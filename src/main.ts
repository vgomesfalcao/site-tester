import { Crawler } from './crawler'

import { getArgs } from './getArgs'
const options = getArgs(process.argv)

const crawler = new Crawler({
  options,
  siteMapPath: 'resources/sitemap/sitemap.xml',
})

crawler.navigateAndTakePrint()
