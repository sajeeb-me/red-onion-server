const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authentication
    // console.log(authHeader)
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized access" })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Access Forbidden" })
        }
        req.decoded = decoded
        next()
    })
}

const uri = `mongodb+srv://redonionAdmin:uB3k0rTZ9O6wV3u5@cluster0.clafk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const breakfastDatabase = client.db("redOnionFoodMenu").collection("breakfast")
        const lunchDatabase = client.db("redOnionFoodMenu").collection("lunch")
        const dinnerDatabase = client.db("redOnionFoodMenu").collection("dinner")

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '1h' })
            res.send({ accessToken })
        })

        //get items
        app.get('/foods/breakfast', async (req, res) => {
            const query = {};
            const cursor = breakfastDatabase.find(query);
            const breakfast = await cursor.toArray()
            res.send(breakfast)
        })
        app.get('/foods/lunch', async (req, res) => {
            const query = {};
            const cursor = lunchDatabase.find(query);
            const breakfast = await cursor.toArray()
            res.send(breakfast)
        })
        app.get('/foods/lunch/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const lunch = await lunchDatabase.findOne(query)
            res.send(lunch)
        })
        app.get('/foods/dinner', async (req, res) => {
            const query = {};
            const cursor = dinnerDatabase.find(query);
            const breakfast = await cursor.toArray()
            res.send(breakfast)
        })
        app.get('/cart', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email;
            if (decodedEmail === email) {
                const query = {};
                const cursor = lunchDatabase.find(query);
                const breakfast = await cursor.toArray()
                res.send(breakfast)
            }
            else {
                res.status(403).send({ message: "Access Forbidden" })
            }
        })

        // post data
        app.post('/foods/lunch', async (req, res) => {
            const updatedLunch = (req.body)
            const lunch = await lunchDatabase.insertOne(updatedLunch)
            res.send(lunch)
        })

        // delete data
        app.delete('/foods/lunch/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const lunch = await lunchDatabase.deleteOne(query)
            res.send(lunch)
        })

        // update data
        app.put('/foods/lunch/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const updatedLunch = req.body
            const options = { upsert: true }
            const updateMenu = {
                $set: updatedLunch
            }
            const lunch = await lunchDatabase.updateOne(query, updateMenu, options)
            res.send(lunch)
        })

    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("This is Home")
})

app.listen(port, () => {
    console.log("Port:", port)
})