if ($ && $.fn) {
// jQuery API
$.fn.videos = function(options) {

  // Get all video tags selected and make Video instances for them
  var $videos = this.find("video");
  $videos = $videos.add(this.filter("video"));

  switch (options) {
    case "destroy":
      // Tear down all video class + dom associations
      $videos.each(function(index, item) {
        if (!(item[Video._prop] instanceof Video)) return;
        item[Video._prop].destroy();
        delete item[Video._prop];
      });
      return $videos;
  }

  options = defaults(options, {
    ui: {
      isEnabled: true,
      replaceWith: true
    },
    dom: {
      isEnabled: true
    }
  });

  $videos.each(function(index, item) {
    if (item[Video._prop]) return;
    new Video(item, options);
    if (options.ui && options.ui.isEnabled) {
      new Video.UI(item, options.ui);
    }
  });
  return $videos;

};

$.fn.play = function() {
  var $videos = this.find("video");
  $videos = $videos.add(this.filter("video"));
  $videos.each(function(index, item) {
    if (item.tagName !== "VIDEO") return;
    item.play();
  });
};

$.fn.pause = function() {
  var $videos = this.find("video");
  $videos = $videos.add(this.filter("video"));
  $videos.each(function(index, item) {
    if (item.tagName !== "VIDEO") return;
    item.pause();
  });
};

}
