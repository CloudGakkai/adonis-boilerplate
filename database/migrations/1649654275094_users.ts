import BaseSchema from '@ioc:Adonis/Lucid/Schema'

/**
 * ========================================================
 * NOTE: Please do attention to each column, some DBMS has different default value condition like NULLABLE and NOT NULLABLE.
 * ========================================================
 */

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.string('email', 155).notNullable()
      table.string('username', 50).notNullable()
      table.string('password').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
