// const { SyncHook } = require('tapable');

// tapable/SyncHook 同步钩子
class SyncHook {
  constructor(args) { // args => ['name']
    this.tasks = [];
  }

  tap(name, task) {
    this.tasks.push(task);
  }

  call(...args) {
    this.tasks.forEach(task => task(...args));
  }
}

class Hook {
  constructor() {
    this.hooks = {
      arch: new SyncHook(['name']),
    };
  }

  // 注册监听函数
  tap() {
    this.hooks.arch.tap('node', (name) => {
      console.log('node', name);
    });
    this.hooks.arch.tap('react', (name) => {
      console.log('react', name);
    });
  }

  start() {
    this.hooks.arch.call('qm');
  }
}

const hook = new Hook();

// 注册钩子事件
hook.tap();

// 启动钩子
hook.start();