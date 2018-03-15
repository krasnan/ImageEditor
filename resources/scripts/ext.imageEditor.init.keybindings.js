function initKeyBindings($scope) {
    $scope.ctrlPressed = false;
    $scope.shiftPressed = false;
    $scope.altPressed = false;


    document.onkeyup = function (e) {
        $scope.ctrlPressed = e.ctrlKey;
        $scope.shiftPressed = e.shiftKey;
        $scope.altPressed = e.altKey;

        var e = window.event ? event : e;

        // console.log(String.fromCharCode(e.keyCode) + " " + e.keyCode);

        if (e.keyCode == 37 && $scope.ctrlPressed) {
            $scope.copy();
        }
        //edit key bindings
        if (e.keyCode == 67 && $scope.ctrlPressed) {
            $scope.copy();
        }
        else if (e.keyCode == 86 && $scope.ctrlPressed) {
            $scope.paste();
        }
        else if (e.keyCode === 88 && $scope.ctrlPressed) {
            $scope.cut();
        }
        // else if (e.keyCode == 68 && e.ctrlKey && e.shiftKey) {
        //     $scope.duplicate();
        // }
        else if (e.keyCode == 68 && $scope.shiftPressed) {
            $scope.duplicate();
        }
        else if (e.keyCode == 46) {
            $scope.deleteSelection();
        }

        // tools key bindings
        else if (e.keyCode == 83) {
            $scope.setActiveTool($scope.tools.select);
        }
        else if (e.keyCode == 80) {
            $scope.setActiveTool($scope.tools.pencil);
        }
        else if (e.keyCode == 76) {
            $scope.setActiveTool($scope.tools.line);
        }
        else if (e.keyCode == 82) {
            $scope.setActiveTool($scope.tools.rectangle);
        }
        else if (e.keyCode == 67) {
            $scope.setActiveTool($scope.tools.circle);
        }
        else if (e.keyCode == 84) {
            $scope.setActiveTool($scope.tools.text);
        }

        //object
        else if (e.keyCode == 38 && $scope.ctrlPressed && $scope.shiftPressed) {
            $scope.bringToFront();
        }
        else if (e.keyCode == 40 && $scope.ctrlPressed && $scope.shiftPressed) {
            $scope.sendToBack();
        }
        else if (e.keyCode == 40 && $scope.ctrlPressed) {
            $scope.sendBackwards();
        }
        else if (e.keyCode == 38 && $scope.ctrlPressed) {
            $scope.bringForward();
        }


        $scope.$apply();
    };

    document.onkeydown = function (e) {
        $scope.ctrlPressed = e.ctrlKey;
        $scope.shiftPressed = e.shiftKey;
        $scope.altPressed = e.altKey;
    };


}