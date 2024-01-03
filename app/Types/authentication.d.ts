interface Token {
  user_id: string
  session_id: string
}

interface JwtGeneratePayload {
  type: string
  token: string
}
