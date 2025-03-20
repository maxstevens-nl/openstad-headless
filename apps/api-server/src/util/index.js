var fs = require("fs"),
	path = require("path");

var util = (module.exports = {
	invokeDir: (dirName, fn, ctx) => {
		dirName = util.relativePath(dirName);
		_invokeDir(dirName, fn, ctx);
	},

	relativePath: (dirName) => {
		// Is `dirName` relative?
		if (path.normalize(dirName) !== path.resolve(dirName)) {
			// make `dirName` relative to the caller.
			var callerFilename = util.stack()[2].getFileName(),
				callerPath = path.dirname(callerFilename);
			dirName = path.resolve(callerPath, dirName);
		}
		return dirName;
	},

	stack: function _stackGrabber() {
		var orig = Error.prepareStackTrace;
		Error.prepareStackTrace = (_, stack) => stack;
		var err = new Error();
		Error.captureStackTrace(err, _stackGrabber);
		var errStack = err.stack;
		Error.prepareStackTrace = orig;
		return errStack;
	},
});

function _invokeDir(dirName, fn, ctx) {
	var dir = fs.readdirSync(dirName);
	for (const fileName of dir) {
		var fullPath = path.join(dirName, fileName),
			isDir = fs.lstatSync(fullPath).isDirectory();

		if (isDir) {
			_invokeDir(fullPath, fn, ctx);
		} else if (fileName !== "index.js" && fileName.match(/\.js$/) !== null) {
			var name = fileName.replace(/\.js$/, "");
			var module = require(fullPath);
			fn.call(ctx || module, module, name, dirName);
		}
	}
}
