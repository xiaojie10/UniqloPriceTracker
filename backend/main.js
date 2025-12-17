require("dotenv").config();
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer')
const {connectDB, getItemsCollection} = require('./db');


let browser;
// Allow the browser to be reused
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
  }
  return browser;
}

// Finds the price of the item
async function priceFind(url) {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Waiting for Uniqlo to insert the price element fr-ec-price
    await page.waitForSelector('.fr-ec-price', { timeout: 15000 });

    const content = await page.content();
    const match = content.match(/aria-label="price is \$(\d{1,3}\.\d{2})"/); // RegEx to find the price

    if (!match) {
      console.log("Price not found in content");
      return null;
    }

    const price = parseFloat(match[1]);
    console.log(price, url);

    await page.close();
    return price;

  } catch (error) {
    console.log("Error getting the price", error);
  }
}

// Shuts down the browser
process.on('exit', async () => { if (browser) await browser.close(); });
process.on('SIGINT', async () => { if (browser) await browser.close(); });
process.on('SIGTERM', async () => { if (browser) await browser.close(); });

async function dbPriceUpdate(){
  const itemsCollection = await getItemsCollection();
  const items = await itemsCollection.find({}, {projection: { link: 1, price: 1}}).toArray(); // Grabs all the link and price

  for (const item of items) {
    const { _id, link, price: oldPrice } = item;

    const newPrice = await priceFind(link);

    // If scraping fails, move onto next
    if (newPrice === null) continue;

    // Updates old price if new price is found
    if (newPrice !== oldPrice) {
      await itemsCollection.updateOne({ _id },{ $set: { price: newPrice } });
      console.log(`Updated price for ${link}: ${oldPrice} → ${newPrice}`);
    }
  }
  console.log("Finished running")
}

async function sendEmail(){
    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
    const info = await transporter.sendMail({
        from: "pricenotify30@gmail.com",
        to: "xiaoli5253@yahoo.com",
        subject: "Price update!",
        text: "New message "
    })

    console.log("Message sent: %s", info.messageId);
}

async function runEmail(){
     await sendEmail()
}

module.exports = {priceFind}