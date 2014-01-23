$(document).ready( function() {
	
	var query = {};
	querySolr(query);
});

function querySolr(query) {
    if(query == null) {var query = {};}
    
    if(query.text == null) {query.text = "*:*";}  
    if(query.roles == null) {query.role = [];}
    if(query.tags == null) {query.tags = [];}
    if(query.groups == null) {query.groups = [];}
    if(query.rows == null) {query.rows = 10;}
    if(query.page == null) {query.page = 0;}
    
    console.log(query);
    
    var url = "http://localhost:8983/solr/select";
    var request = {};
    
    request['q'] = "*:*";
    request['start'] = "0";
    request['rows'] = "10";
    request['fl'] = "score,*";
    request['wt'] = "json";
    request['facet'] = "true";
    request['facet.field'] = "role";
    
    console.log(request);
  
    $.ajax({
		type: "POST",
		dataType: "json",
		url: url,
		data: request,
		error: function () {
			console.log("Ajax: error");
		},
		success: function (data) {
			console.log(data.response.docs);
			
			displayResults(data.response.docs);
		}
	});
}

function displayResults(results) {
    $("section#results").children().remove();
    
    $(results).each( function(index, result) {
        
        var html = '<article id="'+ result.id +'"><h1>'+ result.title +'</h1><p>'+ result.description +'</p></article>';
        
        $("section#results").append(html);
    });
}









