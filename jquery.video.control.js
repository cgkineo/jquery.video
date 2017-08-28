(function($) {
    
    // $.Video standard instance functions
    $.extend($.Video.prototype, {

        play: function() {
            this.el.play();
            return this;
        },

        pause: function() {
            this.el.pause();
            return this;
        }

    });

})(jQuery);