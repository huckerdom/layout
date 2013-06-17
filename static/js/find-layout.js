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

var set_padding_for_sections = function(){
  $('section').each(function(idx, section){
    var h = Math.max($(section).height(), 600);
    var h_diff = Math.max(0, document.documentElement.clientHeight-h);
    $(section).css('padding-top', h_diff/2);
    $(section).css('padding-bottom', h_diff+h);
  });
};

$(document).ready(update_layout_file_URI);
$(document).ready(set_padding_for_sections);
$(window).resize(set_padding_for_sections);
