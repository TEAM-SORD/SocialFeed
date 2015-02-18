var test = require( 'tape');
// var script = require( './script' );
var instagramClient = require( './instagramClient');

// test( 'change response data to html', function( t) {
// 	var instagramData = { 
// 							'username': 'gallasandro88',
// 							'link'    : 'http://instagram.com/p/zN7wjkGyEu',
// 							'caption' : 'My banksy sketch #banksy',
// 							'image'   : 'http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/e15/10990586_1385584158422007_831432989_n.jpg'
// 						};
// 	var expectedHTML = '<div class="instadiv"> <p> gallasandro88</p>' + 
// 							 '<img id="instapic" src=http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/e15/10990586_1385584158422007_831432989_n.jpg>' +
// 							 '<a href="http://instagram.com/p/zN7wjkGyEu"> <p>My banksy sketch #banksy</p></a>' +
// 						 '</div>';

// username = '<p>' + newInsta.username + '</p>';
// 	image = '<img id="instapic" src='+ newInsta.image + '>';
// 	link = '<a href="' + newInsta.link + '">';
// 	caption = '<p>' + newInsta.caption + '</p><a/>';
// 	htmlData = '<div class="instadiv">' + username + image + link + caption + '</div>';						 

// 	t.plan( 1 );
// 	t.equal( script.formatInstaForHTML( instagramData ), expectedHTML );
// });

test( 'extract data from instagram response', function (t) {

	var instaResponse = {	"attribution":null,
							"tags":["lettering","draw","designer","adobe","typetopia","banksy","branding","illustration","freelancer","design","brush","brushlettering","artwork","handlettering","logo","font","logodesign","art","calligraphy","illustrator","script","freelance","artist","typography","vector","letters","handwriting","graphicdesign","type","drawing"],
							"location":null,
							"comments":{
								"count":0,
								"data":[]
							},
							"filter":"Normal",
							"created_time":"1424211508",
							"link":"http://instagram.com/p/zOAHIUhMTs/",
							"likes":{
								"count":0,
								"data":[]
							},
							"images":{
								"low_resolution":{
									"url":"http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/s306x306/e15/10990556_1413975998898496_1644313756_n.jpg",
									"width":306,
									"height":306
								 },
								 "thumbnail":{
								 	"url":"http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/s150x150/e15/10990556_1413975998898496_1644313756_n.jpg",
								 	"width":150,
								 	"height":150
								 },
								 "standard_resolution":{
								 	"url":"http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/e15/10990556_1413975998898496_1644313756_n.jpg",
								 	"width":640,
								 	"height":640
								 }
							 },
							 "users_in_photo":[],
							 "caption":{
							 	"created_time":"1424211508",
							 	"text":"Banksy #lettering",
							 	"from":{
							 		"username":"stevedineur",
							 		"profile_picture":"https://igcdn-photos-a-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-19/10895234_797447666969512_2041343769_a.jpg",
							 		"id":"329805304",
							 		"full_name":"stevedineur®"
							 	},
							 	"id":"922675463896483156"
							 },
							 "type":"image",
							 "id":"922675463628047596_329805304",
							 "user":{
							 	"username":"stevedineur",
							 	"website":"",
							 	"profile_picture":"https://igcdn-photos-a-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-19/10895234_797447666969512_2041343769_a.jpg",
							 	"full_name":"stevedineur®",
							 	"bio":"",
							 	"id":"329805304"
							 }
						};

	var extractedData =  [{ 
							'username': 'stevedineur',
							'link'    : 'http://instagram.com/p/zOAHIUhMTs/',
							'caption' : 'Banksy #lettering',
							'image'   : 'http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/e15/10990556_1413975998898496_1644313756_n.jpg'
						}];
	t.plan(1);
	t.equal( instagramClient.extractDataFromResponse( [instaResponse ]), JSON.stringify( extractedData ), 'Extracting desired data from Instagram response.');
});