# UI 包目录

## 可用包

- `antd-admin`：Ant Design 风格的桌面中后台 UI，提供 foundation、navigation、form、data、feedback。

## 选择规则

1. 每个原型必须且只能选择一个 foundation。
2. navigation、form、data、feedback 等类别各最多选择一个 provider。
3. provider 必须在自身 `PACK.md` 中声明兼容当前 foundation。
4. 用户材料能够确定 UI 类型时选择对应包；无法确定时先询问，禁止默认套用任一视觉体系。
5. Addon 不属于 UI provider，可在不改变产品视觉 Token 的前提下按需叠加。

## 当前组合

当前仅有一个完整包：

```text
foundation: antd-admin
navigation: antd-admin
form: antd-admin
data: antd-admin
feedback: antd-admin
addons: 按需求选择
```

新增 UI 包时只登记能力和兼容关系，不修改共享生成流程。
