/*
 Captures DOM elements and groups them according to their for and kind attributes.
 Media.dom.refresh();
 var UIElements = Media.dom.fetch(media)
 */
var DOM = Class.extend({

  medias: null,
  groups: null,
  registered: null,

  defaults: {
    skipon: "touchend"
  },

  constructor: function DOM() {
    this.medias = [];
    this.groups = {};
    this.listenTo(Media, {
      "create": this.onCreate,
      "created": this.onCreated,
      "destroyed": this.onDestroyed
    });
    bindAll(this, "start", "refreshElements", "onDocumentMutation");
    if (document.body) {
      delay(this.start, 1);
    } else {
      window.addEventListener("load", this.start);
    }
  },

  register: function(name) {
    this.registered = this.registered || [];
    this.registered.push(name);
  },

  start: function() {
    this.addDocumentMutationObserver();
    this.refreshElements();
  },

  addDocumentMutationObserver: function() {
    var observer = new MutationObserver(this.onDocumentMutation);
    observer.observe(document.body, { childList:true, subtree: true });
  },

  onCreate: function(media) {
    if (!media.options.domenabled) return;
    defaults(media.options, this.defaults);
    this.medias.push(media);
  },

  onCreated: function(media) {
    media.dom = media.dom || {};
    media.dom.components = media.dom.components || {};
    for (var i = 0, l = this.registered.length; i < l; i++) {
      var name = this.registered[i];
      var constructor = Media[name];
      media.components[name] = new constructor(media);
    }
  },

  onDestroyed: function(media) {
    for (var i = this.medias.length - 1; i >= 0; i--) {
      if (this.medias[i].id !== media.id) continue;
      this.medias.splice(i, 1);
    }
  },

  onDocumentMutation: function(mutationList) {
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

}, null, {
  instanceEvents: true
});

Media.DOM = DOM;
Media.dom = new DOM();
