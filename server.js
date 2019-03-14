import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import mongoose, { model } from 'mongoose';
import cookieSession from 'cookie-session';
import { data } from './configuration';
import './models/user';

const User = model('users');
const  app = express();
const PORT = process.env.PORT || 3500;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    maxAge: 5*60*60*1000,
    keys: [data.cookieKey]
}))
app.use(passport.initialize());
app.use(passport.session())

mongoose.connect(data.mongooseClient, { useNewUrlParser: true }, ()=>{
    console.log('dev ready');
} );
passport.serializeUser((user,done) => {
    done(null, user.id);
})
passport.deserializeUser((id,done) => {
    User.findById(id).then((user) => {
        done(null, user);
    })
})
passport.use(new GoogleStrategy({
    clientID: data.googleClientID,
    clientSecret: data.googleClientSecret,
    callbackURL: '/googleoauth/callback'
}, (accessToken, refreshToken, profile, done) => {
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    console.log('profile', profile);
    User.findOne({googleId: profile.id})
        .then((existingUser) => {
            if(!existingUser){
                new User({
                    googleId: profile.id
                }).save()
                .then(user => {
                    console.log("user New");
                    done(null, user);
                });
            } else {
                done(null, existingUser);
                console.log("user Exists");
            }
        })
    
    
}))
app.get('/googleauth', passport.authenticate('google', {
    scope: ['profile']
}))
app.get('/googleoauth/callback', passport.authenticate('google'))

app.get('/api/current_user', (req,res)=> {
    res.send(req.user)
})
app.get('/api/logout', (req,res)=> {
    req.logout();
    res.send(req.user)
})
app.post('/use', (req, res) => {
    res.send(req.body.ok);
})

app.listen(PORT, () => console.log(`Runs on ${PORT}`));