import { IDocCreator } from './IDocCreator'
import { existsSync, mkdirSync } from 'fs'
import { UrlMap } from '../typeObjects/UrlMap'
const createCsvWriter = require('csv-writer').createObjectCsvWriter

export class CsvCreator implements IDocCreator {
  private path: string
  private name: string

  constructor({ path, filename }: { path: string; filename: string }) {
    this.path = path
    this.name = filename
  }

  async save(pathMapList): Promise<void> {
    const csvWriter = createCsvWriter({
      path: `${this.path}${this.name}.csv`,
      header: [
        { id: 'statusCode', title: 'Status Code' },
        { id: 'url', title: 'URL' },
        { id: 'imgPath', title: 'IMG' },
      ],
      fieldDelimiter: ';',
    })
    const records: UrlMap[] = pathMapList
    csvWriter.writeRecords(records).then(() => {
      console.log('\n...Done')
    })
  }

  async createFolder() {
    if (!existsSync(this.path)) {
      mkdirSync(this.path, { recursive: true })
    }
  }
}
