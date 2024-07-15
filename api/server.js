const express = require("express")
const app = express()
const axios = require("axios")
const PORT = 3002
const HOST = 'localhost'

app.use(express.json())
app.get('/fakeapi', (req, res, next)=>{
    res.send('Hello From fake api')
})

app.post('/bogusapi', (req, res, next)=>{
    res.send('hello from bogus api')
})

app.listen(PORT, ()=> {
    const authString = 'johndoe:password'
    const encodedAuthString = Buffer.from(authString, 'utf-8').toString('base64')
    console.log(`Encoding authstring ${encodedAuthString}`)
    console.log('Fake api server started on port ' + PORT)
    // Registering this api to our gateway dynamically so we don't need 
    // to register every api manually
    axios({
        method: 'POST', 
        url: 'http://localhost:3000/register',
        headers : {
            'authorization': encodedAuthString,
            'Content-Type': 'application/json'
        },
        data: {
            apiName: "testapi",
            protocol: "http",
            host: HOST, 
            port: PORT,
        }
    }).then((response)=>{
        console.log(response.data)
    })
    .catch((err) => {
        console.error("Error in api/server.js", err.message);
        console.error(err.response?.data || err.message);  
    });
})

