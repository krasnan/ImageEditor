(function (global, $) {
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
        r = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
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

    function getFileName() {
        return location.href.search();
    }

    global.getFileName = getFileName;
    global.capitalize = capitalize;
    global.hex2rgb = hex2rgb;
    global.rgb2hex = rgb2hex;

})(this, jQuery);

