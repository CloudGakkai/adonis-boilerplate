import { SimplePaginatorContract } from '@ioc:Adonis/Lucid/Database'

declare module '@ioc:Adonis/Lucid/Orm' {
  interface ModelPaginatorContract<Result extends LucidRow>
    extends Omit<SimplePaginatorContract<Result>, 'toJSON'> {
    serialize(cherryPick?: CherryPick): {
      meta: any
      data: ModelObject[]
    }
    toJSON(): ModelObject[]
  }
}
