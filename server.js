import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import mongoose, { model } from 'mongoose';
import { data } from './configuration';
import './models/user';

const User = model('users');
const  app = express();
const PORT = process.env.PORT || 3500;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(data.mongooseClient, { useNewUrlParser: true }, ()=>{
    console.log('dev ready');
} );
passport.use(new GoogleStrategy({
    clientID: data.googleClientID,
    clientSecret: data.googleClientSecret,
    callbackURL: '/googleoauth/callback'
}, (accessToken, refreshToken, profile) => {
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    console.log('profile', profile);
    User.findOne({googleId: profile.id})
        .then((existingUser) => {
            if(!existingUser){
                new User({
                    googleId: profile.id
                }).save();
            } else {
                console.log("user Exists");
            }
        })
    
    
}))
app.get('/googleauth', passport.authenticate('google', {
    scope: ['profile']
}))
app.get('/googleoauth/callback', passport.authenticate('google'))


app.post('/use', (req, res) => {
    res.send(req.body.ok);
})

app.listen(PORT, () => console.log(`Runs on ${PORT}`));