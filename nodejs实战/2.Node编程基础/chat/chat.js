const events = require('events');
const net = require('net');

const channel = new events.EventEmitter();
channel.clients = {};
channel.subscriptions = {};
channel.on('join', function (id, client) {
  this.clients[id] = client;
  this.subscriptions[id] = (senderId, message) => {
    if (senderId !== id) {
      this.clients[id].write(message)
    }
  }
  this.on('broadcast', this.subscriptions[id]);
})

channel.on('leave', function (id) {
  channel.removeListener('broadcast', this.subscriptions[id]);
  this.emit('broadcast', id, `${id}: 老子溜了`);
  delete this.clients[id];
})

const server = new net.createServer(client => {
  const id = `${client.remoteAddress}:${client.remotePort}`;
  channel.emit('join', id, client)
  client.on('data', data => {
    channel.emit('broadcast', id, data);
  })
  client.on('close', () => {
    channel.emit('leave', id);
  })
})

server.listen(3000);