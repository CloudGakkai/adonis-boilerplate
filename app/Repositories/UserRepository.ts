import User from 'App/Models/User'
import { Repository } from './Repository'

export default class UserRepository extends Repository<typeof User> {
  public model = User
}
