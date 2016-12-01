var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// our db model
var Food = require("../models/model.js");

//rivescript
var RiveScript = require("rivescript"),
    RSCoffeeScript = require("rivescript-contrib-coffeescript");

var bot = new RiveScript();

// Register the CoffeeScript handler.
bot.setHandler("coffeescript", new RSCoffeeScript(bot));

// Load your replies like normal, and `>object * coffeescript` macros will be
// loaded and usable just like JavaScript ones.
bot.loadDirectory("./replies", function() {
    bot.sortReplies();

    var reply = bot.reply("reverse hello world");
    if (reply === "dlrow olleh") {
        console.log("It works!");
    }
});
//ends Rive

// simple route to render am HTML form that can POST data to our server
// NOTE that this is not a standard API route, and is really for testing
router.get('/create-food', function(req,res){
  res.render('food-form.html')
})

// simple route to render an HTML page that pulls data from our server and displays it on a page
// NOTE that this is not a standard API route, and is really for testing
router.get('/show-food', function(req,res){
  res.render('show-food.html')
})

router.get('/about', function(req, res){
  res.render('about.html')
})

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {
  res.render('home.html')
});

// simple route to show an HTML page
router.get('/edit/:id', function(req,res){

  var requestedId = req.params.id;

  Food.findById(requestedId, function(err, data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      return res.json(err)
    }

    var viewData = {
      status: "OK",
      food: data
    }

    return res.render('edit.html', viewData);
  })
 
})

// /**
//  * POST '/api/create'
//  * Receives a POST request of the new animal, saves to db, responds back
//  * @param  {Object} req. An object containing the different attributes of the Animal
//  * @return {Object} JSON
//  */

router.post('/api/create', function(req, res){

    console.log(req.body);

    // pull out the information from the req.body
    var name = req.body.name;
    var type = req.body.type;
    //var tags = req.body.tags.split(","); // split string into array
    var calories = req.body.calories;
    var protein = req.body.protein;
    var carbohydrates = req.body.carbohydrates;
    var fat = req.body.fat;
    var url = req.body.url;

    // hold all this data in an object
    // this object should be structured the same way as your db model
    var foodObject = {
      name: name,
      type: type,
      calories: calories,
      protein: protein,
      carbohydrates: carbohydrates,
      fat: fat,
      url: url,
    };

    // create a new animal model instance, passing in the object
    var food = new Food(foodObject);

    // now, save that animal instance to the database
    // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save    
    food.save(function(err,data){
      // if err saving, respond back with error
      if (err){
        var error = {status:'ERROR', message: 'Error saving food'};
        return res.json(error);
      }

      console.log('saved a new food!');
      console.log(data);

      // now return the json data of the new animal
      var jsonData = {
        status: 'OK',
        food: data
      }

      return res.json(jsonData);

    })  
});

// /**
//  * GET '/api/get/:id'
//  * Receives a GET request specifying the animal to get
//  * @param  {String} req.params.id - The animalId
//  * @return {Object} JSON
//  */

router.get('/api/get/:id', function(req, res){

  var requestedId = req.params.id;

  // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findById
  Food.findById(requestedId, function(err,data){

    // if err or no user found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that food'};
       return res.json(error);
    }

    // otherwise respond with JSON data of the animal
    var jsonData = {
      status: 'OK',
      food: data
    }

    return res.json(jsonData);
  
  })
})

// /**
//  * GET '/api/get'
//  * Receives a GET request to get all animal details
//  * @return {Object} JSON
//  */

router.get('/api/get', function(req, res){

  // mongoose method to find all, see http://mongoosejs.com/docs/api.html#model_Model.find
  Food.find(function(err, data){
    // if err or no animals found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find food'};
      return res.json(error);
    }

    // otherwise, respond with the data 

    var jsonData = {
      status: 'OK',
      food: data
    } 

    res.json(jsonData);

  })

})

router.get('/api/getByDate', function(req,res){

  console.log('in /api/getByDate')

  var requestedYear = parseInt(req.query.year);
  var requestedMonth = parseInt(req.query.month);
  var requestedDay = parseInt(req.query.day);

  console.log(requestedYear);
  console.log(requestedMonth);
  console.log(requestedDay);

  Food.find({"dateAdded": {"$gte": new Date(requestedYear, requestedMonth, requestedDay-1), "$lt": new Date(requestedYear, requestedMonth, requestedDay)}}, function(err,data){
    console.log(data);
    res.json(data);
  })

})

// /**
//  * GET '/api/search'
//  * Receives a GET request to search an animal
//  * @return {Object} JSON
//  */
router.get('/api/search', function(req,res){

  // first use req.query to pull out the search query
  var searchTerm = req.query.name;
  console.log("we are searching for " + searchTerm);

  // let's find that animal
  Food.find({name: searchTerm}, function(err,data){
    // if err, respond with error 
    if(err){
      var error = {status:'ERROR', message: 'Something went wrong'};
      return res.json(error);
    }

    //if no animals, respond with no animals message
    if(data==null || data.length==0){
      var message = {status:'NO RESULTS', message: 'We couldn\'t find any results'};
      return res.json(message);      
    }

    // otherwise, respond with the data 

    var jsonData = {
      status: 'OK',
      food: data
    } 

    res.json(jsonData);        
  })

})

// /**
//  * POST '/api/update/:id'
//  * Receives a POST request with data of the animal to update, updates db, responds back
//  * @param  {String} req.params.id - The animalId to update
//  * @param  {Object} req. An object containing the different attributes of the Animal
//  * @return {Object} JSON
//  */

router.post('/api/update/:id', function(req, res){

   var requestedId = req.params.id;

   var dataToUpdate = {}; // a blank object of data to update

    // pull out the information from the req.body and add it to the object to update
    var name, type, calories, protein, carbohydrates, url; 

    // we only want to update any field if it actually is contained within the req.body
    // otherwise, leave it alone.
    if(req.body.name) {
      name = req.body.name;
      // add to object that holds updated data
      dataToUpdate['name'] = name;
    }
    if(req.body.type) {
      type = req.body.type;
      // add to object that holds updated data
      dataToUpdate['type'] = type;
    }
    if(req.body.calories) {
      calories = req.body.calories;
      // add to object that holds updated data
      dataToUpdate['calories'] = calories;
      //dataToUpdate['description']['calories'] = calories;
    }
    if(req.body.protein) {
      protein = req.body.protein;
      // add to object that holds updated data
      //if(!dataToUpdate['description']) dataToUpdate['description'] = {};
      dataToUpdate['protein'] = protein;
    }
    if(req.body.carbohydrates) {
      carbohydrates = req.body.carbohydrates;
      // add to object that holds updated data
      //if(!dataToUpdate['description']) dataToUpdate['description'] = {};
      dataToUpdate['carbohydrates'] = carbohydrates;
    }
    if(req.body.fat) {
      fat = req.body.fat;
      // add to object that holds updated data
      //if(!dataToUpdate['description']) dataToUpdate['description'] = {};
      dataToUpdate['fat'] = fat;
    }

    if(req.body.url) {
      url = req.body.url;
      // add to object that holds updated data
      dataToUpdate['url'] = url;
    }

    // var tags = []; // blank array to hold tags
    // if(req.body.tags){
    //   tags = req.body.tags.split(","); // split string into array
    //   // add to object that holds updated data
    //   dataToUpdate['tags'] = tags;
    // }


    console.log('the data to update is ' + JSON.stringify(dataToUpdate));

    // now, update that animal
    // mongoose method findByIdAndUpdate, see http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  
    Food.findByIdAndUpdate(requestedId, dataToUpdate, function(err,data){
      // if err saving, respond back with error
      if (err){
        var error = {status:'ERROR', message: 'Error updating food'};
        return res.json(error);
      }

      console.log('updated the food!');
      console.log(data);

      // now return the json data of the new person
      var jsonData = {
        status: 'OK',
        food: data
      }

      return res.json(jsonData);

    })

})

/**
 * GET '/api/delete/:id'
 * Receives a GET request specifying the animal to delete
 * @param  {String} req.params.id - The animalId
 * @return {Object} JSON
 */

router.get('/api/delete/:id', function(req, res){

  var requestedId = req.params.id;

  // Mongoose method to remove, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
  Food.findByIdAndRemove(requestedId,function(err, data){
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that food to delete'};
      return res.json(error);
    }

    // otherwise, respond back with success
    var jsonData = {
      status: 'OK',
      message: 'Successfully deleted id ' + requestedId
    }

    res.json(jsonData);

  })

})

module.exports = router;