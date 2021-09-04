import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  require('./authRoutes')
  require('./signedRoutes')
}).prefix("/v1")