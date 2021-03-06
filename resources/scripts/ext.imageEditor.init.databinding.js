function initDatabindings($scope) {

    $scope.getActiveStyle = function (styleName, object) {
        object = object || $scope.canvas.getActiveObject();
        if (!object) return '';

        return (object.getSelectionStyles && object.isEditing)
            ? (object.getSelectionStyles()[styleName] || '')
            : (object[styleName] || '');
    };


    $scope.setActiveStyle = function (styleName, value, object) {
        object = object || $scope.canvas.getActiveObject();
        if (!object) return;
        if (object.setSelectionStyles && object.isEditing) {
            var style = {};
            style[styleName] = value;
            object.setSelectionStyles(style);
            object.setCoords();
        }
        else {
            object.set(styleName, value);
        }
        object.setCoords();
        $scope.canvas.trigger('object:modified', {target: object, properties:[styleName]});
        $scope.canvas.renderAll();
    };

    $scope.setActiveProp = function (name, value) {
        var object = $scope.canvas.getActiveObject();
        if (!object) return;
        object.set(name, value).setCoords();
        $scope.canvas.trigger('object:modified', {target: object, properties:[name]});
        $scope.canvas.renderAll();
    };

    $scope.getActiveProp = function (name) {
        var object = $scope.canvas.getActiveObject();
        if (!object) return '';
        return object[name] || '';
    };

    // -------------------- canvas ---------------------
    $scope.getCanvasHeight = function () {
        return $scope.canvasHeight
    };
    $scope.updateCanvasHeight = function () {
        $scope.canvas.setHeight($scope.canvasHeight * $scope.canvas.getZoom());
        $scope.canvas.trigger('canvas:modified', {target: $scope.canvas});
    };

    $scope.getCanvasWidth = function () {
        return $scope.canvasWidth;
    };
    $scope.updateCanvasWidth = function () {
        $scope.canvas.setWidth($scope.canvasWidth * $scope.canvas.getZoom());
        $scope.canvas.trigger('canvas:modified', {target: $scope.canvas});
    };

    $scope.updateCanvasZoom = function () {
        $scope.canvas.setZoom($scope.canvasZoom/100);
        $scope.updateCanvasDimensions();
    };
    $scope.updateCanvasDimensions = function(){
        $scope.canvas.setDimensions({
            width: $scope.canvasWidth * $scope.canvas.getZoom(),
            height: $scope.canvasHeight * $scope.canvas.getZoom()
        })
    };
    
    
    $scope.getCanvasBgColor = function () {
        return $scope.canvas.backgroundColor;
    };
    $scope.setCanvasBgColor = function (value) {
        $scope.canvas.backgroundColor = value;
        $scope.canvas.renderAll();
        $scope.canvas.trigger('canvas:modified', {target: $scope.canvas});
    };

    // -------------------- object ---------------------
    $scope.getHeight = function () {
        return $scope.getActiveStyle('height') * $scope.getActiveStyle('scaleY');
    };
    $scope.setHeight = function (value) {
        $scope.setActiveStyle('scaleY', parseInt(value, 10) / $scope.getActiveStyle('height'));
    };

    $scope.getAngle = function () {
        return ($scope.getActiveStyle('angle') === 0) ? "0" : $scope.getActiveStyle('angle')+0;
    };
    $scope.setAngle = function (value) {
        $scope.setActiveProp('angle', parseInt(value, 10))
    };

    $scope.getWidth = function () {
        return $scope.getActiveStyle('width') * $scope.getActiveStyle('scaleX');
    };
    $scope.setWidth = function (value) {
        $scope.setActiveStyle('scaleX', parseInt(value, 10) / $scope.getActiveStyle('width'));
    };
    $scope.getTop = function () {
        return $scope.getActiveStyle('top')+0;
    };
    $scope.setTop = function (value) {
        $scope.setActiveStyle('top', parseInt(value, 10));
    };
    $scope.getLeft = function () {
        return $scope.getActiveStyle('left')+0;
    };
    $scope.setLeft = function (value) {
        $scope.setActiveStyle('left', parseInt(value, 10));
    };
    $scope.getOpacity = function () {
        return $scope.getActiveStyle('opacity') * 100;
    };
    $scope.setOpacity = function (value) {
        $scope.setActiveStyle('opacity', parseInt(value, 10) / 100);
    };
    $scope.getRx = function () {
        return $scope.getActiveStyle('rx')+0;
    };
    $scope.setRx = function (value) {
        $scope.setActiveStyle('rx', parseInt(value, 10));
    };
    $scope.getRy = function () {
        return $scope.getActiveStyle('ry')+0;
    };
    $scope.setRy = function (value) {
        $scope.setActiveStyle('ry', parseInt(value, 10));
    };
    $scope.getFill = function () {
        return $scope.getActiveStyle('fill');
    };
    $scope.setFill = function (value) {
        $scope.setActiveStyle('fill', value);
    };

    $scope.getStroke = function () {
        return $scope.getActiveStyle('stroke');
    };
    $scope.setStroke = function (value) {
        $scope.setActiveStyle('stroke', value);
    };

    $scope.getStrokeWidth = function () {
        return $scope.getActiveStyle('strokeWidth')+0;
    };
    $scope.setStrokeWidth = function (value) {
        $scope.setActiveStyle('strokeWidth', parseInt(value, 10));
    };


    //text
    $scope.isBold = function () {
        return $scope.getActiveStyle('fontWeight') === 'bold';
    };
    $scope.toggleBold = function () {
        $scope.setActiveStyle('fontWeight',
            $scope.getActiveStyle('fontWeight') === 'bold' ? '' : 'bold');
    };
    $scope.isItalic = function () {
        return $scope.getActiveStyle('fontStyle') === 'italic';
    };
    $scope.toggleItalic = function () {
        $scope.setActiveStyle('fontStyle',
            $scope.getActiveStyle('fontStyle') === 'italic' ? '' : 'italic');
    };

    $scope.isUnderline = function () {
        return $scope.getActiveStyle('textDecoration').indexOf('underline') > -1;
    };
    $scope.toggleUnderline = function () {
        var value = $scope.isUnderline()
            ? $scope.getActiveStyle('textDecoration').replace('underline', '')
            : ($scope.getActiveStyle('textDecoration') + ' underline');

        $scope.setActiveStyle('textDecoration', value);
        $scope.setActiveStyle('underline', !$scope.getActiveStyle('underline'));
    };

    $scope.isLinethrough = function () {
        return $scope.getActiveStyle('textDecoration').indexOf('linethrough') > -1;
    };
    $scope.toggleLinethrough = function () {
        var value = $scope.isLinethrough()
            ? $scope.getActiveStyle('textDecoration').replace('linethrough', '')
            : ($scope.getActiveStyle('textDecoration') + ' linethrough');

        $scope.setActiveStyle('textDecoration', value);
        $scope.setActiveStyle('linethrough', !$scope.getActiveStyle('linethrough'));

    };
    $scope.isOverline = function () {
        return $scope.getActiveStyle('textDecoration').indexOf('overline') > -1;
    };
    $scope.toggleOverline = function () {
        var value = $scope.isOverline()
            ? $scope.getActiveStyle('textDecoration').replace('overline', '')
            : ($scope.getActiveStyle('textDecoration') + ' overline');

        $scope.setActiveStyle('textDecoration', value);
    };

    $scope.getText = function () {
        return $scope.getActiveProp('text');
    };
    $scope.setText = function (value) {
        $scope.setActiveProp('text', value);
    };

    $scope.getTextAlign = function () {
        return $scope.getActiveProp('textAlign');
    };
    $scope.setTextAlign = function (value) {
        $scope.setActiveProp('textAlign', value.toLowerCase());
    };

    $scope.getFontFamily = function () {
        return $scope.getActiveProp('fontFamily').toLowerCase();
    };
    $scope.setFontFamily = function (value) {
        $scope.setActiveProp('fontFamily', value.toLowerCase());
    };

    $scope.getBgColor = function () {
        return $scope.getActiveProp('backgroundColor');
    };
    $scope.setBgColor = function (value) {
        $scope.setActiveProp('backgroundColor', value);
    };

    $scope.getTextBgColor = function () {
        return $scope.getActiveProp('textBackgroundColor');
    };
    $scope.setTextBgColor = function (value) {
        $scope.setActiveProp('textBackgroundColor', value);
    };

    $scope.getFontSize = function () {
        return $scope.getActiveStyle('fontSize');
    };
    $scope.setFontSize = function (value) {
        $scope.setActiveStyle('fontSize', parseInt(value, 10));
    };

    $scope.getLineHeight = function () {
        return $scope.getActiveStyle('lineHeight');
    };
    $scope.setLineHeight = function (value) {
        $scope.setActiveStyle('lineHeight', parseFloat(value, 10));
    };
    $scope.getCharSpacing = function () {
        return $scope.getActiveStyle('charSpacing');
    };
    $scope.setCharSpacing = function (value) {
        $scope.setActiveStyle('charSpacing', value);
    };

    $scope.getBold = function () {
        return $scope.getActiveStyle('fontWeight');
    };
    $scope.setBold = function (value) {
        $scope.setActiveStyle('fontWeight', value ? 'bold' : '');
    };

    //object advanced
    $scope.getHorizontalLock = function () {
        return $scope.getActiveProp('lockMovementX');
    };
    $scope.setHorizontalLock = function (value) {
        $scope.setActiveProp('lockMovementX', value);
    };

    $scope.getVerticalLock = function () {
        return $scope.getActiveProp('lockMovementY');
    };
    $scope.setVerticalLock = function (value) {
        $scope.setActiveProp('lockMovementY', value);
    };

    $scope.getScaleLockX = function () {
        return $scope.getActiveProp('lockScalingX');
    };
    $scope.setScaleLockX = function (value) {
        $scope.setActiveProp('lockScalingX', value);
    };

    $scope.getScaleLockY = function () {
        return $scope.getActiveProp('lockScalingY');
    };
    $scope.setScaleLockY = function (value) {
        $scope.setActiveProp('lockScalingY', value);
    };

    $scope.getRotationLock = function () {
        return $scope.getActiveProp('lockRotation');
    };
    $scope.setRotationLock = function (value) {
        $scope.setActiveProp('lockRotation', value);
    };

    $scope.getOriginX = function () {
        return $scope.getActiveProp('originX');
    };

    $scope.setOriginX = function (value) {
        $scope.setActiveProp('originX', value);
    };

    $scope.getOriginY = function () {
        return $scope.getActiveProp('originY');
    };
    $scope.setOriginY = function (value) {
        $scope.setActiveProp('originY', value);
    };

    $scope.getObjectCaching = function () {
        return $scope.getActiveProp('objectCaching');
    };

    $scope.setObjectCaching = function (value) {
        return $scope.setActiveProp('objectCaching', value);
    };

    $scope.getNoScaleCache = function () {
        return $scope.getActiveProp('noScaleCache');
    };

    $scope.setNoScaleCache = function (value) {
        return $scope.setActiveProp('noScaleCache', value);
    };

    $scope.getTransparentCorners = function () {
        return $scope.getActiveProp('transparentCorners');
    };

    $scope.setTransparentCorners = function (value) {
        return $scope.setActiveProp('transparentCorners', value);
    };

    $scope.getHasBorders = function () {
        return $scope.getActiveProp('hasBorders');
    };

    $scope.setHasBorders = function (value) {
        return $scope.setActiveProp('hasBorders', value);
    };

    $scope.getHasControls = function () {
        return $scope.getActiveProp('hasControls');
    };

    $scope.setHasControls = function (value) {
        return $scope.setActiveProp('hasControls', value);
    };

    // -------------------- layer management ---------------------
    $scope.sendBackwards = function (object) {
        if (object === undefined)
            object = $scope.canvas.getActiveObject();
        if (object) {
            $scope.canvas.sendBackwards(object);
            $scope.canvas.trigger('object:modified', {target: object, properties:['index']});
        }
    };

    $scope.sendToBack = function (object) {
        if (object === undefined)
            object = $scope.canvas.getActiveObject();
        if (object) {
            $scope.canvas.sendToBack(object);
            $scope.canvas.trigger('object:modified', {target: object, properties:['index']});
        }
    };

    $scope.bringForward = function (object) {
        if (object === undefined)
            object = $scope.canvas.getActiveObject();
        if (object) {
            $scope.canvas.bringForward(object);
            $scope.canvas.trigger('object:modified', {target: object, properties:['index']});
        }
    };

    $scope.bringToFront = function (object) {
        if (object === undefined)
            object = $scope.canvas.getActiveObject();
        if (object) {
            $scope.canvas.bringToFront(object);
            $scope.canvas.trigger('object:modified', {target: object, properties:['index']});
        }
    };
    $scope.applyChanges = function (object) {
        if (object !== undefined)
            $scope.canvas.trigger('object:modified', {target: object, properties:['index']});
    };

    $scope.toggleVisibility = function (object) {
        if (object === undefined)
            object = $scope.canvas.getActiveObject();
        if (object) {
            object.visible = !object.visible;
            $scope.canvas.trigger('object:modified', {target: object, properties:['visible']});
        }
    };
    $scope.toggleLock = function (object) {
        if (object === undefined)
            object = $scope.canvas.getActiveObject();
        if (object) {
            if(!object.lockMovementX
                && !object.lockMovementY
                && !object.lockScalingX
                && !object.lockScalingY
                && !object.lockUniScaling
                && !object.lockRotation)
            {
                object.lockMovementX = object.lockMovementY = object.lockScalingX = object.lockScalingY = object.lockUniScaling = object.lockRotation = true;
            }
            else{
                object.lockMovementX = object.lockMovementY = object.lockScalingX = object.lockScalingY = object.lockUniScaling = object.lockRotation = false;
            }

            $scope.canvas.trigger('object:modified', {target: object, properties:['lockMovementX','lockMovementY','lockScalingX','lockScalingY','lockUniScaling','lockRotation']});
        }
    };

}