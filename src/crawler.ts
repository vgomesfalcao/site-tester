import { XMLParser } from 'fast-xml-parser'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import puppeteer from 'puppeteer'
import { URL } from 'url'
const createCsvWriter = require('csv-writer').createObjectCsvWriter
type UrlMap = { url: string; statusCode?: string; imgPath?: string }
export class Crawler {
  private _parser: XMLParser = new XMLParser()
  private _siteMapPath: string
  private _pathMapList: UrlMap[] = []
  private _printDirname = './export/printscreen/'
  private _csvDirname = './export/doc/'

  constructor(siteMapPath: string) {
    this._siteMapPath = siteMapPath
    this.loadUrlPathsList()
    this.loadFilePaths()
  }

  /**
   * Navigate on the pages of sitemap, take print and save into ./printscreen folder
   */
  public async navigateAndTakePrint() {
    const paths = this._pathMapList

    if (!existsSync(this._printDirname)) {
      mkdirSync(this._printDirname, { recursive: true })
    }
    ;(async () => {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.goto(paths[0].url, { waitUntil: 'networkidle2' })
      await page.type('#edit-name', 'admin_cap')
      await page.type('#edit-pass', 'LfK75Jy8T^YT')
      await Promise.all([
        page.click('#edit-submit'),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ])
      paths.forEach(async (path, index) => {
        const filepath = path.imgPath
        console.log(paths[0].url)

        const response = await page.goto(path.url, {
          waitUntil: 'networkidle2',
        })
        this._pathMapList[index].statusCode = response.status().toString()
        await page.screenshot({
          path: filepath,
          fullPage: true,
        })
      })

      await browser.close().then(() => this.createCSVFile())
    })()
  }
  /**
   * Returns the list of urls parsed from sitemap.xml
   */
  private loadUrlPathsList(): void {
    let siteMapObject: object = this._parser.parse(
      readFileSync(this._siteMapPath)
    )
    for (const item of siteMapObject['urlset']['url']) {
      this._pathMapList.push({ url: item['loc'] })
    }
  }
  /**
   * Returns the complete path and filename of file
   */
  private createFilePath(path: string): string {
    const urlObject = new URL(path)
    if (urlObject.pathname == '/') {
      return `${this._printDirname}${urlObject.host.replaceAll('.', '_')}.png`
    }
    const filePath = `${this._printDirname}${urlObject.host.replaceAll(
      '.',
      '_'
    )}_${urlObject.pathname.slice(1).replaceAll('/', '-')}.png`
    return filePath
  }

  private loadFilePaths(): void {
    for (const path of this._pathMapList) {
      path.imgPath = this.createFilePath(path.url)
    }
  }

  public createCSVFile() {
    if (!existsSync(this._csvDirname)) {
      mkdirSync(this._csvDirname, { recursive: true })
    }
    const csvWriter = createCsvWriter({
      path: this._csvDirname + 'test.csv',
      header: [
        { id: 'url', title: 'URL' },
        { id: 'statusCode', title: 'Status Code' },
        { id: 'imgPath', title: 'IMG' },
      ],
    })
    const records: UrlMap[] = this._pathMapList
    csvWriter.writeRecords(records).then(() => {
      console.log('...Done')
    })
  }
}
