import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import jwt from 'jsonwebtoken'

export default class SessionMiddleware {
  public async handle ({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const headers = request.headers()

    try {
      // Get token from request headers
      const token = headers['x-auth-token']

      // If token is not present, return unauthorized
      if (!token) {
        return response.api({ message: 'Token cannot be empty'}, 401)
      }

      /*
      *  TODO: Check if the token is exists on the database
      */

      // Verify token
      const decoded = jwt.verify(token, Env.get('APP_SECRET')) as any

      // If token is invalid, return unauthorized
      if (!decoded) {
        return response.api({ message: 'Invalid token'}, 401)
      } else {
        request.decoded = decoded
      }

      await next()
    } catch (error) {
      return response.api({
        message: error
      }, 500)
    }
  }
}
