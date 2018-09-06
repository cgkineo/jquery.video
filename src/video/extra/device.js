/*
Check for touch devices.
 */

var Device = Class.extend({

  constructor: function Device() {
    this.checkTouchDevice();
  },

  checkTouchDevice: function() {
    Video.isTouchCapable = false;
    var touchListener = function() {
      window.removeEventListener("touchstart", touchListener);
      Video.isTouchCapable = true;
    };
    window.addEventListener("touchstart", touchListener);
  }

});

Video.Device = Device;
Video.device = new Device();
