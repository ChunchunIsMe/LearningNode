var a = new Promise(function (re) {
  re(1);
});

a.then(function (data) {
  console.log('then1')
  return new Promise(function (re, rj) {
    rj(data)
  })
}).then(function (data) { console.log('then2') }, function (data) {
  console.log('reject1')
  return new Promise(function(re) {
    re(data)
  })
}).then(function (data) { console.log('then3') }, function (data) {
  console.log('reject2')
  return new Promise(function(re) {
    re(data)
  })
})



