/*
 * Reload total found documents
 *
 */
function reloadTotalFound(total) {
    $("#total").show().html(total);
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

    var tpl = $("#facet-tpl").text();
    
    var html = "";

    var tags = getState().tags;
    
    for(var i=0; i < results.length; i=i+2) {
        var data = {
            facet: 'tag',
            value: results[i],
            total: results[i+1],
            selected: false
        };

        if (tags.indexOf(data.value) > -1) {
            data.selected = true;
        }

        html += Mustache.render(tpl, data);
    }
    
    $("#tags").children().remove();
    $("#tags").html(html);
}


function reloadFacets(data) {
        reloadTotalFound(data.response.numFound);
        reloadRoleFacet(data.facet_counts.facet_fields.role);
        reloadGroupFacet(data.facet_counts.facet_fields.groupname);
        reloadTagFacet(data.facet_counts.facet_fields.tag);
}