// const { AsyncParallelHook } = require('tapable');

// tapable/AsyncParallelHook 异步并发
class AsyncParallelHook {
  constructor(args) { // args => ['name']
    this.tasks = [];
  }

  tapAsync(name, task) {
    this.tasks.push(task);
  }

  callAsync(...args) {
    const finalCallback = args.pop();
    let index = 0;
    const done = () => {
      index++;
      if (index === this.tasks.length) {
        finalCallback();
      }
    }
    this.tasks.forEach(task => task(...args, done));
  }

  tapPromise(name, task) {
    this.tasks.push(task);
  }

  promise(...args) {
    return Promise.all(this.tasks.map(task => task(...args)));
  }
}

class Hook {
  constructor() {
    this.hooks = {
      arch: new AsyncParallelHook(['name']),
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
      arch: new AsyncParallelHook(['name']),
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