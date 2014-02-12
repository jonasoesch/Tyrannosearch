/*
 * Facet Query
 * @param field = the name of the facet field
 * @param values = value of field to restrict query
 */
function facetQuery(field, values) {
    var query = "";
    query += " +"+ field +":(";
    
    $(values).each( function(index, value) {
        query += value + " ";
    });
    
    query += ")";
    return query;
}