import blessed from 'neo-blessed';
import _ from 'lodash';
import util from 'slap-util';
import BaseWidget from 'base-widget';
import Slap from './Slap.js';


//Button.prototype.__proto__ = BaseWidget.blessed.Button.prototype;

class Button extends BaseWidget.blessed.Button {
  constructor(opts) {
    super(opts)
    var self = this;

    if (!(self instanceof Button))
      return new Button(opts);

    opts = _.merge({
      mouse: true,
      focusable: true,
      shrink: true,
      padding: { left: 1, right: 1 }
    }, Slap.global.options.button, opts);
    opts.style.focus = opts.style.hover;

    self.options = {...self, ...opts}
    // BaseWidget.blessed.Button.call(self, opts);
    // BaseWidget.call(self, opts);
  }
  _initHandlers() {
    var self = this;
    self.on('keypress', function (ch, key) {
      if (key.name === 'enter')
        self.screen.slap._stopKeyPropagation().done(); // FIXME: hack
    });
    return BaseWidget.prototype._initHandlers.apply(self, arguments);
  }
}

export default Button;
