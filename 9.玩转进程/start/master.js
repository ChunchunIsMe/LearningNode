var fork = require('child_process').fork;
var cups = require('os').cpus();

for (let i = 0; i < cups.length; i++) {
  fork('./worker.js');  
}