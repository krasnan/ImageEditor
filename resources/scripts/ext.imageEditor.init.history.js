function initHistoryManager($scope) {
    HistoryManager = function () {
        var self = this;
        this.undoStack = [];
        this.redoStack = [];
        this.objectBefore = null;

        this.operation = {
            add: 'add',
            modify: 'modify',
            remove: 'remove'
        };

        this.undo = function () {
            if (self.undoStack.length === 0) return;
            let last = self.undoStack.pop();


            if (last.after == null) {
                self.undoRemove(last);
            }

            else if (last.before == null) {
                self.undoAdd(last);
            }

            else {
                self.undoModify(last)
            }

            self.redoStack.push(last);
            console.log("HISTORY undo ",self.undoStack);
        };

        this.redo = function () {
            if (self.redoStack.length === 0) return;

        };

        this.commit = function (operation, objectAfter) {
            if (operation === self.operation.modify && (self.objectBefore === null || objectAfter === null)) return;
            if (operation === self.operation.add && (self.objectBefore !== null || objectAfter === null)) return;
            if (operation === self.operation.remove && (self.objectBefore === null || objectAfter !== null)) return;

            let item = {
                before: self.objectBefore,
                after: objectAfter
            };
            console.log("HISTORY push ",self.undoStack);
            self.undoStack.push(item);
            self.objectBefore = objectAfter;
            self.redoStack = [];
        };

        this.undoRemove = function (objectState) {
            console.log("HISTORY undo Remove ",objectState);

            if (objectState.before.type === 'activeSelection') {
                objectState.before.forEach(function (object) {
                    $scope.addObject(object);
                    object.moveTo(obj.index);
                    $scope.canvas.trigger('object:created', {target: object, fromHistory: true});

                });
            }
            else {
                $scope.addObject(objectState.before);
                objectState.before.moveTo(obj.index);
                $scope.canvas.trigger('object:created', {target: objectState.before, fromHistory: true});
            }
        };

        this.undoAdd = function (objectState) {
            console.log("HISTORY undo add ",objectState);
            if (objectState.after.type === 'activeSelection') {
                objectState.after.forEach(function (object) {
                    $scope.canvas.remove(object);
                    $scope.canvas.trigger('object:removed', {target: object, fromHistory: true});

                });
            }
            else {
                $scope.canvas.remove(objectState.after);
                $scope.canvas.trigger('object:created', {target: objectState.after, fromHistory: true});
            }
        };

        this.undoModify = function (objectState) {
            console.log("HISTORY undo modify ",objectState);
            if (objectState.before.type === 'activeSelection') {
                objectState.before.forEach(function (object) {
                    let obj = $scope.canvas.getObjectById(object.id);
                    if (obj !== null) {
                        object.set(obj);
                        object.moveTo(obj.index);
                        $scope.canvas.trigger('object:modified', {target: object, fromHistory: true});
                    }
                });
            }
            else {
                let object = $scope.canvas.getObjectById(objectState.before.id);
                if (object !== null) {
                    object.set(objectState.before);
                    object.moveTo(objectState.before.index);
                    $scope.canvas.trigger('object:modified', {target: object, fromHistory: true});
                }
            }
        }
    };

    $scope.historyManager = new HistoryManager();
    console.log($scope.historyManager);
}