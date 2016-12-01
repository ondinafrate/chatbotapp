var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var foodSchema = new Schema({
	name: {type: String, unique: true}, 
	type: String,
	calories: Number,
	protein: Number,
	carbohydrates: Number,
	fat: Number,
	url: String,
	dateAdded : { type: Date, default: Date.now },
})

module.exports = mongoose.model('Food',foodSchema);