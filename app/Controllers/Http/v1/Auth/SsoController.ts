import Database from '@ioc:Adonis/Lucid/Database'
import Env from '@ioc:Adonis/Core/Env'
import Md5 from 'App/Helpers/Md5Helper'
import JwtService from 'App/Services/JwtService'
import StringTransform from 'App/Helpers/StringTransform'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'

// Services
import ResendService from 'App/Services/ResendService'

// Models
import User from 'App/Models/User'
import Identity from 'App/Models/Identity'
import Session from 'App/Models/Session'
import RefreshToken from 'App/Models/RefreshToken'

// Types
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SsoController {
  private jwt = new JwtService()
  private md5 = new Md5()
  private mailer = new ResendService()

  public async redirect({ request, ally }: HttpContextContract) {
    const { provider } = request.params()

    return ally.use(provider).stateless().redirect()
  }

  public async callback({ request, response, ally }: HttpContextContract) {
    const { provider } = request.params()
    const headers = request.headers()
    const ssoProvider = ally.use(provider).stateless()

    if (ssoProvider.accessDenied()) {
      return 'Access was denied'
    }

    if (ssoProvider.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    if (ssoProvider.hasError()) {
      return ssoProvider.getError()
    }

    const ssoUser = await ssoProvider.user()

    const user = await User.findBy('email', ssoUser.email)

    if (!user) {
      const lastSignInAt = DateTime.now()
      const confirmationToken = this.md5.generate(StringTransform.generateOtpNumber())

      // Create new account
      const result = await Database.transaction(async (trx) => {
        const user = await User.create(
          {
            email: ssoUser.email,
            encryptedPassword: null,
            confirmationToken,
            confirmationSentAt: lastSignInAt,
            emailConfirmedAt:
              ssoUser.emailVerificationState === 'verified' ? DateTime.now() : undefined,
            rawAppMetaData: {
              provider,
              providers: [provider],
            },
            rawUserMetaData: ssoUser.original,
            phone: null,
            isSsoUser: true,
          },
          { client: trx }
        )

        const identity = await Identity.create(
          {
            userId: user.id,
            provider,
            identity_data: ssoUser.original,
            email: ssoUser.email,
          },
          { client: trx }
        )

        return {
          user,
          identity,
        }
      })

      if (ssoUser.emailVerificationState !== 'verified') {
        this.mailer.sendVerification(ssoUser.email, confirmationToken, Env.get('APP_URL'))

        return 'Account has been created, please check your email to verify your account.'
      }

      if (ssoUser.emailVerificationState === 'verified') {
        const newSession = await Database.transaction(async (trx) => {
          const session = await Session.create(
            {
              userId: result.user.id,
              userAgent: headers['user-agent'],
              ip: request.ips()[0],
            },
            { client: trx }
          )

          const refreshToken = await RefreshToken.create(
            {
              userId: result.user.id,
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

        result.user.lastSignInAt = lastSignInAt
        await result.user.save()

        result.identity.lastSignInAt = lastSignInAt
        await result.identity.save()

        const userToken = this.jwt
          .generate({ user_id: result.user.id, session_id: newSession.session.id })
          .make()
        const expiresAt = DateTime.now().plus({ days: 7 }).toUnixInteger()

        return response.redirect(
          `${Env.get('SSO_REDIRECT_URI')}?access_token=${
            userToken.token
          }&expires_at=${expiresAt}&refresh_token=${newSession.refreshToken.token}`
        )
      }
    } else {
      // Existing user
      const identity = await Identity.query()
        .where('email', ssoUser.email)
        .andWhere('provider', provider)
        .first()

      const lastSignInAt = DateTime.now()

      if (!identity) {
        await Identity.create({
          userId: user.id,
          provider,
          identity_data: ssoUser.original,
          email: ssoUser.email,
          lastSignInAt,
        })
      }

      const newSession = await Database.transaction(async (trx) => {
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

      if (identity) {
        identity!.lastSignInAt = lastSignInAt
        await identity?.save()
      }

      user.lastSignInAt = lastSignInAt
      await user.save()

      const userToken = this.jwt
        .generate({ user_id: user.id, session_id: newSession.session.id })
        .make()
      const expiresAt = DateTime.now().plus({ days: 7 }).toUnixInteger()

      return response.redirect(
        `${Env.get('SSO_REDIRECT_URI')}?access_token=${
          userToken.token
        }&expires_at=${expiresAt}&refresh_token=${newSession.refreshToken.token}`
      )
    }
  }
}
