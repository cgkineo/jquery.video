/*
Check for touch devices.
 */
STORE.isTouchCapable = false;
var touchListener = function() {
  window.removeEventListener("touchstart", touchListener);
  STORE.isTouchCapable = true;
};
window.addEventListener("touchstart", touchListener);
