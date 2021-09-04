import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', ({ response }) => {
    return response.api({ message: 'Hello world' }, 200)
  })
}).middleware(['session'])