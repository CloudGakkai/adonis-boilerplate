import Scheduler, { JobCallback, RecurrenceRule, RecurrenceSpecDateRange } from 'node-schedule'
import Logger from '@ioc:Adonis/Core/Logger'

interface SchedulerTask {
  name: string
  job: Scheduler.Job
}

class ScheduleRegistry {
  public lists: SchedulerTask[] = []

  public create(
    name: string,
    rule: RecurrenceRule | RecurrenceSpecDateRange | Date | string | number,
    callback: JobCallback
  ) {
    const job = Scheduler.scheduleJob(name, rule, callback)
    const item = { name, job }
    this.lists.push(item)

    return item
  }

  public find(name: string) {
    if (this.lists) {
      return this.lists.find((item) => item.name === name)
    } else {
      Logger.error(`${name} schedule is not found`)
    }
  }
}

export default new ScheduleRegistry()
