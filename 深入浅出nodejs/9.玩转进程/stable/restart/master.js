var fork = require('child_process').fork;
var cpus = require('os').cpus();

var server = require('net').createServer();
server.listen(1377);

var workers = {};
function createWorker() {
  var worker = fork('./worker.js');
  worker.on('exit', function () {
    console.log('Worker ' + worker.pid + ' exited.');
    delete workers[worker.pid];
    createWorker();
  });

  worker.send('server', server);
  workers[worker.pid] = worker;
  console.log('Create worker. pid: ' + worker.pid + '\n');
}

for (let i = 0; i < cpus.length; i++) {
  createWorker();  
}

process.on('exit', function () {
  for (const pid in workers) {
    if (workers.hasOwnProperty(pid)) {
      workers[pid].kill();
    }
  }
})