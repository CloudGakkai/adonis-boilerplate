import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StatusCodes } from 'http-status-codes'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new AppException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class AppException extends Exception {
  private async jsonHandle(error: this, ctx: HttpContextContract): Promise<void> {
    switch (error.code) {
      case 'E_VALIDATION_FAILURE':
        return ctx.response.api(
          {
            errors: error.message,
          },
          StatusCodes.BAD_REQUEST
        )

      case 'E_ROW_NOT_FOUND':
        return ctx.response.api(
          {
            message: 'Data tidak ditemukan',
          },
          StatusCodes.NOT_FOUND
        )

      default:
        return ctx.response.api(
          {
            message: error.message,
          },
          error.status ?? StatusCodes.INTERNAL_SERVER_ERROR
        )
    }
  }

  public async handle(error: this, ctx: HttpContextContract) {
    switch (ctx.request.accepts(['html', 'json'])) {
      case 'json':
        this.jsonHandle(error, ctx)
        break

      default:
        return ctx.response.status(error.status).send(error.message)
    }
  }
}
