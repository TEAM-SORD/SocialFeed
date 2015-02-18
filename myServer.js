var http = require( 'http' );
var fs = require('fs');
var path = require( 'path' );
var instagramClient =  require( './instagramClient')
var ecstatic = require( 'ecstatic')({root: __dirname + '/public'});

var filePath;

module.exports = {
	start: function() {
		
		http.createServer(function (req, res) {

		    // if only URL root path is received then load the 'homepage'
		    if ( req.url.match( /getinstas/ )) {
		      instagramClient.requestHandler( req, res );
		    }
		    // otherwise look for file in ./public directory and read from there useing ecstatic
		    else {
		      ecstatic( req, res ) ;
		    };

		}).listen( process.env.PORT || 3000   );
	}
};