const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clusterbistroboss.dgynro0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const userCollection = client.db("bistroDb").collection("users");
        const menuCollection = client.db("bistroDb").collection("menu");
        const reviewCollection = client.db("bistroDb").collection("reviews");
        const cartCollection = client.db("bistroDb").collection("carts");

        // Users related APIs
        app.get("/users", async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        app.post("/users", async (req, res) => {
            const user = req.body;
            // console.log(user);
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            // console.log("Existing User:", existingUser);
            if (existingUser) {
                return res.send({ message: "User already exists" });
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }

            const updateDoc = {
                $set: {
                    role: "admin"
                },
            };

            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // Menu related APIs
        app.get("/menu", async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result);
        });

        // Reviews related APIs
        app.get("/reviews", async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        });

        // cart collection related APIs
        app.get("/carts", async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([]);
            }
            else {
                const query = { email: email };
                const result = await cartCollection.find(query).toArray();
                res.send(result);
            }
        });

        app.post("/carts", async (req, res) => {
            const item = req.body;
            // console.log(item);
            const result = await cartCollection.insertOne(item);
            res.send(result);
        });

        app.delete("/carts/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("'Bistro Boss Restaurant' app is running");
});

app.listen(port, () => {
    console.log(`'Bistro Boss Restaurant' app is listening & running on port ${port}`);
});