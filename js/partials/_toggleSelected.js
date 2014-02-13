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