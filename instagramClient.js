
var Twitter = require( 'twitter');
var url = require( 'url');
var ig = require('instagram-node').instagram();
var http = require('http');
var mongoclient = require( 'mongodb').mongoclient;
var database = 'mongodb://localhost:27017/instagramDB';

var twitEnv, instaEnv;
try{
	var apiConfig = require( './config.json');
	twitEnv = {
	  consumer_key: apiConfig.cKey,
	  consumer_secret: apiConfig.cSecret,
	  access_token_key: apiConfig.atKey,
	  access_token_secret: apiConfig.atSecret,
  	};
  	instaEnv = {
	  client_id: apiConfig.instaCID,
	  client_secret: apiConfig.instaCSecret
	};
}
catch( err ){
	console.log( 'Error getting apiConfig, try Heroku Env Vars: ' + err );
	// cannot find config.json so try for Heroku Env Vars instead
 	twitEnv = {
	  consumer_key: process.env.TWIT_C_KEY,
	  consumer_secret: process.env.TWIT_C_SECRET,
	  access_token_key: process.env.TWIT_AT_KEY,
	  access_token_secret: process.env.TWIT_AT_SECRET,
  	};

  	instaEnv = {
	  client_id: process.env.INSTA_CID,
	  client_secret: process.env.INSTA_CSECRET

	};
	console.log( 'ENV VAR CKEY: ' + twitEnv.consumer_key );
	console.log( 'ENV VAR CSecret: ' + twitEnv.consumer_secret );
	console.log( 'ENV VAR atKey: ' + twitEnv.access_token_key );
	console.log( 'ENV VAR atSecret: ' + twitEnv.access_token_secret );
	console.log( 'ENV VAR INSTA Client ID: ' + instaEnv.client_id );
	console.log( 'ENV VAR INSTA Client Secret: ' + instaEnv.client_secret );
};
// if Heroku Env Vars weren't set then client will be nothing
if( twitEnv.consumer_key === undefined || instaEnv.client_id === undefined){
	console.log( 'Environment Vars Undefined');
}
else {
	//client = new Twitter( twitEnv );
	//instagram
	ig.use( instaEnv );
}

module.exports = {
	extractDataFromResponse: function (medias){
		var tagsData;
		if( medias === undefined ) {
			config.log( 'No Media found');
			return tagsData;
		};
		tagsData = JSON.stringify( medias.map( function (media) {
			//console.log( 'media: ' + JSON.stringify( media.caption ));
			return { 'username': media.user.username,
					 'link'    : media.link,
					 'caption' : ( media.caption === null )? "": media.caption.text,
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
		if( twitEnv === undefined || instaEnv === undefined ){
	    	console.log( 'No Twitter Client object. Issue setting Auth Keys.')
	    	response.writeHead( 200, {'Content-Type': 'text/plain'});
	    	response.end( 'Undefined Twitter or instagram client object');
	    }
	    else {	
	    	console.log( "In function queryHandler");
	    	// make a call to the database and see if there is any data for our query 
	    	// var data = {};
	    	// var dbError;
	    	// data = lookupQuery( query );
	    	// if( data.isFresh() ) { 
	    	// 	response.end( data );
	    	// }
	    	// else {
	    		ig.tag_media_recent( /*reqURL.query.*/query , function(err, medias, pagination, remaining, limit) {	    		
			    	console.log( "In callback of tag_media_recent");			    	
					var responseData = module.exports.extractDataFromResponse( medias );
					// add extracted data to database and then return is on the response
					// data = addToDatabase( responseData, dbError);
					// if( data === undefined ) {
					// 	console.log( 'Error adding data to database: ' + dbError );
					// };
					if(err) {
						console.log(err);
						throw err;
					};
					response.writeHead( 200, {'Content-Type': 'text/plain'});
					response.end(responseData);
					if( callback !== undefined ) {
						callback( response );
					};
				});
			// };
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


