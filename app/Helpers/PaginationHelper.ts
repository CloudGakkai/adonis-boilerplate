import { ResponseContract } from '@ioc:Adonis/Core/Response'
import { ModelQueryBuilderContract, LucidModel, ModelObject } from '@ioc:Adonis/Lucid/Orm'
import Application from '@ioc:Adonis/Core/Application'

export interface Pagination {
  page?: number
  perPage: number
}

export default class PaginationHelper {
  public page?: number
  public perPage: number

  /**
   * Initialize pagination helper, this method requires the request context to access header request
   *
   * @param request RequestContract
   * @returns PaginationHelper()
   */
  public static initialize(qs?: Record<string, any>) {
    const instance = new PaginationHelper()

    instance.page = qs?.page
    instance.perPage = qs?.perPage ?? Application.env.get('PAGINATION', 10)

    return instance
  }

  /**
   * Fetch data from model and generate pagination for model
   *
   * @param query ModelQueryBuilderContract<LucidModel>
   * @param response ResponseContract
   * @returns Promise<ModelObject[]>
   */
  public async paginate(
    query: ModelQueryBuilderContract<LucidModel>,
    response: ResponseContract
  ): Promise<ModelObject[]> {
    if (!this.page) {
      throw 'Page query string must exists to execute this method'
    }

    const lists = await query.paginate(this.page, this.perPage)

    response?.header('x-page', lists.currentPage)
    response?.header('x-last-page', lists.lastPage)
    response?.header('x-per-page', lists.perPage)
    response?.header('x-total', lists.total)
    const jsonData = lists.serialize()
    return jsonData.data
  }

  /**
   * Fetch data with or without pagination
   *
   * @param query ModelQueryBuilderContract<LucidModel>
   * @param response ResponseContract
   * @returns Promise<ModelObject[]>
   */
  public async fetch(
    query: ModelQueryBuilderContract<LucidModel>,
    response?: ResponseContract
  ): Promise<ModelObject[]> {
    if (this.page) {
      if (!response) {
        throw 'Context response must provided when using pagination'
      }
      return await this.paginate(query, response)
    } else {
      return await query.limit(this.perPage)
    }
  }
}
