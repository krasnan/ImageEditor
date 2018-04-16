function initKeyBindings($scope) {
    $scope.ctrlPressed = false;
    $scope.shiftPressed = false;
    $scope.altPressed = false;


    document.onkeyup = function (e) {
        let tag = e.target.tagName.toLowerCase();
        if (($scope.canvas.getActiveObject() !== undefined
                && $scope.canvas.getActiveObject() !== null
                && $scope.canvas.getActiveObject().isEditing === true)
            || tag === 'input'
            || tag === 'textarea'
            || tag === 'select'
            || tag === ''
            || tag === 'checkbox'
        ) return;

        $scope.ctrlPressed = e.ctrlKey;
        $scope.shiftPressed = e.shiftKey;
        $scope.altPressed = e.altKey;

        e = window.event ? event : e;

        console.log(String.fromCharCode(e.keyCode) + " " + e.keyCode);

        if (e.keyCode === 37 && $scope.ctrlPressed) {
            $scope.copy();
        }
        //edit key bindings
        if (e.keyCode === 67 && $scope.ctrlPressed) {
            $scope.copy();
        }
        else if (e.keyCode === 86 && $scope.ctrlPressed) {
            $scope.paste();
        }
        else if (e.keyCode === 88 && $scope.ctrlPressed) {
            $scope.cut();
        }
        else if (e.keyCode === 68 && $scope.shiftPressed) {
            $scope.duplicate();
        }
        else if (e.keyCode === 46) {
            $scope.deleteSelection();
        }

        // tools key bindings
        else if (e.keyCode === 83) {
            $scope.setActiveTool($scope.tools.select);
        }
        else if (e.keyCode === 66) {
            $scope.setActiveTool($scope.tools.brush)
        }
        else if (e.keyCode === 76) {
            $scope.setActiveTool($scope.tools.line);
        }
        else if (e.keyCode === 82) {
            $scope.setActiveTool($scope.tools.rectangle);
        }
        else if (e.keyCode === 69) {
            $scope.setActiveTool($scope.tools.ellipse);
        }
        else if (e.keyCode === 84) {
            $scope.setActiveTool($scope.tools.text);
        }
        else if (e.keyCode === 80) {
            $scope.setActiveTool($scope.tools.polygon);
        }
        else if (e.keyCode === 71) {
            $scope.snapToGrid = !$scope.snapToGrid
        }

        //object
        else if (e.keyCode === 38 && $scope.ctrlPressed && $scope.shiftPressed) {
            $scope.bringToFront();
        }
        else if (e.keyCode === 40 && $scope.ctrlPressed && $scope.shiftPressed) {
            $scope.sendToBack();
        }
        else if (e.keyCode === 40 && $scope.ctrlPressed) {
            $scope.sendBackwards();
        }
        else if (e.keyCode === 38 && $scope.ctrlPressed) {
            $scope.bringForward();
        }
        else if (e.keyCode === 27) {
            $scope.canvas.discardActiveObject();
        }


        $scope.$apply();
    };

    document.onkeydown = function (e) {
        $scope.ctrlPressed = e.ctrlKey;
        $scope.shiftPressed = e.shiftKey;
        $scope.altPressed = e.altKey;
    };


}