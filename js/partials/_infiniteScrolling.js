function infiniteScrolling() {
	
	console.log("--scroll----");
    var currentPage = getState().page;
    if($(window).scrollTop() > ($(document).height() - $(window).height() - 400) && !window.resultsLoading && (currentPage*10 < window.nbOfResult))
    {

        $("#results").attr("data-page", currentPage+1);
        search();
    }
}