import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import SgMail from '@sendgrid/mail'

export default class SendgridService {
  constructor() {
    SgMail.setApiKey(Env.get('SENDGRID_API_KEY')!)
  }

  public async sendEmailVerification(email: string, token: string, redirectUri: string) {
    try {
      const msgToSend = {
        to: email,
        from: 'noreply@unboxlabs.id',
        subject: 'Confirm Your Email',
        html: `<h3>Confirm your email</h3>\n
        <p>Follow this link to confirm your email:<br>\n
        <a href="${Env.get(
          'APP_URL'
        )}/auth/v1/verify?token=${token}&type=signup&redirect=${redirectUri}">Confirm email</a>`,
      }

      await SgMail.send(msgToSend)

      return 'Email sent.'
    } catch (e) {
      Logger.error(`2034: ${e}`)
    }
  }
}
