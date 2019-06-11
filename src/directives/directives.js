/* global require,module */

'use strict';

var angular = require('angular');
var $ = angular.element;
var Popup = require('../lib/popup');
var ngModule = require('../ng-module');
var noop = function () {
};


ngModule.createPopup = function (name, options) {
    return ngModule.directive(name, function () {

        var directive = {
            template: options.template,
            restrict: 'AE',
            transclude: true,
            replace: true,
            scope: {
                'ngIf': '=',
                'ngShow': '=',
                'ngHide': '=',
                'close': '&',
                'confirm': "@",  // 确认回调
                'closeAction': '@', // 关闭对话框的动作
                'for': '@', // 吸附到指定 ID 元素
                'align': '@', // 对齐方式，配合 `for` 才能使用
                'fixed': '@', // 是否固定定位（跟随滚动条）
                'modal': '@', // 是否是模态浮层
                'duration': '@', // 显示持续时间
                'htitle': '=', // 标题
                'width': '@width', // 窗口宽
                'height': '@height', // 窗口高
                'confirmText': '@confirmText', // 确认按钮名称
                'closeText': '@closeText', // 关闭按钮名称
                'otherbtnText': '@otherbtnText', // 第三个按钮名称
                'controller': "@" // 控制器
            },
            controller: ['$scope', function ($scope) {
                // 默认的触发关闭动作
                this.closeAction = ['esc', 'timeout'];

                this.close = function (isUiEvent) {
                    $scope.close();
                    if (isUiEvent) {
                        $scope.$apply();
                    }
                };

                this.confirm = function () {
                    // 通过controller来获取Angular应用
                    var busScope = getScope($scope.controller);
                    if ($scope.controller.indexOf('as') !== -1) {
                        var indexAs = $scope.controller.lastIndexOf('as');
                        busScope[$scope.controller.substring(indexAs + 3)][$scope.confirm]($scope);
                    } else {
                        busScope[$scope.confirm]($scope);
                    }
                }
            }],
            link: function (scope, elem, attrs, controller) {
                var popup = new Popup({
                    node: elem[0],
                    fixed: attrToBoolean(attrs.fixed),
                    align: attrs.align,
                    showElement: noop,
                    hideElement: noop,
                    removeElement: noop
                });

                var temp = fix(elem);
                var $document = $(document);

                if (attrs.closeAction) {
                    controller.closeAction = attrs.closeAction.split(/\s+/);
                }

                // 模型同步UI显示、隐藏事件
                if (attrs.ngIf) scope.$watch('ngIf', change);
                if (attrs.ngShow) scope.$watch('ngShow', change);
                if (attrs.ngHide) scope.$watch('ngHide', function (value) {
                    change(!value);
                });

                // ng 销毁事件控制对话框关闭
                // 控制器销毁或者 ng-if="false" 都可能触发此
                // scope.$on('$destroy', callback) >> 这种方式对 ngAnimate 支持不好
                elem.one('$destroy', function () {
                    change(false);
                    popup.remove();
                    temp.remove();
                    changeElementClass(); // 切换遮罩显示在最顶层弹窗元素
                });

                // UI 的显示与隐藏、删除事件
                function change(open) {

                    var anchor = getAnchor(attrs['for']);

                    if (angular.isUndefined(open)) {
                        return;
                    }

                    if (angular.isObject(open)) {
                        // HTMLElement, Event
                        anchor = open;
                    }

                    if (open) {
                        // 使用 setTimeout 等待 ng-show 在 UI 上生效
                        elem.css('visibility', 'hidden');
                        setTimeout(function () {
                            elem.css('visibility', 'visible');
                            popup[attrToBoolean(attrs.modal) ? 'showModal' : 'show'](anchor);
                            setEvent(open);
                        }, 0);
                    } else {
                        popup.close();
                        setEvent(open);
                    }

                    changeElementClass(); // 切换遮罩显示在最顶层弹窗元素
                }

                function getAnchor(id) {
                    return document.getElementById(id);
                }

                function attrToBoolean(value) {
                    return typeof value === 'string';
                }

                // ESC 快捷键关闭浮层
                function esc(event) {
                    var target = event.target;
                    var nodeName = target.nodeName;
                    var rinput = /^input|textarea$/i;
                    var isBlur = Popup.current === popup;
                    var isInput = rinput.test(nodeName) && target.type !== 'button';
                    var keyCode = event.keyCode;

                    // 避免输入状态中 ESC 误操作关闭
                    if (!isBlur || isInput) {
                        return;
                    }

                    if (keyCode === 27) {
                        controller.close(event);
                    }
                }

                // 外部点击关闭
                function outerclick(event) {
                    if (!elem[0].contains(event.target)) {
                        controller.close(event);
                    }
                }

                // 定时关闭
                function timeout() {
                    if (attrs.duration) {
                        timeout.timer = setTimeout(function () {
                            controller.close(true);
                        }, Number(attrs.duration));
                    }
                }

                function setEvent(open) {
                    controller.closeAction.forEach(function (action) {
                        switch (action) {
                            case 'esc':
                                if (open) {
                                    $document.on('keydown', esc);
                                } else {
                                    $document.off('keydown', esc);
                                }
                                break;
                            case 'timeout':
                                if (open) {
                                    timeout();
                                } else {
                                    clearTimeout(timeout.timer);
                                }
                                break;
                            case 'outerchick':
                                if (open) {
                                    $document
                                        .on('ontouchend', outerclick)
                                        .on('click', outerclick);
                                } else {
                                    $document
                                        .off('ontouchend', outerclick)
                                        .off('click', outerclick);
                                }
                                break;
                            case 'click':
                                //case 'focusout': // Error: [$rootScope:inprog]
                                if (open) {
                                    elem.on(action, controller.close);
                                } else {
                                    elem.off(action, controller.close);
                                }
                                break;
                        }
                    });
                }

                (options.link || function () {
                }).apply(this, arguments);
            }
        };

        angular.extend(directive.scope, options.scope);

        return directive;
    });
};

// scope
function getScope(controller) {
    // 通过controller来获取Angular应用
    var controllerElement = document.querySelector('[ng-controller="' + controller + '"]');
    // 获取$scope变量
    var scope = angular.element(controllerElement).scope();
    return scope;
}

// 切换遮罩显示在最顶层弹窗元素
function changeElementClass() {
    var uiPop = document.querySelectorAll('.ui-popup');
    var len = uiPop.length;
    if (len > 1) {
        for (var i = 0; i < uiPop.length; i++) {
            uiPop[i].classList.remove("ui-popup-modal");
        }
        uiPop[uiPop.length - 1].classList.add("ui-popup-modal");
    } else if (len === 1) {
        uiPop[0].classList.add("ui-popup-modal");
    }
}

// AngularJS(v1.4.8) BUG：
// 如果指令内部把 DOM 节点迁移到 document.body 下，
// 则指令元素的 ng-if 为 false 的时候可能导致其他 popups 节点被 AngularJS 删除
function fix(elem) {
    var temp = document.createElement('popup');
    document.body.appendChild(temp);
    temp.appendChild(elem[0]);
    return $(temp);
}

module.exports = ngModule;