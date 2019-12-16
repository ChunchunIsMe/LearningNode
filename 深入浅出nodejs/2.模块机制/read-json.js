// Native extension for .json
module._extensions['.json'] = function (module, filename) {
    var content = NativeModule.require('fs').readFileSync(filename, 'utf8');
    try {
        module.exports = JSON.parse(stripBOM(content));
    } catch (err) {
        err.message = filename + ':' + err.message;
        throw err;
    }
}