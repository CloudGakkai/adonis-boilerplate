import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LoginWithOtpValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string.optional({}, [rules.email()]),
    phone: schema.string.optional(),
    options: schema.object.optional().members({
      redirect_uri: schema.string.optional(),
      channel: schema.enum.optional(['sms', 'whatsapp']),
    }),
  })

  public messages: CustomMessages = {
    email: '{{ field }} should be a valid email.',
  }
}
