import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

// Types
import type { DateTime } from 'luxon'

export default class RefreshToken extends BaseModel {
  public static table = 'auth.refresh_tokens'

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

  @column()
  public parent: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
