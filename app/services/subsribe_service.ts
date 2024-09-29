/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2024-09-29 00:13:56
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-09-29 20:29:44
 * @FilePath: \manga-get\app\services\subsribe_service.ts
 */
import Axios from 'axios'

const cookie = `buvid3=1C68BCE1-EA26-6132-4BC3-4CB18AA6221B07705infoc; b_nut=1714325807; _uuid=F97F958F-110110-CFFF-10A107-DE4928AF3FFD08030infoc; rpdid=0zbfvRPG2A|cnMxLwKO|2gE|3w1S18Hg; iflogin_when_web_push=0; DedeUserID=331165645; DedeUserID__ckMd5=ffc0cdbb2bc9b2c3; buvid4=F0780AFB-2952-1BA1-CB32-3A984C3328DF59297-022100809-H07TdPlUhTJv6hHC%2F5gV0Q%3D%3D; buvid_fp_plain=undefined; LIVE_BUVID=AUTO2017145763743724; hit-dyn-v2=1; enable_web_push=DISABLE; header_theme_version=CLOSE; PVID=1; share_source_origin=COPY; CURRENT_QUALITY=120; home_feed_column=5; bsource=search_baidu; CURRENT_BLACKGAP=0; CURRENT_FNVAL=4048; dy_spec_agreed=1; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjYzODc5OTIsImlhdCI6MTcyNjEyODczMiwicGx0IjotMX0.Ufnodi3aZa52Be2-cNnSaIR40gTIochHEDnRDjNVHi8; bili_ticket_expires=1726387932; fingerprint=fd644845537d05da87b0f42299d564a4; buvid_fp=fd644845537d05da87b0f42299d564a4; SESSDATA=61c8b11f%2C1741855285%2C406f3%2A91CjCG5M4r7l8TOH2NDZDRctog9UWlEzHGFMuTgXGDImKWgVI1rrPVGAW4Cs6QmcQvJK4SVnNzWGc0cUpPQ25YQXJRclpyMWthbmp6NHpSbDRDV0Y1U2lFdUtvVlROV3ItVG5JUFFPY3dWTkVsY3duODNmTkgyaEwwX05ZNUw0TGVqQzIwcmFwMGhBIIEC; bili_jct=c19e0a02758082847ab5a164e4a4c4f7; sid=6grb0we6; b_lsid=15A10665A_191EFC5116A; bp_t_offset_331165645=976962780458385408; browser_resolution=2120-973`

const axios = Axios.create({
  //   baseURL: 'https://manga.bilibili.com',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Cookie': cookie,
    'Origin': 'https://manga.bilibili.com',
    'Referer': 'https://manga.bilibili.com/mc29988/592863?from=manga_detail',
  },
  withCredentials: true,
})

export async function start() {
  console.log('start')
  // 解析章节
}
async function get_chapter_list(comic_id: number) {
  const ComicDetailUrl = 'https://manga.bilibili.com/twirp/comic.v1.Comic/ComicDetail'
  const res = await axios.post(ComicDetailUrl, { comic_id })
  const data = res.data.data

  const chapters = data.ep_list.map((item: any) => {
    return {
      targetId: item.id,
      title: item.title,
      ord: item.ord,
      payMode: item.pay_mode === 1,
      payGold: item.gold,
      isLocked: item.is_locked,
      isFree: item.is_in_free,
      cover: item.cover,
      publishDate: item.pub_time,
      size: item.size,
      count: item.image_count,
    }
  })
  const meta = {
    targetId: data.id,
    title: data.title,
    horizontalCover: data.horizontal_cover,
    squareCover: data.square_cover,
    verticalCover: data.vertical_cover,
    author: data.author_name.join(','),
    classify: data.styles.join(','),
    laster: data.last_ord,
    finished: data.is_finish === 1,
    describe: data.evaluate,
    count: data.total,
    tags: data.tags,
    publishDate: data.release_time,
    updateDate: data.renewal_time,
    payMode: data.pay_mode === 1,
    banners: data.horizontal_covers,
    chapters: chapters,
  }

  return meta
}

async function download_chapter(chapterId: number) {
  // 获取图片列表
  const images = await image_index(chapterId)
  const paths = images.map((item: any) => item.path)
  //   console.log(images)
  const tokens = await image_token(paths)
  tokens.forEach(async (item: any, index: number) => {
    const url = `${item.url}?token=${item.token}`
    const downloadPath = `./download/漫画名/章节名`
    await fs.promises.mkdir(downloadPath, { recursive: true })
    const picName = index.toString().padStart(5, '0')
    const localPath = `${downloadPath}/${picName}.jpg`
    await downloadFile(url, localPath)
  })
}

async function image_index(ep_id: number) {
  const GetImageIndexURL =
    'https://manga.bilibili.com/twirp/comic.v1.Comic/GetImageIndex?device=pc&platform=web'
  const res = await axios.post(GetImageIndexURL, { ep_id })
  const data = res.data.data
  const images = data.images
  return images
}

async function image_token(paths: string[]) {
  const ImageTokenURL =
    'https://manga.bilibili.com/twirp/comic.v1.Comic/ImageToken?device=pc&platform=web'
  const res = await axios.post(ImageTokenURL, {
    urls: JSON.stringify(paths),
  })
  const data = res.data.data
  return data
}

import * as fs from 'fs'
import { title } from 'process'
import { finished } from 'stream'
async function downloadFile(url: string, localPath: string) {
  await Axios.get(url, { responseType: 'arraybuffer' }).then(async function (response) {
    const bufObj = Buffer.from(await response.data)
    fs.writeFileSync(localPath, bufObj, 'binary')
  })
}
