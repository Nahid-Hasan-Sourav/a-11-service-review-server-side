const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const reviewCollection=client.db('flytographer').collection('review');

        app.get('/threeservices', async(req, res)=>{
       
        const query={}
        const cursor=serviceCollection.find(query).limit(3);
        const services= await cursor.toArray();
        res.send(services);
        console.log(services);
       })

       app.get('/services', async(req, res)=>{
       
        const query={}
        const cursor=serviceCollection.find(query);
        const services= await cursor.toArray();
        res.send(services);
        // console.log(services);
       })
       app.get('/services/:id', async(req, res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)}
        // const cursor=serviceCollection.find(query);
        const services= await serviceCollection.findOne(query);
        res.send(services);
        console.log(services);
       })
    //    this is for update get the review
       app.get('/review/:id', async(req, res)=>{
        const id=req.params.id;
        const query={ _id: ObjectId(id)}
        // const cursor=serviceCollection.find(query);
        const review= await reviewCollection.findOne(query);
        res.send(review);
        console.log(review);
       })

    //    this is for update review
       app.patch('/REVIEW/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const review = req.body;
        const option = {upsert: true};
        const updatedReview = {
            $set: {
                reviewText: review.reviewText
                
            }
        }
        const result = await reviewCollection.updateOne(filter, updatedReview, option);
        res.send(result);
    })

    //  Insert data using post.Insert Review api.
    app.post('/review',async(req,res)=>{
        const review=req.body;
        const result= await reviewCollection.insertOne(review);
        res.send(result)
    })

    app.delete('/review/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result= await reviewCollection.deleteOne(query);
        res.send(result);
    })
    app.get('/review',async(req,res)=>{
        let query={}
        console.log(req.query)
        if(req.query.serVicesId){
            query={
                
                serVicesId:req.query.serVicesId
            }
        }    
        var mysort = {time: -1};  
        const cursor=reviewCollection.find(query).sort(mysort);   
        const reviews= await cursor.toArray();
        res.send(reviews);
        
    })
    app.get('/my-review',async(req,res)=>{
        let query={}
        console.log(req.query)
        if(req.query.userEmail){
            query={
                
                userEmail:req.query.userEmail

            }
        }    
        var mysort = {time: -1};  
        const cursor=reviewCollection.find(query).sort(mysort);   
        const reviews= await cursor.toArray();
        res.send(reviews);
        
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