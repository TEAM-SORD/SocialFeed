var test = require( 'tape');
var script = require( './script.js' );

test( 'easy pass test', function( t) {
	
	console.log('work damnit')

	t.plan( 1 );
	t.equal( 1,2 );
});