import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'auth.users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('id', { primaryKey: true })
        .defaultTo(this.db.rawQuery('uuid_generate_v4()').knexQuery)
      table.string('email').nullable().unique()
      table.string('encrypted_password').nullable()
      table.timestamp('email_confirmed_at', { useTz: true })
      table.string('confirmation_token').nullable()
      table.timestamp('confirmation_sent_at', { useTz: true })
      table.string('recovery_token').nullable()
      table.timestamp('recovery_sent_at', { useTz: true })
      table.string('email_change_token_new').nullable()
      table.string('email_change').nullable()
      table.timestamp('email_change_sent_at', { useTz: true })
      table.timestamp('last_sign_in_at', { useTz: true })
      table.jsonb('raw_app_meta_data')
      table.jsonb('raw_user_meta_data')
      table.string('phone').nullable().unique()
      table.timestamp('phone_confirmed_at', { useTz: true })
      table.string('phone_change').nullable()
      table.string('phone_change_token').nullable()
      table.timestamp('phone_change_sent_at', { useTz: true })
      table.timestamp('banned_until', { useTz: true })
      table.boolean('is_sso_user').defaultTo(false)
      table.timestamp('deleted_at', { useTz: true })
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
