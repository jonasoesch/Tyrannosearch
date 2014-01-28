$(document).ready( function() {


    /* User Interactions */
	// Call the function getAddress when a character is writes
	$("form").on("keyup", 'input', function() {	
		delay(function(){
			search();
		}, 200 );
	});
    
    // Role clicked
    $("#roles").on("click", ".role", function() {
        
    });
    
    // Tag clicked
    $("#tags").on("click", ".tag", function() {
        
    });
    
    // Group clicked
    $("#groups").on("click", ".group", function() {
        
    });


    /* ------- System Events -------- */
    $("#results").on("newResults", function(event, data) {
    	reloadTotalFound(data.response.numFound);
    	newResults(data.response.docs);
    	reloadRoleFacet(data.facet_counts.facet_fields.role);
    	reloadGroupFacet(data.facet_counts.facet_fields.groupname);
    	reloadTagFacet(data.facet_counts.facet_fields.tag);
    	if(data.spellcheck != null) {
        	displaySuggestions(data.spellcheck.suggestions[1]);
    	}
    });

    $("#results").on("moreResults", function(event, data) {
        displayResults(data.response.docs);
    });

});



/*
 *	New search
 */
function search() {
    querySolr();
}

/*
 *	delay() function is added to jQuery
 *	The goal is to fix a delay
 */
var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();

/*
 * Facet Query
 * @param:  field = the name of the facet field
 *          values = value of field to restrict query
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

function getState() {
    var state = 
    {
        text: "",
        roles: [],
        tags: [],
        groups: [],
        rows: 10,
        page: 1
    }
    
   var text = $("input").val();
   if(text != "") {
        state.text = text;
   }

    $('#roles li').each(function(index) {
        if($(this).data("selected") === true ) {
            state.roles.push($(this).data("value"));
        }
    });
    
    $('#tags li').each(function(index) {
        if($(this).data("selected") === true ) {
            state.tags.push($(this).text());
        }
    });

    $('#groups li').each(function(index) {
        if($(this).data("selected") === true ) {
            state.tags.push($(this).text());
        }
    });

    return state;
}


/*
 * Get documents in Solr
 *
 */
function querySolr() {
    var url = "http://localhost:8983/solr/select";
    var request = {};
    
    var state = getState();
    
    var query = "+" + state.text;
    
    if(state.roles.length) {
        query += facetQuery("role", state.roles);
    }
    
    if(state.tags.length) {
        query += facetQuery("tag", state.tags);
    }
    
    if(state.groups.length) {
        query += facetQuery("groupname", state.groups);
    }
    
    if(query == "") {
        query = "*:*";
    }
    
    console.log(query);
    
    request['q'] = query;
    request['start'] = (state.page * state.rows) - state.rows;
    request['rows'] = state.rows;
    request['fl'] = "*";
    request['wt'] = "json";
    request['facet'] = "true";
    request['facet.field'] = ["role", "tag", "groupname"];
    request['f.tag.facet.limit'] = "5";
    request['spellcheck'] = "true";
    
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

			if(state.page == 1) {
                $("#results").trigger("newResults", data);
    			
    			
			} else {
                $("#results").trigger("moreResults", data);
			}
		}
	});
}


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
    
    console.log("Group: "+results);
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
    
    console.log("Tag: "+results);
}


/*
 * Display suggestions
 *
 */
function displaySuggestions(suggestions) {
    if(suggestions != null) {
        console.log("Suggestions: "+suggestions.suggestion);
    }
}


/*
 * Add new results to the interface
 *
 */
function newResults(results) {
    
    // Remove old results
    $("section#results").children().remove();
    
    displayResults(results);
}


/*
 * Display results in the interface
 *
 */
function displayResults(results) {

    var tpl = "<article id='{{id}}' class='{{role}}'><h1>{{title}}</h1><p>{{body}}</p></article>"
      
      $(results).each( function(index, result) {
        
        // Default values for a result
        var data = {
          id: result.id,
          role: result.role,
          title: result.title,
          body: result.description
        };
 
        // Display for Person differs
        if(result.role == "person") {
            data.title = [result.firstname, result.lastname].join(" ");
            data.body = result.biography;
        }
        
        // City differs too
        if(result.role == "city") {
            data.title = result['city.name'];
            data.body = result['city.region.name'];
        }
        

        var html = Mustache.render(tpl, data);
        $("section#results").append(html);
    });
}


/*
 * Display error message
 *
 */
function displayError(message) {
    $("section#results").children().remove();
    if(message == null) {var message = "There was a problem.";}
    var html = '<span id="error">'+ message +'</span>';
    $("section#results").append(html);
}


