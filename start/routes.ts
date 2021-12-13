import Route from '@ioc:Adonis/Core/Route'
import '../routes/users'

Route.get('/', async ({ response }) => {
  return response.api({ message: 'Hello World' }, 200)
})
