/*
 *	Query *:*
 *	
 */
function restart() {
    $("form input").val("");
    $("#roles li, aside ul li").removeAttr("data-selected");
    search();
}