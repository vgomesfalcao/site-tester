import { XMLParser } from 'fast-xml-parser'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import puppeteer from 'puppeteer'
import { URL } from 'url'
export class Crawler {
  private _parser: XMLParser = new XMLParser()
  private _siteMapPath: string
  private _urls: string[]
  dirname = './printscreen/'

  constructor(siteMapPath: string) {
    this._siteMapPath = siteMapPath
    this.getUrlPathsList()
  }

  /**
   * Navigate on the pages of sitemap, take print and save into ./printscreen folder
   */
  public async navigateAndTakePrint() {
    const paths = this._urls.slice(0, 3)

    if (!existsSync(this.dirname)) {
      mkdirSync(this.dirname)
    }
    ;(async () => {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      for (const path of paths) {
        const filepath = this.createFilePath(path)
        await page.goto(path, { waitUntil: 'networkidle2' })
        await page.screenshot({
          path: filepath,
          fullPage: true,
        })
      }
      await browser.close()
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
    this._urls = _urls
  }
  /**
   * Returns the complete path and filename of file
   */
  private createFilePath(path: string): string {
    const url = new URL(path)
    if (url.pathname == '/') {
      return `${this.dirname}${url.host.replaceAll('.', '_')}.png`
    }
    const filePath = `${this.dirname}${url.host.replaceAll(
      '.',
      '_'
    )}_${url.pathname.slice(1).replaceAll('/', '-')}.png`
    return filePath
  }
}
