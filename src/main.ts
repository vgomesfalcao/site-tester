import { Crawler } from './crawler'
import { CsvCreator } from './csv_creator/CsvCreator'

const pathToCSV = './export/'
const filenameCSV = 'pages_test'

const crawler = new Crawler(
  'resources/sitemap/sitemap.xml',
  new CsvCreator({ filename: filenameCSV, path: pathToCSV })
)

crawler.navigateAndTakePrint()
