
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
	  client_id: process.env.INSTA_CID,
	  client_secret: process.env.INSTA_SECRET,
	};
	console.log( 'ENV VAR Client ID: ' + environment.client_id );
	console.log( 'ENV VAR Client Secret: ' + environment.client_secret );
};
// if Heroku Env Vars weren't set then client will be nothing
if( environment.client_id === undefined ){
	console.log( 'Environment Variables Undefined');
}
else {
	//instagram
	ig.use( environment );
};

module.exports = {
	extractDataFromResponse: function( medias ){
		console.log(medias);
		var tagsData = JSON.stringify( medias.map( function(media) {
			return { 'username': media.user.username,
					 'link'    : media.link,
					 'caption' : media.caption.text,
					 'image'   : media.images.standard_resolution.url
					};
    	}));
    	return tagsData;
	},
	requestHandler: function( req, res ) {
		var reqURL = url.parse(req.url, true);
		var responseData;
		if( ig === undefined ){
	    	console.log( 'No Twitter Client object. Issue setting Auth Keys.')
	    	res.writeHead( 200, {'Content-Type': 'text/plain'});
	    	res.end( 'Undefined Twitter client object');
	    }
	    else {	
	    	ig.tag_media_recent( reqURL.query.query , function(err, medias, pagination, remaining, limit) {	    		
				responseData = module.exports.extractDataFromResponse( medias );
//				console.log( responseData);
				console.log(err);
				if(err) throw err;
				res.write(responseData);
				res.end();
			});
		};
	}
};


