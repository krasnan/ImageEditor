function initEvents($scope) {
    // ------------ Socket event listeners - START ------------
    $scope.socket.on('connected', function (user) {
        // console.log('SOCKET: connected', user);

        $scope.user = user;
        $scope.loadingMessage = "";
    });

    $scope.socket.on('init', function (data) {
        console.log('SOCKET: init', data);
        $scope.canvas.clear();
        $scope.room = data.room;
        $scope.canvasWidth = data.room.canvas.width;
        $scope.canvasHeight = data.room.canvas.height;
        $scope.updateCanvasZoom();
        $scope.canvas.setBackgroundColor(data.room.canvas.backgroundColor);

        for (let key in $scope.room.objects) {
            if ($scope.room.objects.hasOwnProperty(key)) {
                $scope.addObject($scope.room.objects[key]);
            }
        }
        $scope.canvas.getObjects().forEach(function (obj) {
            obj.moveTo(obj.index);
        });
        $scope.centerViewport();
    });

    $scope.socket.on('user-created', function (user) {
        //console.log('SOCKET: user-created');
        $scope.room.users[user.id] = user;
    });

    $scope.socket.on('user-removed', function (id) {
        //console.log('SOCKET: user-removed');
        delete $scope.room.users[id];
    });

    $scope.socket.on('message-created', function (message) {
        //console.log('SOCKET: message-created');
        // //console.log(message);
        $scope.room.messages.push(message);
        $scope.room.newMessage = true;
        $scope.scrollDown('ie__messenger__messages');
    });

    $scope.socket.on('selection-changed', function (data) {
        //console.log('SOCKET: selection-changed');
        var obj = $scope.canvas.getObjectById(data.id);
        obj.selectable = data.selectable;
        obj.editable = data.selectable;
        obj.selectedBy = data.selectedBy;
    });

    $scope.socket.on('selection-deny', function (id) {
        //TODO: if selection denied, than force unselect object with by id
        console.log('SOCKET: selection-deny');
    });

    $scope.socket.on('object-modified', function (obj) {
        //console.log('SOCKET: object-modified');
        var object = $scope.canvas.getObjectById(obj.id);
        if (object !== null) {
            if (object.type === 'polygon' && object.points.length !== obj.points.length) {
                delete obj.top;
                delete obj.left;
                obj = new fabric.Polygon(obj.points, obj);
            }
            object.animate(
                {
                    left: obj.left,
                    top: obj.top,
                    scaleX: obj.scaleX,
                    scaleY: obj.scaleY,
                    angle: obj.angle
                }, {
                    duration: 500,
                    onChange: function () {
                        object.setCoords();
                        $scope.canvas.renderAll();
                    },
                    easing: fabric.util.ease['easeInOutCubic']
                }
            );
            object.set(obj);
            object.moveTo(obj.index);
        }
        else {
            object = $scope.addObject(obj);
        }
    });

    $scope.socket.on('object-created', function (obj) {
        //console.log('SOCKET: object-created');
        var object = $scope.addObject(obj);
        if (object === undefined) return;
        object.setCoords();
        $scope.canvas.renderAll();
        object.moveTo(object.index);

    });

    $scope.socket.on('object-removed', function (id) {
        //console.log('SOCKET: object-removed');
        var object = $scope.canvas.getObjectById(id);
        $scope.canvas.remove(object);
        $scope.canvas.renderAll();
    });

    $scope.socket.on('canvas-modified', function (properties) {
        //console.log('SOCKET: canvas-modified');
        $scope.canvasWidth = parseInt(properties.width, 10);
        $scope.canvasHeight = parseInt(properties.height, 10);
        $scope.updateCanvasZoom();
        $scope.canvas.backgroundColor = properties.backgroundColor;
        $scope.canvas.renderAll();
    });
    // ------------ Socket event listeners - END ------------


    // ------------ Canvas event listeners - START ------------
    $scope.canvas.on('selection:created', function (event) {
        //console.log('CANVAS: selection:created');
        // $scope.historyManager.objectBefore = $scope.canvas.getActiveObject().toJSON(['id', 'index', 'name']);
        event.selected.forEach(function (obj) {
            $scope.socket.emit('selection-changed', {id: obj.id, selectable: false});
        });
    });

    $scope.canvas.on('selection:updated', function (event) {
        //console.log('CANVAS: selection:updated');
        // $scope.historyManager.objectBefore = $scope.canvas.getActiveObject().toJSON(['id', 'index', 'name']);
        event.selected.forEach(function (obj) {
            $scope.socket.emit('selection-changed', {id: obj.id, selectable: false});
        });
        event.deselected.forEach(function (obj) {
            $scope.socket.emit('selection-changed', {id: obj.id, selectable: true});
        });
    });

    $scope.canvas.on('selection:cleared', function (event) {
        //console.log('CANVAS: selection:cleared');
        // $scope.historyManager.objectBefore = null;
        if (event.deselected === undefined) return;
        event.deselected.forEach(function (obj) {
            $scope.socket.emit('selection-changed', {id: obj.id, selectable: true});
        });
    });

    $scope.canvas.on('object:modified', function (event) {
        //console.log('CANVAS: object:modified', event);
        // if (!event.fromHistory)
        //     $scope.historyManager.commit($scope.historyManager.operation.modify ,event.target);
        var object = event.target;
        var properties = event.properties;
        if (object.type === "activeSelection") {
            var group = object;
            for (var i = group._objects.length - 1; i >= 0; i--) {
                var obj = group._objects[i];
                obj.index = obj.getIndex();
                group.removeWithUpdate(obj);

                $scope.socket.emit('object-modified', toJSONbaseWithParams(obj, properties));
                group.addWithUpdate(obj);
            }
        }
        else {
            object.index = object.getIndex();
            $scope.socket.emit('object-modified', toJSONbaseWithParams(object, properties));
        }
    });


    function toJSONbaseWithParams(obj, propertiesToInclude) {
        if (propertiesToInclude === undefined || true) return obj.toJSON(['id', 'selectable', 'index', 'name']);
        var serialized = {
            id: obj.id,
            type: obj.type,
            left: obj.left,
            top: obj.top,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
            index: obj.index
        };
        propertiesToInclude.forEach(function (p) {
            serialized[p] = obj[p];
        });
        return serialized;
    }

    $scope.canvas.on('object:created', function (event) {
        //console.log('CANVAS: object:created');
        // if (!event.fromHistory)
        //     $scope.historyManager.commit($scope.historyManager.operation.add ,event.target);
        let obj = event.target;
        obj.index = obj.getIndex();
        $scope.socket.emit('object-created', obj.toJSON(['id', 'selectable', 'index', 'name']));


    });

    $scope.canvas.on('object:removed', function (event) {
        //console.log('CANVAS: object:removed');
        // if (!event.fromHistory)
        //     $scope.historyManager.commit($scope.historyManager.operation.remove ,event.target);
        let obj = event.target;
        if (obj.type === "activeSelection") {
            objects.forEach(function (object) {
                $scope.socket.emit('object-removed', object.id);
            });
        }
        else
            $scope.socket.emit('object-removed', obj.id);
    });

    $scope.canvas.on('canvas:modified', function (event) {
        $scope.socket.emit('canvas-modified', {
            width: $scope.getCanvasWidth(),
            height: $scope.getCanvasHeight(),
            backgroundColor: $scope.canvas.backgroundColor
        })
    });

    $scope.canvas.on('path:created', function (event) {
        //console.log('CANVAS: path:created');
        let object = event.path;
        object.index = object.getIndex();
        object.id = uniqueId();
        object.name = "path_" + object.id;
        $scope.socket.emit('object-created', object.toJSON(['id', 'selectable', 'index', 'name']));
    });

    $scope.canvas.on('object:moving', function (options) {
        if ($scope.snapToGrid) {
            options.target.set({
                left: Math.round(options.target.left / ($scope.grid / $scope.canvas.getZoom())) * ($scope.grid / $scope.canvas.getZoom()),
                top: Math.round(options.target.top / ($scope.grid / $scope.canvas.getZoom())) * ($scope.grid / $scope.canvas.getZoom())
            });
        }
    });

    $scope.canvas.on('mouse:wheel', function (event) {
        if (!$scope.ctrlPressed) return;
    });

    $scope.canvas.on('mouse:over', function (e) {
        if (e.target == null) return;
        if (!e.target.selectable) {
            var obj = e.target,
                objectLeft = obj.getBoundingRect().left + obj.getBoundingRect().width / 2,
                objectTop = obj.getBoundingRect().top,
                element = document.getElementsByClassName('ie__user__bubble')[0],
                canvas = document.getElementById('ie__canvas');

            element.textContent = $scope.room.users[obj.selectedBy].name;
            element.style.backgroundColor = $scope.room.users[obj.selectedBy].color;
            element.style.left = canvas.offsetParent.offsetLeft + objectLeft + 'px';
            element.style.top = canvas.offsetParent.offsetTop + objectTop + 'px';
            element.style.visibility = 'visible';
            element.style.opacity = 1;
        }
    });

    $scope.canvas.on('mouse:out', function (e) {
        if (e.target == null) return;
        element = document.getElementsByClassName('ie__user__bubble')[0];
        element.style.visibility = 'hidden';
        element.style.opacity = 0;
    });
    // ------------ Canvas event listeners - END ------------

    // ------------ Window event listeners - START ------------
    $scope.onPlaygroundClick = function (e) {
        if (e.target.className === 'ie__playground__container') {
            $scope.canvas.discardActiveObject();
        }
    };

    function beforeunload() {
        alert("confirm exit is being called");
        return false;
    }

    window.onbeforeunload = beforeunload;

    // ------------ Window event listeners - END ------------


}