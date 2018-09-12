/*
 Captures DOM elements and groups them according to their for and kind attributes.
 Media.dom.refresh();
 var UIElements = Media.dom.fetch(media)
 */
var DOM = Class.extend({

  medias: null,
  groups: null,

  defaults: {
    skipon: "touchend"
  },

  constructor: function DOM() {
    this.medias = [];
    this.groups = {};
    this.listenTo(Media, {
      "create": this.onCreated,
      "destroyed": this.onDestroyed
    });
    bindAll(this, "start", "refreshElements");
    if (document.body) {
      delay(this.start, 1);
    } else {
      window.addEventListener("load", this.start);
    }
  },

  start: function() {
    this.addMutationObserver();
    this.refreshElements();
  },

  addMutationObserver: function() {
    var observer = new MutationObserver(this.onMutation);
    observer.observe(document.body, { childList:true, subtree: true });
  },

  onCreated: function(media) {
    if (!media.options.domenabled) return;
    defaults(media.options, this.defaults);
    this.medias.push(media);
  },

  onDestroyed: function(media) {
    for (var i = this.medias.length - 1; i >= 0; i--) {
      if (this.medias[i].id !== media.id) continue;
      this.medias.splice(i, 1);
    }
  },

  onMutation: function(mutationList) {
    var changedNodes = [];
    for (var i = 0, l = mutationList.length; i < l; i++) {
      var mutationItem = mutationList[i];
      changedNodes = changedNodes.concat(toArray(mutationItem.addedNodes));
      changedNodes = changedNodes.concat(toArray(mutationItem.removedNodes));
    }
    var relevant = changedNodes.filter(function(element) {
      var hasKind = element.getAttribute("kind");
      var hasFor = element.getAttribute("for");
      var hasId = element.getAttribute("id");
      return (hasKind && (hasId || hasFor));
    });
    if (!relevant.length) return;
    this.refreshElements();
  },

  refreshElements: function(mutationList) {
    Media.trigger("dom:destroy");
    this.getNodes();
    Media.trigger("dom:create");
  },

  fetchElements: function(media) {
    var id;
    if (media.el) id =media.el.id;
    return this.groups[id] || {};
  },

  getNodes: function() {
    var ids = this.getIds();
    var eles = elements("[for][kind], [id][kind]").filter(function(ele) {
      var id = ele.getAttribute('for') || ele.getAttribute('id');
      return ids[id];
    });
    this.groups = elements(eles).groupByAttributes('for id', 'kind');
  },

  getIds: function() {
    var ids = {};
    for (var i = 0, l = this.medias.length; i < l; i++) {
      ids[this.medias[i].el.id] = true;
    }
    return ids;
  }

});

Media.dom = new DOM();
