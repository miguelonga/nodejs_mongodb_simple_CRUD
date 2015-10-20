var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST


router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));

//build the REST operations at the base for bikes
//this will be accessible from http://127.0.0.1:3000/blobs if the default route for / is left unchanged
router.route('/')
    //GET all blobs
    .get(function(req, res, next) {
        //retrieve all blobs from Monogo
        mongoose.model('Bike').find({}, function (err, bikes) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/bikes folder. We are also setting "bikes" to be an accessible variable in our jade view
                    html: function(){
                        res.render('bikes/index', {
                              title: 'All my Bikes',
                              "bikes" : bikes
                          });
                    },
                    //JSON response will show all bikes in JSON format
                    json: function(){
                        res.json(infophotos);
                    }
                });
              }     
        });
    })
    //POST a new blob
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var price = req.body.price;
        var description = req.body.description;
        var dob = req.body.dob;
        var issold = req.body.isloved;
        //call the create function for our database
        mongoose.model('Bike').create({
            name: name,
            price: price,
            description: description,
            issold: issold
        }, function (err, blob) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Blob has been created
                  console.log('POST creating new bike: ' + bike);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("bikes");
                        // And forward to success page
                        res.redirect("/bikes");
                    },
                    //JSON response will show the newly created bike
                    json: function(){
                        res.json(bike);
                    }
                });
              }
        })
    });

/* GET New Blob page. */
router.get('/new', function(req, res) {
    res.render('bikes/new', { title: 'Add New Bike' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Bike').findById(id, function (err, bike) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(bike);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});


router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Bike').findById(req.id, function (err, bike) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + bike._id);
        var bikedob = bike.dob.toISOString();
        bikedob = bikedob.substring(0, bikedob.indexOf('T'))
        res.format({
          html: function(){
              res.render('bikes/show', {
                "bikedob" : bikedob,
                "bike" : bike
              });
          },
          json: function(){
              res.json(bike);
          }
        });
      }
    });
  });


 //GET the individual blob by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the blob within Mongo
    mongoose.model('Bike').findById(req.id, function (err, bike) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the bike
            console.log('GET Retrieving ID: ' + bike._id);
            //format the date properly for the value to show correctly in our edit form
          var bikedob = bike.dob.toISOString();
          bikedob = bikedob.substring(0, bikedob.indexOf('T'))
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('bikes/edit', {
                          title: 'Bike' + bike._id,
                        "bikedob" : bikedob,
                          "bike" : bike
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(bike);
                 }
            });
        }
    });
});


//PUT to update a blob by ID
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;
    var price = req.body.price;
    var description = req.body.description;
    var dob = req.body.dob;
    var issold = req.body.issold;

   //find the document by ID
        mongoose.model('Bike').findById(req.id, function (err, bike) {
            //update it
            bike.update({
                name : name,
                price : price,
                description : description,
                dob : dob,
                issold : issold
            }, function (err, bikeID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/bikes/" + bike._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(bike);
                         }
                      });
               }
            })
        });
});

//DELETE a Blob by ID
router.delete('/:id/edit', function (req, res){
    //find blob by ID
    mongoose.model('Bike').findById(req.id, function (err, bike) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            bike.remove(function (err, bike) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + bike._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/bikes");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : bike
                               });
                         }
                      });
                }
            });
        }
    });
});

module.exports = router;