import { StatusCodes } from 'http-status-codes'
import Md5 from 'App/Helpers/Md5Helper'
import StringTransform from 'App/Helpers/StringTransform'
import JwtService from 'App/Services/JwtService'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import { cuid } from '@ioc:Adonis/Core/Helpers'

// Validators
import VerifyOtpValidator from 'App/Validators/v1/Verify/VerifyOtpValidator'

// Models
import User from 'App/Models/User'
import Session from 'App/Models/Session'
import RefreshToken from 'App/Models/RefreshToken'
import Identity from 'App/Models/Identity'

// Types
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class VerifiesController {
  private md5 = new Md5()
  private jwt = new JwtService()

  public async verifyOtp({ request, response }: HttpContextContract) {
    const payload = await request.validate(VerifyOtpValidator)
    const headers = request.headers()

    if (
      (payload.type === 'sms' && !payload.phone) ||
      (payload.type === 'whatsapp' && !payload.phone)
    ) {
      return response.api({ message: 'Invalid verification request.' }, StatusCodes.BAD_REQUEST)
    }

    if (payload.type === 'email' && !payload.email) {
      return response.api({ message: 'Invalid verification request.' }, StatusCodes.BAD_REQUEST)
    }

    const queryUser = User.query()

    if (payload.email) {
      queryUser.where('email', payload.email)
    }

    if (payload.phone) {
      queryUser.where('phone', payload.phone)
    }

    const user = await queryUser.first()

    if (!user) {
      return response.api({ message: 'Invalid verification request.' }, StatusCodes.BAD_REQUEST)
    }

    // Check if session is invalid
    // OTP Code should valid for 60 mins
    if (StringTransform.isOtpExpired(user.confirmationSentAt)) {
      return response.api({ message: 'Invalid OTP Code.' }, StatusCodes.UNAUTHORIZED)
    }

    // Validate OTP Code
    const validateOtp = await this.md5.verify(payload.otp, user.confirmationToken)

    if (!validateOtp) {
      return response.api({ message: 'Invalid OTP Code.' }, StatusCodes.UNAUTHORIZED)
    }

    const newSession = await Database.transaction(async (trx) => {
      user.useTransaction(trx)

      const lastSignedAt = DateTime.now()

      user.lastSignInAt = lastSignedAt
      await user.save()

      const identity = await Identity.query({ client: trx })
        .where('user_id', user.id)
        .andWhere(
          'provider',
          payload.type === 'sms' || payload.type === 'whatsapp' ? 'phone' : 'email'
        )
        .first()

      identity!.lastSignInAt = lastSignedAt
      await identity?.save()

      const session = await Session.create(
        {
          userId: user.id,
          userAgent: headers['user-agent'],
          ip: request.ips()[0],
        },
        { client: trx }
      )

      const refreshToken = await RefreshToken.create(
        {
          userId: user.id,
          sessionId: session.id,
          token: cuid(),
          revoked: false,
          parent: null,
        },
        { client: trx }
      )

      return {
        session,
        refreshToken,
      }
    })

    if (newSession.session && newSession.refreshToken) {
      const userToken = this.jwt.generate({ user_id: user.id }).make()

      return response.api(userToken, StatusCodes.OK)
    } else {
      return response.api({ message: 'Internal server error.' }, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
