/*
 * Reload total found documents
 *
 */
function reloadTotalFound(total) {
    $("#total").html(total);
}


/*
 * Reloads and updates the display of the tag and groupID filters
 * the function is used for both and distinguishes between them
 * based on the parameter `name`
 */
function reloadFacet(name, results) {

    var id = "#"+name+"s";
    var pluralName = name+"s";
    var tpl = $("#facet-tpl").text();
    var html = "";

    var selectedItems = getState()[pluralName];
    
    for(var i=0; i < results.length; i=i+2) {
        var data = {
            facet: name,
            value: results[i],
            total: results[i+1],
            selected: false
        };

        if (selectedItems.indexOf(data.value) > -1) {
            data.selected = true;
        }

        html += Mustache.render(tpl, data);
    }
    
    $(id).children().remove();
    $(id).html(html);
}




function reloadFacets(data) {
        reloadTotalFound(data.response.numFound);
        reloadFacet("group", data.facet_counts.facet_fields.groupname); 
        reloadFacet("tag", data.facet_counts.facet_fields.tag); 
}
