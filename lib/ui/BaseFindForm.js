import _ from 'lodash';
import Slap from './Slap.js';
import BaseForm from './BaseForm.js';
import BaseWidget from 'base-widget';
import pkg from 'editor-widget';
const { Field } = pkg;
import util from 'slap-util';

class BaseFindForm {
  constructor(opts) {
    var self = this;

    if (!(self instanceof BaseFindForm))
      return new BaseFindForm(opts);

    BaseForm.call(self, _.merge({
      prevEditorState: {}
    }, Slap.global.options.form.baseFind, opts));

    self.findField = new Field(_.merge({
      parent: self,
      top: 0,
      left: 0,
      right: 0
    }, Slap.global.options.editor, Slap.global.options.field, self.options.findField));
  }
  find(text, direction) {
    var self = this;
    self.screen.slap.header.message(null);
    if (text)
      self.emit('find', text, direction);
    else
      self.resetEditor();
    return self;
  }
  resetEditor() {
    var self = this;
    var prevEditorState = self.options.prevEditorState;
    var editor = self.pane.editor;
    if (prevEditorState.selection)
      editor.selection.setRange(prevEditorState.selection);
    if (prevEditorState.scroll) { editor.scroll = prevEditorState.scroll; editor._updateContent(); }
  }
  _initHandlers() {
    var self = this;
    var textBuf = self.findField.textBuf;
    var prevEditorState = self.options.prevEditorState;
    self.on('show', function () {
      var editor = self.pane.editor;
      if (!prevEditorState.selection)
        prevEditorState.selection = editor.selection.getRange();
      if (!prevEditorState.scroll)
        prevEditorState.scroll = editor.scroll;
      self.findField.focus();
      self.find(textBuf.getText());
    });
    self.on('hide', function () {
      if (!_.some(self.pane.forms, 'visible')) {
        prevEditorState.selection = null;
        prevEditorState.scroll = null;
      }
    });

    textBuf.onDidChange(function () { self.find(textBuf.getText()); });

    return BaseForm.prototype._initHandlers.apply(self, arguments);
  }
}
BaseFindForm.prototype.__proto__ = BaseForm.prototype;



export default BaseFindForm;
