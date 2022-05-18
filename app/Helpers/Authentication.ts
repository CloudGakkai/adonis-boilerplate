import { HttpContext } from '@adonisjs/core/build/standalone'
import UnAuthorized from 'App/Exceptions/UnAuthorizedException'
import { StatusCodes } from 'http-status-codes'

/**
 * Used to check admin role on method controller
 *
 * @param permitted [string]
 * @returns void
 *
 * ```
 * @CheckRole(['satpam'])
 * public async index(ctx: HttpContextContract) {
 *  .....
 * }
 *
 * ```
 */
export function CheckRole(permission: string[] = []) {
  return function (_target: Object, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value!
    descriptor.value = function (...args: any[]) {
      const ctx: HttpContext = args[0]
      const isPermitted: boolean = permission.some((item) => ctx.request.decoded?.role === item)
      if (isPermitted) {
        return originalMethod.bind(this)(...args)
      } else {
        throw new UnAuthorized('Tidak memiliki izin', StatusCodes.UNAUTHORIZED)
      }
    }
  }
}

// export default { CheckRole }
