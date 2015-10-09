// Send a message containing the page details back to the event page
chrome.runtime.sendMessage({
    //'contentId' : document.getElementById('contentId'),
    'contentId' : $.attr('data-contentid'),
    'url': window.location.href 
});