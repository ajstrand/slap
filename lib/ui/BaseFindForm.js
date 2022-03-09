import _ from 'lodash';
import Slap from './Slap.js';
import BaseForm from './BaseForm.js';
import BaseWidget from 'base-widget';
import pkg from 'editor-widget';
const { Field } = pkg;
import util from 'slap-util';

//BaseFindForm.prototype.__proto__ = BaseForm.prototype;

class BaseFindForm extends BaseForm {
  constructor(opts) {
    super(opts);
    var self = this;

    if (!(self instanceof BaseFindForm))
      return new BaseFindForm(opts);

    self.options = {...self, ..._.merge({
        prevEditorState: {}
      }, Slap.global.options.form.baseFind, opts)}

    // BaseForm.call(self, _.merge({
    //   prevEditorState: {}
    // }, Slap.global.options.form.baseFind, opts));

    let globalOptE = Slap.global.options.editor
    let globalOptField = Slap.global.options.field

    self.findField = new Field(_.merge({
      parent: self,
      top: 0,
      left: 0,
      right: 0
    }, globalOptE, globalOptField, self.options.findField));

    let x = 2;
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



export default BaseFindForm;
