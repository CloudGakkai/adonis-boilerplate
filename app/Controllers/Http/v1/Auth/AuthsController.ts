import { StatusCodes } from 'http-status-codes'
import StringTransform from 'App/Helpers/StringTransform'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import Md5 from 'App/Helpers/Md5Helper'
import Env from '@ioc:Adonis/Core/Env'
import Hash from '@ioc:Adonis/Core/Hash'
import JwtService from 'App/Services/JwtService'
import { cuid } from '@ioc:Adonis/Core/Helpers'

// Services
import ResendService from 'App/Services/ResendService'
import TwilioService from 'App/Services/TwilioService'

// Validators
import RegisterWithPasswordValidator from 'App/Validators/v1/Auth/RegisterWithPasswordValidator'
import LoginWithPasswordValidator from 'App/Validators/v1/Auth/LoginWithPasswordValidator'

// Models
import User from 'App/Models/User'
import Identity from 'App/Models/Identity'
import Session from 'App/Models/Session'
import RefreshToken from 'App/Models/RefreshToken'

// Types
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthsController {
  private jwt = new JwtService()
  private md5 = new Md5()
  private mailer = new ResendService()
  private twilio = new TwilioService({
    from: {
      phone: Env.get('TWILIO_FROM_NUMBER')!,
      whatsapp: Env.get('TWILIO_FROM_NUMBER')!,
    },
  })

  public async signUpWithPassword({ request, response }: HttpContextContract) {
    const payload = await request.validate(RegisterWithPasswordValidator)

    if (!payload.email && !payload.phone) {
      return response.api({ message: 'Credential cannot be empty.' }, StatusCodes.BAD_REQUEST)
    }

    const otpCode = StringTransform.generateOtpNumber()
    const confirmationToken = this.md5.generate(otpCode)

    const result = await Database.transaction(async (trx) => {
      const user = await User.create(
        {
          email: payload.email ?? null,
          encryptedPassword: payload.password,
          confirmationToken,
          confirmationSentAt: DateTime.now(),
          rawAppMetaData: payload.email
            ? {
                provider: 'email',
                providers: ['email'],
              }
            : {
                provider: 'phone',
                providers: ['phone'],
              },
          rawUserMetaData: {},
          phone: payload.phone ?? null,
        },
        { client: trx }
      )

      const identity = await Identity.create(
        {
          userId: user.id,
          provider: payload.email ? 'email' : 'phone',
          identity_data: payload.email
            ? {
                email: user.email,
                email_verified: false,
                phone_verified: false,
              }
            : {
                email_verified: false,
                phone_verified: false,
              },
          email: user?.email ?? undefined,
        },
        { client: trx }
      )

      return {
        user,
        identity,
      }
    })

    if (result.user && result.identity) {
      if (payload.email) {
        this.mailer.sendEmailVerification(payload.email, confirmationToken, 'http://localhost:3333')
      } else {
        if (payload.channel === 'whatsapp') {
          this.twilio.sendOtpWhatsapp(otpCode, payload.phone!)
        } else {
          this.twilio.sendOtpSms(otpCode, payload.phone!)
        }
      }

      return response.api(
        {
          message: payload.email
            ? `Account created, we've sent verification link to ${payload.email}.`
            : `Account created, we've sent verification code to ${payload.phone}.`,
        },
        StatusCodes.CREATED
      )
    } else {
      return response.api(
        {
          message: 'Failed to create new account.',
        },
        StatusCodes.BAD_REQUEST
      )
    }
  }

  public async signInWithPassword({ request, response }: HttpContextContract) {
    const payload = await request.validate(LoginWithPasswordValidator)
    const headers = request.headers()

    const userQuery = User.query().preload('identities')

    if (!payload.email && !payload.phone) {
      return response.api({ message: 'Email / Phone cannot be empty.' }, StatusCodes.BAD_REQUEST)
    }

    if (payload.email) {
      userQuery.where('email', payload.email)
    }

    if (payload.phone) {
      userQuery.where('phone', payload.phone)
    }

    const user = await userQuery.first()

    if (!user) {
      return response.api({ message: 'Invalid credentials.' }, StatusCodes.UNAUTHORIZED)
    }

    const isPasswordValid = await Hash.verify(user.encryptedPassword, payload.password)

    if (!isPasswordValid) {
      return response.api({ message: 'Invalid credentials.' }, StatusCodes.UNAUTHORIZED)
    }

    if (payload.email && !user.emailConfirmedAt) {
      return response.api({ message: 'Please confirm your email.' }, StatusCodes.FORBIDDEN)
    }

    if (payload.phone && !user.phoneConfirmedAt) {
      return response.api({ message: 'Please confirm your phone.' }, StatusCodes.FORBIDDEN)
    }

    const newSession = await Database.transaction(async (trx) => {
      user.useTransaction(trx)

      const lastSignedAt = DateTime.now()

      user.lastSignInAt = lastSignedAt

      await user.save()

      const identity = await Identity.query({ client: trx })
        .where('user_id', user.id)
        .andWhere('provider', payload.phone ? 'phone' : 'email')
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
}
