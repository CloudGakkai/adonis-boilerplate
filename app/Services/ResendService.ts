import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import { Resend } from 'resend'

export default class ResendService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(Env.get('RESEND_API_KEY'))
  }

  public async sendVerification(email: string, token: string, redirectUri: string) {
    try {
      const msgToSend = {
        to: email,
        from: Env.get('RESEND_EMAIL_SENDER')!,
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

  public async sendRecovery(email: string, token: string, redirectUri: string) {
    try {
      const msgToSend = {
        to: email,
        from: Env.get('RESEND_EMAIL_SENDER')!,
        subject: 'Reset Your Password',
        html: `<h3>Reset Password</h3>\n
        <p>Follow this link to reset the password for account:<br>\n
        <a href="${Env.get(
          'APP_URL'
        )}/auth/v1/verify?token=${token}&type=recovery&redirect=${redirectUri}">Reset password</a>`,
      }

      const resendResp = await this.resend.emails.send(msgToSend)

      Logger.info('resend', resendResp)

      return 'Email sent.'
    } catch (e) {
      Logger.error(`2034: ${e}`)
    }
  }

  public async sendOtp(email: string, token: string) {
    try {
      const msgToSend = {
        to: email,
        from: Env.get('RESEND_EMAIL_SENDER')!,
        subject: 'Verification OTP Code',
        html: `<h3>Your Verification OTP Code</h3>\n
        <p>Please enter this code:</p>
        <p><b>${token}</b></p>
        <p>DON'T SHARE THIS CODE TO ANYONE.</p>`,
      }

      const resendResp = await this.resend.emails.send(msgToSend)

      Logger.info('resend', resendResp)

      return 'Email sent.'
    } catch (e) {
      Logger.error(`2034: ${e}`)
    }
  }

  public async sendMagicLink(email: string, token: string, redirectUri: string) {
    try {
      const msgToSend = {
        to: email,
        from: Env.get('RESEND_EMAIL_SENDER')!,
        subject: 'Login Verification',
        html: `<h3>Login Verification</h3>\n
        <p>Follow this link to login into your account:<br>\n
        <a href="${Env.get(
          'APP_URL'
        )}/auth/v1/verify?token=${token}&type=magiclink&redirect=${redirectUri}">Log In</a>`,
      }

      const resendResp = await this.resend.emails.send(msgToSend)

      Logger.info('resend', resendResp)

      return 'Email sent.'
    } catch (e) {
      Logger.error(`2034: ${e}`)
    }
  }
}
