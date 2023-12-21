import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthsController.signUpWithPassword')
})
  .prefix('/v1')
  .namespace('App/Controllers/Http/v1/Auth')
