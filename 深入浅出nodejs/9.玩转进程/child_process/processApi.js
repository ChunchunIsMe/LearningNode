var cp = require('child_process');
cp.spawn('node', ['../start/worker.js']);
cp.exec('node ../start/worker.js', function (err, stdout, stderr) {
  // todo
})
// cp.execFile('../start/worker.js', function (err, stdout, stderr) {
//   // todo
// })
cp.fork('../start/worker.js')