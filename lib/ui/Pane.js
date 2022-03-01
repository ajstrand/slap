import _ from 'lodash';
import util from 'slap-util';
import BaseWidget from 'base-widget';

Pane.prototype.__proto__ = BaseWidget.prototype;
class Pane {
  constructor(opts) {
    var self = this;

    if (!(self instanceof Pane))
      return new Pane(opts);

    BaseWidget.call(self, _.merge({
      top: Slap.global.header.options.headerPosition === 'top' ? 1 : 0,
      bottom: Slap.global.header.options.headerPosition === 'bottom' ? 1 : 0,
      left: 0,
      right: 0,
    }, Slap.global.options.pane, opts));
    self.left = Slap.global.fileBrowser.visible ? Slap.global.fileBrowser.width : 0;

    if (!self.parent.panes)
      self.parent.panes = [];
    self.parent.panes.push(self);
  }
  getTitle() {
    return "Untitled pane";
  }
  setCurrent() {
    var self = this;
    var slap = self.screen.slap;
    var panes = slap.panes;
    var paneIndex = panes.indexOf(self);
    if (paneIndex === -1) { paneIndex = panes.length; panes.push(self); }
    slap.data.prevPane = slap.data.currentPane;
    slap.data.currentPane = paneIndex;
    self.focus();
    return self;
  }
  close() {
    var self = this;

    var slap = self.screen.slap;
    var paneIndex = slap.panes.indexOf(self);
    if (paneIndex !== -1)
      slap.panes.splice(paneIndex, 1);

    self.emit('close', paneIndex);
    self.detach();

    return true;
  }
  _initHandlers() {
    var self = this;

    self.on('close', function () { self.screen.slap.header.message(null); });

    return BaseWidget.prototype._initHandlers.apply(self, arguments);
  }
}




export default Pane;

import Slap from './Slap.js';
