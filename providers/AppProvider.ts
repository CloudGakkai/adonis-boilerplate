import { ApplicationContract } from '@ioc:Adonis/Core/Application'
/**
 * Uncomment these line if you want to use Scheduler
 */
// import ScheduleRegistry from 'App/Registries/ScheduleRegistry'
// import { RecurrenceRule } from 'node-schedule'
// import Logger from '@ioc:Adonis/Core/Logger'
export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    /**
     * Uncomment these line if you want to use WebSocket
     */
    // await import('../start/socket')
    /**
     * Uncomment these line if you want to use Scheduler
     */
    // const rule = new RecurrenceRule()
    // rule.second = 1
    // ScheduleRegistry.create('health_check', rule, () => {
    //   Logger.info('Ok is already up !')
    // })
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
