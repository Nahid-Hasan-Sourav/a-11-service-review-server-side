const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middle wares
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gbngdkv.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1});

async function run(){
    try{
        const serviceCollection=client.db('flytographer').collection('services');

        app.get('/threeservices', async(req, res)=>{
       
        const query={}
        const cursor=serviceCollection.find(query).limit(3);
        const services= await cursor.toArray();
        res.send(services);
        console.log(services);
       })

    }
    finally{

    }
   
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('genius car server is running')
})

app.listen(port, () => {
    console.log(`Genius Car server running on ${port}`);
})