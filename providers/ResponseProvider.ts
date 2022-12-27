import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import HttpStatus from 'http-status-codes'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/

export default class ResponseProvider {
  public static needsApplication = true
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    const Response = this.app.container.use('Adonis/Core/Response')

    Response.macro('api', function (data, status) {
      const request = this.ctx!.request

      this.ctx!.response.header('Access-Control-Allow-Origin', '*')

      this.ctx!.response.status(status).json({
        response: {
          status: status,
          message: HttpStatus.getStatusText(status),
          url: request.completeUrl(),
        },
        data,
      })
      return this
    })
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
