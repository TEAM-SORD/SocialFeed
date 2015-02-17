var test = require( 'tape');
var script = require( './script.js' );

test( 'easy pass test', function( t) {
	

	t.plan( 1 );
	t.equal( 1,2 );
});