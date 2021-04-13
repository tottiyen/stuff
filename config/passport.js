const User = require('../models/userscollection');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: 'email'},(email,password,done)=>{
            //match user
            User.findOne({email:email})
            
            .then((user)=>{
                console.log(user.verification) 
                if(!user){
                    return done(null,false,{message:'email or password incorrect'});
                }
                if(user === ''){
                    return done(null,false,{message:'email or password incorrect'});
                }
                if(user.verification === false){
                    return done(null,false,{message:'Please verify your email'});
                }
                //math passwords
                bcrypt.compare(password,user.password,(err,isMatch)=>{
                    if(err) throw err;
                    if(isMatch){
                        return done(null,user);
                    } else{
                        return done(null,false,{message: 'email or password incorrect'});
                    }
                })
            })
            .catch((err)=>{return done(null,false,{message:'email or password incorrect'});})
        })
    )
    passport.serializeUser(function(user,done) {
        done(null,user.email);
    })
    passport.deserializeUser(function(email,done){
        User.findByEmail(email,function(err,user){
            done(err,user);
        })
    })
}