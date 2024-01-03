interface Token {
  user_id: string
  session_id: string
}

declare module '@ioc:Adonis/Core/Request' {
  interface RequestContract {
    decoded?: Token
  }
}
