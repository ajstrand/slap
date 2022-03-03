import _ from 'lodash';
import BaseWidget from 'base-widget';
import pkg from 'editor-widget';
const { Field } = pkg;
import Slap from './Slap.js';
import BaseForm from './BaseForm.js';
import Label from './Label.js';

//SaveAsForm.prototype.__proto__ = BaseForm.prototype;

class SaveAsForm extends BaseForm {

  constructor(opts) {
    super(opts)
    var self = this;
    this._label = " save as: ";


    if (!(self instanceof SaveAsForm))
      return new SaveAsForm(opts);

    // BaseForm.call(self, _.merge({
    //   field: { left: this._label.length }
    // }, Slap.global.options.form.saveAs, opts));

    self.saveAsLabel = new Label(_.merge({
      parent: self,
      tags: true,
      content: this._label,
      top: 0,
      left: 0,
      width: this._label.length,
    }, self.options.saveAsLabel));

    self.pathField = new Field(_.merge({
      parent: self,
      top: 0,
      left: this._label.length,
      right: 0
    }, Slap.global.options.editor, Slap.global.options.field, self.options.pathField));
  }
  _initHandlers() {
    var self = this;
    self.on('show', function () {
      self.pathField.textBuf.setText(self.pane.editor.textBuf.getPath() || '');
      self.pathField.selection.setHeadPosition([0, Infinity]);
      self.pathField.focus();
    });
    self.on('submit', function () {
      var path = self.pathField.textBuf.getText();
      if (!path) {
        self.screen.slap.header.message("couldn't save, no filename passed", 'error');
        return;
      }
      self.pane.save(path).done(function (newPath) {
        if (newPath) {
          self.hide();
          self.emit('save', newPath);
        }
      });
    });
    return BaseForm.prototype._initHandlers.apply(self, arguments);
  }
}


export default SaveAsForm;
