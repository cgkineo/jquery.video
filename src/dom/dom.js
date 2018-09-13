/*
 Captures DOM elements and groups them according to their for and kind attributes.
 Media.DOM.refresh();
 var UIElements = Media.DOM.fetch(media)
 */
Media.DOM = Class.extend({

  medias$write: null,
  index$write: null,
  registered$write: null,

  constructor: function DOM() {
    this.defineProperties({
      "medias$write": [],
      "index$write": {},
      "registered$write": []
    });
    this.listenTo(Media, {
      "create": this.onCreate,
      "created": this.onCreated,
      "destroyed": this.onDestroyed
    });
    bindAll(this, "start", "onDocumentMutation");
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

  start$value: function() {
    this.addDocumentMutationObserver();
    this.refreshElements();
  },

  addDocumentMutationObserver$value: function() {
    var observer = new MutationObserver(this.onDocumentMutation);
    observer.observe(document.body, { childList:true, subtree: true });
  },

  onCreate$value: function(media) {
    if (!media.options.domenabled) return;
    this.medias.push(media);
  },

  onCreated$value: function(media) {
    media.defineProperties({
      dom: {}
    })
    media.dom.components = media.dom.components || {};
    for (var i = 0, l = this.registered.length; i < l; i++) {
      var name = this.registered[i];
      var constructor = Media.DOM[name];
      media.dom.components[name] = new constructor(media);
    }
  },

  onDestroyed$value: function(media) {
    for (var i = this.medias.length - 1; i >= 0; i--) {
      if (this.medias[i].id !== media.id) continue;
      this.medias.splice(i, 1);
    }
  },

  onDocumentMutation$value: function(mutationList) {
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

  refreshElements: function() {
    Media.DOM.trigger("destroy");
    this.getNodes();
    Media.DOM.trigger("create");
  },

  fetchElements: function(media) {
    var id;
    if (media.el) id = media.el.id;
    return this.index[id] || {};
  },

  getNodes$value: function() {
    var ids = this.getIds();
    var eles = elements("[for][kind], [id][kind]").filter(function(ele) {
      var id = ele.getAttribute('for') || ele.getAttribute('id');
      return ids[id];
    });
    this.index = elements(eles).groupByAttributes('for id', 'kind');
  },

  getIds$value: function() {
    var ids = {};
    for (var i = 0, l = this.medias.length; i < l; i++) {
      ids[this.medias[i].el.id] = true;
    }
    return ids;
  }

}, null, {
  instanceEvents: true
});

Media.DOM = new Media.DOM();
Media.DefaultOptions.add({
  classprefix: "media--",
  domenabled: false
});

