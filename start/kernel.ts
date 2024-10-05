/*
 * @Author: 梁楷文 lkw199711@163.com
 * @Date: 2024-09-30 05:07:46
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-10-02 05:50:04
 * @FilePath: \manga-get\start\kernel.ts
 */
/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

import { mangaDownload } from '#services/subsribe_service'

/**
 * The error handler is used to convert an exception
 * to a HTTP response.
 */
server.errorHandler(() => import('#exceptions/handler'))

/**
 * The server middleware stack runs middleware on all the HTTP
 * requests, even if there is no route registered for
 * the request URL.
 */
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])

/**
 * The router middleware stack runs middleware on all the HTTP
 * requests with a registered route.
 */
router.use([() => import('@adonisjs/core/bodyparser_middleware')])

/**
 * Named middleware collection must be explicitly assigned to
 * the routes or the routes group.
 */
export const middleware = router.named({})

import { read_json } from '#utils/index'
const subsribe = read_json('./subsribe.json')
console.log(subsribe);
if(subsribe.length > 0){
  for(let i = 0; i < subsribe.length; i++){
    const download = new mangaDownload(subsribe[i].id)
    await download.start()
  }
}
// const download = new mangaDownload(34355)
// download.start()