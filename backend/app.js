require("dotenv").config();
const express = require('express');
const app = express();
const {connectDB} = require('./db');

app.set('view engine', 'ejs')

app.use(express.static("public")); // Allow the browser to access any public files
app.use(express.urlencoded({extended: true})); // For handling form submission
app.use(express.json()); // Parse incoming json body

// Handles all POST request sent to "/"
app.post("/", async (req, res) =>{
    try{
        const db = await connectDB() 
        const itemsCollection = db.collection("items") // It represent the item collection now

        const emailDelete = req.body.emailRemove // Holds the value for the email user wants to delete(userEmail)
        
        // Delete email from DB
        if(emailDelete){
            await itemsCollection.updateMany({}, {$pull: {watchers: emailDelete}})
            return res.render("website")
        }

        const email = req.body.email; // Grabs the email value from the form
        const link = req.body.itemLink; // Grabs the link value from the form

        // If both email or link is empty, stop it from continue running
        if (!email || !link) {
            return res.render("website");
        }
        const exist = await itemsCollection.findOne({"link": link}) // Check if the link exist already in the database

        // If the link doesn't exist in the collection, insert it. Else, if it does exist, append the email to the array on watchers
        if(!exist){
            await itemsCollection.insertOne({
            "link": link,
            "price": null,
            "watchers": [email]
        })
        } else{
            await itemsCollection.updateOne(
                {"link": link}, // This is the filter argument, where the it's point to the document where this link exist
                { $addToSet: {"watchers":email}} // Append the new email to the array of other email watchers only if it hasn't been added before
            )
        }

    } catch(error){
        console.log("An error has occured", error)
    }

    res.render("website") 
})

app.get("/", (req, res) =>{
    res.render("website");
})

app.listen(3000);
