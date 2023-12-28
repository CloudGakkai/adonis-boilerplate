import { BaseModel, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

// Models
import User from './User'

// Types
import type { BelongsTo } from '@ioc:Adonis/Lucid/Orm'
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

  // Relationship
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
