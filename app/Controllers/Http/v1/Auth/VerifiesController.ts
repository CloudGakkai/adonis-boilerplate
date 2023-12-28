import { StatusCodes } from 'http-status-codes'
import Md5 from 'App/Helpers/Md5Helper'
import StringTransform from 'App/Helpers/StringTransform'
import JwtService from 'App/Services/JwtService'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import { cuid } from '@ioc:Adonis/Core/Helpers'

// Validators
import VerifyOtpValidator from 'App/Validators/v1/Verify/VerifyOtpValidator'
import VerifyMagicLinkValidator from 'App/Validators/v1/Verify/VerifyMagicLinkValidator'

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
      return response.api({ message: 'OTP Code is expired.' }, StatusCodes.UNAUTHORIZED)
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

      if (payload.type === 'sms' || payload.type === 'whatsapp') {
        user.phoneConfirmedAt = lastSignedAt
      } else {
        user.emailConfirmedAt = lastSignedAt
      }

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
      const expiresAt = DateTime.now().plus({ days: 7 }).toUnixInteger()

      return response.api(
        {
          access_token: userToken.token,
          expires_at: expiresAt,
          refresh_token: newSession.refreshToken.token,
        },
        StatusCodes.OK
      )
    } else {
      return response.api({ message: 'Internal server error.' }, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  public async verifyMagicLink({ request, response }: HttpContextContract) {
    const payload = await request.validate(VerifyMagicLinkValidator)
    const headers = request.headers()

    const user = await User.findBy('confirmation_token', payload.token)

    if (!user) {
      return response
        .redirect()
        .withQs({ message: 'Invalid verification request', status: 'failed' })
        .toPath(payload.redirect)
    }

    // Check if session is invalid
    // OTP Code should valid for 60 mins
    if (StringTransform.isOtpExpired(user.confirmationSentAt)) {
      return response
        .redirect()
        .withQs({
          message: 'Verification request is expired',
          status: 'failed',
        })
        .toPath(payload.redirect)
    }

    const newSession = await Database.transaction(async (trx) => {
      user.useTransaction(trx)

      const lastSignedAt = DateTime.now()

      user.lastSignInAt = lastSignedAt

      if (payload.type === 'signup') {
        user.emailConfirmedAt = lastSignedAt
      }

      await user.save()

      const identity = await Identity.query({ client: trx })
        .where('user_id', user.id)
        .andWhere('provider', payload.type === 'signup' ? 'email' : 'phone')
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
      const expiresAt = DateTime.now().plus({ days: 7 }).toUnixInteger()

      return response
        .redirect()
        .withQs({
          access_token: userToken.token,
          expires_at: expiresAt,
          refresh_token: newSession.refreshToken.token,
          status: 'success',
        })
        .toPath(payload.redirect)
    } else {
      return response
        .redirect()
        .withQs({
          message: 'Internal server error',
          status: 'failed',
        })
        .toPath(payload.redirect)
    }
  }
}
