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