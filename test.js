var test = require( 'tape');

test( 'easy pass test', function( t) {
	
	console.log('work damnit')

	t.plan( 1 );
	t.equal( 1,2 );
});