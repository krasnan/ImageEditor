(function (mw) {
    'use strict';


    var canvas = new fabric.Canvas('ie__canvas', {preserveObjectStacking: true});
    window.canvas = canvas;

    var app = angular.module('ImageEditor', [
        'colorpicker.module'
    ]);

    app.config(function ($interpolateProvider) {
        $interpolateProvider
            .startSymbol('{[')
            .endSymbol(']}');
    });

    app.directive('bindValueTo', function () {
        return {
            restrict: 'A',

            link: function ($scope, $element, $attrs) {

                var prop = capitalize($attrs.bindValueTo),
                    getter = 'get' + prop,
                    setter = 'set' + prop;

                $element.on('change keyup select', function () {
                    if ($element[0].type !== 'checkbox') {
                        $scope[setter] && $scope[setter](this.value);
                    }
                });

                $element.on('click', function () {
                    if ($element[0].type === 'checkbox') {
                        if ($element[0].checked) {
                            $scope[setter] && $scope[setter](true);
                        }
                        else {
                            $scope[setter] && $scope[setter](false);
                        }
                    }
                });

                $scope.$watch($scope[getter], function (newVal) {
                    if ($element[0].type === 'radio') {
                        var radioGroup = document.getElementsByName($element[0].name);
                        for (var i = 0, len = radioGroup.length; i < len; i++) {
                            radioGroup[i].checked = radioGroup[i].value === newVal;
                        }
                    }
                    else if ($element[0].type === 'checkbox') {
                        $element[0].checked = newVal;
                    }
                    else {
                        $element.val(newVal);
                    }
                });
            }
        };
    });

    app.directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var file = elem[0].files[0];
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        file.dataUri = loadEvent.target.result;
                    };
                    reader.readAsDataURL(file);
                    ngModel.$setViewValue(file);
                })
            }
        }
    });

    app.directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = loadEvent.target.result;
                            console.log(scope.fileread);
                        });
                    };
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }]);

    app.factory('socket', function ($rootScope) {
        var socket;
        return {
            connect: function (url, query) {
                socket = io.connect(url, query);
            },
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });




    app.controller('ImageEditor', function ($scope, $http, $timeout, socket) {

        function updateScope() {
            $scope.$$phase || $scope.$digest();
            $scope.canvas.renderAll();
        }

        $scope.socket = socket;
        $scope.canvas = canvas;
        $scope.mw = mw;

        $scope.canvas
            .on('object:selected', updateScope)
            .on('object:modified', updateScope)
            .on('group:selected', updateScope)
            .on('path:created', updateScope)
            .on('selection:created', updateScope)
            .on('selection:cleared', updateScope)
            .on('selection:updated', updateScope);

        $scope.socketInit = function (serverUrl, serverPort, userName, fileName) {
            $scope.filename = fileName;
            $scope.serverUrl = serverUrl;
            $scope.serverPort = serverPort;
            $scope.userName = userName;

            var server = serverUrl + ':' + serverPort;
            var query = {query: 'name=' + userName + '&room=' + fileName};

            socket.connect(server, query);
            initAccessors($scope);
            initTools($scope, $http, $timeout);
            initEvents($scope);
            initKeyBindings($scope);
            $scope.loaded = true;
        };

    });


}(mediaWiki));
