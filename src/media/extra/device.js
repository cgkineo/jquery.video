/*
Check for touch devices.
 */

var Device = Class.extend({

  constructor: function Device() {
    this.checkTouchDevice();
  },

  checkTouchDevice: function() {
    Media.isTouchCapable = false;
    var touchListener = function() {
      window.removeEventListener("touchstart", touchListener);
      Media.isTouchCapable = true;
    };
    window.addEventListener("touchstart", touchListener);
  }

});

Media.Device = Device;
Media.device = new Device();
