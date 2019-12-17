const fs = require('fs');
const events = require('events');

class Watcher extends events.EventEmitter {
  constructor(watchDir, processDir) {
    super(watchDir, processDir);
    this.watchDir = watchDir;
    this.processDir = processDir;
  }

  watch() {
    fs.readdir(this.watchDir, (err, file) => {
      if (err) throw err;
      for (let i in file) {
        this.emit('process', file[i]);
      }
    })
  }

  start() {
    fs.watchFile(this.watchDir, () => {
      this.watch();
    })
  }
}
const watchDir = './watch';
const processDir = './done';
const watcher = new Watcher(watchDir, processDir);
watcher.on('process', (file) => {
  const watchFile = `${watchDir}/${file}`;
  const processedFile = `${processDir}/${file.toLowerCase()}`;
  fs.copyFile(watchFile, processedFile, (err) => {
    if (err) {
      throw err;
    }
  })
})

watcher.start();