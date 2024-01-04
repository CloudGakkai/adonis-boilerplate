import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/:provider/redirect', 'SsoController.redirect')
  Route.get('/:provider/callback', 'SsoController.callback')
})
  .prefix('/sso')
  .namespace('App/Controllers/Http/v1/Auth')
