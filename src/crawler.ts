import { XMLParser } from 'fast-xml-parser'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import puppeteer, { Browser, Page } from 'puppeteer'
import { URL } from 'url'
import { Options } from './getArgs'
const { ceil } = require('mathjs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
type UrlMap = { url: string; statusCode?: string; imgPath?: string }
export class Crawler {
  private _parser: XMLParser = new XMLParser()
  private _siteMapPath: string
  private _pathMapList: UrlMap[] = []
  private _printDirname = './export/printscreen/'
  private _csvDirname = './export/'
  private _options: Options

  constructor({ options, siteMapPath }: { options: Options; siteMapPath: string }) {
    this._siteMapPath = siteMapPath
    this._options = options
    console.log('Carregando lista de urls...')
    this.loadUrlPathsList()
    console.log('Carregando lista de imagens...')
    this.loadFilePaths()
  }

  /**
   *
   * Navigate on the pages of sitemap, take print and save into ./printscreen folder
   */
  public async takePrint(): Promise<void> {
    console.log('Criando Pasta...')
    this.createFolder(this._printDirname)

    await this.start(8)
  }

  private async start(instanceNumber: number): Promise<void> {
    const divisionNumber = ceil(this._pathMapList.length / instanceNumber)

    for (let index = 0; index < instanceNumber; index++) {
      const initialPathNumber = this.calculateInitialPathNumber(divisionNumber, index)
      const finalPathNumber = this.calculateFinalPathNumber(divisionNumber, index, instanceNumber)
      this.createInstance(initialPathNumber, finalPathNumber, index, instanceNumber)
    }
  }

  private async createInstance(
    initialPathNumber: number,
    finalPathNumber: number,
    index: number,
    instanceNumber: number
  ) {
    const { page, browser } = await this.loadBrowser(this._pathMapList[0])

    this.navigate(this._pathMapList.slice(initialPathNumber, finalPathNumber), page, browser).then(() => {
      index === instanceNumber - 1 ? this.createCSVFile() : null
    })
  }

  private calculateInitialPathNumber(divisionNumber: number, index: number) {
    if (index == 0) {
      return 0
    }
    return divisionNumber * index + 1
  }

  private calculateFinalPathNumber(divisionNumber: number, index: number, instanceNumber: number) {
    if (index === instanceNumber) {
      return this._pathMapList.length
    }
    return divisionNumber * (index + 1)
  }

  /**
   * Load a browser instance and login at the page if necessary
   * @param {UrlMap[]} loginPath path to login
   * @returns {Promise<{page:Page,browser:Browser}>} Promise with page and browser
   */
  private async loadBrowser(loginPath: UrlMap) {
    console.log('Abrindo Browser...\n')
    const browser = await puppeteer.launch({
      defaultViewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      },
    })
    const page = await browser.newPage()
    !this._options.nologin ? await this.login(page, loginPath.url) : null
    return { page, browser }
  }
  /**
   *
   * @param {UrlMap[]} paths
   * @param {Page} page
   */
  private async navigate(paths: UrlMap[], page: Page, browser: Browser) {
    for (const [index, path] of paths.entries()) {
      const filepath = path.imgPath

      console.log(`Acessando página ${index + 1} de ${paths.length}`)

      const response = await page.goto(path.url, {
        waitUntil: 'networkidle2',
      })
      this._pathMapList[index].statusCode = response.status().toString()
      await page.screenshot({
        path: filepath,
        fullPage: true,
      })
    }
    browser.close()
  }

  private async login(page: Page, url: string): Promise<void> {
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.type('#edit-name', 'admin_cap')
    await page.type('#edit-pass', 'LfK75Jy8T^YT')
    await Promise.all([page.click('#edit-submit'), page.waitForNavigation({ waitUntil: 'networkidle2' })])
  }

  /**
   * Returns the list of urls parsed from sitemap.xml
   */
  private loadUrlPathsList(): void {
    let siteMapObject: object
    if (this._options.test) {
      siteMapObject = this._parser.parse(readFileSync('resources/sitemap/sitemap_test.xml'))
    } else {
      siteMapObject = this._parser.parse(readFileSync(this._siteMapPath))
    }
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
    const filePath = `${this._printDirname}${urlObject.host.replaceAll('.', '_')}_${urlObject.pathname
      .slice(1)
      .replaceAll('/', '-')}.png`
    return filePath
  }

  private loadFilePaths(): void {
    for (const path of this._pathMapList) {
      path.imgPath = this.createFilePath(path.url)
    }
  }

  public createCSVFile(): void {
    this.createFolder(this._csvDirname)
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

  private createFolder(dirName: string) {
    if (!existsSync(dirName)) {
      mkdirSync(dirName, { recursive: true })
    }
  }
}
