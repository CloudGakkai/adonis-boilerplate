interface Token {
  user_id: string
}

interface JwtGeneratePayload {
  type: string
  token: string
}
