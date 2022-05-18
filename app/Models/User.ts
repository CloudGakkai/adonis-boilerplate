import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'

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

  /**
   *  hashPassword is some hook to hashing input value before create some data
   *  Some config is registered at config/hash.ts
   *  More information see at : https://docs.adonisjs.com/guides/security/hashing
   */
  @beforeCreate()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
