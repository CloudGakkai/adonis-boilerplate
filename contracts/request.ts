interface IToken {
  user_id: number;
  role: string;
}

declare module '@ioc:Adonis/Core/Request' {
  interface RequestContract {
    decoded?: IToken
  }
}