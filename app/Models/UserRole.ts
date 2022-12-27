import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@ioc:Adonis/Lucid/Orm'

// Models
import User from './User'
import Role from './Role'

// Types
import type { BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class UserRole extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public roleId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>
}
