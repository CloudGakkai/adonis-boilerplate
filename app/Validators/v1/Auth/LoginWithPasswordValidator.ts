import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LoginWithPasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string.optional({}, [rules.email()]),
    phone: schema.string.optional(),
    password: schema.string(),
  })

  public messages: CustomMessages = {
    required: '{{ field }} cannot be empty.',
    email: '{{ field }} should be a valid email.',
  }
}
