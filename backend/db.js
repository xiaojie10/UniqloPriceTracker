const {MongoClient} = require('mongodb')
const client = new MongoClient(process.env.MONGO_URI)
let db;

async function connectDB(){
    try{
        if (db) return db;

        await client.connect()
        db = client.db("uniqlo_tracker") // Connects to the testing db
        return db

    } catch(error){
        console.log("an error has occured", error)
    }
}

const getItemsCollection = async () => {
    const db = await connectDB();
    return db.collection("items");
};

module.exports = {connectDB, getItemsCollection}