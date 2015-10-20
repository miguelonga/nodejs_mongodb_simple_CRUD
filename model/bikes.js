var mongoose = require('mongoose');  
var bikeSchema = new mongoose.Schema({  
  name: String,
  price: Number,
  description: String,
  dob: { type: Date, default: Date.now },
  issold: Boolean
});
mongoose.model('Bike', bikeSchema);