import _ from 'lodash';
import BaseWidget from 'base-widget';
import Slap from './Slap.js';
import BaseFindForm from './BaseFindForm.js';
import Label from './Label.js';
class GoLineForm {
  constructor(opts) {
    var self = this;

    this._label = " line number: ";

    if (!(self instanceof GoLineForm))
      return new GoLineForm(opts);

    BaseFindForm.call(self, _.merge({
      findField: { left: this._label.length }
    }, Slap.global.options.form.goLine, opts));

    self.goLineLabel = new Label(_.merge({
      parent: self,
      tags: true,
      content: this._label,
      top: 0,
      left: 0,
      width: GoLineForm._label.length,
    }, self.options.goLineLabel));
  }
  _initHandlers() {
    var self = this;

    self.findField.on('keypress', function (ch, key) {
      var lineNumber = self.findField.textBuf.getText();
      switch (self.resolveBinding(key)) {
        // Use setTimeout as a horrible hack to prevent
        // the keypress from being transferred to the editor,
        // causing an unintentional extra linebreak.
        case 'next': setTimeout(function () { self.find(lineNumber, 1); }, 1); return false;
        case 'submit': setTimeout(function () { self.find(lineNumber, 1); }, 1); return false;
      };
    });

    self.on('cancel', function () { self.resetEditor(); });
    self.on('show', function () { self.findField.textBuf.setText(''); });
    self.on('find', function (lineNumber, direction) {
      lineNumber = Number(lineNumber) - 1;
      if (lineNumber !== lineNumber)
        return; // isNaN(lineNumber)
      var selection = self.pane.editor.selection;
      selection.setHeadPosition([lineNumber, 0]);
      selection.clearTail();
      if (direction)
        self.hide();
      return self;
    });
    return BaseFindForm.prototype._initHandlers.apply(self, arguments);
  }
}
GoLineForm.prototype.__proto__ = BaseFindForm.prototype;


export default GoLineForm;
