import mongoose from 'mongoose';

let Schema = mongoose.Schema;

const Fund = new Schema({
  name: String,
  date: Date,
  value: Number
});

const User = new Schema({
  name: String,
  funds: [Fund]
});


export default mongoose.model('User', User);