var DOM = Class({

  _videos: null,
  elements: null,

  constructor: function() {
    this._videos = [];
    this.elements = {};
    this.listenTo(Video, {
      "created": this._onCreated,
      "destroyed": this._onDestroyed
    });
    this.refresh = this.refresh.bind(this);
    if (document.body) {
      delay(this.refresh, 1);
    } else {
      document.addEventListener("load", this.refresh);
    }
  },

  _onCreated: function(video) {
    this._videos.push(video);
    this.refresh();
  },

  _onDestroyed: function(video) {
    for (var i = 0, l = this._videos.length; i < l; i++) {
      if (this._videos[i].id !== video.id) continue;
      this._videos.splice(i, 1);
    }
    this.refresh();
  },

  refresh: function() {
    var elements = this._searchNodeList([document.body], "[for][kind]");
    elements = this._filterNodes(elements);
    this.elements = this._groupNodes(elements);
  },

  _searchNodeList: function(nodeList, selector) {
    var results = [];
    for (var i = 0, l = nodeList.length; i < l; i++) {
      var node = nodeList[i];
      var children = node.querySelectorAll(selector);
      for (var c = 0, cl = children.length; c < cl; c++) {
        results.push(children[c]);
      }
    }
    return results;
  },

  _filterNodes: function(elements) {
    var nodes = [];
    var ids = this._getIds();
    if (!ids) return nodes;
    if (!elements.length) return nodes;
    for (var i = 0, l = elements.length; i < l; i++) {
      var element = elements[i];
      var forId = element.getAttribute('for');
      if (!ids[forId]) continue;
      nodes.push(element);
    }
    return nodes;
  },

  _getIds: function() {
    var ids = {};
    for (var i = 0, l = this._videos.length; i < l; i++) {
      ids[this._videos[i].el.id] = true;
    }
    return this._videos.length ? ids : null;
  },

  _groupNodes: function(elements) {
    var grouped = {};
    for (var i = 0, l = elements.length; i < l; i++) {
      var element = elements[i];
      var forId = element.getAttribute("for");
      grouped[forId] = grouped[forId] || {};
      var forKinds = element.getAttribute("kind").split(" ");
      forKinds.forEach(function(forKind) {
        grouped[forId][forKind] = grouped[forId][forKind] || [];
        grouped[forId][forKind].push(element);
      });
    }
    return grouped;
  }

});

Video.dom = new DOM();