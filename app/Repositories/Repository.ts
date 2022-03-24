import {
  ExtractModelRelations,
  LucidModel,
  ModelAdapterOptions,
  ModelAttributes,
  ModelObject,
  ModelQueryBuilderContract,
  RelationQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'
import PaginationHelper from 'App/Helpers/PaginationHelper'
import { ResponseContract } from '@ioc:Adonis/Core/Response'

export abstract class Repository<T extends LucidModel> {
  public model: T
  public query: ModelQueryBuilderContract<T>

  private pagination: PaginationHelper
  private _qs?: Record<string, any> | undefined

  public get qs(): Record<string, any> | undefined {
    return this._qs
  }

  public set qs(value: Record<string, any> | undefined) {
    this._qs = value
  }

  /**
   * Initialize query method for profile model
   *
   */
  public setQuery(opt?: { qs?: Record<string, any>; adapter?: ModelAdapterOptions }) {
    this._qs = opt?.qs
    this.pagination = PaginationHelper.initialize(opt?.qs)
    this.query = this.model.query(opt?.adapter)
    return this
  }

  public findOrFail(id: number) {
    return this.model.findOrFail(id)
  }

  public create(payload: Partial<ModelAttributes<InstanceType<T>>>) {
    return this.model.create(payload)
  }

  public preload(
    relation: ExtractModelRelations<InstanceType<T>>,
    callback?: (callback: RelationQueryBuilderContract<T, any>) => void
  ) {
    this.query.preload(relation, callback)
    return this
  }

  public select(fields: string[]) {
    this.query.select(fields)
    return this
  }

  /**
   * sort query row result
   *
   * @param field
   * @param direction
   * @returns
   */
  public orderBy(field: string, direction: 'asc' | 'desc') {
    this.query.orderBy(field, direction)
    return this
  }

  /**
   *
   * Fetch data from query
   *
   * @returns Promise<ModelObject[]>
   */
  public async fetch(response?: ResponseContract): Promise<ModelObject[]> {
    return await this.pagination.fetch(this.query, response)
  }
}
