var test = require( 'tape');
var script = require( './script.js' );

test( 'result to html', function( t) {
	var exampleInsta = {
		user : 'username',
		comment: 'comment',
		media_url: 'picture'
	};
	var expectedHTML = '<div> <p> ' + exampleInsta.user +'</p>' + 
							 '<img src=' + exampleInsta.media_url + '>' +
							 '<p>' + exampleInsta.comment + '</p>' +
						 '</div>';

	t.plan( 1 );
	t.equal( script.formatInstaForHTML( tweet ), expectedHTML );
});

test( 'extract data from instagram response', function (t) {

	var instaResponse = {};
	var extractedData =  {
		user : 'username',
		comment: 'comment',
		media_url: 'picture'
	};
	t.plan(1);
	t.equal( extractDataFromResponse( instaResponse ), extractedData );
}