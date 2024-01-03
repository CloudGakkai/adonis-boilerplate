import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ForgotPasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.required(), rules.email()]),
    redirect_uri: schema.string(),
  })

  public messages: CustomMessages = {
    required: '{{ field }} cannot be empty.',
    email: '{{ field }} should be a valid email.',
  }
}
