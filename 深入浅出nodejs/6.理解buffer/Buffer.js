// var str = '你好Node';
// var buf = new Buffer(str, 'utf-8');
// console.log(buf);
// Buffer 的内存不是在 V8 的堆内存中是 Node 在 C++ 层面实现内存的申请的
// Buffer 元素均为 16 进制的两位数 范围是 0 - 255 
// 如果给元素赋值小于 0 则逐次 + 256 直到 范围在 0 - 256 如果大于 256 则逐次减，如果是小数则舍去小数位
// 8bit(位) === 1Byte(字节)
// 1024byte === 1KB
// 1024KB === 1MB
// 1024MB === 1GB
// 1024GB === 1TB
var fs = require('fs');
var str = '';
var size = 0;
var arr = [];
var rs = fs.createReadStream('test.md', { highWaterMark: 11 });
// rs.setEncoding('utf-8');
rs.on('data', function (chunk) {
  arr.push(chunk)
  size += chunk.length;
  str += chunk;
})
rs.on('end', function () {
  var buf = new Buffer(size);
  var offset = 0;
  arr.forEach(function (item) {
    item.copy(buf, offset);
    offset += item.length;
  });
  console.log(str);
  console.log(buf.toString());
})