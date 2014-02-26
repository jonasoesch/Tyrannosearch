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
       
    
        // Not all the filenames were indexed with their
        // file extension. If needed we add it.
       var filename = result.filename;
       if(filename.indexOf(".") < 0){
            filename = filename + "." + data.fileformat;
       }
       data.filename = $.trim(filename);
        
        data.url = ["http://comem.trucmu.ch/mrm/medias", result.groupname, result.role, data.filename].join("/");
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
        
        console.log(result.fileformat);
        
        if(result.fileformat == '.flv') {
            data.isFLV = true;
        } else {
            data.notFLV = true;
        }
        
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
