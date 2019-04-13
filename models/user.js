import  {Schema, model} from 'mongoose';
const userSchema = new Schema({
    googleId: String,
    displayName: String
})
model('users', userSchema);