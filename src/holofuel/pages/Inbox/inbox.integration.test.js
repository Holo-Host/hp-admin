import puppeteer from 'puppeteer'

describe('Inbox', () => {
  it("CopyToClipboard contains 'Perry'", async () => {
    const browser = await puppeteer.launch({
      headless: true
    })

    const page = await browser.newPage()

    await page.goto('http://localhost:3100/inbox')

    await page.waitForSelector("[data-testid='copy-content']")

    const html = await page.$eval("[data-testid='copy-content']", e => e.innerHTML)
    expect(html).toBe('Perry')

    browser.close()
  }, 10000)
})
