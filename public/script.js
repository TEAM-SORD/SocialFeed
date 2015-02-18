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
			insertNewInstaToHTML( JSON.parse(data) );
		});
	});
	$('#searchvalue').keypress(function(e){
        if(e.which == 13){//Enter key pressed
            $('#search').click();//Trigger search button click event
        }
    });
});

function formatInstaToHTML (newInsta) {
	// console.log( 'In formatTweetToHTML');
	// var textandlink, media_url, htmlData;
	var username, image, link, caption, htmlData;

	username = '<p>' + newInsta.username + '</p>';
	image = '<img id="instapic" src='+ newInsta.image + '>';
	link = '<a href="' + newInsta.link + '">';
	caption = '<p>' + newInsta.caption + '</p></a>';
	htmlData = '<div class="instadiv">' + username + image + link + caption + '</div>';
	
	console.log(htmlData);
	return htmlData;
	
};
function insertNewInstaToHTML ( instas ) {
	var results, resultHTML;
	// generate a map of html elements for each insta
 	console.log('instas: ', typeof(instas));
	results = instas.map( function( element, index ){
		resultHTML = formatInstaToHTML( element );
		console.log(resultHTML);
		return resultHTML;
	});

	$('#resultsarea').empty();

	$('#resultsarea').append( results.join("") );
};
