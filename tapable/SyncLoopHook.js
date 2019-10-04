// const { SyncLoopHook } = require('tapable');

// tapable/SyncLoopHook 同步钩子，遇到不返回undefined的函数循环执行
class SyncLoopHook {
  constructor(args) { // args => ['name']
    this.tasks = [];
  }

  tap(name, task) {
    this.tasks.push(task);
  }

  call(...args) {
    this.tasks.forEach(task => {
      let ret;
      do {
        ret = task(...args);
      } while (ret !== undefined)
    });
  }
}

class Hook {
  constructor() {
    this.total = 0
    this.hooks = {
      arch: new SyncLoopHook(['name']),
    };
  }

  // 注册监听函数
  tap() {
    this.hooks.arch.tap('node', (name) => {
      console.log('node', name);
      return ++this.total === 3 ? undefined : 'continue';
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