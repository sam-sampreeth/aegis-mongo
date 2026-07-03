const express = require('express')
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb');
const bodyparser = require('body-parser');
const cors = require('cors');
dotenv.config()

const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'aegis';
const app = express()
const port = process.env.PORT || 3000
app.use(bodyparser.json())
app.use(cors())

async function connectDb() {
  try {
    await client.connect();
    console.log(`Connected to MongoDB at ${url}`);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
  }
}
connectDb();

app.use(async (req, res, next) => {
  try {
    await client.connect();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database not connected" });
  }
});

app.get('/', async (req, res) => {
    try {
        const db = client.db(dbName)
        const collection = db.collection('passwords');
        const findResult = await collection.find({}).toArray();
        res.json(findResult);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch passwords from MongoDB" });
    }
})

app.post('/', async (req, res) => {
    try {
        const password = req.body
        const db = client.db(dbName)
        const collection = db.collection('passwords');
        const findResult = await collection.insertOne(password);
        res.send({success: true, result: findResult})
    } catch (err) {
        res.status(500).json({ error: "Failed to save password to MongoDB" });
    }
})

app.delete('/', async (req, res) => {
    try {
        const password = req.body
        const db = client.db(dbName)
        const collection = db.collection('passwords');
        const findResult = await collection.deleteOne(password);
        res.send({success: true, result: findResult})
    } catch (err) {
        res.status(500).json({ error: "Failed to delete password from MongoDB" });
    }
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
