import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import { Resend } from 'resend'

export default class ResendService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(Env.get('RESEND_API_KEY'))
  }

  public async sendEmailVerification(email: string, token: string, redirectUri: string) {
    try {
      const msgToSend = {
        to: email,
        from: 'noreply@stmikunboxlabs.ac.id',
        subject: 'Confirm Your Email',
        html: `<h3>Confirm your email</h3>\n
        <p>Follow this link to confirm your email:<br>\n
        <a href="${Env.get(
          'APP_URL'
        )}/auth/v1/verify?token=${token}&type=signup&redirect=${redirectUri}">Confirm email</a>`,
      }

      const resendResp = await this.resend.emails.send(msgToSend)

      Logger.info('resend', resendResp)

      return 'Email sent.'
    } catch (e) {
      Logger.error(`2034: ${e}`)
    }
  }
}
