// const { AsyncSeriesHook } = require('tapable');

// tapable/AsyncSeriesHook 异步串行
class AsyncSeriesHook {
  constructor(args) { // args => ['name']
    this.tasks = [];
  }

  tapAsync(name, task) {
    this.tasks.push(task);
  }

  callAsync(...args) {
    const finalCallback = args.pop();
    let index = 0;
    const next = () => {
      if (this.tasks.length === index) return finalCallback();
      const task = this.tasks[index++];
      task(...args, next);
    }
    next();
  }

  tapPromise(name, task) {
    this.tasks.push(task);
  }

  promise(...args) {
    const [firstTask, ...tasks] = this.tasks;
    return tasks.reduce((p, task) => {
      return p.then(() => task(...args));
    }, firstTask(...args));
  }
}

class Hook {
  constructor() {
    this.hooks = {
      arch: new AsyncSeriesHook(['name']),
    };
  }

  // 注册监听函数
  tap() {
    this.hooks.arch.tapAsync('node', (name, cb) => {
      setTimeout(() => {
        console.log('node', name);
        cb();
      }, 1000);
    });
    this.hooks.arch.tapAsync('react', (name, cb) => {
      setTimeout(() => {
        console.log('react', name);
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
      arch: new AsyncSeriesHook(['name']),
    };
  }

  // 注册监听函数
  tap() {
    this.hooks.arch.tapPromise('node', (name) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log('node', name);
          resolve();
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
