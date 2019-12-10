var cluster = require('cluster');

cluster.setupMaster({
  exec: 'worker.js'
});

var cups = require('os').cpus();

for (let i = 0; i < cups.length; i++) {
  cluster.fork();  
}