/* global require */

'use strict';

require('../css/ui-dialog.css');
var angular = require('angular');
var $ = angular.element;
var directives = require('./directives');

var dialogTpl =
    '<div class="ui-popup" aria-labelledby="{{$dialogId}}-title" aria-describedby="{{$dialogId}}-content">' +
    '<div class="ui-dialog">' +
    '<div class="ui-dialog-header">' +
    '<div class="ui-dialog-title" id="{{$dialogId}}-title">{{htitle}}</div>' +
    '<a class="ui-dialog-close" ng-click="$close()">&times;</span></a>' +
    '</div>' +
    '<div class="ui-dialog-body">' +
    '<div class="ui-dialog-content" id="{{$dialogId}}-content" ng-transclude style="width: {{width}};height: {{height}};"></div>' +
    '</div>' +
    '<div class="ui-dialog-footer">' +
    '<div class="ui-dialog-buttons">' +
    '<a class="ui-dialog-btn" autofocus ng-if="confirmText" ng-click="$confirm()">{{confirmText}}</a>' +
    '<a class="ui-dialog-btn" ng-if="closeText" ng-click="$close()">{{closeText}}</a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

directives.createPopup('dialog', {
    template: dialogTpl,
    link: function (scope, elem, attrs, controller) {
        var node = elem[0];
        scope.$dialogId = 'ui-dialog' + scope.$id;
        scope.$confirm = controller.confirm;
        scope.$close = controller.close;
    }
});

var dialogPopupTpl =
    '<div class="ui-popup" aria-labelledby="{{$dialogId}}-title" aria-describedby="{{$dialogId}}-content" ng-transclude></div>';

directives.createPopup('dialogPopup', {
    template: dialogPopupTpl,
    link: function (scope, elem, attrs, controller) {
        var node = elem[0];
        scope.$dialogId = 'ui-dialog' + scope.$id;
    }
});