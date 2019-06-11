/* global require */
// TODO Popup.prompt

'use strict';

var angular = require('angular');
var ngModule = require('../ng-module');

ngModule.provider('Popup', function () {

    var that = this;
    var compiled = false;
    var noop = function () {
    };
    var defaults = {
        title: 'Message',
        okValue: 'Ok',
        cancelValue: 'Cancel'
    };
    var model = {
        open: true,
        title: null,
        content: null,
        duration: null,
        okValue: null,
        cancelValue: null,
        showBtn: true,
        notice: false,
        type: '',
        longShort: "",
        width: '280px',
        height: "120px",
        ok: null,
        cancel: null,
        $destroy: noop,
        $ok: function () {
            if (this.ok && this.ok() !== false) {
                this.open = false;
                this.$destroy();
            }
        },
        $cancel: function () {
            if (this.cancel && this.cancel() !== false) {
                this.open = false;
                this.$destroy();
            }
        },
        $close: function () {
            if (this.cancel) {
                this.$cancel();
            } else {
                this.$ok();
            }
        }
    };

    var sub = {
        close: function () {
            model.$close();
        }
    };

    var baseDialogTpl =
        '<dialog-popup ng-if="$$Popup.open && !$$Popup.notice" duration="{{$$Popup.duration}}" modal fixed close="$$Popup.$close()">' +
        '<div class="ui-dialog">' +
        '<div class="ui-dialog-header">' +
        '<div class="ui-dialog-title" id="{{$dialogId}}-title">{{$$Popup.title}}</div>' +
        '<a class="ui-dialog-close" ng-click="$$Popup.$close()">&times;</span></a>' +
        '</div>' +
        '<div class="ui-dialog-body">' +
        '<div class="messagerWrap messager-{{$$Popup.type}}" ng-style="{width:$$Popup.width,height:$$Popup.height}">' +
        ' <div class="messagerCnt {{$$Popup.longShort}} clear">' +
        ' <div class="messager-icon"><img src="/images/{{$$Popup.type}}.png" width="26"></div>' +
        ' <div class="messager-text">{{$$Popup.content}}</div>' +
        ' </div>' +
        '</div>' +
        '</div>' +
        '<div class="ui-dialog-footer" ng-if="$$Popup.showBtn">' +
        '<div class="ui-dialog-buttons">' +
        '<a class="ui-dialog-btn" ng-if="$$Popup.ok" autofocus ng-click="$$Popup.$ok()">{{$$Popup.okValue}}</a>' +
        '<a class="ui-dialog-btn" ng-if="$$Popup.cancel" ng-click="$$Popup.$cancel()">{{$$Popup.cancelValue}}</a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</dialog-popup>';

    var noticeDialogTpl =
        '<notice ng-if="$$Popup.open && $$Popup.notice" fixed duration="{{$$Popup.duration}}" close="$$Popup.$close()">' +
        '{{$$Popup.content}}' +
        '</notice>';

    angular.extend(this, defaults);

    this.$get = [
        '$compile',
        '$rootScope',
        function ($compile, $rootScope) {

            function createPopup(options) {
                if (!compiled) {
                    var baseDialog = createElement(baseDialogTpl);
                    document.body.appendChild(baseDialog);
                    $compile(baseDialog)($rootScope);

                    var noticeDialog = createElement(noticeDialogTpl);
                    document.body.appendChild(noticeDialog);
                    $compile(noticeDialog)($rootScope);
                    compiled = true;
                }

                if (!options.notice) {
                    var len = options.content.length;
                    if (len > 25) {
                        options.longShort = "";
                        options.width = "400px";
                        options.height = "280px";
                    } else if (len > 15) {
                        options.longShort = "center-long";
                        options.width = "320px";
                        options.height = "140px";
                    } else if (len <= 15) {
                        options.longShort = "center-short";
                        options.width = "320px";
                        options.height = "140px";
                    }
                }
                var dialogModel = Object.create(model);
                dialogModel = angular.extend(dialogModel, that, options);
                dialogModel.$destroy = function () {
                    delete $rootScope.$$Popup;
                };

                $rootScope.$$Popup = dialogModel;

                return sub;
            }

            return {
                alert: function (content, ok) {
                    return createPopup({
                        content: content,
                        ok: ok || noop
                    });
                },
                success: function (content, ok) {
                    return createPopup({
                        content: content,
                        type: 'success',
                        duration: 5000,
                        showBtn: false,
                        ok: ok || noop
                    });
                },
                info: function (content, ok) {
                    return createPopup({
                        content: content,
                        type: 'info',
                        duration: 5000,
                        showBtn: false,
                        ok: ok || noop
                    });
                },
                warning: function (content, ok) {
                    return createPopup({
                        content: content,
                        type: 'warning',
                        showBtn: false,
                        ok: ok || noop
                    });
                },
                fail: function (content, ok) {
                    return createPopup({
                        content: content,
                        type: 'fail',
                        showBtn: false,
                        ok: ok || noop
                    });
                },
                confirm: function (content, ok, cancel) {
                    return createPopup({
                        content: content,
                        ok: ok || noop,
                        cancel: cancel || noop
                    });
                },
                notice: function (content, duration, ok) {
                    return createPopup({
                        content: content,
                        duration: duration || 2000,
                        ok: ok || noop,
                        notice: true
                    });
                }
            };
        }];
});


function createElement(html) {
    var temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.firstChild;
}