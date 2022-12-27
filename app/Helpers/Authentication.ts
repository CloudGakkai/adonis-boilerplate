import { HttpContext } from '@adonisjs/core/build/standalone'
import UnAuthorized from 'App/Exceptions/UnAuthorizedException'
import User from 'App/Models/User'
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
export function CheckRole(permissions: string[] = []) {
  return function (_target: Object, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value!
    descriptor.value = async function (...args: any[]) {
      const ctx: HttpContext = args[0]
      permissions.push('SUPERADMIN')
      const user = await User.findOrFail(ctx.request.decoded!.user_id)

      // Fetch user roles
      await user.load('roles')
      if (user.roles.length === 0) {
        throw new UnAuthorized('Access denied.', StatusCodes.UNAUTHORIZED)
      }

      // Check if user has permission to access target module
      let isPermitted = false
      if (user.roles.some((role) => permissions.includes(role.title.toUpperCase()))) {
        isPermitted = true
      }

      if (isPermitted) {
        return originalMethod.bind(this)(...args)
      } else {
        throw new UnAuthorized('Tidak memiliki izin', StatusCodes.UNAUTHORIZED)
      }
    }
  }
}
