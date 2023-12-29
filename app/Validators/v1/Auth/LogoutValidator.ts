import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LogoutValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    scope: schema.enum(['global', 'local', 'others']),
  })

  public messages: CustomMessages = {}
}
