import { StatusCodes } from 'http-status-codes'
import StringTransform from 'App/Helpers/StringTransform'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import Md5 from 'App/Helpers/Md5Helper'
import Env from '@ioc:Adonis/Core/Env'

// Services
import ResendService from 'App/Services/ResendService'
import TwilioService from 'App/Services/TwilioService'

// Validators
import RegisterWithPassword from 'App/Validators/v1/Auth/Email/RegisterWithPasswordValidator'

// Models
import User from 'App/Models/User'
import Identity from 'App/Models/Identity'

// Types
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthsController {
  private md5 = new Md5()
  private mailer = new ResendService()
  private twilio = new TwilioService({
    from: {
      phone: Env.get('TWILIO_FROM_NUMBER')!,
      whatsapp: Env.get('TWILIO_FROM_NUMBER')!,
    },
  })

  public async signUpWithPassword({ request, response }: HttpContextContract) {
    const payload = await request.validate(RegisterWithPassword)

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
        this.mailer.sendEmailVerification(payload.email, confirmationToken, 'http://localhost:3000')
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
}
