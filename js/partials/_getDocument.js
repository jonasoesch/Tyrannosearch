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