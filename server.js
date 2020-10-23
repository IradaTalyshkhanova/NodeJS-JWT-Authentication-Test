const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

// letting the backend know what kind of data is being sent
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'fabio',
        password: '123',
    },
    {
        id: 2,
        username: 'nolasco',
        password: '456',
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    /* 
    console.log('This is me', username, password);
    res.json({ data: 'it works'}); 
    */
   for (let user of users){
       if (username == user.username && password == user.password) {
           let token = jwt.sign({id: user.id, username: user.username }, secretKey, { expiresIn: '7d' });
           res.json({
               success: true,
               err: null,
               token 
           });
           break;
       }
       else {
           res.status(401).json({
               success: false,
               token: null,
               err: 'Username or password is incorrect'
           });
       }
   }
});

//protected route (jwtMW -> middleware)
app.get('/api/dashboard', jwtMW, (req, res) => {
    //console.log(req);
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see!!!'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Yay, it works!'
    });
});

//root address => index.html (absolute path)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    /*
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
    */
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});