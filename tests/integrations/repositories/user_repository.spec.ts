import Database from '@ioc:Adonis/Lucid/Database'
import UserRepository from 'App/Repositories/UserRepository'
import { UserFactory } from 'Database/factories/user'
import test from 'japa'

test.group('User Repository Test', (group) => {
  let repository: UserRepository
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

  group.beforeEach(() => {
    repository = new UserRepository()
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('Fetch user data from repository', async (assert) => {
    await UserFactory.createMany(5)
    const list = await repository.setQuery().fetch()

    assert.equal(list.length, 5)
  })

  test('Fetch some data from repository', async (assert) => {
    const dummy = await UserFactory.create()
    const user = await repository.findOrFail(dummy.id)

    assert.equal(user.id, dummy.id)
    assert.equal(user.username, dummy.username)
    assert.equal(user.email, dummy.email)
  })

  test('Create some data from repository', async (assert) => {
    const user = new repository.model()
    user.username = 'user'
    user.password = 'password'
    user.email = 'user@localhost'

    await user.save()
    assert.equal(user.username, 'user')
    assert.equal(user.email, 'user@localhost')
  })
})
