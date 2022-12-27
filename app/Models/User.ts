import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasManyThrough } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'

// Models
import Role from './Role'
import UserRole from './UserRole'

// Types
import { HasManyThrough } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public email: string

  @column()
  public username: string

  @column()
  public password: string

  @beforeCreate()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasManyThrough([() => Role, () => UserRole], {
    throughForeignKey: 'id',
  })
  public roles: HasManyThrough<typeof Role>
}
