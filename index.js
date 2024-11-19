const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// console.log(process.env.USER_NAME);
// console.log(process.env.SECRET_KEY);
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.SECRET_KEY}@cluster0.o0jck.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffees");
    const userCollection = client.db("coffeeDB").collection("user");

    app.get("/coffees", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const Coffee = req.body;

      console.log("update Koro: ", Coffee);
      const filter = { _id: new ObjectId(id) };
      const objects = { upsert: true };
      const updateCoffee = {
        $set: {
          coffeeName: Coffee.coffeeName,
          chief: Coffee.chief,
          supplier: Coffee.supplier,
          taste: Coffee.taste,
          category: Coffee.category,
          price: Coffee.price,
          details: Coffee.details,
          photoUrl: Coffee.photoUrl,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updateCoffee,
        objects
      );

      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await coffeeCollection.insertOne(newUser);
      res.send(result);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Server", id);
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffee making server is running");
});

app.listen(port, () => {
  console.log(`Coffee making server is running on the port of : ${port}`);
});
