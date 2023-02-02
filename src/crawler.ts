import { XMLParser } from 'fast-xml-parser'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import puppeteer, { Page } from 'puppeteer'
import { URL } from 'url'
const createCsvWriter = require('csv-writer').createObjectCsvWriter
type UrlMap = { url: string; statusCode?: string; imgPath?: string }
export class Crawler {
  private _parser: XMLParser = new XMLParser()
  private _siteMapPath: string
  private _pathMapList: UrlMap[] = []
  private _printDirname = './export/printscreen/'
  private _csvDirname = './export/'

  constructor(siteMapPath: string) {
    this._siteMapPath = siteMapPath
    console.log('Carregando lista de urls...')
    this.loadUrlPathsList()
    console.log('Carregando lista de imagens...')
    this.loadFilePaths()
  }

  /**
   * Navigate on the pages of sitemap, take print and save into ./printscreen folder
   */
  public async navigateAndTakePrint({ login = false }: { login: boolean }) {
    console.log('Criando Pasta...')
    const paths = this._pathMapList
    if (!existsSync(this._printDirname)) {
      mkdirSync(this._printDirname, { recursive: true })
    }

    console.log('Abrindo Browser...\n')
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    login ? this.login(page, paths[0].url) : null

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
    await browser.close().then(() => this.createCSVFile())
  }

  private async login(page: Page, url: string): Promise<void> {
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.type('#edit-name', 'admin_cap')
    await page.type('#edit-pass', 'LfK75Jy8T^YT')
    await Promise.all([
      page.click('#edit-submit'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ])
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

  public createCSVFile(): void {
    if (!existsSync(this._csvDirname)) {
      mkdirSync(this._csvDirname, { recursive: true })
    }
    const csvWriter = createCsvWriter({
      path: this._csvDirname + 'pages_test.csv',
      header: [
        { id: 'statusCode', title: 'Status Code' },
        { id: 'url', title: 'URL' },
        { id: 'imgPath', title: 'IMG' },
      ],
      fieldDelimiter: ';',
    })
    const records: UrlMap[] = this._pathMapList
    csvWriter.writeRecords(records).then(() => {
      console.log('\n...Done')
    })
  }
}
