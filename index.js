const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
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

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        const serviceCollection=client.db('flytographer').collection('services');
        const reviewCollection=client.db('flytographer').collection('review');

        // JWT api
        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
            res.send({token})
            // console.log(user);
        })  

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

    //    Added servie from client side
        app.post('/services', async (req, res) => {
            const addService = req.body;         
            const result = await serviceCollection.insertOne(addService)
            res.send(result);
        });

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
       app.patch('/review/:id', async (req, res) => {
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
        console.log(reviews);
        res.send(reviews);
        
    })
    // my review api
    app.get('/my-review',verifyJWT,async(req,res)=>{
        const decoded = req.decoded;
        // console.log("inside orders api",decoded)
        console.log("Decoded",decoded.email)
        console.log("Req",req.query.userEmail)
        if(decoded.email !== req.query.userEmail){
            res.status(403).send({message: 'unauthorized access'})
        }

       else{
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
        console.log(reviews); 
        res.send(reviews);
       }
        
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
    console.log(`Flytographer ${port}`);
})