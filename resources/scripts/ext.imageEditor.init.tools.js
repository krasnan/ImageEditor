function uniqueId() {
    return Math.random().toString(36).substr(2, 16);
}

function initTools($scope, $http, $timeout) {

    $scope.tools = {
        select: 'select',
        brush: 'brush',
        line: 'line',
        rectangle: 'rectangle',
        circle: 'circle',
        ellipse: 'ellipse',
        triangle: 'triangle',
        polygon: 'polygon',
        text: 'text',
        image: 'image'
    };
    $scope.panels = {};
    $scope.room = {
        canvas: {},
        objects: {},
        users: {},
        messages: [],
        loaded: false
    };

    // $scope.canvas = canvas;

    $scope.activeTool = $scope.tools.select;
    $scope.backgroundColor = 'rgba(0,0,0,0)';
    $scope.fillColor = 'rgba(0,0,0,1)';
    $scope.strokeColor = 'rgba(0,0,0,1)';
    $scope.message = "";
    $scope.grid = 5;
    $scope.snapToGrid = false;
    $scope.canvasZoom = 50;
    $scope.canvasWidth = 1280;
    $scope.canvasHeight = 720;

    $scope.updateCanvasZoom();

    $scope.centerViewport = function () {
        var outer = document.getElementsByClassName("ie__playground")[0];
        var inner = document.getElementsByClassName("ie__playground__container")[0];

        outer.scrollLeft = ((inner.offsetWidth - outer.offsetWidth) / 2);
        outer.scrollTop = ((inner.offsetHeight - outer.offsetHeight) / 2);

    };

    $scope.updateIfIdle = function () {
        if ($scope.selectionCahngedTimestamp + 60 * 1000 < Date.now()
            && $scope.canvas.getActiveObjects().length > 0) {
            canvas.discardActiveObject();
        }
        $timeout($scope.updateIfIdle, 1000);
    };

    $timeout($scope.updateIfIdle, 1000);

    $scope.saveRevision = function () {
        //TODO ukladat vo formate podla urlky
        $scope.room.loaded = false;
        var token = $scope.mw.user.tokens.get('editToken');
        var dataUrl;
        if ($scope.room.format === "svg+xml")
            dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent($scope.canvas.toSVG());
        else
            dataUrl = $scope.canvas.toDataURL({format: $scope.room.format, multiplier: 100 / $scope.canvasZoom});

        var file = dataURItoBlob(dataUrl);

        formData = new FormData();
        formData.append("action", "upload");
        formData.append("filename", $scope.mw.util.getParamValue("file"));
        formData.append("token", token);
        formData.append("file", file);
        formData.append("format", "json");
        formData.append("ignorewarnings", true);
        formData.append("comment", JSON.stringify($scope.canvas.toJSON('id', 'index')));

        $http({
            method: "POST",
            url: $scope.mw.util.wikiScript('api'),
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(
            function (value) {
                console.log(value);
                if (value.data.error !== undefined) {
                    $scope.panels.modal = {
                        opened: true,
                        header: $scope.mw.msg("ie-error"),
                        text: $scope.mw.msg("ie-file-save-error") + " " + value.data.error.info,
                        successText: $scope.mw.msg("ie-ok")
                    }
                }
                else {
                    $scope.panels.modal = {
                        opened: true,
                        header: $scope.mw.msg("ie-success"),
                        text: $scope.mw.msg("ie-file-saved-successfully"),
                        successText: $scope.mw.msg("ie-ok")
                    }
                }
                $scope.room.loaded = true;
            },
            function (reason) {
                $scope.panels.modal = {
                    opened: true,
                    header: $scope.mw.msg("ie-error"),
                    text: $scope.mw.msg("ie-file-save-error"),
                    successText: $scope.mw.msg("ie-ok")
                };
                $scope.room.loaded = true;
            }
        );
    };

    function dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {type: mimeString});
    }

    $scope.closeEditor = function (e) {
        $scope.panels.modal = {
            opened: true,
            header: $scope.mw.msg("ie-close-editor-header"),
            text: $scope.mw.msg("ie-close-editor-description"),
            successText: $scope.mw.msg("ie-save-and-close"),
            optionalText: $scope.mw.msg("ie-cancel"),
            cancelText: $scope.mw.msg("ie-close"),
            success: function () {
                $scope.room.loaded = false;
                $scope.saveRevision();
                window.location = $scope.mw.util.wikiScript() + '?title=' + $scope.mw.util.getParamValue("file");
            },
            optional: function () {
            },
            cancel: function () {
                $scope.room.loaded = false;
                window.location = $scope.mw.util.wikiScript() + '?title=' + $scope.mw.util.getParamValue("file");
            }
        };
    };

    $scope.setFreeDrawingBrush = function (type) {
        $scope.brushType = type;
        console.log(type);
        $scope.canvas.freeDrawingBrush = new fabric[type + 'Brush']($scope.canvas);
    };

    $scope.selectAllObjects = function () {
        $scope.canvas.discardActiveObject();
        var sel = new fabric.ActiveSelection($scope.getSelectableObjects(), {
            canvas: $scope.canvas
        });
        if (sel.getObjects().length === 0) return;
        $scope.canvas.setActiveObject(sel);
        $scope.canvas.requestRenderAll();
    };

    $scope.getSelectableObjects = function () {
        return $scope.canvas.getObjects().filter(function (obj) {
            return obj.selectable;
        });
    };

    $scope.setActiveTool = function (tool) {
        $scope.polygon_edit = false;
        $scope.activeTool = tool;
        if ($scope.activeTool === $scope.tools.brush) {
            $scope.canvas.isDrawingMode = true;
            $scope.canvas.discardActiveObject();
        }
        else {
            $scope.canvas.isDrawingMode = false;
        }
    };

    $scope.getStrokeColor = function () {
        if ($scope.canvas.getActiveObject())
            return $scope.getStroke();
        else return $scope.strokeColor;

    };
    $scope.setStrokeColor = function (value) {
        if ($scope.canvas.getActiveObject())
            $scope.setStroke(value);
        else $scope.strokeColor = value;

        $scope.canvas.freeDrawingBrush.strokeColor = value;
    };
    $scope.getFillColor = function (value) {
        if ($scope.canvas.getActiveObject())
            return $scope.getFill(value);
        else return $scope.fillColor;

    };
    $scope.setFillColor = function (value) {
        if ($scope.canvas.getActiveObject())
            $scope.setFill(value);
        else $scope.fillColor = value;

        $scope.canvas.freeDrawingBrush.color = value;
    };
    $scope.deleteSelection = function () {
        var objects = $scope.canvas.getActiveObjects();
        if (objects.length > 0) {
            $scope.panels.modal = {
                opened: true,
                header: "Delete items?",
                text: "Do you want to delete selected items?",
                successText: "Delete",
                cancelText: "Cancel",
                success: function () {
                    objects.forEach(function (object) {
                        $scope.canvas.trigger('object:removed', {target: object});
                        $scope.canvas.remove(object);
                    });
                    $scope.canvas.discardActiveObject();
                },
                cancel: function () {
                }
            };
        }
    };
    $scope.deleteObject = function (object) {
        $scope.panels.modal = {
            opened: true,
            header: "Delete " + object.type + "?",
            text: "Do you want to delete " + object.type + "(" + object.id + ") object?",
            successText: "Delete",
            cancelText: "Cancel",
            success: function () {
                $scope.canvas.remove(object);
                $scope.canvas.trigger('object:removed', {target: object});
            },
            cancel: function () {
            }
        }
    };

    $scope.selectObject = function (object) {
        $scope.canvas.setActiveObject(object);
    };

    $scope.rasterize = function (e, filename) {
        if (!fabric.Canvas.supports('toDataURL')) {
            alert('This browser doesn\'t provide means to serialize canvas to an image');
        }
        else {
            var elem = angular.element(e.currentTarget)[0];
            elem.href = $scope.canvas.toDataURL({format: "png", multiplier: 100 / $scope.canvasZoom});
            elem.download = filename;

        }
    };

    $scope.rasterizeSVG = function (e, filename) {
        var elem = angular.element(e.currentTarget)[0];
        elem.href = 'data:image/svg+xml;utf8,' + encodeURIComponent($scope.canvas.toSVG());
        elem.download = filename;
    };

    $scope.copy = function () {
        $scope.canvas.getActiveObject().clone(function (cloned) {
            $scope._clipboard = cloned;
        });
    };

    $scope.paste = function () {
        // clone again, so you can do multiple copies.
        $scope._clipboard.clone(function (clonedObj) {
            $scope.canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 10,
                top: clonedObj.top + 10,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                // active selection needs a reference to the canvas.
                clonedObj.canvas = $scope.canvas;
                clonedObj.forEachObject(function (obj) {
                    obj.id = uniqueId();
                    $scope.canvas.add(obj);
                });
                // this should solve the unselectability
                clonedObj.setCoords();
            } else {
                clonedObj.id = uniqueId();
                $scope.canvas.add(clonedObj);
            }
            $scope._clipboard.top += 10;
            $scope._clipboard.left += 10;
            $scope.canvas.setActiveObject(clonedObj);
            $scope.canvas.trigger('object:created', {target: clonedObj});
            $scope.canvas.requestRenderAll();
        });
    };

    $scope.duplicate = function () {
        $scope.copy();
        $scope.paste();
    };

    $scope.cut = function () {
        $scope.copy();
        var objects = $scope.canvas.getActiveObjects();
        objects.forEach(function (object) {
            $scope.canvas.trigger('object:removed', {target: object});
            $scope.canvas.remove(object);
        });
    };


    var obj = null, isDown = false, origX = 0, origY = 0;

    $scope.canvas.on('mouse:down', function (o) {
        if ($scope.activeTool !== $scope.tools.select)
            $scope.canvas.selection = false;
        var pointer = $scope.canvas.getPointer(o.e);
        origX = pointer.x;
        origY = pointer.y;
        var pointer = $scope.canvas.getPointer(o.e);
        switch ($scope.activeTool) {
            case $scope.tools.line:
                // obj = $scope.createLine(pointer);
                obj = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                    id: uniqueId(),
                    strokeWidth: 5,
                    stroke: $scope.strokeColor,
                    originX: 'center', originY: 'center'
                });
                break;
            case $scope.tools.rectangle:
                obj = new fabric.Rect({
                    id: uniqueId(),
                    strokeWidth: 0,
                    left: origX,
                    top: origY,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor
                });
                break;
            case $scope.tools.circle:
                obj = new fabric.Circle({
                    id: uniqueId(),
                    strokeWidth: 0,
                    left: origX,
                    top: origY,
                    radius: 1,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor
                });
                break;
            case $scope.tools.ellipse:
                obj = new fabric.Ellipse({
                    id: uniqueId(),
                    strokeWidth: 0,
                    left: origX,
                    top: origY,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor
                });
                break;

            case $scope.tools.text:
                obj = new fabric.Textbox($scope.mw.msg('ie-insert-your-text...'), {
                    id: uniqueId(),
                    strokeWidth: 0,
                    left: origX,
                    top: origY,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor,
                    fontFamily: 'Arial'
                    // originX: 'left'
                });
                break;

            case $scope.tools.triangle:
                obj = new fabric.Triangle({
                    id: uniqueId(),
                    strokeWidth: 0,
                    left: origX,
                    top: origY,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor
                });
                break;
            case $scope.tools.polygon:
                if ($scope.polygon_edit === false) {
                    obj = new fabric.Polygon([{x: origX, y: origY}], {
                        id: uniqueId(),
                        strokeWidth: 0,
                        fill: $scope.fillColor,
                        stroke: $scope.strokeColor,
                        objectCaching: false
                    });
                    $scope.polygon_edit = obj.id;
                }
                else {

                    obj = $scope.canvas.getObjectById($scope.polygon_edit);
                    obj.draggable = false;
                    obj.points.push({x: pointer.x, y: pointer.y});
                    tmp = obj.toObject('selectable', 'selectedBy', 'index');
                    delete tmp.top;
                    delete tmp.left;
                    tmp = new fabric.Polygon(tmp.points, tmp);
                    obj.set(tmp);
                    $scope.canvas.renderAll();
                    $scope.canvas.setActiveObject(obj);
                    $scope.canvas.trigger('object:modified', {target: obj});
                    return;
                }

                break;

            default:
                return false;
        }
        if (obj != null) {
            obj.name = obj.type + "_" + obj.id;

            $scope.canvas.getObjects().forEach(function (obj) {
                obj.lockMovementX = true;
                obj.lockMovementY = true;
            });
            $scope.canvas.add(obj);
            $scope.canvas.trigger('object:created', {target: obj});
            $scope.canvas.setActiveObject(obj);

        }
        isDown = true;
    });


    $scope.canvas.on('mouse:move', function (o) {
        if (!isDown) return;
        var pointer = $scope.canvas.getPointer(o.e);

        if (obj != null) {
            switch (obj.get('type')) {
                case 'rect':
                    if (origX > pointer.x)
                        obj.set({left: Math.abs(pointer.x)});
                    if (origY > pointer.y)
                        obj.set({top: Math.abs(pointer.y)});

                    width = Math.abs((origX - pointer.x));
                    height = Math.abs((origY - pointer.y));
                    if ($scope.shiftPressed) {
                        obj.set({width: Math.max(width, height), height: Math.max(width, height)});
                    }
                    else {
                        obj.set({width: width, height: height});
                    }
                    break;


                case 'circle':
                    x = Math.abs(origX - pointer.x);
                    y = Math.abs(origY - pointer.y);
                    obj.set({radius: Math.max(x, y) / 2});
                    break;

                case 'ellipse':
                    if (origX > pointer.x)
                        obj.set({left: Math.abs(pointer.x)});
                    if (origY > pointer.y)
                        obj.set({top: Math.abs(pointer.y)});

                    rx = Math.abs((origX - pointer.x) / 2);
                    ry = Math.abs((origY - pointer.y) / 2);
                    if ($scope.shiftPressed) {
                        obj.set({rx: Math.max(rx, ry), ry: Math.max(rx, ry)});
                    }
                    else {
                        obj.set({rx: rx, ry: ry});
                    }
                    break;

                case 'line':
                    if ($scope.shiftPressed) {
                        dx = Math.abs(origX - pointer.x);
                        dy = Math.abs(origY - pointer.y);
                        if (dx > dy)
                            obj.set({x2: pointer.x, y2: origY});
                        else
                            obj.set({x2: origX, y2: pointer.y});
                    }
                    else
                        obj.set({x2: pointer.x, y2: pointer.y});

                    break;

                case 'triangle':
                    if (origX > pointer.x)
                        obj.set({left: Math.abs(pointer.x)});
                    if (origY > pointer.y)
                        obj.set({top: Math.abs(pointer.y)});
                    width = Math.abs((origX - pointer.x));
                    height = Math.abs((origY - pointer.y));
                    if ($scope.shiftPressed) {
                        obj.set({width: Math.max(width, height), height: Math.max(width, height)});
                    }
                    else {
                        obj.set({width: width, height: height});
                    }
                    break;

                case 'textbox':
                    if (origX > pointer.x)
                        obj.set({left: Math.abs(pointer.x)});
                    if (origY > pointer.y)
                        obj.set({top: Math.abs(pointer.y)});

                    width = Math.abs((origX - pointer.x));
                    height = Math.abs((origY - pointer.y));
                    if ($scope.shiftPressed) {
                        obj.set({width: Math.max(width, height), height: Math.max(width, height)});
                    }
                    else {
                        obj.set({width: width, height: height});
                    }
                    break;

                default:
                    return;
            }
        }
        $scope.canvas.renderAll();
    });

    $scope.canvas.on('mouse:up', function (o) {
        $scope.canvas.selection = true;
        if (!isDown) return;
        if (obj != null) {
            $scope.canvas.getObjects().forEach(function (obj) {
                obj.lockMovementX = false;
                obj.lockMovementY = false;
            });
            $scope.canvas.trigger('object:modified', {target: obj});
            // canvas.trigger('object:created',{target:obj});
            obj.setCoords();
            if ($scope.activeTool !== $scope.tools.polygon) {
                $scope.setActiveTool($scope.tools.select);
            }
        }
        isDown = false;
        obj = null;
    });

    $scope.loadImage = function (file) {
        var object;
        new fabric.Image.fromURL(file.dataUri, function (obj) {
            obj.id = uniqueId();
            $scope.canvas.add(obj);
            object = obj;
            $scope.canvas.trigger('object:created', {target: obj});
        });
    };

    $scope.toggleFullScreen = function () {
        $scope.isFullscreen = !$scope.isFullscreen;
        if ($scope.isFullscreen) {
            document.getElementById('mw-navigation').style.display = 'none';
        }
        else {
            document.getElementById('mw-navigation').style.display = 'block';
        }
    };

    $scope.addObject = function (object) {
        var obj = undefined;
        switch (object.type) {
            case 'line':
                obj = new fabric.Line([object.x1, object.y1, object.x2, object.y2], object);
                break;
            case 'polygon':
                obj = new fabric.Polygon(object.points, object);
                break;
            case 'textbox':
                obj = new fabric.Textbox(object.text, object);
                break;
            case 'path':
                obj = new fabric.Path(object.path, object);
                break;
            case 'image':
                fabric.Image.fromURL(object.src, function (obj) {
                    obj.id = object.id;
                    obj.name = object.name;
                    obj.set(object);
                    obj.top = object.top;
                    obj.left = object.left;
                    obj.selectable = object.selectable;
                    obj.selectedBy = object.selectedBy;
                    $scope.canvas.add(obj);
                    obj.moveTo(obj.index);
                    return obj;
                });

                return;
            case 'group':
                console.log(object);
                new fabric.Group.fromObject(object, function (obj) {
                    obj.id = object.id;
                    obj.name = object.name;
                    obj.set(object);
                    obj.top = object.top;
                    obj.left = object.left;
                    obj.selectable = object.selectable;
                    obj.selectedBy = object.selectedBy;
                    $scope.canvas.add(obj);
                    obj.moveTo(obj.index);
                    return obj;

                });
                return;

            // break;
            default:
                type = fabric.util.string.camelize(fabric.util.string.capitalize(object.type));
                obj = new fabric[type](object);
                break;
        }
        if (obj !== undefined) {
            obj.id = object.id;
            obj.name = object.name;
            obj.selectable = object.selectable;
            obj.selectedBy = object.selectedBy;
            $scope.canvas.add(obj);
            obj.moveTo(obj.index);
            return obj;
        }
        else {
            return undefined;
        }
    };
    $scope.addFilter = function (obj, index, filter) {
        if (!filter) return;
        f = fabric.util.string.camelize(fabric.util.string.capitalize(filter));
        obj.filters[index] = new fabric.Image.filters[f]({});
        obj.applyFilters($scope.canvas.renderAll.bind($scope.canvas));
    };

    $scope.applyFilterValue = function (obj, index, prop, value) {
        if (obj.filters[index]) {
            obj.filters[index][prop] = value;
            obj.applyFilter();
        }
        obj.applyFilters($scope.canvas.renderAll.bind($scope.canvas));

    };

    $scope.groupSelection = function () {
        obj = $scope.canvas.getActiveObject();
        if (obj.type === 'activeSelection') {
            obj.toGroup();
        }
        $scope.canvas.renderAll();
    };

    $scope.ungroupSelection = function () {
        obj = $scope.canvas.getActiveObject();
        if (obj.type === 'group') {
            obj.ungroupOnCanvas();
            $scope.canvas.renderAll();
        }
    };

    $scope.groupAlign = function (direction, object) {
        if (object === undefined)
            object = $scope.canvas.getActiveObject();

        if (object.type !== 'group' && object.type !== 'activeSelection') return;

        var groupWidth = object.getWidth();
        var groupHeight = object.getHeight();

        object.forEachObject(function (obj) {
            var itemWidth = obj.getBoundingRect().width;
            var itemHeight = obj.getBoundingRect().height;
            switch (direction) {
                case 'vertical-top':
                    obj.set({
                        originY: 'center',
                        top: -groupHeight / 2 + itemHeight / 2
                    });
                    break;
                case 'vertical-center':
                    obj.set({
                        originY: 'center',
                        top: 0
                    });
                    break;
                case 'vertical-bottom':
                    obj.set({
                        originY: 'center',
                        top: groupHeight / 2 - itemHeight / 2
                    });
                    break;
                case 'horizontal-left':
                    obj.set({
                        originX: 'center',
                        left: -groupWidth / 2 + itemWidth / 2
                    });
                    break;
                case 'horizontal-center':
                    obj.set({
                        originX: 'center',
                        left: 0
                    });
                    break;
                case 'horizontal-right':
                    obj.set({
                        originX: 'center',
                        left: groupWidth / 2 - itemWidth / 2
                    });
                    break;
                default:
                    return;
            }
            obj.setCoords();
            $scope.canvas.renderAll();
        });
        $scope.canvas.trigger('object:modified', {target: object});

    };

    $scope.scrollDown = function (elementClass) {
        $timeout(function () {
            var scroller = document.getElementsByClassName(elementClass);
            scroller[0].scrollTop = scroller[0].scrollHeight;
        }, 100, false);
    };

    $scope.sendMessage = function () {
        if ($scope.message === "") return;
        $scope.socket.emit('message-created', {text: $scope.message});
        $scope.message = "";
        $scope.scrollDown('ie__messenger__messages');
    };

    $scope.getLayers = function () {
        return $scope.canvas._objects;
    };
    $scope.reorderLayer = function (object,indexTo) {
        object.moveTo(indexTo);
        $scope.canvas.trigger('object:modified', {target: object});
    }
}