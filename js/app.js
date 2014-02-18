/*
This function loads the state of the user interface
from the data-* attributes.
It returns
*/

function getState() {
    var state =
    {
        text: "",
        roles: [],
        tags: [],
        groups: [],
        rows: 10,
        page: 1
    };

    
   var text = $("input").val();
   if(text !== "") {
        state.text = text;
   }

    $('#roles li').each(function() {
        if($(this).attr("data-selected") === "true" ) {
            state.roles.push($(this).data("value"));
        }
    });
    
    $('#tags li').each(function() {
    if($(this).attr("data-selected") === "true" ) {
            state.tags.push($(this).data('value'));
        }
    });

    $('#groups li').each(function() {
        if($(this).attr("data-selected") === "true" ) {
            state.groups.push($(this).data('value'));
        }
    });

    var page = $("#results").attr("data-page");
    if(page) {
        state.page = parseInt(page);
    }

    return state;
}

/* **********************************************
     Begin _displayResults.js
********************************************** */

/*
 * Display results in the interface
 *
 */
function displayResults(results) {

    var tpl = $("#result-tpl").text();
      
      $(results).each( function(index, result) {
        
        // Default values for a result
        var data = {
          id: result.id,
          role: result.role,
          title: result.title,
          body: result.description
        };
 
        // Display for Person differs
        if(result.role === "person") {
            data.title = [result.firstname, result.lastname].join(" ");
            data.body = result.biography;
        }
        
        // City differs too
        if(result.role === "city") {
            data.title = result['city.name'];
            data.body = result['city.region.name'];
        }
        
        data.title = (data.title) ? data.title : result.filename;
        //data.body = (data.body) ? data.body : result.tag.join(", ");


        var html = Mustache.render(tpl, data);
        $("section#results").append(html);
    });
    
    window.resultsLoading = false;
}

/* **********************************************
     Begin _displayError.js
********************************************** */

/*
 * Display error message
 *
 */
function displayError(message) {
    $("section#results").children().remove();
    if(message === null) {message = "There was a problem.";}
    var html = '<span id="error">'+ message +'</span>';
    $("section#results").append(html);
}

/* **********************************************
     Begin _search.js
********************************************** */

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

/* **********************************************
     Begin _getDocument.js
********************************************** */

/*
 * Get a document in Solr
 *
 */
function getDocument(id) {
    var url = "http://localhost:8983/solr/select";
    var request = {};
    
    window.resultsLoading = true;
    
    
    if(id === null || id === "") {
        displayError("The function getDocument() requires an id.");
        return false;
    }
    
    request.q = "id:" + id;
    request.start = "0";
    request.rows = "1";
    request.fl = "*";
    request.wt = "json";
    
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

/* **********************************************
     Begin _reloadFacets.js
********************************************** */

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

/* **********************************************
     Begin _detailView.js
********************************************** */

/*
 * Display details in the interface
 *
 */
function displayDetails(result) {
    
    var id = result.id;
    
    var article = $("article[id='" + id + "']");
    
    $(article).hide();
    
    console.log(article);
    
    var tpl = $("#result-tpl").text();
    
    // Default values for a result
    var data = {
      id: result.id,
      role: result.role,
      title: result.title,
      body: "No template found for this role"
    };
    
    

    // Display for Person differs
    if(result.role === "person") {
        data.name = [result.firstname, result.lastname].join(" ");
        data.biography = result.biography;
        data.size = result.size;
        data.address = result.address;
        data.foot = result.foot;
        data.cityName = result['city.name'];
        data.cityCode = result['city.code'];
        data.languages = result.language.join(", ");
        data.email = result.email;
        data.hobbies = result.hobby.join(", ");
        

        tpl = $("#person-tpl").text();
    }
    
    // City 
    if(result.role === "city") {
        data.cityName = result['city.name'];
        data.regionName = result['city.region.name'];
        data.regionCode = result['city.region.code'];
        
        tpl = $("#city-tpl").text();
    }

    
    // Setting values for all media types
    if(
        (result.role === "audio") ||
        (result.role === "image") ||
        (result.role === "video") ||
        (result.role === "text")
    ) {
        data.tags = result.tag ? result.tag.join(", ") : "";
        data.fileformat = result.fileformat ? result.fileformat.replace(".", "") : "";
        data.filesize = result.filesize;
        data.filename = result.filename;
        data.copyright = result.copyright;
        data.creationDate = result.creationDate;
        
       var filename = result.filename;
       if(filename.indexOf(".") < 0){
            filename = filename + "." + data.fileformat;
       }
        
        data.url = ["http://comem.trucmu.ch/mrm/medias", result.groupname, result.role, filename].join("/");
        console.log(data);

    }

    // Sound
    if(result.role === "audio") {
        data.duration = result.duration;
        tpl = $("#audio-tpl").text();
    }

	// Image
    if(result.role === "image") {
        data.title = (data.title) ?  data.title : result.filename;
        tpl = $("#image-tpl").text();
    }
    
    //Text
    if(result.role === "text") {
        tpl = $("#text-tpl").text();
    }


	//Video
    if(result.role === "video") {
        tpl = $("#video-tpl").text();
    }
    var html = Mustache.render(tpl, data);
    $(article).after(html);
}


/*
 * Remove details in the interface
 *
 */
function hideDetails(id) {
    var article = $("article[id='" + id + "']:not(.details)");
    var articleDetail = $("article[id='" + id + "'].details");
    
    $(articleDetail).remove();
    $(article).show();
    
}


/* **********************************************
     Begin _prepareInterface.js
********************************************** */

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

function prepareInterface() {

	var header = $("header");

	if(header.hasClass("intro")) {
		normalSearch();
	} else if (!header.hasClass("normal")) {
		startSearch();
	}
}

/* **********************************************
     Begin _infiniteScrolling.js
********************************************** */

function infiniteScrolling() {
	
	var currentPage, pointOfNoReturn;

	pointOfNoReturn = ($(document).height() - $(window).height() - 400);
	currentPage = getState().page;

    if(
		($(window).scrollTop() > pointOfNoReturn) &&
		(!window.resultsLoading) &&
		(currentPage*10 < window.nbOfResult)
    )
    {
		console.log("End of page");
        search(currentPage+1);
    }
}

/* **********************************************
     Begin _toggleSelected.js
********************************************** */

/*
 *	Toggle data-selected
 */
function toggleSelected(el) {
    if(el.attr("data-selected") === "true") {
        el.attr("data-selected", false);
    } else {
        el.attr("data-selected", true);
    }
}

/* **********************************************
     Begin _restart.js
********************************************** */

/*
 *	Query *:*
 *	
 */
function restart() {
    $("form input").val("");
    $("#roles li, aside ul li").removeAttr("data-selected");
    search();
}

/* **********************************************
     Begin _newResults.js
********************************************** */

/*
 * Add new results to the interface
 *
 */
function newResults(results) {
    
    // Remove old results
    $("section#results").children().remove();
    displayResults(results);
}

/* **********************************************
     Begin _app.js
********************************************** */

// @codekit-prepend "_getState.js"
// @codekit-prepend "_displayResults.js"
// @codekit-prepend "_displayError.js"
// @codekit-prepend "_search.js"
// @codekit-prepend "_getDocument.js"
// @codekit-prepend "_reloadFacets.js"
// @codekit-prepend "_detailView.js"
// @codekit-prepend "_prepareInterface.js"
// @codekit-prepend "_infiniteScrolling.js"
// @codekit-prepend "_toggleSelected.js"
// @codekit-prepend "_restart.js"
// @codekit-prepend "_newResults.js"



window.resultsLoading = true;
window.nbOfResult = 0;




/*
 *  delay() function is added to jQuery
 *  The goal is to fix a delay
 */
var delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();





$(document).ready( function() {
    
    // Initialize the interface
    window.resultsLoading = false;
    prepareInterface();

    /* ------------ User Interactions ---------------- */
    

    // When the user types, after a short delay display results
    $("form").on("keyup", 'input', function() {
            delay(function(){
            search(1);
        }, 200 );
        
        prepareInterface();
    });
    
    // Role, Tag, Group clicked, reload the results with the new criteria
    $("#roles, #tags, #groups").on("click", "li", function() {
        toggleSelected($(this));
        search(1);
    });
    
    // When the users scrolls, load more results when he arrives at the bottom
    window.onscroll = function() {
        infiniteScrolling();
    };

    // When the user clicks on a search result show a detailed view
    $("#main").on("click", "article:not(.details)", function() {
        getDocument($(this).attr("id"));
    });
    
    // When the user clicks on a detail view, reduce it again
    $("#main").on("click", "article.details h2", function() {
        hideDetails($(this).parent().attr("id"));
    });
    
    
    $("form").on("click", "img.dino", function(e) {
        e.preventDefault();
        restart();
    });

    $("form").on("submit", function(e) {e.preventDefault(); });



    /* ------- System Events -------- */

    // When we receive new results from the server, update the user interface
    $("#results").on("newResults", function(event, data) {
        newResults(data.response.docs);
        reloadFacets(data);
    });

    // When infinite scrolling asks for more results. Append them.
    $("#results").on("moreResults", function(event, data) {
        displayResults(data.response.docs);
    });
    
    // Display detailed data when we have received it
    $("#results").on("newResult", function(event, data) {
        displayDetails(data.response.docs[0]);
    });
    

});

