function infiniteScrolling() {
	
	var currentPage, pointOfNoReturn;

	pointOfNoReturn = ($(document).height() - $(window).height() - 400);
	currentPage = getState().page;

    if(
		($(window).scrollTop() > pointOfNoReturn) &&
		(!window.resultsLoading) &&
		(currentPage*10 < window.nbOfResult)
    )
    {
		console.log("End of page");
        search(currentPage+1);
    }
}