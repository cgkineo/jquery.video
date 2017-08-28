(function($) {

    $.indexOfRegex = function(value, regex, fromIndex){
        fromIndex = fromIndex || 0;
        var str = fromIndex ? value.substring(fromIndex) : value;
        var match = str.match(regex);
        return match ? str.indexOf(match[0]) + fromIndex : -1;
    }

    $.lastIndexOfRegex = function(value, regex, fromIndex){
        fromIndex = fromIndex || 0;
        var str = fromIndex ? value.substring(0, fromIndex) : value;
        var match = str.match(regex);
        return match ? str.lastIndexOf(match[match.length-1]) : -1;
    }

})(jQuery);