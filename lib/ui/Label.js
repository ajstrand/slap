import blessed from 'neo-blessed';
import _ from 'lodash';
import util from 'slap-util';
import BaseWidget from 'base-widget';
import Slap from './Slap.js';

//Label.prototype.__proto__ = BaseWidget.blessed.Text.prototype;

class Label extends BaseWidget.blessed.Text {
  constructor(opts) {
    super(opts)
    var self = this;

    if (!(self instanceof Label))
      return new Label(opts);

    opts = _.merge({
      height: 1
    }, Slap.global.options.label, opts);

    self.options = {...self, ...opts}

    // BaseWidget.blessed.Text.call(self, opts);
    // BaseWidget.call(self, opts);
  }
}


export default Label;
