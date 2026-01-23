require("dotenv").config();
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer')
const {getItemsCollection} = require('./db');


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
  await itemsCollection.deleteMany({watchers: { $size: 0 }}) // Cleaning up items with no watchers
  const items = await itemsCollection.find({}, {projection: { link: 1, price: 1, watchers: 1}}).toArray(); // Grabs all the link and price

  for (const item of items) {
    const { _id, link, price: oldPrice, watchers } = item;

    const newPrice = await priceFind(link);
    if (newPrice === null) continue; // If scraping fails, move onto next

    // Setting the price from null
    if (oldPrice == null) {
      await itemsCollection.updateOne({ _id },{ $set: { price: newPrice } });
      console.log(`Setting price for ${link}: ${oldPrice} -> ${newPrice}`);
      continue // Since price was null, no need to compare it with newPrice
    }

    // If price is dropped, call sendEmail() and send an email to the watchers notifying them about the price drop
    if (oldPrice > newPrice){
      await itemsCollection.updateOne({ _id },{ $set: { price: newPrice } });
      console.log(`Price dropped for ${link}: ${oldPrice} -> ${newPrice}`);

      // If there are a watcher exist for an item, sends the email, if not, skip it
      if(watchers && watchers.length> 0 ){
        await sendEmail(link, watchers, oldPrice, newPrice)
      } else{
        console.log(`No watchers for ${link}, skipping email`)
      }
      
    }
  }

  console.log("Finished running")
}

async function sendEmail(link, email, oldPrice, newPrice){
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
        to: email,
        subject: "Your Uniqlo item price has dropped!",
        text: `The item from your watch list has drops its price from ${oldPrice} to ${newPrice}!
        View item: ${link}`
    })

    console.log("Message sent: %s", info.messageId);
}

module.exports = {priceFind}