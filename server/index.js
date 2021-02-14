const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const keys = require('./config/keys')
const passport = require('passport')
const User = require('./models/User')
const Document = require('./models/Document')
const cors = require('cors')
const session = require('express-session');
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('./config/keys')
const requireLogin = require('./middleware/requireLogin')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

//passport config
require('./config/passport')(passport);

//connect to Mongo
mongoose.connect(keys.MongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        if (err) return console.log(err);
        console.log('Database Connected!!')
    })

app.use(cors())
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }))

app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());



let membersCollaborating = []
io.on('connection', (socket) => {
    // console.log('Connected to client!');
    // socket.on('msg', (data) => { console.log('Message obtained ', data); });
    // socket.emit('msg', { hello: 'world' });
    // socket.on('cmd', (data) => {
    //     console.log(data);
    // });


    let docInactive = true

    socket.on('joinSocket', (data) => {
        // console.log('Connected to Client: ', data.user)

        //Create a room for each doc:
        socket.join(data.id)
        docInactive = true

        membersCollaborating.forEach((member) => {
            if (member.id === data.id) {
                docInactive = false
                member.membersLive.push(data.user)
            }
        })
        if (docInactive) {

            //2 fields are created in the array to group the users opening same doc
            membersCollaborating.push({ id: data.id, membersLive: [data.user] })

        }

        // const len = membersCollaborating.length - 1
        // console.log(membersCollaborating[len])

    })

    socket.on("leaveSocket", (data) => {
        // console.log("Leaving this document", data.id)

        //Leave this Joined doc for which room was created earlier
        socket.leave(data.id)

        //removing the left member from collaborator list of that doc
        membersCollaborating.forEach((member) => {
            if (member.id === data.id) {
                let newArray = member.membersLive.filter(doc => {
                    if (doc._id !== data.user._id) {
                        return true;
                    }
                    return false;
                })
                member.membersLive = newArray
                // console.log(member)
            }
        })
    })

    socket.on("liveUsers", (data) => {
        let newArray = null
        membersCollaborating.forEach((member) => {
            if (member.id === data.id) {
                newArray = member.membersLive
                console.log(newArray)
            }
        })
        socket.emit("liveUsers", newArray)
    })

    socket.on("edit", (data) => {
        //propogating changes to the doc on other users onnected to that socket
        socket.broadcast.to(data.id).emit('edit', { content: data.content })
    })

    socket.on("updateAccess", (data) => {
        // console.log("Hi")
        console.log("Server side socket--->", data.members)
        socket.broadcast.to(data.id).emit('updateAccess', { members: data.members, content: data.content })
    })
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
    const token = jwt.sign({ _id: req.user._id }, JWT_SECRET)
    const { _id, username } = req.user
    res.send({ success: true, token, user: { _id, username } });
});
app.get('/logout', requireLogin, (req, res) => {
    req.logout();
    res.json({ success: true });
});

// app.post('/createDocument', requireLogin, (req, res) => {
//     if (!req.user) {
//         return console.log("User Must be logged in");
//     }
//     const newDocument = new Document({
//         owner: req.user._id,
//         title: req.body.title,
//         createdAt: new Date(),
//         editedAt: new Date()
//     })

//     newDocument.save((err, Doc) => {
//         if (err) {
//             return res.json({ success: false, error: err })
//         }
//         else {
//             return res.json({ success: true })
//         }
//     })
// })

app.post('/createDocument', requireLogin, (req, res) => {
    if (!req.user) {
        return console.log("User Must be logged in");
    }
    const newDocument = new Document({
        owner: req.user,
        title: req.body.title,
        createdAt: new Date(),
        editedAt: new Date()
    })

    newDocument.save((err, Doc) => {
        if (err) {
            return res.json({ success: false, error: err })
        }
        else {
            return res.json({ success: true })
        }
    })
})

// app.get('/myOwnedDocs', requireLogin, (req, res) => {
//     if (!req.user) {
//         return console.log("User Must be logged in");
//     }
//     Document.find({ owner: req.user._id }, (err, Doc) => {
//         if (err) {
//             return res.json({ success: false, error: err })
//         }
//         else {
//             return res.json({ success: true, documents: Doc })
//         }
//     })
// })
app.get('/myOwnedDocs', requireLogin, (req, res) => {
    if (!req.user) {
        return console.log("User Must be logged in");
    }
    Document.find({ owner: { _id: req.user._id, username: req.user.username } }, (err, Doc) => {
        if (err) {
            return res.json({ success: false, error: err })
        }
        else {
            return res.json({ success: true, documents: Doc })
        }
    })
})


app.get('/myCollabDocs', requireLogin, (req, res) => {
    // console.log(req.user._id)
    Document.find((err, Doc) => {
        if (err) {
            return res.json({ success: false, error: err })
        }
        let docs = Doc.filter(doc => {
            let flag = false
            doc.memberList.forEach((member) => {
                if (member._id.toString() == req.user._id.toString()) {
                    flag = true
                }
            })
            return flag
        })
        return res.json({ success: true, documents: docs })
    })
})

app.post('/collaborate', requireLogin, (req, res) => {
    Document.findById(req.body.id, (err, Doc) => {
        if (err) {
            return res.json({ success: false, error: err })
        }
        let newMemberList = [...Doc.memberList]
        newMemberList.push({ _id: req.user._id, username: req.user.username, access: req.body.access })
        Document.findByIdAndUpdate(req.body.id, { memberList: newMemberList }, (err, doc) => {
            if (err) {
                return res.json({ success: false, error: err })
            }
            else {
                return res.json({ success: true })
            }
        })
    })
})

app.post('/addCollaborator', requireLogin, (req, res) => {
    Document.findById(req.body.docId, (err, Doc) => {
        if (err) {
            return res.json({ success: false, error: err })
        }
        let newMemberList = [...Doc.memberList]
        User.findById(req.body.id, (err, user) => {
            if (err) {
                return res.json({ success: false, error: err })
            }
            console.log("User---->", user)
            newMemberList.push({ _id: req.body.id, username: user.username, access: req.body.access })
            console.log("Document before--->", Doc)
            console.log("NewMmeberList---->", newMemberList)
            Document.findByIdAndUpdate(req.body.docId, { memberList: newMemberList }, (err, doc) => {
                if (err) {
                    return res.json({ success: false, error: err })
                }
                else {
                    return res.json({ success: true })
                }
            })
        })
    })
})

app.post("/getList", requireLogin, (req, res) => {
    Document.findById(req.body.docId, (err, Doc) => {
        if (err) {
            return res.json({ success: false, error: err })
        }
        let newArray = [Doc.owner, ...Doc.memberList]
        return res.json({ success: true, members: newArray })
    })
})

app.post('/deleteDocument', requireLogin, (req, res) => {
    Document.findByIdAndDelete(req.body.id, (err, Doc) => {
        if (err) {
            return res.json({ success: false, error: err })
        }
        else {
            return res.json({ success: true })
        }
    })
})

app.post('/saveDocument', requireLogin, (req, res) => {
    const newContent = { text: req.body.content, username: req.user.username }
    Document.findById(req.body.id, (err, Doc) => {
        if (err) {
            return res.json({ success: false, error: err })
        }
        let newArray = [...Doc.content]
        newArray.push(newContent)
        Document.findByIdAndUpdate(req.body.id, { content: newArray }, (err, doc) => {
            if (err) {
                return res.json({ success: false, error: err })
            }
            else {
                Document.findById(req.body.id, (err, updated) => {
                    if (err) {
                        return res.json({ success: false, error: err })
                    }
                    else {
                        return res.json({ success: true, updated: updated })
                    }
                })

            }
        })
    })
})

// app.post('/updateAccess', requireLogin, (req, res) => {
//     Document.findById(req.body.docId, (err, Doc) => {
//         if (err) {
//             return res.json({ success: false, error: err })
//         }
//         let newMemberList = [...Doc.memberList]
//         newMemberList.forEach((member) => {
//             if (member._id == req.body.id) {
//                 member.access = req.body.access
//             }
//         })
//         Document.findByIdAndUpdate(req.body.docId, { memberList: newMemberList }, (err, doc) => {
//             if (err) {
//                 return res.json({ success: false, error: err })
//             }
//             else {
//                 return res.json({ success: true })
//             }
//         })
//     })
// })

app.post('/updateAccess', requireLogin, (req, res) => {
    Document.findById(req.body.docId, (err, Doc) => {
        if (err) {
            return res.json({ success: false, error: err })
        }
        let newMemberList = [...Doc.memberList]
        let i = 0;
        req.body.members.forEach((member, index) => {
            if (member.accessState) {
                newMemberList[i].access = member.accessState;
                i = i + 1;
            }
        })
        Document.findByIdAndUpdate(req.body.docId, { memberList: newMemberList }, (err, doc) => {
            if (err) {
                return res.json({ success: false, error: err })
            }
            else {
                return res.json({ success: true })
            }
        })
    })
})


http.listen(5000, () => {
    console.log("server running at 5000")
})