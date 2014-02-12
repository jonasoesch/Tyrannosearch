// @codekit-prepend "_getState.js"
// @codekit-prepend "_displayResults.js"
// @codekit-prepend "_displayError.js"
// @codekit-prepend "_sortQuery.js"
// @codekit-prepend "_facetQuery.js"
// @codekit-prepend "_querySolr.js"
// @codekit-prepend "_getDocument.js"
// @codekit-prepend "_reloadFacets.js"
// @codekit-prepend "_detailView.js"
// @codekit-prepend "_prepareInterface.js"


window.resultsLoading = true;
window.nbOfResult = 0;


/*
 *	Toggle data-selected
 */
function toggleSelected(el) {
    if(el.attr("data-selected") === "true") {
        el.attr("data-selected", false);
    } else {
        el.attr("data-selected", true);
    }
}

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


/*
 *	Query *:*
 *	
 */
function restart() {
    $("form input").val("");
    $("#roles li, aside ul li").removeAttr("data-selected");
    search();
}


/*
 * Display suggestions
 *
 */
function displaySuggestions(suggestions) {
    if(suggestions !== null) {
        console.log("Suggestions: "+suggestions.suggestion);
    }
}


/*
 * Add new results to the interface
 *
 */
function newResults(results) {
    
    // Remove old results
    $("section#results").children().remove();
    
    displayResults(results);
}



function infiniteScrolling() {

    var currentPage = getState().page;
    if($(window).scrollTop() > ($(document).height() - $(window).height() - 400) && !window.resultsLoading && (currentPage*10 < window.nbOfResult))
    {
        $("#results").attr("data-page", currentPage+1);
        querySolr();
    }
}

$(document).ready( function() {
    
    window.resultsLoading = false;
    
    // Initalize the search
    startSearch();

    //$("header").addClass("normal");


    /* User Interactions */
    // Call the function getAddress when a character is writes
    $("form").on("keyup", 'input', function() {
            delay(function(){
            search();
        }, 200 );
        
        if($("header").hasClass("intro")) {
            normalSearch();
        }
    });
    
    // Role, Tag, Group clicked
    $("#roles, #tags, #groups").on("click", "li", function() {
        toggleSelected($(this));
        search();
    });
    
    // Scroll
    $("#results").scroll(infiniteScrolling());

    // Show the detailed article
    $("#main").on("click", "article:not(.details)", function() {
        getDocument($(this).attr("id"));
    });
    
    // Hide the detailed article
    $("#main").on("click", "article.details", function() {
        hideDetails($(this).attr("id"));
    });
    
    /* ------- System Events -------- */
    $("#results").on("newResults", function(event, data) {
        reloadTotalFound(data.response.numFound);
        newResults(data.response.docs);
        reloadRoleFacet(data.facet_counts.facet_fields.role);
        reloadGroupFacet(data.facet_counts.facet_fields.groupname);
        reloadTagFacet(data.facet_counts.facet_fields.tag);
        if(data.spellcheck !== null) {
            displaySuggestions(data.spellcheck.suggestions[1]);
        }
        $("*").on("scroll", infiniteScrolling());
    });

    $("#results").on("moreResults", function(event, data) {
        displayResults(data.response.docs);
    });
    
    $("#results").on("newResult", function(event, data) {
        displayDetails(data.response.docs[0]);
    });
    
    $("form").on("click", "img.dino", function(e) {
        e.preventDefault();
        restart();
    });

});
