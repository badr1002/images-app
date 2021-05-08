const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('pg');


const app = express();
app.use(express.json()); 
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
    if (err) {
        res.status(500).json({ message: err })
    }
});

require('dotenv').config();

//Database connection
const client = new Client({
    connectionString: process.env.DATABASE_URL
})
client.connect(err => {
    if (err) {
        console.error('connection error', err.stack)
    } else {
        console.log('Database is connected')
    }
});



// Get Apis
app.get('/images', async (req, res) => {
    const sql = 'select * from images';
    try {
        const data = await client.query(sql);
        res.json({data:data.rows}).status(200)
        
    } catch (err) {
        console.log(err.stack);
    }

});


// Add to Apis
app.post('/add/image', async (req, res) => {
    const sql = `insert into images(src) values('${req.body.src}')`;
    try {
        await client.query(sql);
        console.log();
        res.json({message: "Successfully Addition!"}).status(200)
    } catch (err) {
        console.log(err.stack);
        res.json({message:"Not found source!"}).status(400)
    }
   
});

// delete from Apis
app.delete('/delete/image/:id', async (req, res) => {
   const sql = `delete from images where id=${req.params.id}`;
    try {
        await client.query(sql);
        res.json({message:"Deleted"}).status(200)
    } catch (err) {
        console.log(err.stack);
        res.json({message:"Faild!"}).status(500)
    }
   
});



let port =process.env.PORT || 5000;
app.listen(port, (() => console.log(`Connected successfully to ${port}`)))
