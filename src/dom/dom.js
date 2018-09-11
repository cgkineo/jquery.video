/*
 Captures DOM elements and groups them according to their for and kind attributes.
 Video.dom.refresh();
 var UIElements = Video.dom.fetch(video)
 */
var DOM = Class.extend({

  _videos: null,
  _groups: null,

  constructor: function DOM() {
    this._videos = [];
    this._groups = {};
    this.listenTo(Video, {
      "create": this._onCreated,
      "destroyed": this._onDestroyed
    });
    bindAll(this, "refreshElements");
    if (document.body) {
      delay(this.refreshElements, 1);
    } else {
      document.addEventListener("load", this.refreshElements);
    }
  },

  _onCreated: function(video) {
    if (!video.options.dom || !video.options.dom.isEnabled) return;
    this._videos.push(video);
    this.refreshElements();
  },

  _onDestroyed: function(video) {
    for (var i = this._videos.length - 1; i >= 0; i--) {
      if (this._videos[i].id !== video.id) continue;
      this._videos.splice(i, 1);
    }
    this.refreshElements();
  },

  refreshElements: function() {
    Video.trigger("uidestroy");
    this._getNodes();
    Video.trigger("uicreate");
  },

  fetchElements: function(video) {
    var id;
    if (video.el) id =video.el.id;
    return this._groups[id] || {};
  },

  _getNodes: function() {
    var ids = this._getIds();
    var eles = elements("[for][kind], [id][kind]").filter(function(ele) {
      var id = ele.getAttribute('for') || ele.getAttribute('id');
      return ids[id];
    });
    this._groups = elements(eles).groupByAttributes('for id', 'kind');
  },

  _getIds: function() {
    var ids = {};
    for (var i = 0, l = this._videos.length; i < l; i++) {
      ids[this._videos[i].el.id] = true;
    }
    return ids;
  }

});

Video.dom = new DOM();
