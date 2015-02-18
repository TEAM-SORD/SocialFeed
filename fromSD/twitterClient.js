
var apiConfig = require( './config.json');
var url = require( 'url');
var ig = require('instagram-node').instagram();
var http = require('http');

// var client = new Twitter({
//   consumer_key: apiConfig.cKey,
//   consumer_secret: apiConfig.cSecret,
//   access_token_key: apiConfig.atKey,
//   access_token_secret: apiConfig.atSecret,
// });

//instagram
ig.use({client_id: apiConfig.clientId,
		client_secret: apiConfig.clientSecret});


// function queryPrefix(){
// 	return 'search/tweets.json';
// 	//return 'statuses/filter.json';
// };

// module.exports = {
// 	requestHandler: function( req, res ) {
// 		var jsonStr;
// 		var reqURL = url.parse( req.url, true );

// 	    // console.log( "URL: " + req.url );
// 	    console.log( "in twitterClient.requestHandler" );
// 		client.get( queryPrefix(), { q : reqURL.query.query, lang: 'en', result_type: 'recent' }, function(error, tweets, response){
// 			// For each tweet get the tweet Text, URL and MEDIA_URLS
// 		    jsonStr = JSON.stringify( tweets.statuses.map( function(tweet) {
// 		    	var returnString = { 'text': tweet.text };
// 		     	if ( typeof (tweet.entities.media) !== 'undefined' && tweet.entities.media[0]) {
// 		    		console.log( 'tweet pic: ' + tweet.entities.media[0].media_url );
// 		    		returnString.media_url = tweet.entities.media[0].media_url;
// 		    	};
// 	    		if (tweet.entities.urls[0]) {
// 	    			console.log( 'tweet link: ' + tweet.entities.urls[0].url );
// 	    			returnString.url = tweet.entities.urls[0].url;
//     			};
// 		    	return returnString;
// 		    }));
// 		    console.log('Stream ReturnString: ' + jsonStr);
// 		    res.writeHead( 200, {'Content-Type': 'application/json'});
// 		    res.end( jsonStr );
// 		    if (!error) {
// 		      console.log(tweets.statuses[0]);
// 		    };
// 	    });
// 	}
// };
module.exports = {
	requestHandler: function( req, res ) {
		var reqURL = url.parse(req.url, true);
		ig.tag_media_recent( reqURL.query.query , function(err, medias, pagination, remaining, limit) {
			//strip out function
			var tagsData = JSON.stringify(medias.map( function(media) {
				return { 'username': media.user.username,
						 'link'    : media.link,
						 'caption' : media.caption.text};
				    	}

		    ));
			console.log(err);
			if(err) throw err;
			res.write(tagsData);
			res.end();
		});

	}
};


// var instaUsernames = FromJson(data) {
// 	var instaUsernames = [];
// 	for (var i = 0; i < data.length; i++) {
// 		instaUsernames.push(data[i].user.username);
// 	};
// 	return instaUsernames;
// };

// module.exports = {
// 	requestHandler: function( req, res) {
// 		var reqURL = url.parse( req.url, true);
// 		ig.media_popular(function(err, medias, remaining, limit) {
// 			res.writeHead(200, {'content-type': 'text-plain'});
// 			console.log(err);
// 			if(err) throw err;
// 			limit = 10;
// 			console.log(JSON.stringify(getInstaStringFromJson(medias)));
// 			res.end();
// 			})
// 	}
// };





//ig.user_media_recent('user_id', [options,] function(err, medias, pagination, remaining, limit) {});

//ig.tag_media_recent('tag', [options,] function(err, medias, pagination, remaining, limit) {});


