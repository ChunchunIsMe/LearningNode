process.nextTick(function () {
  console.log('nextTick1');
})

process.nextTick(function () {
  console.log('nextTick2');
})

setImmediate(function () {
  console.log('setImmediate1');
  process.nextTick(function () {
    console.log('insert nextTick');
  });
})

setImmediate(function () {
  console.log('setImmediate2');
})

console.log('正常执行');
