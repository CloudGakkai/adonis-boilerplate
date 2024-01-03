import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterWithPasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string.optional({}, [
      rules.email(),
      rules.unique({
        table: 'auth.users',
        column: 'email',
      }),
    ]),
    password: schema.string(),
    phone: schema.string.optional({}, [
      rules.unique({
        table: 'auth.users',
        column: 'phone',
      }),
    ]),
    channel: schema.enum.optional(['sms', 'whatsapp']),
  })

  public messages: CustomMessages = {
    required: '{{ field }} cannot be empty.',
    unique: '{{ field }} already exists.',
    email: '{{ field }} should be a valid email.',
  }
}
