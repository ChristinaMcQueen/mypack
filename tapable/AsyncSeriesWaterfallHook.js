// const { AsyncSeriesWaterfallHook } = require('tapable');

// tapable/AsyncSeriesWaterfallHook 异步串行瀑布流
class AsyncSeriesWaterfallHook {
  constructor(args) { // args => ['name']
    this.tasks = [];
  }

  tapAsync(name, task) {
    this.tasks.push(task);
  }

  callAsync(...args) {
    const finalCallback = args.pop();
    let index = 0;
    const next = (err, data) => {
      const task = this.tasks[index];
      if (!task) return finalCallback();
      index === 0 ? task(...args, next) : task(data, next);
      index++;
    }
    next();
  }

  tapPromise(name, task) {
    this.tasks.push(task);
  }

  promise(...args) {
    let [firstTask, ...tasks] = this.tasks;
    return tasks.reduce((p, task) => {
      return p.then((ret) => task(ret));
    }, firstTask(...args));
  }
}

class Hook {
  constructor() {
    this.hooks = {
      arch: new AsyncSeriesWaterfallHook(['name']),
    };
  }

  // 注册监听函数
  tap() {
    this.hooks.arch.tapAsync('node', (name, cb) => {
      setTimeout(() => {
        console.log('node', name);
        cb(null, 'Node result');
      }, 1000);
    });
    this.hooks.arch.tapAsync('react', (data, cb) => {
      setTimeout(() => {
        console.log('react', data);
        cb();
      }, 1000);
    });
  }

  start() {
    this.hooks.arch.callAsync('qm', () => {
      console.log('end');
      console.log('====================================');
    });
  }
}

const hook = new Hook();

// 注册钩子事件
hook.tap();

// 启动钩子
hook.start();


class HookPromise {
  constructor() {
    this.hooks = {
      arch: new AsyncSeriesWaterfallHook(['name']),
    };
  }

  // 注册监听函数
  tap() {
    this.hooks.arch.tapPromise('node', (name) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log('node', name);
          resolve('Node result');
        }, 1000);
      });
    });
    this.hooks.arch.tapPromise('react', (name) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log('react', name);
          resolve();
        }, 1000);
      });
    });
  }

  start() {
    this.hooks.arch.promise('qm').then(() => {
      console.log('end');
    });
  }
}

const hookPromise = new HookPromise();

// 注册钩子事件
hookPromise.tap();

// 启动钩子
hookPromise.start();
