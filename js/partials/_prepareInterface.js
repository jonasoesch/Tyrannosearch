/*
 * Display start interface
 *
 */
function startSearch() {
    $("header").addClass("intro");
    $("aside").hide();
    $("#main").hide();
    $("#total").hide();
}


/*
 * Display normal interface
 *
 */
function normalSearch() {
    $("header").removeClass("intro");
    $("header").addClass("normal");
    $("aside").show();
    $("#main").show();
    $("#total").show();
}

function prepareInterface() {

	var header = $("header");

	if(header.hasClass("intro")) {
		normalSearch();
	} else if (!header.hasClass("normal")) {
		startSearch();
	}
}
