import Factory from '@ioc:Adonis/Lucid/Factory'
import User from 'App/Models/User'

export const UserFactory = Factory.define(User, ({ faker }) => ({
  username: faker.name.firstName(),
  password: faker.random.words(2),
  email: faker.internet.email(),
})).build()
