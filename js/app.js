$(document).ready( function() {
	
});

function querySolr(query) {
  if(query.text == null) {query.text = "*:*";}  
  if(query.roles == null) {query.role = [];}
  if(query.tags == null) {query.tags = [];}
  if(query.groups == null) {query.groups [];}
  if(query.limit == null) {query.limit = 20;}
  if(query.page == null) {query.page = 1;}

}
