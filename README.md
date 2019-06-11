# angular-popup

基于 AngularJS 的浮层组件，由 [angular-popups](https://github.com/aui/angular-popups) 演进而来。angular-popup 是一个严格遵循 AngularJS 架构与 web 标准的组件：

1. 使用 AngularJS 自带的 `ng-if`、`ng-show`、`ng-hide` 控制浮层的显示、销毁
2. 支持 ARIA 规范、无障碍焦点管理、快捷键关闭
3. 完全基于 HTML 标签（指令），无需在控制器中进行配置
4. 可以指定元素或鼠标事件对象（`$event`）对齐
5. 支持模态浮层
