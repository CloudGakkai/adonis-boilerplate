import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/otp', 'VerifiesController.verifyOtp')
  Route.get('/', 'VerifiesController.verifyMagicLink')
})
  .prefix('/verify')
  .namespace('App/Controllers/Http/v1/Auth')
