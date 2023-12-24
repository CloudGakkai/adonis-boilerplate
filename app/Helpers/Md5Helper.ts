import crypto from 'crypto'
import Env from '@ioc:Adonis/Core/Env'

export default class Md5 {
  private hasher: crypto.Hmac

  constructor() {
    this.hasher = crypto.createHmac('md5', Env.get('APP_KEY'))
  }

  public generate(plainText: string) {
    return this.hasher.update(plainText).digest('hex')
  }

  public verify(plainText: string, hashed: string) {
    return new Promise((resolve, reject) => {
      try {
        const hash = this.hasher.update(plainText).digest('hex')

        resolve(hash === hashed)
      } catch (e) {
        reject(e)
      }
    })
  }
}
