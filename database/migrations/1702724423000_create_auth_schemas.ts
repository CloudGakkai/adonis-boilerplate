import BaseSchema from '@ioc:Adonis/Lucid/Schema'

/**
 * ========================================================
 * NOTE: Please do attention to each column, some DBMS has different default value condition like NULLABLE and NOT NULLABLE.
 * ========================================================
 */

export default class CreateAuthSchema extends BaseSchema {
  protected schemaName = 'auth'

  public async up() {
    this.schema.createSchemaIfNotExists(this.schemaName)
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
  }

  public async down() {
    this.schema.dropSchemaIfExists(this.schemaName)
  }
}
