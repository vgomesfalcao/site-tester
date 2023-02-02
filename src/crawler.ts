import { XMLParser } from 'fast-xml-parser'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import puppeteer from 'puppeteer'
import { URL } from 'url'
import { IDocCreator } from './csv_creator/IDocCreator'
import { UrlMap } from './objectsType/UrlMap'
export class Crawler {
  private _parser: XMLParser = new XMLParser()
  private _csvCreator: IDocCreator
  private _siteMapPath: string
  private _pathMapList: UrlMap[] = []
  private _printDirname = './export/printscreen/'

  constructor(siteMapPath: string, csvCreator: IDocCreator) {
    this._siteMapPath = siteMapPath
    this._csvCreator = csvCreator
    console.log('Carregando lista de urls...')
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
      process.stdout.write('Abrindo Browser...\n')
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.goto(paths[0].url, { waitUntil: 'networkidle2' })
      await page.type('#edit-name', 'admin_cap')
      await page.type('#edit-pass', 'LfK75Jy8T^YT')
      await Promise.all([
        page.click('#edit-submit'),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ])

      for (const [index, path] of paths.entries()) {
        const filepath = path.imgPath
        process.stdout.clearLine(0)
        process.stdout.cursorTo(0)
        process.stdout.write(
          `Acessando página ${index + 1} de ${paths.length + 1}`
        )

        const response = await page.goto(path.url, {
          waitUntil: 'networkidle2',
        })
        this._pathMapList[index].statusCode = response.status().toString()
        await page.screenshot({
          path: filepath,
          fullPage: true,
        })
      }
      await browser.close().then(() => this._csvCreator.save(this._pathMapList))
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
    // Slice to test with a demo of complete list
    // this._pathMapList = this._pathMapList.slice(0, 249)
  }
  /**
   * Returns the complete path and filename of file
   */
  private createFileName(path: string): string {
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
      path.imgPath = this.createFileName(path.url)
    }
  }
}
