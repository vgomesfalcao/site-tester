import { Crawler } from "./crawler"

const crawler = new Crawler('resources/sitemap/sitemap.xml')

crawler.navigateAndTakePrint()
