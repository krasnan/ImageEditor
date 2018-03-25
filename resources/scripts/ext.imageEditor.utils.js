console.log("utils loaded");

(function (mw, $) {
    $( document ).ready( function () {
        var outer=$('.ie__playground');
        var inner=$('.ie__playground>div');
        // console.log(inner);
        outer.scrollLeft((inner[0].offsetWidth-outer[0].offsetWidth)/2 - 100);
        outer.scrollTop((inner[0].offsetHeight-outer[0].offsetHeight)/2);
    } );

    function rgb2hex(rgb) {
        if (rgb[0] === '#') return rgb;
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
    }

    function hex2rgb(hex) {
        // long version
        var r = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        if (r) {
            return r.slice(1, 4).map(function (x) {
                return parseInt(x, 16);
            });
        }
        // short version
        r = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
        if (r) {
            return r.slice(1, 4).map(function (x) {
                return 0x11 * parseInt(x, 16);
            });
        }
        return null;
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    window.capitalize = capitalize;
    window.hex2rgb = hex2rgb;
    window.rgb2hex = rgb2hex;

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

})(mediaWiki, jQuery);

