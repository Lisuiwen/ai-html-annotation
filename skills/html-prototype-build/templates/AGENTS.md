# 原型交接

本目录只提供产品原型信息，不是生产代码模板。实现时遵循目标前后端工程的规范。

## 读取顺序

1. 先读 `prototype/notes.snapshot.js`：
   - `state`：基础状态；
   - `activeScenario`、`scenarios`：默认场景和场景差异；
   - `cards[].when`：说明适用的状态；
   - `cards[].title`、`cards[].body`：功能、交互和结果；
   - `cards[].target.anchor`：局部页面锚点。
2. 再看 `screenshots/` 中当前场景的截图，理解页面分区、层级、可见内容和相对关系。
3. 只有前两项不足时，才按 `target.anchor` 定位 `prototype.html` 的最小局部范围，核对可见文案、字段关系或局部结构。

未被当前场景说明覆盖的业务规则视为未定义；查阅需求资料或澄清，不得补推。

## 禁止参考

不得读取、复制或迁移原型实现：

- `prototype.html` 的整体 DOM、class 和属性组织；
- `prototype/prototype.css`、`prototype/prototype.js`；
- `prototype/` 中的运行时文件、Mock 数据、Mock 交互和状态模型。

截图只表达视觉和结构意图；组件、样式、响应式、无障碍、接口、校验、权限、状态管理和测试均以目标工程规范为准。
