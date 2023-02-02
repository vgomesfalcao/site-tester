import { existsSync, mkdirSync } from 'fs'
import puppeteer from 'puppeteer'
import { IDocCreator } from './docCreators/IDocCreator'
import { Sitemap } from './sitemap'
export class Page {
  private _csvCreator: IDocCreator
  private _sitemap: Sitemap
  private _printDirname = './export/printscreen/'

  constructor({
    sitemap,
    csvCreator,
  }: {
    sitemap: Sitemap
    csvCreator: IDocCreator
  }) {
    this._sitemap = sitemap
    this._csvCreator = csvCreator
  }

  /**
   * Navigate on the pages of sitemap, take print and save into ./printscreen folder
   */
  public async navigateAndTakePrint() {
    const paths = this._sitemap.pathMapList
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
        this._sitemap.pathMapList[index].statusCode = response.status().toString()
        await page.screenshot({
          path: filepath,
          fullPage: true,
        })
      }
      await browser.close().then(() => this._csvCreator.save(this._sitemap.pathMapList))
    })()
  }
  /**
   * Returns the list of urls parsed from sitemap.xml
   */
  /**
   * Returns the complete path and filename of file
   */
  

  
}
