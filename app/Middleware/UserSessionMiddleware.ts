import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import JwtService from 'App/Services/JwtService'

export default class UserSessionMiddleware {
  public jwtService = new JwtService()

  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const headers = request.headers()

    // Get token from request headers
    const token = headers['x-auth-token'] as string | undefined

    // If token is not present, return unauthorized
    if (!token) {
      return response.api({ message: 'Token cannot be empty' }, 401)
    }

    // Verify token
    const decoded = this.jwtService.verify(token).extract()

    request.decoded = {
      user_id: decoded['user_id'],
      session_id: decoded['session_id'],
    }

    await next()
  }
}
