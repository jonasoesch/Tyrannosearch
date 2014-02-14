/*
 * Add new results to the interface
 *
 */
function newResults(results) {
    
    // Remove old results
    $("section#results").children().remove();
    displayResults(results);
}