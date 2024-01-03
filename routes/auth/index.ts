import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  require('./v1')
}).prefix('/auth')
