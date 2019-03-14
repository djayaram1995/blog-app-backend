import  {Schema, model} from 'mongoose';
const userSchema = new Schema({
    googleId: String
})
model('users', userSchema);