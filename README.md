# Uniqlo Price Tracker
A full stack web application that allows users to track products from popular clothing brand Uniqlo. Users will receive email notifications once their selected items drops in price by simplying submitting a Uniqlo product link along with their email. The system
automatically track the price in the background and sends email notifcation when price drop occurs. Users are also able to remove their email from the database anytime.

## How it's made
Front end: EJS, HTML/CSS, JavaScript

Backend: Node.js, Express.js, MongoDB

Automation: Puppeteer, Nodemailer

## Server
Why expres?

Express was used because it's a lightweight and flexible backend framework fits all my needs of a scraping(puppeteer) application as well as easy integration with other tools I'm using such as MongoDB and Nodemailer.


It serves as the backbone for request handling and data validation by using a single POST endpoint `(/)` to handle adding users to product watchlist, removing users from all tracked products, handling user input validation, and interacting with my MongoDB. 

## Database
Why MongoDB?
I first started storing user data in a JSON file on my local host but then integrated to MongoDB because it works really well with Node.js and express and easy to scale. Native operators like `$addToSet` and `$pull` make it easy to manage subscriptions without complex joins as well.

## Optimizations & Design Decisions
Browser reuse(Puppeteer): A single browser instance is used across all scrapes to reduce memory usage and startup overhead.

Database Cleanup: Automatically removes products with no watchers to prevent unnecessary scraping resulting in faster overall scraping time.

Link Normalization: Query parameters are stripped from Uniqlo URLs to ensures the same product isn’t stored multiple times.

Efficient Updates: Uses `$addToSet` to avoid duplicate emails and uses $pull to remove emails cleanly
