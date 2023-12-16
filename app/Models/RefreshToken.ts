import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

// Types
import type { DateTime } from 'luxon'

export default class RefreshToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public sessionId: string

  @column({ serializeAs: null })
  public token: string

  @column()
  public revoked: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
