Media.DOM.FullScreenController = Class.extend({

  currentFullScreenPlayer: null,

  constructor: function SkipStateComponent(media) {
    bindAll(this, "onFullScreenChanged");
    this.addEventListeners();
  },

  addEventListeners: function() {
    document.addEventListener("fullscreenchange", this.onFullScreenChanged);
  },

  onFullScreenChanged: function() {
    var element = document.fullscreenElement;
    if (this.currentFullScreenPlayer) {
      this.currentFullScreenPlayer.dispatchEvent("fullscreen:exited");
      this.currentFullScreenPlayer = null;
    }
    if (!element) return;
    var kind = element.getAttribute("kind");
    if (!kind) return;
    var kinds = kind.split(" ");
    if (!includes(kinds, "fullscreen")) return;
    var id = element.getAttribute("for") || element.getAttribute("id");
    var player = Media.findById(id);
    if (!player) return;
    this.currentFullScreenPlayer = player;
    this.currentFullScreenPlayer.dispatchEvent("fullscreen:entered");
  },

  removeEventListeners: function() {
    document.removeEventListener("fullscreenchange", this.onFullScreenChanged);
  },

  onDestroyed: function() {
    this.removeEventListeners();
    Class.prototype.destroy.call(this);
  }

});

Media.DOM.FullScreenController = new Media.DOM.FullScreenController();
Media.DOMEvents.add("fullscreen:entered");
Media.DOMEvents.add("fullscreen:exited");
