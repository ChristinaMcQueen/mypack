// const { SyncWaterfallHook } = require('tapable');

// tapable/SyncWaterfallHook 同步瀑布流钩子
class SyncWaterfallHook {
  constructor(args) { // args => ['name']
    this.tasks = [];
  }

  tap(name, task) {
    this.tasks.push(task);
  }

  call(...args) {
    const [firstTask, ...tasks] = this.tasks;
    const ret = firstTask(...args);
    tasks.reduce((ret, task) => task(ret), ret);
  }
}

class Hook {
  constructor() {
    this.hooks = {
      arch: new SyncWaterfallHook(['name']),
    };
  }

  // 注册监听函数
  tap() {
    this.hooks.arch.tap('node', (name) => {
      console.log('node', name);
      return 'first result';
    });
    this.hooks.arch.tap('react', (data) => {
      console.log('react', data);
      return 'second result';
    });
    this.hooks.arch.tap('vue', (data) => {
      console.log('vue', data);
      return 'last result';
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