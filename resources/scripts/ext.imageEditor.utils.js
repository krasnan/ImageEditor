(function (mw, $) {
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    window.capitalize = capitalize;

    fabric.Canvas.prototype.getObjectById = function (id) {
        var objects = this.getObjects();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].id === id) return objects[i];
        }
        return null;
    };
    fabric.Object.prototype.getIndex = function () {
        return this.canvas.getObjects().indexOf(this);
    };
    fabric.Object.prototype.isSelected = function () {
        return canvas.getActiveObjects().indexOf(this) >= 0;
    };
    fabric.Object.prototype.set({
        cornerSize: 18,
        cornerColor: '#00a5ff',
        borderColor:'#00a5ff',
        borderScaleFactor: 2,
    });

})(mediaWiki, jQuery);

