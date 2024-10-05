/*
 * @Author: 梁楷文 lkw199711@163.com
 * @Date: 2024-09-30 10:48:36
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-10-02 05:48:33
 * @FilePath: \manga-get\app\utils\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import Axios from 'axios'
import * as fs from 'fs'
export async function downloadImage(url: string, path: string): Promise<void> {
  const response = await Axios({
    method: 'get',
    url,
    responseType: 'stream',
  })

  const writer = fs.createWriteStream(path)
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

export function read_json(file: string) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}
