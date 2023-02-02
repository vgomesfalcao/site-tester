import { Page } from 'puppeteer'
import { IScreenshotTaker } from './IScreenshotTaker'

class ScreenShotTaker implements IScreenshotTaker {
  async takeScreenshot(page: Promise<Page>): Promise<void> {}
}
