const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// midleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rwz2c.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        // console.log('Database connected successfully');
        const database = client.db('onlineShop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        // GET products API
        app.get('/products', async (req, res) => {
            // console.log(req.query);
            const cursor = productCollection.find({});
            // const products = await cursor.limit(10).toArray();     // limit data load 
            const count = await cursor.count();
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();             // all data load 
            }
            res.send({
                count,
                products
            });
        });

        // use post to get data by keys
        app.post('/products/byKeys', async (req, res) => {
            // console.log(req.body);
            const keys = req.body;
            const query = { key: { $in: keys } };
            const products = await productCollection.find(query).toArray();
            res.json(products);
        });

        // Add orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log(order);
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally {
        // await client.connect();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Ema jon server is running');
});

app.listen(port, () => {
    console.log("Server is running port", port);
})