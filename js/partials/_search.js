function sortQuery(roles) {
    var query = "score desc";
    
    var media = ['video', 'audio', 'text', 'image'];
    
    var aMedia = false;
    var aCity = false;
    var aPerson = false;
    
    $(roles).each( function(index, role) {
        if($.inArray(role, media) >= 0) {
            aMedia = true;
        }
        
        if(role === 'city') {aCity = true;}
        if(role === 'person') {aPerson = true;}
    });
    
    if(aMedia && !aCity && !aPerson) {
        query += ", title asc";
    }
    
    if(aCity && !aMedia && !aPerson) {
        query += ", city.name asc";
    }
    
    if(aPerson && !aCity && !aMedia) {
        query += ", lastname asc, firstname asc";
    }
    
    return query;
}


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


/*
 * Get documents in Solr
 *
 */
function querySolr() {
    var url = "http://localhost:8983/solr/select";
    var request = {};
    
    window.resultsLoading = true;
    
    var state = getState();
    console.log(state);
    
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
            window.nbOfResult = data.response.numFound;

            if(state.page === 1) {
                $("#results").trigger("newResults", data);
                       
            } else {
                $("#results").trigger("moreResults", data);
            }
        }
    });
}

/*
 *  New search
 */
function search(page) {
    page = (page === null) ? 1 : page;

    $("#results").attr("data-page", page);
    
    if(page === 1) {
        $(window).scrollTop(0);
    }
    querySolr();
}