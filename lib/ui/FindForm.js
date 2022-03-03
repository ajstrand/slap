import _ from "lodash";
import lodash from "lodash";
import util from "slap-util";
import BaseWidget from "base-widget";
import Slap from "./Slap.js";
import BaseFindForm from "./BaseFindForm.js";
import Label from "./Label.js";

//FindForm.prototype.__proto__ = BaseFindForm.prototype;

class FindForm extends BaseFindForm {
  constructor(opts) {
    super(opts)
    var self = this;

    this._label = " find (/.*/ for regex): ";
    this._regExpRegExp = /^\/(.+)\/(\w*)$/i;
    this._invalidRegExpMessageRegExp =
      /^(Invalid regular expression:|Invalid flags supplied to RegExp constructor)/;

    if (!(self instanceof FindForm)) return new FindForm(opts);

    // BaseFindForm.call(
    //   self,
    //   _.merge(
    //     {
    //       findField: { left: this._label.length },
    //     },
    //     Slap.global.options.form.find,
    //     opts
    //   )
    // );

    self.findLabel = new Label(
      _.merge(
        {
          parent: self,
          tags: true,
          content: this._label,
          top: 0,
          left: 0,
          width: this._label.length,
        },
        self.options.findLabel
      )
    );
  }
  selectRange(range) {
    var self = this;
    var editor = self.pane.editor;
    var selection = editor.selection;
    selection.setRange(range);
    var visibleRange = editor.visiblePos(range);
    editor.clipScroll([visibleRange.start, visibleRange.end]);
    return self;
  }
  _initHandlers() {
    var self = this;
    var header = self.screen.slap.header;
    var editor = self.pane.editor;
    var selection = editor.selection;

    self.on("hide", function () {
      editor.destroyMarkers({ type: "findMatch" });
      editor._updateContent();
    });
    self.on(
      "find",
      lodash.throttle(function (pattern, direction) {
        direction = direction || 0;
        editor.destroyMarkers({ type: "findMatch" });
        try {
          var regExpMatch = pattern.match(this._regExpRegExp);
          pattern = new RegExp(
            regExpMatch[1],
            regExpMatch[2].replace("g", "") + "g"
          );
        } catch (e) {
          if (e.message.match(this._invalidRegExpMessageRegExp)) {
            header.message(e.message, "error");
            self.resetEditor();
            return;
          }
          pattern = new RegExp(_.escapeRegExp(pattern), "img");
        }

        var selectionRange = selection.getRange();
        var matches = [];
        editor.textBuf[direction === -1 ? "backwardsScan" : "scan"](
          pattern,
          function (match) {
            matches.push(match);
            editor.textBuf.markRange(match.range, { type: "findMatch" });
          }
        );

        if (!matches.length) {
          header.message("no matches", "warning");
          self.resetEditor();
          return;
        }
        if (
          !matches.some(function (match) {
            var matchRange = match.range;
            var cmp = matchRange.start.compare(selectionRange.start);
            if (cmp === direction) {
              self.selectRange(matchRange);
              return true;
            } else if (!cmp && matches.length === 1) {
              header.message("this is the only occurrence", "info");
              return true;
            }
          })
        ) {
          header.message("search wrapped", "info");
          self.selectRange(matches[0].range);
        }
        editor._updateContent();
      }, self.options.perf.findThrottle)
    );

    self.findField.on("keypress", function (ch, key) {
      var text = self.findField.textBuf.getText();
      switch (self.resolveBinding(key)) {
        case "next":
          self.find(text, 1);
          return false;
        case "prev":
          self.find(text, -1);
          return false;
      }
    });

    return BaseFindForm.prototype._initHandlers.apply(self, arguments);
  }
}

export default FindForm;
