import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RefreshSessionValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    refresh_token: schema.string(),
  })

  public messages: CustomMessages = {
    required: '{{ field }} cannot be empty.',
  }
}
