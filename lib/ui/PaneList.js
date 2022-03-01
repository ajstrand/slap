import _ from 'lodash';
import util from 'slap-util';
import BaseWidget from 'base-widget';
import Pane from './Pane.js';
import Slap from './Slap.js';

PaneList.prototype.__proto__ = Pane.prototype;
class PaneList {
  constructor(opts) {
    var self = this;

    if (!(self instanceof PaneList))
      return new PaneList(opts);

    Pane.call(self, _.merge({}, Slap.global.options.paneList, opts));

    self.topContent = new BaseWidget(_.merge({
      parent: self,
      tags: true,
      shrink: true,
      top: 1,
      left: 'center',
      style: self.options.style
    }, self.options.topContent));

    var listOpts = _.merge({
      parent: self,
      mouse: true,
      keys: true,
      focusable: true,
      tags: true,
      top: 3,
      style: self.options.style
    }, self.options.list);
    self.list = new BaseWidget.blessed.List(listOpts);
    BaseWidget.call(self.list, listOpts);
  }
  close() {
    // Don't actually close anything, just act closed and maybe setFront another pane
    var self = this;
    var slap = self.screen.slap;
    if (self === slap.getCurrentPane()) {
      var prevPane = slap.getPrevPane();
      if (prevPane)
        prevPane.setCurrent();
    }
    return true;
  }
  getTitle() {
    return util.markup("<PaneList>", this.style.paneList).toString();
  }
  _initHandlers() {
    var self = this;
    var slap = self.screen.slap;

    self.on('element mousedown', function (el) { self.focus(); });

    slap.on('element keypress', function (el, ch, key) {
      if (!(el === self || el.hasAncestor(self)))
        return;
      switch (self.resolveBinding(key)) {
        case 'cancel':
          var prevPane = slap.getPrevPane();
          if (prevPane)
            prevPane.setCurrent();
          return false;
      }
    });

    self.on('focus', function () { self.screen.program.hideCursor(); });

    self.update();
    ['adopt', 'remove'].forEach(function (evt) {
      slap.on('element ' + evt, function (parent, child) {
        if (child instanceof Pane)
          setImmediate(function () { self.update(); });
      });
    });

    self.list.on('select', function (_, i) {
      slap._stopKeyPropagation().then(function () {
        slap.panes[i].setCurrent();
      });
    });

    return Pane.prototype._initHandlers.apply(self, arguments);
  }
  update() {
    var self = this;
    var slap = self.screen.slap;

    var list = self.list;
    var items = slap.panes.reduce(function (items, pane) {
      var title = pane.getTitle();
      if (title !== null)
        items.push(title);
      return items;
    }, []);
    list.setItems(items);

    var topContent = self.topContent;
    topContent.setContent(items.length + " pane" + (items.length === 1 ? '' : 's') + " open");

    return self;
  }
}




export default PaneList;
