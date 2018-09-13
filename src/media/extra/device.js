/*
Check for touch devices.
 */

Media.Device = Class.extend({

  constructor: function Device() {
    this.checkTouchDevice();
  },

  checkTouchDevice: function() {
    this.isTouchCapable = false;
    var touchListener = function() {
      window.removeEventListener("touchstart", touchListener);
      this.isTouchCapable = true;
    }.bind(this);
    window.addEventListener("touchstart", touchListener);
  }

}, null, {
  instanceEvents: true
});

Media.Device = new Media.Device();
