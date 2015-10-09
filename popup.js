
var debugMode = true;

function isContentId(str) {
	var i = str.length;
	count = 0;

	while (i--) {
		if( !isNaN(str[i]) ) { count++;} 
		if( count > 3 ){ return true; }
	}

	if (count <= 3) { return false; } 
	else { return true; }
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

function makeVideoCard(title, content) {
	
	var $link_div = $('#link_template').clone();
	var $link_title = $link_div.find('#link_title');
	var $link_content = $link_div.find('#link_content');

	$link_title.text(title);
	$link_content.html(content);

	$('.page-content').append($link_div);
	$link_div.show();
}

function getVideoLink(contentId) {

	if(debugMode) {
		$('#debugInfo').append( "[url.contentId: " + contentId + "]<br>" );
	}

	var jsonSuffix = "http://www.nfl.com/static/embeddablevideo/";
	var cdn = "http://a.video.nfl.com/";
	var json_url = jsonSuffix + contentId +".json";

	if(debugMode) {
		$('#debugInfo').append( "[json url: " + json_url + "]<br>" );
	}

	$.getJSON( json_url, function( data ) {

		if(data['cdnData']['bitrateInfo']) {

			var arr = data['cdnData']['bitrateInfo'];
			for(var i = 0; i < arr.length; i++) {
			}

			var highest_quality_path = arr[arr.length-1]['path'];
			var link = cdn + highest_quality_path; 
			var html_link = "<a href=\"" + link + "\"> Highest Quality </a>";
			
			var title = 'Video';
			if(data['briefHeadline']) {
				title = data['briefHeadline'];
			}
			
			makeVideoCard(title, html_link);
		}

		else {
			errorDisplay('json_url_error')
		}
	})
	.error(function() { 
		errorDisplay('json_error');
	});
}

function errorDisplay(errorId) {
	$('#error_card').show();

	if (errorId == "site_error") {
		$('#error_detail').append("Detail: Couldn't find content ID.<br><hr>" 
		); 
	}
	else if(errorId == "json_error") {
		$('#error_detail').append("Detail: Couldn't get json from content ID.<br>");
	}
	else if(errorId == "json_url_error") {
		$('#error_detail').append("Detail: Couldn't get video link from json.<br>");
	}
}

function onPageDetailsReceived(pageDetails)  { 

	if(debugMode) {$('#debugDiv').show();}

	if(debugMode) {
		$('#debugInfo').append( "[pagedetails.contentId: " + 
			pageDetails.contentId + "]<br>" );
	}
	
	/*
		Look for contentId in order of: in page source -> page url
	*/

	//pageDetails.contentId = '09000d5d81c27f1e';
	if( pageDetails.contentId ) {
		getVideoLink(pageDetails.contentId);
	}

	else if( getContentIdFromUrl(pageDetails.url) ) {
		getVideoLink( getContentIdFromUrl(pageDetails.url) );
	}

	else {
		errorDisplay("site_error");
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

/* opens links in new tabs */
$(document).ready(function(){
	$('body').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});
	// could replace tabs.create with [below] to create popup
	// chrome.windows.create({url: link, type: "popup",/* focused: false*/});
});