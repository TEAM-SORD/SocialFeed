var Twitter = require( 'twitter');
var apiConfig = require( './config.json');
var url = require( 'url');

var client = new Twitter({
  consumer_key: apiConfig.cKey,
  consumer_secret: apiConfig.cSecret,
  access_token_key: apiConfig.atKey,
  access_token_secret: apiConfig.atSecret,
});

function queryPrefix(){
	return 'search/tweets.json';
	//return 'statuses/filter.json';
};

module.exports = {
	requestHandler: function( req, res ) {
		var jsonStr;
		var reqURL = url.parse( req.url, true );
		
	    // console.log( "URL: " + req.url );
	    console.log( "in twitterClient.requestHandler" );
		client.get( queryPrefix(), { q : reqURL.query.query, lang: 'en', result_type: 'recent' }, function(error, tweets, response){		   
			// For each tweet get the tweet Text, URL and MEDIA_URLS
		    jsonStr = JSON.stringify( tweets.statuses.map( function(tweet) {
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
		    console.log('Stream ReturnString: ' + jsonStr);
		    res.writeHead( 200, {'Content-Type': 'application/json'});
		    res.end( jsonStr );
		    if (!error) {
		      console.log(tweets.statuses[0]);
		    };
	    });
	}
};
