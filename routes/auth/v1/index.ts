import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthsController.signUpWithPassword')
  Route.post('/login/password', 'AuthsController.signInWithPassword')
  Route.post('/login/otp', 'AuthsController.signInWithOtp')
  Route.post('/resend', 'AuthsController.resend')
  Route.post('/forgot-password', 'AuthsController.forgotPassword')
  Route.post('/refresh', 'AuthsController.refreshSession').middleware('userSession')
  Route.delete('/logout', 'AuthsController.signOut').middleware('userSession')
  require('./verify')
  require('./sso')
})
  .prefix('/v1')
  .namespace('App/Controllers/Http/v1/Auth')
