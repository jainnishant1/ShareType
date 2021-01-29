const LocalStrategy = require('passport-local')
const User = require('../models/User');

module.exports = (passport)=>{
    passport.use(new LocalStrategy({usernameField:'username'},
        (username, password, done) => {
            User.findOne({
                username:username
            }).then(user => {
                    if (!user) {
                        return done(null, false);
                    }
                    if(password==user.password){
                        return done(null,user)
                    }else{
                        return done(null,false)
                    }
                }
            )
        }))
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, response) => {
            done(err, response);
        });
    });

}
