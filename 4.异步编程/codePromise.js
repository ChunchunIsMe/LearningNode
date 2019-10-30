const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'FEJECTED';

class MyPromise {
  constructor(handle) {
    if (typeof handle !== 'function') {
      throw new Error('not function');
    }
    this._status = PENDING;
    this._value = undefined;
    this._fulfilledQueues = [];
    this._rejectedQueues = [];
    try {
      fn(this._resolve.bind(this), this._reject.bind(this));
    } catch (error) {
      this._reject(error);
    }
  }

  // 添加resolve时候执行的函数
  _resolve(val) {

    const run = () => {
      if (this._status !== PENDING) {
        return;
      }
      this._status = FULFILLED;
      const runFulfilled = (value) => {
        let cb;
        while(cb = this._fulfilledQueues.shift()) {
          cb(value);
        }
      }

      const runRejected = (value) => {
        let cb;
        while(cb = this._rejectedQueues.shift()) {
          cb(value);
        }
      }

      if (val instanceof MyPromise) {
        val.then(value => {
          this._value = value;
          runFulfilled(value);
        }, err => {
          this._value = err;
          runRejected(err);
        })
      } else {
        this._value = val;
        runFulfilled(val)
      }
    }

    setTimeout(run, 0);
  }

  _reject(err) {
    if (this._status !== PENDING) {
      return;
    }
    const run = () => {
      this._status = REJECTED;
      this._value = err;
      let cb;
      while (cb = this._rejectedQueues.unshift()) {
        cb(val)
      }
    }
    setTimeout(run, 0);
  }

  then(onFulfilled, onRejected) {
    const { _status, _value } = this;
    return new MyPromise((onFulfilledNext, onRejectedNext) => {
      let fulfilled = value => {
        try {
          if (typeof onFulfilled !== 'function') {
            onFulfilledNext(value);
          } else {
            let res = onFulfilled(value);
            if (res instanceof MyPromise) {
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              onFulfilledNext(value);
            }
          }
        } catch (error) {
          onRejectedNext(error);
        }
      }

      let rejected = error => {
        try {
          if (typeof onRejected !== 'function') {
            onFulfilledNext(error);
          } else {
            let res = onRejected(error);
            if (res instanceof MyPromise) {
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              onRejectedNext(value);
            }
          }
        } catch (error) {
          onRejectedNext(error);
        }
      }

      switch (_status) {
        case PENDING:
          this._fulfilledQueues.push(fulfilled);
          this._rejectedQueues.push(rejected);
          break;
        case FULFILLED:
          fulfilled(_value);
          break;
        case REJECTED:
          rejected(_value);
          break;
      }
    })
  }
}
