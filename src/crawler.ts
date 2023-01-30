import { XMLParser } from 'fast-xml-parser'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import puppeteer from 'puppeteer'
import { URL } from 'url'
const createCsvWriter = require('csv-writer').createObjectCsvWriter
export class Crawler {
  private _parser: XMLParser = new XMLParser()
  private _siteMapPath: string
  private _urls: string[]
  private _statusCode: string[] = []
  private _printDirname = './export/printscreen/'
  private _csvDirname = './export/doc/'

  constructor(siteMapPath: string) {
    this._siteMapPath = siteMapPath
    this.getUrlPathsList()
  }

  /**
   * Navigate on the pages of sitemap, take print and save into ./printscreen folder
   */
  public async navigateAndTakePrint() {
    const paths = this._urls

    if (!existsSync(this._printDirname)) {
      mkdirSync(this._printDirname, { recursive: true })
    }
    ;(async () => {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.goto(paths[0], { waitUntil: 'networkidle2' })
      await page.type('#edit-name', 'admin_cap')
      await page.type('#edit-pass', 'LfK75Jy8T^YT')
      await Promise.all([
        page.click('#edit-submit'),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ])
      for (const path of paths) {
        const filepath = this.createFilePath(path)
        const response = await page.goto(path, { waitUntil: 'networkidle2' })
        this._statusCode.push(response.status().toString())
        await page.screenshot({
          path: filepath,
          fullPage: true,
        })
      }
      await browser.close().then(() => this.createCSVFile())
    })()
  }
  /**
   * Returns the list of urls parsed from sitemap.xml
   */
  private getUrlPathsList(): void {
    let siteMapObject: object = this._parser.parse(
      readFileSync(this._siteMapPath)
    )
    let _urls: string[] = []
    for (const item of siteMapObject['urlset']['url']) {
      _urls.push(item['loc'])
    }
    this._urls = _urls.slice(0, 3)
  }
  /**
   * Returns the complete path and filename of file
   */
  private createFilePath(path: string): string {
    const url = new URL(path)
    if (url.pathname == '/') {
      return `${this._printDirname}${url.host.replaceAll('.', '_')}.png`
    }
    const filePath = `${this._printDirname}${url.host.replaceAll(
      '.',
      '_'
    )}_${url.pathname.slice(1).replaceAll('/', '-')}.png`
    return filePath
  }

  private generateRecords(): object[] {
    let records: object[] = []
    this._urls.forEach((element, index) => {
      records.push({
        url: new URL(element).pathname,
        statusCode: this._statusCode[index],
        imgPath: this.createFilePath(element),
      })
    })
    return records
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
    const records: object[] = this.generateRecords()
    csvWriter.writeRecords(records).then(() => {
      console.log('...Done')
    })
  }
}
