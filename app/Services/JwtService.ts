import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import AppException from 'App/Exceptions/AppException'
import { StatusCodes } from 'http-status-codes'

export default class JwtService {
  private token: string
  private extractData: string | jwt.JwtPayload

  public generate(payload: Token): JwtService {
    this.token = jwt.sign(payload, Env.get('APP_KEY'), {
      algorithm: 'HS256',
      expiresIn: '7d',
    })
    return this
  }

  public make(): JwtGeneratePayload {
    return {
      type: 'Bearer',
      token: this.token,
    }
  }

  public verify(token: string): this {
    try {
      this.extractData = jwt.verify(token, Env.get('APP_KEY'))
      return this
    } catch (error) {
      throw new AppException('Invalid token', StatusCodes.UNPROCESSABLE_ENTITY)
    }
  }

  public extract(): Token {
    return this.extractData as Token
  }
}
