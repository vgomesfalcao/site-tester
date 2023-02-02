import { Page } from './page'
import { CsvCreator } from './docCreators/CsvCreator'
import { Sitemap } from './sitemap'

const pathToCSV = './export/'
const filenameCSV = 'pages_test'

const crawler = new Page({
  sitemap: new Sitemap({ siteMapPath: 'resources/sitemap/sitemap.xml' }),
  csvCreator: new CsvCreator({ filename: filenameCSV, path: pathToCSV }),
})

crawler.navigateAndTakePrint()
