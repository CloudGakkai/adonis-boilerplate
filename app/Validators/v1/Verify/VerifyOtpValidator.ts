import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class VerifyOtpValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    phone: schema.string.optional(),
    email: schema.string.optional({}, [rules.email()]),
    otp: schema.string(),
    type: schema.enum(['sms', 'whatsapp', 'email']),
  })

  public messages: CustomMessages = {
    required: '{{ field }} cannot be empty.',
    unique: '{{ field }} already exists.',
    email: '{{ field }} is not a valid email.',
  }
}
