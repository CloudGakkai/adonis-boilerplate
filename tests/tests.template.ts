import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
// import Config from '@ioc:Adonis/Core/Config'

test.group('Template Test', (group) => {
  // const baseURL = Config.get('app.url.baseURL')
  /**
   * Database Transaction Note
   *
   * When you try to use database transaction in unit test
   * please add Database.beginGlobalTransaction() and Database.rollbackGlobalTransaction()
   * to make all data is not persisted on any database
   *
   */
  // group.beforeEach(async () => {
  //   await Database.beginGlobalTransaction()
  // })
  // group.afterEach(async () => {
  //   await Database.rollbackGlobalTransaction()
  // })
})
