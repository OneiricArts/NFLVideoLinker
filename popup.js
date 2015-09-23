function isContentId(str) {
	var i = str.length;
	count = 0;
	while (i--) {
		// isNaN == false if number, or ' ' or '' -- find better way
		// using char < 9 etc has same problem 
		// try ' ' < 7 in console
		// http://stackoverflow.com/questions/15737763/how-to-use-javascript-to-check-if-the-first-character-in-a-textbox-is-a-number
  		if( !isNaN(str[i]) ) {
  			count++;
	  	}

	  	if( count > 3 ){
	  		return true;
	  	}
	}

	if (count <= 3) {
		return false;
	}
	else {
		return true;
	}
}

function getContentIdFromUrl(url) {

	contentId = null;
	var urlArr = url.split('/');

	for(var i = 0; i < urlArr.length; i++) {
		
		if(isContentId(urlArr[i]) == true) {
			contentId = urlArr[i];
			break;
		}
	}
	return contentId;
}

function getVideoLink(contentId) {


	document.getElementById('content').innerHTML += contentId;
	document.getElementById('content').innerHTML += ' --- test --- ';


	var jsonSuffix = "http://www.nfl.com/static/embeddablevideo/";
	var cdn = "http://a.video.nfl.com/";
	var json_url = jsonSuffix + contentId +".json";

	$.getJSON( json_url, function( data ) {

		if(data['cdnData']['bitrateInfo']) {

			var arr = data['cdnData']['bitrateInfo'];
			for(var i = 0; i < arr.length; i++) {
			}

			var highest_quality_path = arr[arr.length-1]['path'];
			var link = cdn + highest_quality_path; 
			var html_link = "<a href=\"" + link + "\"> Highest Quality </a>";
			
			document.getElementById('content').innerHTML += html_link;
			//document.getElementById('content').innerHTML = data['cdnData']['bitrateInfo']; 
		}

		else {
			document.getElementById('content').innerHTML += 'ERROR: coundnt get link from json'; 
		}
	})
	.error(function() { 
		document.getElementById('content').innerHTML += 'ERROR: coundnt get json -- content ID incorrect'; 
 	});
}

// This callback function is called when the content script has been 
// injected and returned its results
function onPageDetailsReceived(pageDetails)  { 

	var error_message = 'No Video Found, are you on an NFL site?';

	if( pageDetails.contentId ) {
		getVideoLink(pageDetails.contentId);
	}

	else if( getContentIdFromUrl(pageDetails.url) ) {
		getVideoLink( getContentIdFromUrl(pageDetails.url) );
	}

	else {
		document.getElementById('content').innerHTML = error_message;
	}

} 

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {

	// Get the event page
	chrome.runtime.getBackgroundPage(function(eventPage) {
		// Call the getPageInfo function in the event page, passing in 
		// our onPageDetailsReceived function as the callback. This injects 
		// content.js into the current tab's HTML
		eventPage.getPageDetails(onPageDetailsReceived);
	});
});