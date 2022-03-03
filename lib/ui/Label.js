import blessed from 'neo-blessed';
import _ from 'lodash';
import util from 'slap-util';
import BaseWidget from 'base-widget';
import Slap from './Slap.js';

class Label {
  constructor(opts) {
    var self = this;

    if (!(self instanceof Label))
      return new Label(opts);

    opts = _.merge({
      height: 1
    }, Slap.global.options.label, opts);

    BaseWidget.blessed.Text.call(self, opts);
    BaseWidget.call(self, opts);
  }
}

Label.prototype.__proto__ = BaseWidget.blessed.Text.prototype;

export default Label;
