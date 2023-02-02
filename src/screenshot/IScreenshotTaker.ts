import { Page } from 'puppeteer'

export interface IScreenshotTaker {
  takeScreenshot(page: Promise<Page>): Promise<void>
}
