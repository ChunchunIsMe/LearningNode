process.nextTick(function () {
  console.log('nextTick1');
});

setImmediate(function () {
  console.log('setImmediate1');
});

console.log('正常执行');

setImmediate(function () {
  console.log('setImmdiate2');
});

process.nextTick(function () {
  console.log('nextTick2');
})