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
import LoginWithOtpValidator from 'App/Validators/v1/Auth/LoginWithOtpValidator'
import LogoutValidator from 'App/Validators/v1/Auth/LogoutValidator'
import ResendValidator from 'App/Validators/v1/Auth/ResendValidator'

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
      return response.api({ message: 'Identity cannot be empty.' }, StatusCodes.BAD_REQUEST)
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
              }
            : {
                phone: user.phone,
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
        this.mailer.sendVerification(payload.email, confirmationToken, Env.get('APP_URL'))
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
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async resend({ request, response }: HttpContextContract) {
    const payload = await request.validate(ResendValidator)

    if (!payload.email && !payload.phone) {
      return response.api({ message: 'Identity cannot be empty.' }, StatusCodes.BAD_REQUEST)
    }

    const userQuery = User.query()

    if (payload.email) {
      userQuery.where('email', payload.email)
    }

    if (payload.phone) {
      userQuery.where('phone', payload.phone)
    }

    const user = await userQuery.first()

    if (!user) {
      return response.api({ message: 'Invalid user account.' }, StatusCodes.UNPROCESSABLE_ENTITY)
    }

    if (payload.type === 'signup') {
      if (payload.email && user.emailConfirmedAt) {
        return response.api(
          { message: 'Email already confirmed.' },
          StatusCodes.UNPROCESSABLE_ENTITY
        )
      }

      if (payload.phone && user.phoneConfirmedAt) {
        return response.api(
          { message: 'Phone already confirmed.' },
          StatusCodes.UNPROCESSABLE_ENTITY
        )
      }
    }

    if (payload.type === 'signup' && !StringTransform.isResendAvailable(user.confirmationSentAt)) {
      return response.api(
        { message: 'You can resend new confirmation after 2 minutes.' },
        StatusCodes.TOO_MANY_REQUESTS
      )
    }

    const otpCode = StringTransform.generateOtpNumber()
    const confirmationToken = this.md5.generate(otpCode)

    try {
      user.confirmationToken = confirmationToken
      await user.save()

      if (payload.email) {
        this.mailer.sendVerification(
          payload.email,
          confirmationToken,
          payload.options?.redirect_uri ?? Env.get('APP_URL')
        )
      } else {
        if (payload.options?.channel === 'whatsapp') {
          this.twilio.sendOtpWhatsapp(otpCode, payload.phone!)
        } else {
          this.twilio.sendOtpSms(otpCode, payload.phone!)
        }
      }

      user.confirmationSentAt = DateTime.now()
      await user.save()

      return response.api(
        {
          message: payload.email
            ? `We've sent new verification link to ${payload.email}.`
            : `We've sent new verification code to ${payload.phone}.`,
        },
        StatusCodes.OK
      )
    } catch (e) {
      return response.api(
        { message: 'Failed to resend new confirmation.' },
        StatusCodes.INTERNAL_SERVER_ERROR
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
      const userToken = this.jwt
        .generate({ user_id: user.id, session_id: newSession.session.id })
        .make()
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

  public async signInWithOtp({ request, response }: HttpContextContract) {
    const payload = await request.validate(LoginWithOtpValidator)

    const userQuery = User.query()

    if (!payload.email && !payload.phone) {
      return response.api({ message: 'Identity cannot be empty.' }, StatusCodes.BAD_REQUEST)
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

    if (payload.email && !user.emailConfirmedAt) {
      return response.api({ message: 'Please confirm your email.' }, StatusCodes.FORBIDDEN)
    }

    if (payload.phone && !user.phoneConfirmedAt) {
      return response.api({ message: 'Please confirm your phone.' }, StatusCodes.FORBIDDEN)
    }

    const otpCode = StringTransform.generateOtpNumber()
    const confirmationToken = this.md5.generate(otpCode)

    user.confirmationToken = confirmationToken
    user.confirmationSentAt = DateTime.now()

    await user.save()

    if (payload.email) {
      if (!payload.options?.redirect_uri) {
        this.mailer.sendOtp(payload.email, otpCode)

        return response.api(
          { message: `Verification otp code has been sent to ${payload.email}` },
          StatusCodes.OK
        )
      }

      this.mailer.sendMagicLink(payload.email, confirmationToken, payload.options.redirect_uri)

      return response.api(
        { message: `Verification link has been sent to ${payload.email}` },
        StatusCodes.OK
      )
    }

    if (payload.phone) {
      if (payload.options?.channel === 'whatsapp') {
        this.twilio.sendOtpWhatsapp(otpCode, payload.phone)

        return response.api(
          { message: `OTP Code has been sent to ${payload.phone}` },
          StatusCodes.OK
        )
      }

      this.twilio.sendOtpSms(otpCode, payload.phone)
      return response.api({ message: `OTP Code has been sent to ${payload.phone}` }, StatusCodes.OK)
    }
  }

  public async signOut({ request, response }: HttpContextContract) {
    const payload = await request.validate(LogoutValidator)
    const userId = request.decoded!.user_id
    const sessionId = request.decoded!.session_id

    const sessions = await Database.transaction(async (trx) => {
      const currentSession = await Session.query({ client: trx })
        .where('user_id', userId)
        .andWhere('id', sessionId)
        .first()

      const allSession = await Session.query({ client: trx }).where('user_id', userId).exec()

      return {
        currentSession,
        allSession,
      }
    })

    try {
      if (!sessions.currentSession) {
        return response.api({ message: 'Invalid session.' }, StatusCodes.UNAUTHORIZED)
      }

      if (payload.scope === 'global') {
        sessions.allSession.map(async (session) => {
          await session.delete()
        })
      }

      if (payload.scope === 'others') {
        sessions.allSession.map(async (session) => {
          if (session.id !== sessions.currentSession!.id) await session.delete()
        })
      }

      if (payload.scope === 'local') {
        await sessions.currentSession.delete()
      }

      return response.api({ message: '' }, StatusCodes.NO_CONTENT)
    } catch (e) {
      return response.api({ message: `704: ${e}` }, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
