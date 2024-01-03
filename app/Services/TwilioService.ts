import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import TwilioSDK from 'twilio'

// Types
import type { Twilio } from 'twilio'

interface SenderConfig {
  from: {
    phone: string
    whatsapp?: string
  }
}

export default class TwilioService {
  private twilio: Twilio
  private senderConfig: SenderConfig

  constructor(senderConfig: SenderConfig) {
    this.twilio = TwilioSDK(Env.get('TWILIO_ACCOUNT_SID'), Env.get('TWILIO_AUTH_TOKEN'))
    this.senderConfig = senderConfig
  }

  public async sendOtpSms(otpCode: string, phone: string) {
    try {
      await this.twilio.messages.create({
        body: `<#> OTP: ${otpCode} to verify your account. DON'T SHARE THIS CODE TO ANYONE.`,
        from: this.senderConfig.from.phone,
        to: phone,
      })

      return true
    } catch (e) {
      Logger.error(`2040: ${e}`)
      throw Error(`2040: ${e}`)
    }
  }

  public async sendOtpWhatsapp(otpCode: string, phone: string) {
    try {
      await this.twilio.messages.create({
        body: `*${otpCode}* is your verification code. For your security, do not share this code.`,
        from: `whatsapp:${this.senderConfig.from.whatsapp}`,
        to: `whatsapp:${phone}`,
      })
    } catch (e) {
      Logger.error(`2041: ${e}`)
      throw Error(`2041: ${e}`)
    }
  }
}
