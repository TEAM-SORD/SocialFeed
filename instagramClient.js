var Twitter = require( 'twitter');
var url = require( 'url');
var ig = require('instagram-node').instagram();
//var mongoclient = require( 'mongodb').mongoclient;
var mongojs = require('mongojs');

var moment = require('moment');
//var database = 'mongodb://localhost:27017/instagramDB';
var database = 'mongodb://beechware:Pass1on8@ds039301.mongolab.com:39301/sord';

var db = mongojs(database, ['MediaResults']);
var STALE_TIME_LIMIT = 2;// 2 minutes
db.open();
console.log( db );
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
	  client_secret: process.env.INSTA_SECRET

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
var DATABASE_CONNECTION; // boolean
db.on('error',function(err) {
    console.log('database error', err);
    DATABASE_CONNECTION = false;
});

db.on('ready',function() {
    console.log('database connected');
    DATABASE_CONNECTION = true;
});
module.exports = {
	extractJSONFromResponseStringified: function (medias){
		var tagsData;
		if( medias === undefined ) {
			console.log( 'No Media found');
			return tagsData;
		};
		console.log( 'medias: ' + medias );
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
	extractDataFromResponse: function (medias){
		var tagsData; 
		if( medias === undefined || medias.length === 0 ) {
			config.log( 'No Media found');
			return tagsData;
		};
		
		tagsData = medias.map( function (media) {
			console.log( 'media: ' + JSON.stringify( media.caption ));
			return { 'username': media.user.username,
					 'link'    : media.link,
					 'caption' : ( media.caption === null )? "": media.caption.text,
					 'image'   : media.images.standard_resolution.url
					};
    	});
    	return tagsData;
	},
	requestHandler: function( request, response , callback ) {
		console.log( 'Request url: ' + request.url );
		var reqURL = url.parse( request.url, true );
		module.exports.queryHandler( reqURL.query.query, response, callback );
	},
	queryHandler: function( query, response, callback){
		var docs, documents;
    	var data = {
    		results: [],
    		isFresh: function() {
    			console.log( 'In isFresh()' )
    			if( this.results === undefined || 
    				this.results.length === 0  || 
    				module.exports.isDocumentStale( this.results[0].dateTimeInserted ) === true ){
    				console.log( "Documents are stale ");
    				return false;
    			};
    			console.log( "Documents aren't stale yet.");
    			return true;
    		}
    	};

    	console.log( "In function queryHandler");
		if( twitEnv === undefined || instaEnv === undefined ){
	    	console.log( 'No Twitter Client object. Issue setting Auth Keys.');
	    	response.writeHead( 200, {'Content-Type': 'text/plain'});
	    	response.end( 'Undefined Twitter or instagram client object');
	    	return;
	    };

    	// make a call to the database and see if there is any data for our query 
    	var dbError, formattedData;
    	var projection = { 'dateTimeInserted': 1, 'username': 1, 'link':1, 'caption':1, 'image':1, _id: 0 };
    	module.exports.lookupQueryInDB( query, projection, function( documents ) { 
    		data.results = documents;
	    	if( data.isFresh() ) { 
	    		console.log( 'Data is fresh so resend fron the database');
	    		response.writeHead( 200, {'Content-Type': 'text/plain'});
	    		response.end( JSON.stringify( documents ));
	    		
	    		if( callback !== undefined ) {
					callback( response );
					db.close();
				};
				return;
	    	};
	    	// Need to call the INSTAGRAM API to get fresh data:	
    		ig.tag_media_recent( query , function(err, medias, pagination, remaining, limit) {	    		
		    	console.log( "In callback of tag_media_recent");			    	
				var responseData;
				if(err) {
					console.log( "In tag_media_recent callback. Error: " + err);
					throw err;
				};
				
				if( medias === undefined || medias.length === 0 ) {
					console.log( 'No Media found');
					responseData = JSON.stringify ( [{ 'username': "",
			 									      'link'    : "",
			 										  'caption' : "No MEDIAS FOUND FOR: " + query,
			 										  'image'   : ""
													}]);

				}
				else {
					responseData = module.exports.extractJSONFromResponseStringified( medias );
				};
				response.writeHead( 200, {'Content-Type': 'text/plain'});
				response.end(responseData);
			
				if( callback !== undefined ) {
					callback( response );
					db.close();
					return;
				};
				
				if( medias !== undefined && medias.length >= 1 ) {
					module.exports.databaseUpdates( query, responseData);
				};	
			});
	
		});
	},
	databaseUpdates: function ( query, responseData ) {
		// add extracted data to database and then return is on the response
		try{
			// if there's data in the database then it will need to be replaced
			module.exports.lookupQueryInDB( query, {}, function( docs ){ 								
				console.log( "In lookupQueryInDB's callback");
				module.exports.removeDocsFromCollection( docs, query, function( nRemoved ) {
					console.log( "In removeDocsFromCollection's callback");
					if( docs && docs.length !== nRemoved ) {
						console.log( 'Not all of the docs were removed!');
					}
					else if ( docs ){
						console.log( 'All docs have been removed!' );
					};
					// and then new data added
					module.exports.addToCollection( responseData, query );						
				});
			});
		}
		catch( error ){
			console.log( 'I think the add to collection failed: Error: ' + error );
		};
	},
	isDocumentStale: function( entryDateTime ) {
		//var startDate = moment('2013-5-11 8:73:18', 'YYYY-M-DD HH:mm:ss')
		console.log( 'entryDateTime: ' + entryDateTime);
		var timeNow = moment(moment(), 'YYYY-M-DD HH:mm:ss');
		var minutesDiff = timeNow.diff( entryDateTime, 'minutes');
		console.log('isDocumentStale - Difference in time: ' + minutesDiff);
		return ( minutesDiff > STALE_TIME_LIMIT )? true : false;
	},
	createDatabaseCollection: function( ){
		// if collection isn't found then create it
		db.collection( 'MediaResults', function() {
			console.log( 'In collection constructor cb');
		} );		
	},
	lookupQueryInDB: function( query, projection, callback ) {
		var err, docs;
		console.log( 'In lookupQueryInDB');
		db.MediaResults.find( { queriedTerm: query }, projection, function(err, docs) {
    		// docs is an array of all the documents in mycollection
    		if( err ){
    			console.log( 'Error: ' + err );
    		};
    		console.log( ( docs && docs.length > 0 ) ? 'Any Documents found?: ' + docs.length : 'No Documents found.');
			callback( docs ); 
		});
	},
	removeDocsFromCollection: function( docs, query , callback ) {
		var writeResult = 0;
		var documents, err, nRemoved;
		console.log( 'In removeDocsFromCollection');
		if( docs && docs.length > 0 ) {
			db.MediaResults.remove( {queriedTerm: query }, function( err, writeResult ) {
			//db.MediaResults.find({ queriedTerm: query}, function( err, documents ) {
				if( err ){
    				throw err;
    			};

    			console.log( "Result from remove: " + writeResult.nRemoved );
				//writeResult = documents.remove();
				console.log( "In removeDocsFromCollection, number removed: " + writeResult.nRemoved );
				callback( writeResult.nRemoved );
			})
		}
		else {
			console.log( 'in removeDocsFromCollection  - no documents to remove' );
			callback( writeResult );
		};
	},
	formatDocumentResponse: function( documents ) {
		// 
		// return a JSON string of data
		return { 'username': data.results.username,
				 'link'    : data.results.link,
				 'caption' : data.results.caption,
				 'image'   : data.results.imageURL
				};
	},
	addToCollection: function( responseData, query ) {
		var res;
		var apiResponse = JSON.parse( responseData );
		console.log( 'in addToCollection');
		var tobeinserted = apiResponse.map( function( element, index ) {
			element.queriedTerm = query;
			element.dateTimeInserted = moment(moment(), 'YYYY-M-DD HH:mm:ss');
			return element;
		});

		
		// do a bulk insert
		var bulk = db.MediaResults.initializeOrderedBulkOp();
		tobeinserted.forEach( function( element, index ) {
			bulk.insert(element);
		});
		var results = bulk.execute( function( err, res ) {
			console.log( 'In Insert CB');
			if( err ) {
				console.log( 'Error: ' + err )
			};
			return res;
		});
		console.log( 'Inserted documents, result: ' + res );
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

