/*
 * Get documents in Solr
 *
 */
function querySolr() {
    var url = "http://localhost:8983/solr/select";
    var request = {};
    
    window.resultsLoading = true;
    
    var state = getState();
    
    var query = "";
    
    if(state.text.length) {
        query += "+" + state.text;
    }
    
    if(state.roles.length) {
        query += facetQuery("role", state.roles);
    }
    
    if(state.tags.length) {
        query += facetQuery("tag", state.tags);
    }
    
    if(state.groups.length) {
        query += facetQuery("groupname", state.groups);
    }
    
    if(query === "") {
        query = "*:*";
    }
    
    request.q = query;
    request.start = (state.page * state.rows) - state.rows;
    request.rows = state.rows;
    request.fl = "*";
    request.wt = "json";
    request.sort = sortQuery(state.roles);
    request.facet = "true";
    request['facet.field'] = ["role", "tag", "groupname"];
    request['f.tag.facet.limit'] = "5";
    request.spellcheck = "true";
    
    jQuery.ajaxSettings.traditional = true;
  
    $.ajax({
        type: "POST",
        dataType: "json",
        url: url,
        data: request,
        error: function () {
            displayError("The server doesn't respond.");
        },
        success: function (data) {
            console.log(data);

            if(state.page === 1) {
                $("#results").trigger("newResults", data);
                       
            } else {
                window.nbOfResult = data.response.numFound;
                $("#results").trigger("moreResults", data);
            }
        }
    });
}

/*
 *  New search
 */
function search() {
    $("#results").attr("data-page", 1);
    $(window).scrollTop(0);
    querySolr();
}