/**
 * Module dependencies.
 */
var nodify    = require('nodify-shopify'),
    express   = require('express'),
    http      = require('http'), 
    path      = require('path'),
    app       = express(),
    fs        = require('fs'),
    db        = require('./model/db'); // Initialise Connection to MongoDB

// Session Vars
var apiKey, secret, 
    session = {}, persistentKeys = {}; 

// Set Api Key & Secret
//If Heroku or Foreman
 if(process.env.SHOPIFY_API_KEY != undefined && process.env.SHOPIFY_SECRET != undefined){
  apiKey = process.env.SHOPIFY_API_KEY;
  secret = process.env.SHOPIFY_SECRET;
}
else {
  var config = require ('./config.json');
  apiKey = config.apiKey;
  secret = config.secret;
} // Key & Secret Set

// App Config
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "simplify" }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
}); // Configs End

// Locate and Load Routes
var routesDir = 'routes',
    routeFiles = fs.readdirSync(routesDir);

routeFiles.forEach(function(file) {
  var filePath = path.resolve('./', routesDir, file),
      route = require(filePath);
  route.init(app, {
    apiKey: apiKey,
    secret: secret,
    session: session,
    persistentKeys: persistentKeys,
    nodify: nodify
  });
}); // Done Loading Routes

// Start The Server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
