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