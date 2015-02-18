
var url = require( 'url');
var ig = require('instagram-node').instagram();
var http = require('http');

var environment;
try{
	var apiConfig = require( './config.json');
	environment = {
		client_id: apiConfig.instaCID,
		client_secret: apiConfig.instaCSecret
	};	
}
catch( err ){
	// cannot find config.json so try for Heroku Env Vars instead
 	environment = {
	  client_id: process.env.TWIT_C_KEY,
	  client_secret: process.env.TWIT_C_SECRET,
	};
	console.log( 'ENV VAR Client ID: ' + process.env.TWIT_C_KEY );
	console.log( 'ENV VAR Client Secret: ' + environment.client_secret );
};
// if Heroku Env Vars weren't set then client will be nothing
if( environment.client_id === undefined ){
	console.log( 'Environment Variables Undefined');
	environment = undefined;
}
else {
	//instagram
	ig.use( environment );
};

module.exports = {
	extractDataFromResponse: function (medias){
		var tagsData = JSON.stringify( medias.map( function (media) {
			return { 'username': media.user.username,
					 'link'    : media.link,
					 'caption' : media.caption.text,
					 'image'   : media.images.standard_resolution.url
					};
    	}));
    	return tagsData;
	},
	requestHandler: function( request, response , callback ) {
		console.log( 'Request url: ' + request.url );
		var reqURL = url.parse( request.url, true );
		module.exports.queryHandler( reqURL.query.query, response, callback );
	},
	queryHandler: function( query, response, callback){
		if( environment === undefined ){
	    	console.log( 'No Twitter Client object. Issue setting Auth Keys.')
	    	response.writeHead( 200, {'Content-Type': 'text/plain'});
	    	response.end( 'Undefined Twitter client object');
	    }
	    else {	
	    	console.log( "In function queryHandler");
	    	ig.tag_media_recent( /*reqURL.query.*/query , function(err, medias, pagination, remaining, limit) {	    		
		    	console.log( "In function queryHandler");
				var responseData = module.exports.extractDataFromResponse( medias );
				console.log(err);
				if(err) throw err;
				response.writeHead( 200, {'Content-Type': 'text/plain'});
				response.end(responseData);
				if( callback !== undefined ) {
					callback( response );
				};
			});
		};
	},

	handleMedia: function(err, medias, pagination, remaining, limit, response, callback) {	    		
    	console.log( "In function queryHandler");
		var responseData = module.exports.extractDataFromResponse( medias );
		console.log(err);
		if(err) throw err;
		response.end(responseData);
		if( callback !== undefined ) callback( response );
	}
};


