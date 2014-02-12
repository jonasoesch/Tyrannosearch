/*
 * Display error message
 *
 */
function displayError(message) {
    $("section#results").children().remove();
    if(message === null) {message = "There was a problem.";}
    var html = '<span id="error">'+ message +'</span>';
    $("section#results").append(html);
}