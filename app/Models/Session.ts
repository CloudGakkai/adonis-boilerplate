import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

// Types
import type { DateTime } from 'luxon'

export default class Session extends BaseModel {
  public static table = 'auth.sessions'

  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column.dateTime()
  public refreshedAt: DateTime

  @column()
  public userAgent: string

  @column()
  public ip: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
