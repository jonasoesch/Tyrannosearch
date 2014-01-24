$(document).ready( function() {
	
	// Call the function getAddress when a character is writes
	$("form").on("keyup", 'input', function() {	
		var value = $(this).val();
		delay(function(){
			search(value);
		}, 200 );
	});
	
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
    
    $(results).each( function(index, result) {
        
        // Person
        if(result.role == "person") {
            var html = '<article id="'+ result.id +'" class="person"><h1>'+ result.firstname +' '+ result.lastname +'</h1><p>'+ result.biography +'</p></article>';
        }
        
        // City
        if(result.role == "city") {
            var html = '<article id="'+ result.id +'" class="city"><h1>'+ result['city.name'] +'</h1><p>'+ result['city.region.name'] +'</p></article>';
        }
        
        // Video
        if(result.role == "video") {
            var html = '<article id="'+ result.id +'" class="video"><h1>'+ result.title +'</h1><p>'+ result.description +'</p></article>';
        }
        
        // audio
        if(result.role == "audio") {
            var html = '<article id="'+ result.id +'" class="audio"><h1>'+ result.title +'</h1><p>'+ result.description +'</p></article>';
        }
        
        // Image
        if(result.role == "image") {
            var html = '<article id="'+ result.id +'" class="image"><h1>'+ result.title +'</h1><p>'+ result.description +'</p></article>';
        }
        
        // Text
        if(result.role == "text") {
            var html = '<article id="'+ result.id +'" class="text"><h1>'+ result.title +'</h1><p>'+ result.description +'</p></article>';
        }
        
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







