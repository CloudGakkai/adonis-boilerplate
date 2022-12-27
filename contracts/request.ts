interface Token {
  user_id: number
}

declare module '@ioc:Adonis/Core/Request' {
  interface RequestContract {
    decoded?: Token
  }
}
