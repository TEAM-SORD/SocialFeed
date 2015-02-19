var Twitter = require( 'twitter');
var url = require( 'url');
var ig = require('instagram-node').instagram();
//var mongoclient = require( 'mongodb').mongoclient;
var moment = require('moment');
var database = 'mongodb://localhost:27017/instagramDB';
var mongojs = require('mongojs');
var db = mongojs(database, ['MediaResults']);

db.open();
//console.log( db );
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
	extractDataFromResponse: function (medias){
		var tagsData;
		if( medias === undefined ) {
			config.log( 'No Media found');
			return tagsData;
		};
		tagsData = medias.map( function (media) {
			//console.log( 'media: ' + JSON.stringify( media.caption ));
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
	    	var data = {
	    		results: [],
	    		isFresh: function() {
	    			console.log( 'In isFresh(), Data.Results: ' + this.results )
	    			if( this.results === undefined || 
	    				this.results.length === 0  || 
	    				isDocumentStale( this.results[0].dateTimeInserted ) === true ){
	    				console.log( "Documents are stale ");
	    				return false;
	    			};
	    			console.log( "Documents aren't stale yet.");
	    			return true;
	    		}
	    	};
		if( twitEnv === undefined || instaEnv === undefined ){
	    	console.log( 'No Twitter Client object. Issue setting Auth Keys.');
	    	response.writeHead( 200, {'Content-Type': 'text/plain'});
	    	response.end( 'Undefined Twitter or instagram client object');
	    }
	    else {	
	    	console.log( "In function queryHandler");
	    	// make a call to the database and see if there is any data for our query 
	    	var dbError, formattedData;
	    	data.results = module.exports.lookupQueryInDB( query );
	    	if( data.isFresh() ) { 
	    		formattedData = module.exports.formatDocumentResponse( data );
	    		console.log( 'Collection data formatted for response to browser' + formattedData );
	    		response.end( formattedData );
	    	}
	    	else {
	    		ig.tag_media_recent( /*reqURL.query.*/query , function(err, medias, pagination, remaining, limit) {	    		
			    	console.log( "In callback of tag_media_recent");			    	
					var responseData = module.exports.extractJSONFromResponseStringified( medias );
					// add extracted data to database and then return is on the response
					try{
						// if there's data in the database then it will need to be replaced
						var docs = module.exports.lookupQueryInDB( 'MediaResults', query );
						if( docs.length > 0 ) {
							if( docs.length !== module.exports.removeDocsFromCollection( query ).WriteResult ) {
								console.log( 'Not all of the docs were removed!');
							}
							else{
								console.log( 'All docs have been removed!' );
							};
						};
						// and then new data added
						data = addToCollection( 'MediaResults', responseData, query );
						if( data === undefined ) {
							console.log( 'Error adding data to database: ' );
						};
					}
					catch( error ){
						console.log( 'I think the add to collection failed: Error: ' + error );
					}
					if(err) {
						console.log( "In tag_media_recent callback. Error: " + err);
						throw err;
					};
					response.writeHead( 200, {'Content-Type': 'text/plain'});
					response.end(responseData);
					if( callback !== undefined ) {
						callback( response );
					};
				});
			};
		};
	},
	isDocumentStale: function( entryDateTime ) {
		//var startDate = moment('2013-5-11 8:73:18', 'YYYY-M-DD HH:mm:ss')
		var timeNow = moment(moment(), 'YYYY-M-DD HH:mm:ss');
		var minutesDiff = timeNow.diff( entryDateTime, 'minutes');
		console.log(minutesDiff);
		return ( minutesDiff > STALE_TIME_LIMIT )? true : false;
	},
	createDatabaseCollection: function( ){
		// if collection isn't found then create it
		db.collection( 'MediaResults', function() {
			console.log( 'In collection constructor cb');
		} );		
	},
	lookupQueryInDB: function( collectionName, query ) {
		if( !DATABASE_CONNECTION ){
			console.log( 'In lookupQueryInDB - Database Not Connected!');
			return;
		};
		db.MediaResults.find( { queriedTerm: query }, function(err, docs) {
    		// docs is an array of all the documents in mycollection
    		if( err ){
    			console.log( err );
    		}
    		console.log( 'Any Documents found?: ' + docs)
    		return docs;
		});
	},
	removeDocsFromCollection: function( query ) {
		var writeResult = db.MediaResults.find({ queriedTerm: query}).remove();
		console.log( "In removeDocsFromCollection, number removed: " + writeResult.nRemoved );
		return writeResult;
	},
	formatDocumentResponse: function( data ) {
		// return a JSON string of data
		return { 'username': data.results.username,
				 'link'    : data.results.link,
				 'caption' : data.results.caption,
				 'image'   : data.results.imageURL
				};
	},
	addToCollection: function( collectionName, responseData, query ) {
		if( !DATABASE_CONNECTION ) {
			console.log( "In addToCollection - Database Not Connected!");
			return;
		};
		var apiResponse = JSON.parse( responseData );
		var tobeinserted = apiResponse.map( function( element, index ) {
			element.queriedTerm = query;
			var timeNow = moment(moment(), 'YYYY-M-DD HH:mm:ss');
			console.log( 'timeNow: ' + timeNow);
			element.dateTimeInserted = moment(moment(), 'YYYY-M-DD HH:mm:ss');
			return element;
		});

		
		// do a bulk insert
		var bulk = db.MediaResults.initializeOrderedBulkOp();
		// for( var i = 0; i< tobeinserted.length; ++i ){
		// 	console.log( 'Before insert index[' + i + '] of: ' + tobeinserted[i].username );
		// 	bulk.insert(element);
		// }
		tobeinserted.forEach( function( element, index ) {
			console.log( 'Before insert index[' + index + '] of: ' + element.queriedTerm );
			console.log( 'Link: ' + element.dateTimeInserted );
			console.log( 'Link: ' + element.link );
			console.log( 'Link: ' + element.caption );
			console.log( 'Link: ' + element.image );
			console.log( 'Link: ' + element.username);
			bulk.insert(element);
		});
		bulk.execute( function( err, res ) {
			console.log( 'In Insert CB');
			if( err ) {
				console.log( 'Error: ' + err )
			};
			console.log( res );
			return res;
		});
		// db.MediaResults.insert( JSON.stringify( apiResponse ), function( err, docs ){
		// 	console.log( 'In Insert CB');
		// 	if( err ) {
		// 		console.log( err )
		// 	};
		// 	console.log( docs );
		// 	return docs;
		// });
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

