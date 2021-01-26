const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const keys = require('./config/keys')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/schema')
const Document = require('./models/document')
const cors = require('cors')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


mongoose.connect(keys.MongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        if (err) return console.log(err);
        console.log('Database Connected!!')
    })

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, response) => {
        done(err, response);
    });
});

passport.use(new LocalStrategy(
    (username, password, done) => {
        User.findOne({ username: username }, (err, res) => {
            if (err) return console.log(err);
            if (!res) {
                return done(null, false);
            }
            if (password != res.password) {
                return done(null, false);
            }
            else {
                return done(null, res);
            }
        })
    }))

io.on('connection', (socket) => {
    console.log('Connected to client!');
    socket.on('msg', (data) => { console.log('Message obtained ', data); });
    socket.emit('msg', { hello: 'world' });
    socket.on('cmd', (data) => {
        console.log(data);
    });
});

app.post('/register', (req, res) => {

    const username = req.body.username
    const password = req.body.password

    if (username == '' || password == '') {
        return res.json({ success: false, error: "please fill in all the details" })
    }
    User.findOne({ username }, (err, Doc) => {
        if (err) return console.log(err)

        if (Doc) return res.json({ success: false, error: "This Username is already registered!! Try another one" })

        const newUser = new User({
            username,
            password,
        })
        newUser.save((err, Doc) => {
            if (err) {
                return res.json({ success: false, error: err })
            }
            else {
                return res.json({ success: true })
            }
        })

    })

})

app.post('/login', passport.authenticate('local'), (req, res) => {
    console.log(req.user)
    res.send({ success: true });
});

app.get('/logout', (req, res) => {
    req.logout();
    res.json({ success: true });
});

app.post('/createDocument',(req,res)=>{
    if(!req.user){
        return console.log("User Must be logged in");
    }
    const newDocument = new Document({
        owner: req.user._id,
        password: req.body.password,
        title: req.body.title,
        createdAt: new Date(),
        editedAt: new Date()
    })

    newDocument.save((err,Doc)=>{
        if(err){
            return res.json({ success: false, error: err })
        }
        else{
            return res.json({ success: true })
        }
    })
})

app.get('/myOwnedDocs',(req,res)=>{
    if (!req.user) {
        return console.log("User Must be logged in");
    }

    Document.find({ owner: req.user._id},(err,Doc)=>{
        if (err) {
            return res.json({ success: false, error: err })
        }
        else {
            return res.json({ success: true, documents: Doc})
        }
    })
})

app.get('/myCollabDocs',(req,res)=>{
    Document.find((err,Doc)=>{
        if (err) {
            return res.json({ success: false, error: err })
        }
        let docs = Doc.filter(doc=>{
            if(doc.memberList.indexOf(req.user._id)>-1){
                return true
            }
            return false
        })
        return res.json({ success: true, documents: docs})
    })
})

app.post('/collaborate',(req,res)=>{
    Document.findById(req.body.id,(err,Doc)=>{
        if(err){
            return res.json({ success: false, error: err })
        }
        let newMemberList = [...Doc.memberList]
        newMemberList.push(req.user._id)
        Document.findByIdAndUpdate(req.body.id,{memberList:newMemberList},(err,doc)=>{
            if (err) {
                return res.json({ success: false, error: err })
            }
            else{
                return res.json({ success: true })
            }
        })
    })
})

// app.post('/save',(req,res)=>{

// })


http.listen(5000, () => {
    console.log("server running at 5000")
})