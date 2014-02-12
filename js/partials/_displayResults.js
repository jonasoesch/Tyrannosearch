/*
 * Display results in the interface
 *
 */
function displayResults(results) {

    var tpl = "<article id='{{id}}' class='{{role}}'><h1>{{title}}</h1><p>{{body}}</p></article>";
      
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
        data.body = (data.body) ? data.body : result.tag.join(", ");

        var html = Mustache.render(tpl, data);
        $("section#results").append(html);
    });
    
    window.resultsLoading = false;
}