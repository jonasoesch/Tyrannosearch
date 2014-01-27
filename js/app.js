$(document).ready( function() {
	
	// Call the function getAddress when a character is writes
	$("form").on("keyup", 'input', function() {	
		var value = $(this).val();
		delay(function(){
			search(value);
		}, 200 );
	});

  $("#roles").on("click", ".role", function() {}); 
  $("#tags").on("click", ".tag", function() {}); 
  $("#groups").on("click", ".group", function() {}); 

  
	
});



/*
 *	New search
 */
function search(text) {
    var query = {};
    query.text = text;
	querySolr(query);
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
 * Get documents in Solr
 *
 */

function querySolr(query) {
    if(query == null) {var query = {};}
    
    if(query.text == (null || "")) {query.text = "*:*";}  
    if(query.roles == null) {query.role = [];}
    if(query.tags == null) {query.tags = [];}
    if(query.groups == null) {query.groups = [];}
    if(query.page == null) {query.page = 1;}
    
    var url = "http://localhost:8983/solr/select";
    var request = {};
    var nbArticles = 10;
    
    request['q'] = query.text;
    request['start'] = (query.page * nbArticles) - nbArticles;
    request['rows'] = nbArticles;
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
			
			if(query.page == 1) {
    			reloadTotalFound(data.response.numFound);
    			newResults(data.response.docs);
    			reloadRoleFacet(data.facet_counts.facet_fields.role);
    			reloadGroupFacet(data.facet_counts.facet_fields.groupname);
    			reloadTagFacet(data.facet_counts.facet_fields.tag);
    			
    			if(data.spellcheck != null) {
        			displaySuggestions(data.spellcheck.suggestions[1]);
    			}
    			
			} else {
    			displayResults(data.response.docs);
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


