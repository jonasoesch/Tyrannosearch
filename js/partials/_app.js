// @codekit-prepend "_getState.js"
// @codekit-prepend "_displayResults.js"
// @codekit-prepend "_displayError.js"
// @codekit-prepend "_search.js"
// @codekit-prepend "_getDocument.js"
// @codekit-prepend "_reloadFacets.js"
// @codekit-prepend "_detailView.js"
// @codekit-prepend "_prepareInterface.js"
// @codekit-prepend "_infiniteScrolling.js"
// @codekit-prepend "_toggleSelected.js"
// @codekit-prepend "_restart.js"
// @codekit-prepend "_newResults.js"



window.resultsLoading = true;
window.nbOfResult = 0;




/*
 *  delay() function is added to jQuery
 *  The goal is to fix a delay
 */
var delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();





$(document).ready( function() {
    
    // Initialize the interface
    window.resultsLoading = false;
    prepareInterface();

    /* ------------ User Interactions ---------------- */
    

    // When the user types, after a short delay display results
    $("form").on("keyup", 'input', function() {
            delay(function(){
            search(1);
        }, 200 );
        
        prepareInterface();
    });
    
    // Role, Tag, Group clicked, reload the results with the new criteria
    $("#roles, #tags, #groups").on("click", "li", function() {
        toggleSelected($(this));
        search(1);
    });
    
    // When the users scrolls, load more results when he arrives at the bottom
    window.onscroll = function() {
        infiniteScrolling();
    };

    // When the user clicks on a search result show a detailed view
    $("#main").on("click", "article:not(.details)", function() {
        getDocument($(this).attr("id"));
    });
    
    // When the user clicks on a detail view, reduce it again
    $("#main").on("click", "article.details h2", function() {
        hideDetails($(this).parent().attr("id"));
    });
    
    
    $("form").on("click", "img.dino", function(e) {
        e.preventDefault();
        restart();
    });

    $("form").on("submit", function(e) {e.preventDefault(); });



    /* ------- System Events -------- */

    // When we receive new results from the server, update the user interface
    $("#results").on("newResults", function(event, data) {
        newResults(data.response.docs);
        reloadFacets(data);
    });

    // When infinite scrolling asks for more results. Append them.
    $("#results").on("moreResults", function(event, data) {
        displayResults(data.response.docs);
    });
    
    // Display detailed data when we have received it
    $("#results").on("newResult", function(event, data) {
        displayDetails(data.response.docs[0]);
    });
    

});

