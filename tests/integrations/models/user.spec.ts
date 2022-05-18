import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import test from 'japa'

test.group('User Model Test', (group) => {
  /**
   * Database Transaction Note
   *
   * When you try to use database transaction in unit test
   * please add Database.beginGlobalTransaction() and Database.rollbackGlobalTransaction()
   * to make all data is not persisted on any database
   *
   */
  group.before(async () => {
    await Database.beginGlobalTransaction()
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('Create a some data', async (assert) => {
    const user = new User()
    user.username = 'user'
    user.email = 'user@localhost.com'
    user.password = 'password'

    await user.save()

    assert.notEqual(user.password, 'password')
    assert.equal(user.username, 'user')
    assert.equal(user.email, 'user@localhost.com')
  })
})
