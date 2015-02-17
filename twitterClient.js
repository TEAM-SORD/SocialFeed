var Twitter = require( 'twitter');

var url = require( 'url');
var envVars, client;
try{
	var apiConfig = require( './config.json');
	envVars= {
	  consumer_key: apiConfig.cKey,
	  consumer_secret: apiConfig.cSecret,
	  access_token_key: apiConfig.atKey,
	  access_token_secret: apiConfig.atSecret,
	};
}
catch( err ){
	// cannot find config.json so try for Heroku Env Vars instead
 	envVars = {
	  consumer_key: process.env.TWIT_C_KEY,
	  consumer_secret: process.env.TWIT_C_SECRET,
	  access_token_key: process.env.TWIT_AT_KEY,
	  access_token_secret: process.env.TWIT_AT_SECRET,
	}
	console.log( 'ENV VAR CKEY: ' + envVars.consumer_key );
	console.log( 'ENV VAR CSecret: ' + envVars.consumer_secret );
	console.log( 'ENV VAR atKey: ' + envVars.access_token_key );
	console.log( 'ENV VAR atSecret: ' + envVars.access_token_secret );
};
// if Heroku Env Vars weren't set then client will be nothing
if( envVars.consumer_key === undefined ){
	console.log( 'envVars undefined');
}
else {
	client = new Twitter( envVars );
}

function queryPrefix(){
	return 'search/tweets.json';
};

function extractDataFromResponse ( tweet ) {

	var jsonStr;
	try {
		jsonStr = JSON.stringify( tweet.statuses.map( function(tweet) {
			var returnString = { 'text': tweet.text };
		 	if ( typeof (tweet.entities.media) !== 'undefined' && tweet.entities.media[0]) {
				console.log( 'tweet pic: ' + tweet.entities.media[0].media_url );
				returnString.media_url = tweet.entities.media[0].media_url;
			};
			if (tweet.entities.urls[0]) {
				console.log( 'tweet link: ' + tweet.entities.urls[0].url );
				returnString.url = tweet.entities.urls[0].url;
			};
			return returnString;
		}));
	}
	catch( err ) {
		console.log( 'Error: ' + err );
	}
	return jsonStr;
}
module.exports = {
	requestHandler: function( req, res ) {
		var jsonStr;
		var reqURL = url.parse( req.url, true );
		
	    // console.log( "URL: " + req.url );
	    console.log( "in twitterClient.requestHandler" );
	    if( client === undefined ){
	    	console.log( 'No Twitter Client object. Issue setting Auth Keys.')
	    	res.writeHead( 200, {'Content-Type': 'text/plain'});
	    	res.end( 'Undefined Twitter client object');
	    }
	    else {

			client.get( queryPrefix(), { q : reqURL.query.query, lang: 'en', result_type: 'recent' }, function(error, tweets, response){		   
				// For each tweet get the tweet Text, URL and MEDIA_URLS
				jsonStr = extractDataFromResponse( tweets );
			    
			    console.log('Stream ReturnString: ' + jsonStr);
			    res.writeHead( 200, {'Content-Type': 'application/json'});
			    res.end( jsonStr );
			    if (!error) {
			      console.log(tweets.statuses[0]);
			    };
		    });
	    };
	}
};
