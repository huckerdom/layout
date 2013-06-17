var get_parameter_by_name = function(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search || location.hash);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var update_layout_file_URI = function(){
  var url = get_parameter_by_name('q').replace(/\/$/g, '');
  if ( !url || url.length == 0 ) { return };
  $('.layout')[0].dataset.layoutFile = url;
}

$(document).ready(update_layout_file_URI);
