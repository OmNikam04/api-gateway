const express = require('express')
const app = express()
const registry = require("./routes/registry.json")
const helmet = require('helmet')
const routes = require("./routes")
const rateLimiter = require('./rateLimiter.js');
const PORT = 3000
const morgan = require('morgan');

app.use(express.json())
app.use(helmet())
app.use(morgan('combined'));
// adding middleware to handle auth
// once we get the authstring it will look something like 
// johndoe:password
const auth = (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic ')) {
        return res.status(401).send({ authenticated: false, message: 'Missing or invalid authorization header' });
    }

    const authString = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8');
    const [username, password] = authString.split(':');

    const user = registry.auth.users[username];
    if (user && user.password === password) {
        next();
    } else {
        res.status(401).send({ authenticated: false, message: 'Authentication failed' });
    }
};


app.use(auth)
app.use(rateLimiter)
app.use("/", routes)

app.listen(PORT, ()=>{
    console.log(`Gateway has started ${PORT}`)
})