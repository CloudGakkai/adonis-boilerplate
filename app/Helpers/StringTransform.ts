import { markdownToTxt } from 'markdown-to-txt'
import { DateTime } from 'luxon'

export default class StringTransform {
  public static toSlug(str: string): string {
    str = str.replace(/^\s+|\s+$/g, '') // trim
    str = str.toLowerCase()

    // remove accents, swap ñ for n, etc
    const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
    const to = 'aaaaeeeeiiiioooouuuunc------'
    for (let i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
    }

    str = str
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')

    return str
  }

  public static toPlainText(str: string): string {
    return markdownToTxt(str)
  }

  public static generateOtpNumber() {
    const otp = Math.floor(Math.random() * 900000) + 100000
    return otp.toString()
  }

  public static isOtpExpired(confirmationSentAt: DateTime<boolean>) {
    const sentAt = DateTime.fromISO(confirmationSentAt.toString())
    const now = DateTime.now()

    // Calculate the difference in minutes
    const diffInMinutes = now.diff(sentAt, 'minutes').minutes

    // Check if the difference is more than 60 minutes
    return diffInMinutes > 60
  }
}
