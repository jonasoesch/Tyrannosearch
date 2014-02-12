/*
 * Reload total found documents
 *
 */
function reloadTotalFound(total) {
    console.log("Total found: "+total);
}



/*
 * Reload Group facet
 *
 */
function reloadGroupFacet(results) {
    
    $("#groups").children().remove();
    
    var tpl = $("#facet-tpl").text();
    
    var html = "";
    
    for(var i=0; i < results.length; i=i+2) {
        var data = {
            facet: 'group',
            value: results[i],
            total: results[i+1],
        };
        
        html += Mustache.render(tpl, data);
    }
    
    $("#groups").html(html);
}


/*
 * Reload Role facet
 *
 */
function reloadRoleFacet(results) {
    
    console.log("Role: "+results);
}


/*
 * Reload Tag facet
 *
 */
function reloadTagFacet(results) {
    
    $("#tags").children().remove();
    
    var tpl = $("#facet-tpl").text();
    
    var html = "";
    
    for(var i=0; i < results.length; i=i+2) {
        var data = {
            facet: 'tag',
            value: results[i],
            total: results[i+1],
        };
        
        html += Mustache.render(tpl, data);
    }
    
    $("#tags").html(html);
}