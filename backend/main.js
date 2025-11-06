require("dotenv").config();
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer')

// To Do: Return error if user enters an invalid URL. If the function returns an error, display an error on the website
async function priceFind(url){
    try{
    const browser = await puppeteer.launch({
        args:[
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath: 
            process.env.NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath
    }); 
    const page = await browser.newPage();
    await page.goto(url);
    const priceTag = await page.evaluate(() => { // PriceTag stores the latest price of the item
        const price = document.querySelector(".fr-ec-price").textContent.replace("$", ""); // Price is stored in .fr-ec-price, extracts the price then cleans it up
        return parseFloat(price); // Convert price to float
    });
    await browser.close();
    return priceTag        
    } catch(error){
        console.log("Error getting the price", error)
    }
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

