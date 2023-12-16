import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

// Types
import type { DateTime } from 'luxon'

export default class Identity extends BaseModel {
  public static table = 'auth.identities'

  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public provider: string

  @column()
  public identity_data: object

  @column.dateTime()
  public lastSignInAt: DateTime

  @column()
  public email: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
