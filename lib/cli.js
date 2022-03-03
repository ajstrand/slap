import _ from "lodash";
import path, {resolve} from "path";
import rc from "rc";
import util from "slap-util";
import ttys from "ttys";
import pkgFS from "fs-extra";
const { readFile } = pkgFS;
import pkg from "bluebird";
const { Promise } = pkg;
import childProcess from "child_process"
import {fileURLToPath} from 'url';
import updateNotifier from "update-notifier"


const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const json = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url))
);
const name = json.name;
const baseDir = path.join(__dirname, "..");
const configFile = path.join(baseDir, name + ".ini");
let opts = util.parseOpts(rc(name, configFile));


opts = _.merge(opts, opts.slap);

var info = console._error || console.error;

const startApp = () => {
  // special invocation modes
  if (opts.h || opts.help) {
    var command = process.argv[1];
    if (
      !process.env.PATH.split(path.delimiter).some(function (binPath) {
        var newCommand = path.relative(binPath, command);
        if (path.dirname(newCommand) === ".") {
          command = newCommand;
          return true;
        }
      })
    ) {
      command = path.relative(process.cwd(), command);
      if (path.dirname(command) === ".") command = "." + path.sep + command;
    }
    const cliText = `
  Usage: " + command + " [options...] [<file1> [<file2> [...]]]",
  ${json.description},
  To see what options are available, run
    ${command}
    configFile.
  Example:  ${command} + " --logger.level debug file.c
  `;

    info([cliText].join("\n"));

    return process.exit(0);
  }

  if (opts.v || opts.version) {
    var SORT_ORDER = ["slap", "node", "v8"].reverse();
    var versions = _.clone(process.versions);
    versions[json.name] = json.version;
    info(
      Object.keys(versions)
        .sort(function (a, b) {
          return SORT_ORDER.indexOf(b) - SORT_ORDER.indexOf(a);
        })
        .map(function (name) {
          return name + "@" + versions[name];
        })
        .join(", ")
    );
    return process.exit(0);
  }

  if (opts.perf.profile && process.execArgv.indexOf("--prof") === -1) {
    var cp = childProcess.fork(
      process.argv[1],
      process.argv.slice(2),
      {
        stdio: "inherit",
        execArgv: ["--prof"].concat(process.execArgv),
      }
    );
    cp.on("exit", function (code) {
      process.exit(code);
    });
    cp.on("error", function (err) {
      process.exit(8);
    });
    return;
  }
};

startApp()

global.Promise = Promise;
import fs from "fs";
var fsp = Promise.promisifyAll(fs);

import pkgBW from 'base-widget';
const { blessed } = pkgBW;
import Slap from "./ui/Slap.js";
import EditorPane from "./ui/EditorPane.js";

function readAsync(stream) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    stream
      .on("error", reject)
      .on("data", chunks.push.bind(chunks))
      .on("end", function () {
        resolve(Buffer.concat(chunks));
      });
  });
}

const cli = (options) => {
  opts = _.merge(opts, options);
  return Promise.all([
    //Slap.getUserDir().catch(Promise.resolve()),
    Slap.getUserDir(),

    process.stdin.isTTY ? Promise.resolve() : readAsync(process.stdin), // read pipe to stdin into a new file if there is one
  ]).spread(function (userDir, stdin) {
    if (userDir)
      opts = _.merge(
        { logger: { file: path.resolve(userDir, name + ".log") } },
        opts
      );
    opts = _.merge({ editor: { logger: opts.logger } }, opts);
    opts.screenOpts.input = ttys.stdin; // Uses ttys to read from /dev/tty
    util.logger(opts.logger);
    util.logger.info("loading...");
    util.logger.verbose("configuration:", opts);

    if (!opts.config)
      fsp
        .createReadStream(path.join(__dirname, "..", "default-config.ini")) // if a user config doesn't exist, make one by copying a template
        .pipe(fsp.createWriteStream(path.join(userDir, "config")));

    if (!opts.screen) opts.screen = new blessed.Screen(opts.screenOpts);
    opts.screen.logger = opts.logger;
    var slap = new Slap(opts);

    Promise.all(
      opts._.map(function (path, i) {
        return slap.open(path.toString(), !i);
      })
    ).done();

    if (stdin || !opts._.length) {
      // if no files are passed
      var pane = new EditorPane({ parent: slap });
      // Sets stdin from pipe if it exists
      if (stdin) pane.editor.textBuf.setText(stdin.toString());
      pane.setCurrent();
    }

    // Checks for available update and returns an instance
    const notifier = updateNotifier({pkg:json});
    notifier.notify();

    //require("update-notifier")({ pkg: json }).notify();

    return slap.ready.disposer(function (slap) {
      slap.quit();
    });
  });
};

export default cli;
