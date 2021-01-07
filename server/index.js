const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const keys = require('./config/keys')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/schema')

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


mongoose.connect(keys.MongoURI, 
    { useNewUrlParser: true, useUnifiedTopology:true }, (err) => {
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

app.post('/register',(req,res)=>{
    // res.send(`User: ${req.body.username}\nPassword: ${req.body.password}`)
    const username = req.body.username
    const password = req.body.password
    if(username==''||password==''){
        return res.json({success:false,error:"please fill in all the details"})
    }
    User.findOne({username},(err,Doc)=>{
        if(err) return console.log(err)

        if (Doc) return res.json({ success: false, error: "This Username is already registered!! Try another one"})

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
    res.send({ success: true });
});



app.listen(3000, () => {
    console.log("server running at 3000")
})