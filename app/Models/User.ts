import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

// Types
import type { DateTime } from 'luxon'

export default class User extends BaseModel {
  public static table = 'auth.users'

  @column({ isPrimary: true })
  public id: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public encryptedPassword: string

  @column.dateTime()
  public emailConfirmedAt: DateTime

  @column({ serializeAs: null })
  public confirmationToken: string

  @column.dateTime()
  public confirmationSentAt: DateTime

  @column({ serializeAs: null })
  public recoveryToken: string

  @column.dateTime()
  public recoverySentAt: DateTime

  @column({ serializeAs: null })
  public emailChangeTokenNew: string

  @column({ serializeAs: null })
  public emailChange: string

  @column.dateTime()
  public emailChangeSentAt: DateTime

  @column.dateTime()
  public lastSignInSentAt: DateTime

  @column()
  public rawAppMetaData: object

  @column()
  public rawUserMetaData: object

  @column()
  public phone: string

  @column.dateTime()
  public phoneConfirmedAt: DateTime

  @column({ serializeAs: null })
  public phoneChange: string

  @column({ serializeAs: null })
  public phoneChangeToken: string

  @column.dateTime()
  public phoneChangeSentAt: DateTime

  @column.dateTime()
  public bannedUntil: DateTime

  @column()
  public isSsoUser: boolean

  @column.dateTime()
  public deletedAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
