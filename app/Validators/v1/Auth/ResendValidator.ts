import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ResendValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string.optional({}, [rules.email()]),
    phone: schema.string.optional(),
    type: schema.enum(['signup', 'email_change', 'phone_change']),
    options: schema.object.optional().members({
      redirect_uri: schema.string.optional(),
      channel: schema.enum.optional(['sms', 'whatsapp']),
    }),
  })

  public messages: CustomMessages = {}
}
