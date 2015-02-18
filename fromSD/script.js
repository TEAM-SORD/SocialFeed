$(document).ready( function (){
	$('#searchvalue').focus( function(){
        $(this).val('');
    });
	// send a GET request to my web server
	$('#search').click( function() {
		$.get('./getinstas?query=' + $('#searchvalue').val(), function(data){
			console.log( 'data: ' + data );
			})
			.done(function (data) {
				console.log( "In done callback. Data: " + data );
				if( typeof ( data ) !== 'string' ) 
					insertNewInstaToHTML( JSON.parse(data) );
		});
	});
	$('#searchvalue').keypress(function(e){
        if(e.which == 13){//Enter key pressed
            $('#search').click();//Trigger search button click event
        }
    });
});

// function formatTextForHTML ( newTweet ){
// 	console.log( 'In formatTextForHTML');
// 	if (newTweet.url === undefined ) {
// 		return '<p class="tweettext">' + newTweet.text + '</p>';
// 	}
// 	else {
// 		return "<p class='tweettext'> <a class='tweetlink' href="+ newTweet.url + ">" + newTweet.text + "</a></p>";
// 	};
// }
// function formatMediaForHTML (mediaUrl){
// 	console.log( 'In formatMediaForHTML');
// 	return '<div class="mediadiv"> ' + '<img class="mediapic" src=' + mediaUrl + ' alt="Cannot display image"></div>';
// }

function formatInstaToHTML(newInsta) {
	// console.log( 'In formatTweetToHTML');
	// var textandlink, media_url, htmlData;
	var username, link, caption, htmlData;

	username = '<p>' + newInsta.username + '</p>';
	link = '<a href="' + newInsta.link + '">';
	caption = '<p>' + newInsta.caption + '</p><a/>';
	htmlData = '<div class="instadiv">' + username + link + caption + '</div>';
	// formatTextForHTML
	// textandlink = formatTextForHTML( newTweet );
	// if media_url available then include in html
	// if (newTweet.media_url !== undefined ){
	// 	media_url = formatMediaForHTML( newTweet.media_url);
	// };
	// if (newTweet.media_url !== undefined ){
	// 	media_url = formatMediaForHTML( newTweet.media_url);
	// };
	// if( media_url === undefined ) {
	// 	htmlData = '<div class="tweetdiv">' + textandlink + '</div>';
	// }
	// else {
	// 	htmlData = '<div class="tweetdiv">' + textandlink + media_url + '</div>';
	// };

	// console.log( "HTML to be prepended: " + htmlData );
	console.log(htmlData);
	return htmlData;
}

function insertNewInstaToHTML( instas ) {
	var results, resultHTML;
	// generate a map of html elements for each insta
 	console.log('instas: ', typeof(instas));
	results = instas.map( function( element, index ){
		resultHTML = formatInstaToHTML( element );
		console.log(resultHTML);
		return resultHTML;
	});

	$('#resultsarea').append( results.join("") );
}
