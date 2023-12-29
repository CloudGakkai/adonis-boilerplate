import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'auth.identities'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('id', { primaryKey: true })
        .defaultTo(this.db.rawQuery('uuid_generate_v4()').knexQuery)
      table.uuid('user_id').references('id').inTable('auth.users').onDelete('CASCADE')
      table.string('provider')
      table.jsonb('identity_data')
      table.timestamp('last_sign_in_at', { useTz: true })
      table.string('email')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
