import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'

export default new (class WsService {
  public io: Server
  private booted = false

  /**
   * this method is only called once, when the server is started, do not call twice or more times or it will not returning any value.
   *
   * @returns void
   */
  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: '*',
      },
    })
  }

  /**
   * Send message to all connected clients
   *
   * Example :
   * WsService.emit('news', { message: 'holaaa' })
   *
   * @param event
   * @param data
   */
  public emit(event: string, data: any) {
    this.io.emit(event, { event, data })
  }
})()
