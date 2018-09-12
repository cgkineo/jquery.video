if ($ && $.fn) {
// jQuery API
$.fn.medias = function(options) {

  // Get all media tags selected and make Media instances for them
  var $medias = this.find("video, audio, canvas, img");
  $medias = $medias.add(this.filter("video, audio, canvas, img"));

  switch (options) {
    case "destroy":
      // Tear down all media class + dom associations
      $medias.each(function(index, item) {
        if (!(item[Media._prop] instanceof Media)) return;
        item[Media._prop].destroy();
        delete item[Media._prop];
      });
      return $medias;
  }

  options = defaults(options, {
    uienabled: true,
    uireplace: true,
    domenabled: true
  });

  $medias.each(function(index, item) {
    if (item[Media._prop]) return;
    var media = new Media(item, options);
    new Media.UI(item, media.options);
  });
  return $medias;

};

$.fn.play = function() {
  var $medias = this.find("video, audio, canvas");
  $medias = $medias.add(this.filter("video, audio, canvas"));
  $medias.each(function(index, item) {
    switch (item.tagName) {
      case "VIDEO":
      case "AUDIO":
      case "CANVAS":
        break;
      default:
        return;
    }
    item.play();
  });
};

$.fn.pause = function() {
  var $medias = this.find("video, audio, canvas");
  $medias = $medias.add(this.filter("video, audio, canvas"));
  $medias.each(function(index, item) {
    switch (item.tagName) {
      case "VIDEO":
      case "AUDIO":
      case "CANVAS":
        break;
      default:
        return;
    }
    item.pause();
  });
};

}
