$(document).ready( function (){
	$('#searchvalue').focus( function(){
        $(this).val('');
    });
	// send a GET request to my web server
	$('#search').click( function() {
		
		console.log( './gettweets?query='+$('#searchvalue').val());
		$.get('./gettweets?query=' + $('#searchvalue').val(), function( data ) {
			console.log( 'data: ' + data );
		})
		.done(function(data){
			console.log( "In done callback. Data: " + data );
			if( typeof ( data ) !== 'string' ) 
				insertNewTweetToHTML( data );			
		});
	});
});

function formatTextForHTML ( newTweet ){
	console.log( 'In formatTextForHTML');
	if (newTweet.url === undefined ) {
		return '<p class="tweettext">' + newTweet.text + '</p>';
	}
	else {
		return "<p class='tweettext'> <a class='tweetlink' href="+ newTweet.url + ">" + newTweet.text + "</a></p>";
	};
}
function formatMediaForHTML (mediaUrl){
	console.log( 'In formatMediaForHTML');
	return '<div class="mediadiv"> ' + '<img class="mediapic" src=' + mediaUrl + ' alt="Cannot display image"></div>';
}

function formatTweetToHTML (newTweet) {
	console.log( 'In formatTweetToHTML');
	var textandlink, media_url, htmlData;
	// formatTextForHTML
	textandlink = formatTextForHTML( newTweet );
	// if media_url available then include in html
	if (newTweet.media_url !== undefined ){
		media_url = formatMediaForHTML( newTweet.media_url);	
	};
	if( media_url === undefined ) {
		htmlData = '<div class="tweetdiv">' + textandlink + '</div>';
	}	 
	else {
		htmlData = '<div class="tweetdiv">' + textandlink + media_url + '</div>';
	};

	console.log( "HTML to be prepended: " + htmlData );
	return htmlData;
}

function insertNewTweetToHTML( tweets ) {
	var results, resultHTML;
	// generate a map of html elements for each tweet
	results = tweets.map( function( element, index ){
		resultHTML = formatTweetToHTML( element )
		return resultHTML;
	})
	
	//var htmlTweet = formatTweetToHTML(newTweet);
	$('#resultsarea').append( results.join("") );
}