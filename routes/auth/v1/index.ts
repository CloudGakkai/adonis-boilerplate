import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthsController.signUpWithPassword')
  Route.post('/login/password', 'AuthsController.signInWithPassword')
  Route.post('/login/otp', 'AuthsController.signInWithOtp')
  Route.delete('/logout', 'AuthsController.signOut').middleware('userSession')
  require('./verify')
})
  .prefix('/v1')
  .namespace('App/Controllers/Http/v1/Auth')
