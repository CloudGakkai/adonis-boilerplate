import { BaseModel, beforeSave, hasMany, column } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'

// Models
import Session from './Session'
import Identity from './Identity'
import RefreshToken from './RefreshToken'

// Types
import type { HasMany } from '@ioc:Adonis/Lucid/Orm'
import type { DateTime } from 'luxon'

export default class User extends BaseModel {
  public static table = 'auth.users'

  @column({ isPrimary: true })
  public id: string

  @column()
  public email: string | null

  @column({ serializeAs: null })
  public encryptedPassword: string | null

  @column.dateTime()
  public emailConfirmedAt: DateTime

  @column({ serializeAs: null })
  public confirmationToken: string | null

  @column.dateTime()
  public confirmationSentAt: DateTime

  @column({ serializeAs: null })
  public recoveryToken: string | null

  @column.dateTime()
  public recoverySentAt: DateTime

  @column({ serializeAs: null })
  public emailChangeTokenNew: string | null

  @column({ serializeAs: null })
  public emailChange: string | null

  @column.dateTime()
  public emailChangeSentAt: DateTime

  @column.dateTime()
  public lastSignInAt: DateTime

  @column()
  public rawAppMetaData: object

  @column()
  public rawUserMetaData: object

  @column()
  public phone: string | null

  @column.dateTime()
  public phoneConfirmedAt: DateTime

  @column({ serializeAs: null })
  public phoneChange: string | null

  @column({ serializeAs: null })
  public phoneChangeToken: string | null

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

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.encryptedPassword) {
      user.encryptedPassword = await Hash.make(user.encryptedPassword!)
    }
  }

  // Relationships
  @hasMany(() => Session)
  public sessions: HasMany<typeof Session>

  @hasMany(() => Identity)
  public identities: HasMany<typeof Identity>

  @hasMany(() => RefreshToken)
  public refresh_tokens: HasMany<typeof RefreshToken>
}
