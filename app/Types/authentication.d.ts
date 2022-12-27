interface Token {
  user_id: number
}

interface JwtGeneratePayload {
  type: string
  token: string
}
