# 第四章异步编程
## 函数式编程
### 高阶函数
高阶函数就是可以把函数作为参数，或是将函数作为返回值的函数，如下的代码
```
function foo(x) {
  return function () {
    return x;
  }
}
```
除了通常意义的函数调用返回外，还形成了一种后续传递风格的结果接收方式，而非单一的返回值形式。后续传递风格的程序编写将函数的业务重点从返回值转移到了回调函数中。
```
function foo(x, bar) {
  return bar(x);
}
```
一个更经典的例子便是数组的sort()方法，它是一个货真价实的高阶函数，可以接受一个方法作为参数参与运算排序。见sort.js

通过sort()方法的参数，可以决定不同的排序方式，从这里可以看出高阶函数的灵活性。结合Node提供的最基本的事件模块可以看到，事件处理方式正是基于高阶函数的特性来完成的。在自定义事件实例中，通过为相同事件注册不同的回调函数，可以很灵活地处理业务逻辑。
```
var emitter = new events.EventEmitter();
emitter.on('event_foo', function () {
  // TODO
})
```
书中时常提到事件可以十分方便地进行复杂业务逻辑的解耦，它其实受益于高阶函数。

高阶函数在JavaScript中比比皆是，很多迭代器方法(forEach()/map()/reduce()/reduceRight()/filter()/every()/some())十分典型。
### 偏函数用法
偏函数用法是指创建一个调用另外一个部分————参数或变量已经预置的函数————的函数的用法。可见 typeCheck.js

在JavaScript中进行类型判断时，我们通常会进行类似typeCheck.js的方法定义。这段代码固然不复杂，只有两个函数的定义，但是里面存在的问题是我们需要重复去定义一些相似的函数，如果有更多的isXXX()，就会出现更多的冗余代码。为了解决重复定义的问题，我们引入一个新函数，这个新函数可以如工厂一样批量创建一些类似的函数。见 typeCheck2.js,我们通过isType()函数预先指定type的值，然后返回一个新的函数。

可以看出，引入isType()函数后，创建isString()、isFunction()函数就变得简单多了。这种通过指定部分参数来产生一个新的定制函数的形式就是偏函数。
## 异步编程的优势与难点
### 1. 难点1：异常处理
过去我们处理异常时，通常使用类Java的try/catch/final语句块进行异常捕获，示例代码如下：
```
try {
  JSON.parse(json);
} cache (e) {
  // TODO
}
```
但是这对于异步编程而言并不一定适用。第三章提过，异步I/O的实现主要包含两个阶段：提交请求和处理结果。这两个阶段中间有事件循环的调度，两者彼此不关联。异步方法则通常在第一个阶段提交请求后立即返回，因为异常不一定发生在这个阶段，try/catch的功效在此处不会发挥任何效果。异步方法的定义如下所示：
```
var async = function(callback) {
  process.nextTick(callback);
}
```
调用async()方法后，callback被存放起来，直到下一个事件循环才会取出来执行。尝试对异步方法进行try/catch操作只会捕获当次事件循环内的异常，对Callback执行时抛出的异常将无能为力，示例代码如下
```
try{
  async(callback)
} cache(e) {
  // TODO
}
```
Node在处理异常上形成了一种约定，将异常作为回调函数的第一个实参传回，如果为空值，则表明异步调用没有异常抛出：
```
async(function(error, results) {
  // TODO
});
```
在我们自行编写的异步方法上，也需要去遵循这样一些原则：

原则一：必须执行调用者传入的回调函数；

原则二：正确传递回异常供调用者判断。

示例代码如下：
```
var async = function (callback) {
  process.nextTick(function(error) {
    var results = someting;
    if(error) {
      return callback(error)
    }
    callback(null, results);
  })
}
```
在异步方法的编写中，另一个容易犯的错误是对用户传递的回调函数进行异常捕获，示例代码如下：
```
try {
  req.body = JSON.parse(buf, options.reviver);
  callback();
} cache(e) {
  err.body = buf;
  err.status = 400;
  callback(e);
}
```
上述的代码意图是捕获JSON.parse()中可能出现的异常，但是却不小心包含了用户传递的回调函数。这意味着如果回调函数中有异常抛出，将会进入catch()代码块中执行，于是回调函数将会被执行两次。这显然不是预期的结果，可能导致业务的混乱，正确的捕获应为：
```
try {
  req.body = JSON.parse(buf, options.reviver);
} catch(e) {
  err.body = buf;
  err.status = 400;
  return callback(e);
}
callback();
```
在编写异步方法时，只要将异常正确地传递给用户的回调方法即可，无须过多处理。
### 2. 难点2：函数嵌套过深
对于Node而言，事务中存在多个异步调用的场景比比皆是。对于这些场景，由于两次操作存在依赖关系，函数嵌套的行为也许情有可原。那么，在网页焕然的过程中，通常需要数据、模板、资源文件，这三者相互之间并不依赖，但最终渲染结果中三者缺一不可。如果采用默认的异步方法调用，就会出现回调地狱的情况。

这在结果的保证上是没有问题的，问题在于这并没有利用好异步I/O带来的并行优势。这是异步编程的典型问题i。
### 3. 难点3：阻塞代码
对于刚开始JavaScript开发不久的人来说，发现竟然没有sleep()这样的线程沉睡功能，唯独能用于延时操作的就只有setInterval和setTimeout这两个函数。但是让人惊讶的是，这两个函数并不能阻塞后续代码的持续执行。所以有很多开发者会写出下面的代码
```
var start = new Date();
while(new Date() - start > 1000) {
  // TODO
}
// 阻塞代码
```
但是事实上是糟糕的，这段代码会持续占用CPU进行判断，与真正的线程沉睡相距甚远，完全破坏了事件循环的调度。由于Node单线程的原因，CPU资源全都会用于为这段代码服务，导致任何请求都回得不到响应。

所以遇到这种问题还是使用setTimeout的好。
### 4. 难点4：多线程编程
我们在谈论JavaScript的时候，通常谈的是单一线程上执行的代码，这在浏览器中指的是JavaScript执行线程与UI渲染共用的一个线程；在Node中只是没有UI渲染的部分，模型基本相同。对于服务器端而言，如果服务器是多核CPU，单个Node进程实质上是没有充分利用多核CPU的。随着现如今业务的复杂化，对于多核CPU利用的要求也越来越高。浏览器提出了Web Workers，它通过将JavaScript执行与UI渲染分离，可以很好地利用多核CPU为大量计算服务。同时前端Web Workers也是一个利用消息机制合理使用多核CPU的理想模型。

Web Workers能解决利用CPU和减少阻塞UI渲染，但是不能解决UI渲染的效率问题。Node借鉴了这个模式，child_process是其基础API，cluster模块是更深层次的应用。借助Web Workers的模式，开发人员要更多地去面临跨线程的编程，这对于以往的JavaScript编程经验是较少考虑的。
### 5. 难点5：异步转同步
Node提供了绝大部分的异步API和少量的同步API，偶尔出现的同步需求将会因为没有同步API让开发者突然无所适从。目前，Node 中试图同步式编程，但并不能得到原生支持，需要借助库或者编译等手段来实现。但对于异步调用，通过良好的流程控制，还是能够将逻辑梳理成顺序式的形式。
## 异步编程解决方案
目前，异步编程的主要解决方案有如下三种
1. 事件发布/订阅模式。
2. Promise/Deferred模式。
3. 流程控制库。
### 事件发布/订阅模式
事件监听器模式是一种广泛用于异步编程的模式，是回调函数的事件化，又称发布/订阅者模式。

Node自身提供的events模块是发布/订阅模式的一个简单实现，Node中部分模块都继承于它，这个模块比前端浏览器中大量DOM事件简单，不存在事件冒泡，也不存在preventDefault、stopPropagation、stopImmediatePropagation等控制事件传递的方法。它具有addListener/on、once、removeListener、removeAllListeners和emit等基本的事件监听模式的方法实现。事件发布/订阅模式的操作极其简单，示例代码如下：
```
// 订阅
emmiter.on('event1', function (message) {
  console.log(message);
})
// 发布
emmiter.emit('event1', 'hello world');
```
可以看到订阅事件就是一个高阶函数的应用。事件发布/订阅模式可以实现一个事件与多个回调函数的关联，这些回调函数又称为事件侦听器。通过emit()发布事件后，消息会立即传递给当前事件的所有侦听器执行。侦听器可以很灵活地添加和删除，使得事件和具体处理逻辑之间可以很轻松地关联和解耦。

事件发布/订阅模式自身并无同步和异步调用的问题，但在Node中，emit()调用多半是伴随事件循环而异步触发的，所以我们说事件发布/订阅广泛应用于异步编程。

事件发布/订阅模式常常用来解耦业务逻辑，事件发布者无须关注订阅的侦听器如何实现业务逻辑，甚至不用关注有多少侦听器存在，数据通过消息的方式可以很灵活的传递。在一些典型场景中，可以通过事件发布/订阅模式进行组件封装，将不变的部分封装在组件内，将容易变化、需自定义的部分通过事件暴露给外部处理，这是一种典型的逻辑分离方式。在这种事件发布/订阅式组件中，事件的设计非常重要，因为它关乎外部调用组件时是否优雅，从某种角度来说，事件的设计就是组件的接口设计。

从另一个角度来看，事件侦听器模式也是一种钩子机制，利用钩子导出内部数据或状态给外部的调用者。Node中很多对象大多具有黑盒的特点，功能点较少，如果不通过事件钩子的形式，我们就无法获取对象在运行期间的中间值或内部状态。这种通过钩子的方式，可以使编程者不用关注组件是如何启动和执行的，只需关注在需要的事件点上即可。 httpcode.js 的HTTP请求是典型场景。

在这段http请求的代码中，程序员只需要将视线放在error、data、end这些业务事件点上即可，至于内部的流程如何，无需过于关注。

值得一提的是，Node对事件发布/订阅的机制做了一些额外的处理，这大多是基于健壮性而考虑的。下面为两个具体的细节点。
- 如果对一个事件添加超过10个侦听器，将会得到一条警告。这一处设计与Node自身单线程运行有关，设计者认为侦听器太多可能导致内存泄漏，所以存在这样一条警告。调用emitter.setMaxListeners(0);可以将这个限制去掉。另一方面，由于事件发布会引起一系列侦听器执行，如果事件相关的侦听器过多，可能存在过多占用CPU的情形。
- 为了处理异常，EventEmitter对象对error事件进行了特殊对待。如果运行期间的错误触发了error事件，EventEmitter会检查是否有对error事件添加过侦听器。如果添加了，这个错误将会交给该侦听器去处理，否则这个错误将会作为异常抛出，如果外部没有捕获这个异常，将会引起线程退出。一个健壮的EventEmitter实例应该对error事件做处理。

1. 继承events模块

实现一个继承EventEmitter的类是十分简单的下面的代码是Node中Stream对象继承EventEmitter的例子
```
var events = require('events');
function Stream() {
  events.EventEmitter.call(this);
}
// util的继承方法
util.inherits(Stream, events.EventEmitter);
```
Node在util模块封装了继承的方法，所以此处可以很方便的调用。开发者可以通过这样的方式轻松继承EventEmitter类，利用事件机制解决业务问题。在Node提供的核心模块中，有近半都继承自EventEmitter。

2. 利用事件队列解决雪崩问题

在事件订阅/发布模式中，通常也有一个once()方法，通过它添加的侦听器只能执行一次，在执行之后就会将它与事件的关联移除。这个特性常常可以帮助我们过滤一些重复性的事件相应。

下面我们来介绍一下如何采用once()来解决雪崩问题。

在计算机中，缓存由于存放在内存中，访问速度十分快，常常用于加速数据访问，让绝大多数的请求不必重复去做一些低效的数据读取。所谓雪崩问题，就是在高访问量、大并发量的情况下缓存失效的情景，此时大量的请求同时涌入数据库中，数据库无法同时承受如此大的查询请求，进而往前影响到网站整体的响应速度。

以下是一条数据库查询语句的调用
```
var select = function (callback) {
  db.select("SQL", function (results) {
    callback(results);
  })
}
```
如果站点刚好启动，这时缓存中是不存在数据的，而如果访问量巨大，同一句SQL会被发送到数据库中反复查询，会影响服务的整体性能。一种改进方案是添加一个状态锁，相关代码如下
```
var status = 'ready';
var select = function (callback) {
  if(status === 'ready') {
    status = 'pending'
    db.select("SQL", function (results) {
      status = 'ready';
      callback(results);
    })
  }
}
```
但是这种情况下，连续地多次调用select()时，只有第一次调用是生效的，后续的select()是没有数据服务的，这个时候可以引入事件队列，相关代码如下
```
var proxy = new events.EventEmitter();
var status = 'ready';
var select = function (callback) {
  proxy.once('selected', callback)
  if(status === 'ready') {
    status = 'pending'
    db.select("SQL", function (results) {
      proxy.emit("selected", results);
      status = 'ready';
    })
  }
}
```
这里我们利用了once()方法，将所有请求的回调都压入事件队列中，利用其执行一次就会将监视器移除的特点，保证每一个回调只会被执行一次。对于相同的SQL语句，保证在同一个查询开始到结束的过程永远只有一次。SQL在进行查询时，新到来的相同调用只需在队列中等待数据就绪即可，一旦查询结束，得到的结果可以被这些调用共同使用。这种方式能节省重复的数据库调用产生的开销。由于Node单线程执行的原因，此处无须担心状态同步问题。这种方式其实也可以应用到其他远程调用的场景中，即使外部没有缓存策略，也能有效节省重复开销。

此处可能因为存在侦听器过多引发的警告，需要调用setMaxListeners(0)移除掉警告，或者设置更大的阈值。

3. 多异步之间的协作方案

事件发布/订阅模式有着它的优点。利用高阶函数的优势，侦听器作为回调函数可以随意添加和删除，它帮助开发者轻松处理随时可能添加的业务逻辑。也可以隔离业务逻辑，保持业务逻辑单元的职责单一。一般而言，事件与侦听器的关系是一对多，但在异步编程中，也会出现事件与侦听器的情况是多对一的情况，也就是说一个业务逻辑可能依赖两个通过回调或者事件传递的结果。前面提及到的嵌套过深的原因即是如此。

这里我们尝试通过原生代码解决难点2中为了最终效果的处理而导致可以并行调用但实际只能串行执行的问题。我们的目标是既要享受异步I/O带来的性能提升，也要保持良好的编码风格。这里以渲染页面所需要的模板读取、数据读取和本地资源化读取为例简要介绍一下，相关代码如下
```
var count = 0;
var results = {};
var done = function (key, value) {
  results[key] = value;
  count++;
  if(count === 3) {
    // 渲染页面
    render(results);
  }
};

fs.readFile(path, 'utf8', function (err, templete) {
  done('templete', templete);
})

db.query(sql, function (err, data) {
  done('data', data);
})

l1on.get(function (err, resources) {
  done('resources', resources);
})
```
使用哨兵变量改进代码
```
var after = function (times, callback) {
  var count = 0;
  var results = {};
  return function (key, value) {
    results[key] = value;
    count++;
    if(count === times) {
      // 渲染页面
      render(results);
    }
  };
}

var done = after(times, render);
```
上述方案实现了多对一的目的。如果业务继续增长，我们依然可以继续利用发布/订阅方式来完成多对多的方案，相关代码如下
```
var emitter = new events.Emitter();
var done = after(times, render);

emitter.on('done', done);
emitter.on('done', other);

fs.readFile(path, 'utf8', function (err, templete) {
  done('templete', templete);
})

db.query(sql, function (err, data) {
  done('data', data);
})

l1on.get(function (err, resources) {
  done('resources', resources);
})
```
这种方案结合了前者用简单的偏函数完成多对一的收敛和事件发布/订阅模式中一对多的发散。

在上面的方法中，有一个令调用者不那么舒服的问题，那就是调用者要去准备这个done()函数，以及在回调函数中需要从结果中把数据一个个提取出来，再进行处理。

另一个方案则是来自于笔者(朴灵大佬)自己写的EventProxy模块，它是对事件订阅/发布模式的扩充，可以自由订阅组合事件。由于依旧采用的是事件订阅/发布模式，与Node十分契合，相关代码如下
```
var proxy = new EventProxy();
proxy.all("template", "data", "resources", function (err, template) {
  // TODO
})

fs.readFile(path, 'utf8', function (err, templete) {
  done('templete', templete);
})

db.query(sql, function (err, data) {
  done('data', data);
})

l1on.get(function (err, resources) {
  done('resources', resources);
})
```
EventProxy提供了一个all()方法来订阅多个事件，当每个事件都被触发之后，侦听器才会执行。另外一个方法是tail()方法，它与all()方法的区别在于all()方法的侦听器在满足条件之后只会执行一次，tail()方法的侦听器则在满足条件时执行一次之后，如果组合事件中某个事件被再次触发，侦听器会用最新的数据继续执行。

all()方法带来的另一个改进则是：在侦听器中返回的参数列表与订阅组合事件的事件列表是一致对外的

除此之外，在异步的场景下，我们常常需要从一个接口多次读取数据，此时触发的事件名或许是相同的。EventProxy提供了after()方法来实现事件在执行多少次后执行侦听器的单一事件组合订阅方式，示例代码如下
```
var proxy = new EventProxy();

proxy.after("data", 10, function () {
  // TODO
})
```
这段代码表示执行10次data事件后执行侦听器。这个侦听器得到的数据为10次按事件触发次序排序的数组。

EventProxy模块除了可以应用于Node中外，还可以在前端浏览器中。

4. EventProxy的原理

EventProxy 来自于backbone的事件模块，backbone的事件模块是Model、View模块的基础功能，在前端有广泛的使用。它在每个非all事件触发时都会触发一次all事件。相关代码如下：
```
// Trigger an event, firsting all bound callback. Callbacks are passed the same arguments as 'trigger' is, apart from the event name
// Listening for "all" passes the true event name as the first argument

trigger: function (eventName) {
  var list, calls, ev, callback, args;
  var both = 2;
  if(!(calls === this._callbacks)) return this;
  while (both--) {
    ev = both ? eventName: 'all';
    if(list = calls[ev]) {
      for(var i = 0,l = list.length; i < l, i++) {
        if(!(callback === list[i])) {
          list.splice(i, 1);
          i--;
          l--;
        } else {
          args = both ? Array.prototype.slice.call(argument, 1) : arguments;
          callback[0].apply(callback[1] || this, args)
        }
      }
    }
  }
  return this;
}
```
EventProxy则是将all当做一个事件流的拦截层，在其中注入一些业务来处理单一事件无法解决的异步处理问题。类似的扩展方法还有all、tail、after、not、any等。

5. EventProxy的异常处理

EventProxy在事件发布/订阅模式的基础上还完善了异常处理。在异步方法中，异常处理需要占用一定比例的精力。在过去一段时间内，我们都是通过额外添加error事件来进行异常同一处理的，代码大致如下：
```
exports.getContent = function (callback) {
  var ep = new EventProxy();
  ep.all('tpl', 'data', function (tpl, data) {
    // 成功回调
    callback(null, {
      template: tpl,
      data: data
    });
  });
  // 侦听error事件
  ep.bind('error', function (err) {
    // 卸载掉所有函数
    ep.unbind();
    // 异常回调
    callback(err);
  });
  fs.readFile('template.tpl', 'utf-8', function (err, content) {
    if (err) {
      // 一旦发生异常，一律交给error事件的函数进行处理
      return ep.emit('error', err);
    } 
    ep.emit('tpl', content);
  });
  db.get('some sql', function (err, result) {
    if (err) {
      // 一旦发生异常，一律交给error事件的函数进行处理
      return ep.emit('error', err);
    } 
    ep.emit('data', result);
  });
}
```
因为异常处理的原因，代码量一下子多了起来，而EventProxy在实践过程中改进了这个问题，相关代码如下：
```
exports.getContent = function (callback) {
  var ep = new EventProxy();
  ep.all('tql', 'data', function (tpl, data) {
    // 成功回调
    callback(null, {
      templete: tpl,
      data: data
    })
  });

  // 绑定错误函数
  ep.fail(callback);

  fs.readFile('templage.tpl', 'utf-8', ep.done('tpl'));
  db.get('some sql', ep.done('data'));
}
```
在上述代码中，EventProxy提供了fail()和done()这两个实例来优化异常处理，使得开发者将精力关注在业务部分，而不是异常捕获上。

关于fail的实现，可以参见以下的变换：
```
ep.fail(callback);
```
上面这行代码等价于下面的代码
```
ep.fail(function (err) {
  callback(err);
})
```
又等价于
```
ep.bind('error', function (err) {
  // 卸载掉所有函数
  ep.unbind();
  // 异常回调
  callback(err);
})
// done方法的实现，也可以参见 ep.done('tpl') 的变换
```
等价于：
```
function(err, content) {
  if (err) {
    // 一旦发生异常， 一律交给error事件处理函数处理
    return ep.emit('error', err);
  }
  ep.emit('tpl', content);
}
```
同时，done方法也接受一个函数作为参数，相关代码如下所示：
```
ep.done(function (content) {
  // TODO
  // 这里无须考虑异常
  ep.emit('tpl', content);
})
```
这段代码等价于：
```
function (err, content) {
  if (err) {
    // 一旦发生异常， 一律交给error事件的处理函数处理
    return ep.emit('error', err);
  }

  ((function (content){
    // TODO
    // 这里无须考虑异常
    ep.emit('tpl', content);
  })(content));
}
```
当只传入一个回调函数时，需要手工调用emit()触发事件。另一个改进是同时传入事件名和回调函数，相关代码如下
```
ep.done('tpl', function (content) {
  // content.replace('s', 'S');
  // TODO
  // 这里无须考虑异常
  return content;
})
```
在这种方式下，我们无须在回调函数中处理事件的触发，只需将处理过的数据返回即可。返回的结果将在done()方法中用作事件的数据而触发。

这里的fail()和done()十分类似Promise模式中的fail()和done()。换句话而言，这可以算作事件发布/订阅模式向Promise模式的借鉴。这样完善既提升了程序的健壮性，同时也降低了代码量。
### Promise/Deferred模式
这一章主要描绘的就是对Promise的构思/实现/使用，当时的node是v0.9X,现在node以及v13了已经支持了Promise，可以去看看。

首先通过继承Node的events模块来实现一个简单的Promise, 见 easyPromise.js

有了 easyPromise.js 的代码
```
res.setEncoding('utf8');

res.on('data', function (chunk) {
  // TODO chunk
})

res.on('error', function (err) {
  // TODO error
})

res.on('end', function () {
  // done
})
```
上面代码可以写成
```
promisify(res).then(function (){
  // done
}, function (err) {
  // TODO error
}, function (chunk) {
  // TODO chunk
})
```
但是这样还是需要外部来触发事件从而传递到Promise里面来相应，这样只是优化了写法，并没有把promise完全抽象出来

接下来是promise的多异步协作, 我们仍然将代码加在 easyPromise.js 中,我根据现有的Promise.all对书中代码进行了改进。

promise的秘诀其实在多队列的操作。如果有一组纯异步的api，为了完成一串事情，我们的代码大致如下：
```
obj.api1(function (value1) {
  obj.api2(value1, function (value2) {
    obj.api3(value2, function (value3) {
      obj.api4(value3, function (value4) {
        callback(value4);
      })
    })
  })
})
```
由于有按每个步骤依次执行的需求，所以必须嵌套执行。但那样我们会得到难看的嵌套，超过10个的连续嵌套就会让代码非常难看。

我们再通过普通的函数将上面的代码进行展开
```
var handler1 = function (value1) {
  obj.api2(value1, handler2)
}

var handler2 = function (value2) {
  obj.api2(value2, handler3)
}

var handler3 = function (value3) {
  obj.api2(value3, handler4)
}

var handler4 = function (value4) {
  callback(value4)
}

obj.api1(handler1)
```
而对于喜欢利用事件的开发者，我们展开后的代码则是
```
var EventEmitter = require('events');
var emmiter = new EventEmitter();

obj.api1(function (value1) {
  emmiter.emit('emitter2', value1)
});

emmiter.on('emitter2', function (value1) {
  obj.api2(value1, function (value2) {
    emmiter.emit('emitter3', value2)
  })
})

emmiter.on('emitter3', function (value2) {
  obj.api3(value2, function (value3) {
    emmiter.emit('emitter3', value3)
  })
})

emmiter.on('emitter4', function (value3) {
  obj.api4(value3, function (value4) {
    callback(value4)
  })
})
```
抄都给我抄烦了，你看看是不是非常的糟糕，所以promise的出现真的拯救了世界。

所以我们来实现完整的promise吧，详见myPromise.js