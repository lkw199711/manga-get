/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2024-09-29 00:13:56
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-10-02 13:41:27
 * @FilePath: \manga-get\app\services\subsribe_service.ts
 */
import * as fs from 'fs'
import { downloadImage, get_meta, image_index, image_token } from '#api/index'

// import { downloadImage } from '#utils/index'

export class mangaDownload {
  private mangaId: number
  private downloadPath: string
  constructor(mangaId: number) {
    this.mangaId = mangaId
    this.downloadPath = `F:\\01manga\\bilibili`
  }

  /**
   * @description: 开始下载
   */
  async start() {
    console.log('start')
    // 解析章节
    // 元数据
    const meta = await get_meta(this.mangaId)
    // 章节列表
    const chapters = meta.chapters
    // 漫画名删除特殊字符
    const mangaName = meta.title.replaceAll(/[<>:"/\\|?*]/g, '')
    // 创建元数据文件夹
    const metaFolder = `${this.downloadPath}/${mangaName}-smanga-info`
    if (!fs.existsSync(metaFolder)) await fs.promises.mkdir(metaFolder, { recursive: true })
    const metaFile = `${metaFolder}/${mangaName}.json`
    if (fs.existsSync(metaFile)) {
      const rawData = fs.readFileSync(metaFile, 'utf-8')
      const oldMetaData = JSON.parse(rawData)
      if (oldMetaData.chapters.length !== meta.chapters.length) {
        await fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2))
      } else {
        return
      }
    } else {
      // 写入元数据
      await fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2))

      // 下载banner图
      const banners = meta.banners
      for (let i = 0; i < banners.length; i++) {
        const banner = banners[i]
        const localPath = `${metaFolder}/banner${i.toString().padStart(2, '0')}.jpg`
        await downloadImage(banner, localPath)
      }

      // 封面图
      await downloadImage(meta.horizontalCover, `${metaFolder}/horizontalCover.jpg`)
      await downloadImage(meta.squareCover, `${metaFolder}/squareCover.jpg`)
      await downloadImage(meta.verticalCover, `${metaFolder}/verticalCover.jpg`)
      await downloadImage(meta.verticalCover, `${metaFolder}/cover.jpg`)
    }

    // 下载章节
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i]
      const chapterName = chapter.title.replaceAll(/[<>:"/\\|?*]/g, '')
      if (chapter.isLocked) {
        continue
      }
      const chapterFolder = `${this.downloadPath}/${mangaName}/${this.get_order(chapter.ord)} ${chapterName}`
      // 已下载 跳过
      if (fs.existsSync(chapterFolder)) {
        continue
      } else {
        await fs.promises.mkdir(chapterFolder, { recursive: true })
      }
      await downloadImage(chapter.cover, `${chapterFolder}.jpg`)
      await this.download_chapter(chapter.targetId, chapterFolder)
    }

    console.log(mangaName + ' 订阅完毕')
  }

  /**
   * 下载章节
   * @param chapterId
   * @param downloadPath
   */
  async download_chapter(chapterId: number, downloadPath: string) {
    // 获取图片列表
    const images = await image_index(chapterId)
    const paths = images.map((item: any) => item.path)
    //   console.log(images)
    const tokens = await image_token(paths)
    for (let i = 0; i < tokens.length; i++) {
      const item = tokens[i]
      const url = `${item.url}?token=${item.token}`
      const picName = i.toString().padStart(5, '0')
      const localPath = `${downloadPath}/${picName}.jpg`
      await downloadImage(url, localPath)
    }
  }

  get_order(ord: number) {
    const arr = ord.toString().split('.')

    if (arr.length > 1) return arr[0].padStart(5, '0') + '.' + arr[1]

    return ord.toString().padStart(5, '0')
  }
}
