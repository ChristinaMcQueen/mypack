// const { SyncBailHook } = require('tapable');

// tapable/SyncBailHook 同步保释钩子
class SyncBailHook {
  constructor(args) { // args => ['name']
    this.tasks = [];
  }

  tap(name, task) {
    this.tasks.push(task);
  }

  call(...args) {
    let ret;
    let index = 0;
    do {
      ret = this.tasks[index++](...args);
    }
    while (ret === undefined && index < this.tasks.length)
  }
}

class Hook {
  constructor() {
    this.hooks = {
      arch: new SyncBailHook(['name']),
    };
  }

  // 注册监听函数
  tap() {
    this.hooks.arch.tap('node', (name) => {
      console.log('node', name);
      return 'stop here';
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