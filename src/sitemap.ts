import { readFileSync } from 'fs'
import { XMLParser } from 'fast-xml-parser'
import { URL } from 'url'
import { UrlMap } from './typeObjects/UrlMap'

export class Sitemap {
  private _siteMapPath: string
  public pathMapList: UrlMap[] = []

  private _parser: XMLParser = new XMLParser()

  constructor({ siteMapPath }: { siteMapPath: string }) {
    this._siteMapPath = siteMapPath
    console.log('Carregando lista de urls...')
    this.loadUrlPathsList()
    console.log('Carregando nomes dos arquivos de imagem...')
    this.loadFilePaths()
  }
  private loadUrlPathsList(): void {
    let siteMapObject: object = this._parser.parse(
      readFileSync(this._siteMapPath)
    )
    for (const item of siteMapObject['urlset']['url']) {
      this.pathMapList.push({ url: item['loc'] })
    }
    // Slice to test with a demo of complete list
    // this._pathMapList = this._pathMapList.slice(0, 249)
  }
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
    for (const path of this.pathMapList) {
      path.imgPath = this.createFileName(path.url)
    }
  }
}
