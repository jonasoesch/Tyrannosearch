$(document).ready( function() {
    
    // Show start interface
    //startSearch();
    $("header").addClass("normal");

    /* User Interactions */
	// Call the function getAddress when a character is writes
	$("form").on("keyup", 'input', function() {	
		delay(function(){
			search();
		}, 200 );
		
		if($("header").hasClass("intro")) {
    		normalSearch();
		}
	});
    
    // Role, Tag, Group clicked
    $("#roles, #tags, #groups").on("click", "li", function() {
        toggleSelected($(this));
        search();
    });
    
    // Scroll
    $(window).scroll( function() {
        infiniteScrolling();
    });

    // Show the detailed article
    $("#main").on("click", "article:not(.details)", function() {
        getDocument($(this).attr("id"));
    });
    
    // Hide the detailed article
    $("#main").on("click", "article.details", function() {
        hideDetails($(this).attr("id"));
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
    	$("*").on("scroll", infiniteScrolling());
    });

    $("#results").on("moreResults", function(event, data) {
        displayResults(data.response.docs);
    });
    
    $("#results").on("newResult", function(event, data) {
        displayDetails(data.response.docs[0]);
    });

});



/*
 *	New search
 */
function search() {
    querySolr();
}


function toggleSelected(el) {
    if(el.attr("data-selected") === "true") {
        el.attr("data-selected", false);
    } else {
        el.attr("data-selected", true);
    } 
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
        if($(this).attr("data-selected") === "true" ) {
            state.roles.push($(this).data("value"));
        }
    });
    
    $('#tags li').each(function(index) {
    if($(this).attr("data-selected") === "true" ) {
            state.tags.push($(this).text());
        }
    });

    $('#groups li').each(function(index) {
        if($(this).attr("data-selected") === "true" ) {
            state.groups.push($(this).text());
        }
    });

    var page = $("#results").attr("data-page");
    if(page) {
        state.page = page;
    }

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
 * Get a document in Solr
 *
 */
function getDocument(id) {
    var url = "http://localhost:8983/solr/select";
    var request = {};
    
    
    if(id == null || id == "") {
        displayError("The function getDocument() requires an id.");
        return false;
    }
    
    request['q'] = "id:" + id;
    request['start'] = "0";
    request['rows'] = "1";
    request['fl'] = "*";
    request['wt'] = "json";
    
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
			$("#results").trigger("newResult", data);
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
    
    $("#results").attr("data-page", 1);
    
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
 * Display details in the interface
 *
 */
function displayDetails(result) {
    
    var id = result.id;
    
    var article = $("article[id='" + id + "']");
    
    $(article).hide();
    
    console.log(article);
    
    var tpl = "<article id='{{id}}' class='{{role}} details'><h1>{{title}}</h1><p>{{body}}</p></article>";
    
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
    $(article).after(html);
}


/*
 * Remove details in the interface
 * @param id
 */
function hideDetails(id) {
    var article = $("article[id='" + id + "']:not(.details)");
    var articleDetail = $("article[id='" + id + "'].details");
    
    $(articleDetail).remove();
    $(article).show();
    
}


/*
 * Display error message
 * @param String message
 */
function displayError(message) {
    $("section#results").children().remove();
    if(message == null) {var message = "There was a problem.";}
    var html = '<span id="error">'+ message +'</span>';
    $("section#results").append(html);
}


/*
 * Display start interface
 *
 */
function startSearch() {
    $("header").addClass("intro");
    $("aside").hide();
    $("#main").hide();
}


/*
 * Display normal interface
 *
 */
function normalSearch() {
    $("header").removeClass("intro");
    $("header").addClass("normal");
    $("aside").show();
    $("#main").show();
}


/*
 * Infinite scrolling
 *
 */
function infiniteScrolling() {
    if($(window).scrollTop() > ($(document).height() - $(window).height() - 400))
    {
        displayResults();
        var currentPage = $("#results").data("page");
        $("#results").attr("data-page", currentPage+1);
    }
}
