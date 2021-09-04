import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/sign-in', () => {})
  Route.delete('/sign-out', () => {})
}).prefix('auth')