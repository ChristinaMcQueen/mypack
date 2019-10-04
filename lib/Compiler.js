const fs = require('fs');
const path = require('path');
const babylon = require('babylon');                     // 将源码转换成AST
const t = require('@babel/types');                      // 替换节点
const traverse = require('@babel/traverse').default;    // 遍历节点
const generator = require('@babel/generator').default;  // 生成替换好的结果
const ejs = require('ejs');
const { SyncHook } = require('tapable');

class Compiler {
  constructor(config) {
    this.config = config;

    // 保存入口文件的路径
    this.entryId;

    // 保存所有的模块依赖
    this.modules = {};

    // 入口路径
    this.entry = config.entry;

    // 工作路径
    this.root = process.cwd();

    this.hooks = {
      entryOption: new SyncHook(),
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      afterPlugins: new SyncHook(),
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook(),
    }

    const { plugins } = this.config;
    if (Array.isArray(plugins)) {
      plugins.forEach(plugin => {
        plugin.apply(this);
      });
      this.hooks.afterPlugins.call(this);
    }
  }


  /**
   * @description 获取文件内容
   *
   * @param {*} modulePath
   * @returns
   * @memberof Compiler
   */
  getSource(modulePath) {
    let content = fs.readFileSync(modulePath, 'utf8');

    const { rules } = this.config.module;
    rules.forEach(rule => {
      const { test, use } = rule;
      let len = use.length - 1;
      if (test.test(modulePath)) {
        function normalLoader() {
          const loader = require(use[len--]);
          content = loader(content);
          if (len >= 0) {
            normalLoader();
          }
        }
        normalLoader();
      }
    });
    return content;
  }


  /**
   * @description 解析源码
   *
   * @param {*} source
   * @param {*} parentPath
   * @returns
   * @memberof Compiler
   */
  parse(source, parentPath) { // AST 解析语法树
    const ast = babylon.parse(source);
    const dependencies = [];  // 依赖的数组
    traverse(ast, {
      CallExpression(p) {
        const node = p.node; // 对应的节点
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__';
          let moduleName = node.arguments[0].value; // 模块的引用名字
          moduleName = `${moduleName}${path.extname(moduleName) ? '' : '.js'}`;
          moduleName = `./${path.join(parentPath, moduleName)}`;
          dependencies.push(moduleName);
          node.arguments = [t.stringLiteral(moduleName)];
        }
      }
    });
    const sourceCode = generator(ast).code;
    return { sourceCode, dependencies };
  }


  /**
   * @description 构建模块
   * 
   * @param {*} modulePath
   * @param {*} isEntry     - 是否是入口
   * @memberof Compiler
   */
  buildModule(modulePath, isEntry) {
    // 拿到模块内容
    const source = this.getSource(modulePath);

    // 模块 id
    const moduleName = `./${path.relative(this.root, modulePath)}`;

    // 保存入口的名字
    if (isEntry) {
      this.entryId = moduleName;
    }

    // 解析，需要把source源码进行改造，返回一个依赖列表
    const { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName));

    // 把相对路径和模块中的内容对应起来
    this.modules[moduleName] = sourceCode;

    // 子模块加载
    dependencies.forEach(dep => {
      this.buildModule(path.join(this.root, dep), false);
    });
  }

  /**
   * @description 用数据渲染模版
   * @memberof Compiler
   */
  emitFile() {
    // 输出路径
    const main = path.join(this.config.output.path, this.config.output.filename);

    // 模版路径
    const templateStr = this.getSource(path.join(__dirname, 'main.ejs'));

    const code = ejs.render(templateStr, { entryId: this.entryId, modules: this.modules });

    this.assets = {};
    // 资源中路径对应的代码
    this.assets[main] = code;
    fs.writeFileSync(main, this.assets[main]);
  }

  run() {
    this.hooks.run.call(this);
    this.hooks.compile.call(this);
    // 执行 & 创建模块依赖关系
    this.buildModule(path.join(path.resolve(this.root, this.entry)), true);
    this.hooks.afterCompile.call();

    // 发射一个文件 打包后的文件
    this.emitFile();
    this.hooks.emit.call(this);
    this.hooks.done.call(this);
  }
}

module.exports = Compiler;