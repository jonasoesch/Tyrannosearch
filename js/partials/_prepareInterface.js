
/*
 * Display start interface
 *
 */
function startSearch() {
    $("header").addClass("intro");
    $("aside").hide();
    $("#main").hide();
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
}