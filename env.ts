/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  APP_URL: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local'] as const),
  NODE_ENV: Env.schema.enum(['development', 'production', 'testing'] as const),
  DB_CONNECTION: Env.schema.string(),
  PG_HOST: Env.schema.string({ format: 'host' }),
  PG_PORT: Env.schema.number(),
  PG_USER: Env.schema.string(),
  PG_PASSWORD: Env.schema.string.optional(),
  PG_DB_NAME: Env.schema.string(),
  SQLITE_LOCATION: Env.schema.string.optional(),
  SENDGRID_API_KEY: Env.schema.string.optional(),
  TWILIO_ACCOUNT_SID: Env.schema.string.optional(),
  TWILIO_AUTH_TOKEN: Env.schema.string.optional(),
  TWILIO_FROM_NUMBER: Env.schema.string.optional(),
  RESEND_EMAIL_SENDER: Env.schema.string.optional(),
  RESEND_API_KEY: Env.schema.string.optional(),
  VONAGE_API_KEY: Env.schema.string.optional(),
  VONAGE_SECRET_KEY: Env.schema.string.optional(),
})
