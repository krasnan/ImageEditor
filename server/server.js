var ENDPOINT = process.env.npm_package_config_endpoint;
var DYNAMIC_ENDPOINT = process.env.npm_package_config_dynamic_endpoint;
var PORT = process.env.npm_package_config_port;
var HOST = process.env.npm_package_config_host;

// Setup basic express server
var request = require('request');
var server = require('http').createServer();
var io = require('socket.io')(server);

server.listen(PORT, HOST);
console.log('Running on: ' + HOST + ':' + PORT);
console.log('Running dynamic endpoints: ' + DYNAMIC_ENDPOINT);

var rm = new RoomManager();

io.on('connection', function (socket) {
    query = socket.handshake.query;
    var room;



    if (DYNAMIC_ENDPOINT === "true")
        room = rm.createRoom(query['file'], query['endpoint']);
    else
        room = rm.createRoom(query['file'], ENDPOINT);

    var user = new User(query['name'], socket);

    socket.join(room.name);

    // socket.emit('connection-created', {room: room, user: user});
    room.createUser(user, socket);

    socket.on('message-created', function (message) {
        room.createMessage(message.text, user.id, '*');
    });

    socket.on('canvas-modified', function (properties) {
        room.modifyCanvas(properties, socket);
    });

    socket.on('selection-changed', function (data) {
        room.setSelectable(data.id, data.selectable, user, socket);
    });

    socket.on('object-modified', function (object) {
        room.modifyObject(object, socket);
    });

    socket.on('object-created', function (object) {
        room.createObject(object, socket);
    });

    socket.on('object-removed', function (id) {
        room.removeObject(id, socket);
    });

    socket.on('disconnect', function () {
        room.deselectObjectsBy(user);

        socket.broadcast.to(room.name).emit('user-removed', user);
        socket.leave(room.name);
        room.removeUser(socket.id);
    });
});


function User(name, socket) {
    this.id = socket.id;
    this.name = name;
    this.color = getRandomColor();

    this.getSocket = function () {
        return io.sockets.connected[this.id];
    };

    this.setEditToken = function (token) {
        _token = token;
    };

    this.getEditToken = function () {
        return _token;
    }
}

function Message(text, from, to, type) {
    this.from = from;
    this.to = to;
    this.text = text;
    this.type = type;
    dt = new Date();
    this.time = dt.toLocaleTimeString();
}

function Room(file, endpoint) {
    var self = this;
    this.users = {};
    this.messages = [];
    this.objects = {};
    this.canvas = {width: 1280, height: 720};
    this.format = "png";
    this.loaded = false;
    this.file = file;
    this.endpoint = endpoint;

    this.name = this.endpoint + "_" + this.file;

    this.isEmpty = function () {
        return Object.keys(this.users).length <= 0;
    };

    this.setEndpoint = function (endpoint) {
        this.endpoint = endpoint;
    };

    this.loadFromWiki = function () {
        request.post(
            {
                url: this.endpoint,
                form: {
                    action: 'query',
                    format: 'json',
                    prop: 'imageinfo',
                    titles: this.file,
                    iiprop: 'url|dimensions|metadata|mime'
                }
            },
            function (error, response, body) {
                if (error) {
                    console.log("Unable to connect to: " + this.endpoint);
                    console.log(error);
                    return;
                }
                body = JSON.parse(body);

                var pageId = Object.keys(body.query.pages)[0];
                if (pageId >= 0) {
                    var imageinfo = body.query.pages[pageId].imageinfo[0];
                    self.canvas.width = imageinfo.width;
                    self.canvas.height = imageinfo.height;
                    self.format = imageinfo.mime.split('/')[1];

                    var jsonLoaded = false;

                    for (var i in imageinfo.metadata) {
                        if (imageinfo.metadata[i].name === 'imageEditorContent') {
                            var content = JSON.parse(imageinfo.metadata[i].value);

                            content.objects.forEach(function (obj) {
                                self.objects[obj.id] = obj;
                            });

                            if (content.background !== undefined)
                                self.canvas.backgroundColor = content.background;

                            jsonLoaded = true;
                        }
                    }
                    if (!jsonLoaded) {
                        self.loadObjectImageFromUrl(imageinfo.url);
                    }
                    self.deselectAll();

                }
                self.loaded = true;
                io.in(self.name).emit('init', {
                    room: self
                });
            }
        );
    };

    this.createUser = function (user, socket) {
        this.users[user.id] = user;
        console.log("+ user " + user.name + "(" + user.id + ") added");
        this.createMessage('User ' + user.name + ' connected', 'SYSTEM', '*', 'system');
        io.in(this.name).emit('user-created', this.users[user.id]);

        socket.emit('connected', user);

        if (this.loaded) {
            socket.emit('init', {
                room: this,
            });
        }
    };

    this.removeUser = function (id) {
        if (this.users[id] === undefined) return;

        this.createMessage('User ' + this.users[id].name + ' disconnected', 'SYSTEM', '*', 'system');
        io.in(this.name).emit('user-removed', id);

        delete this.users[id];
        console.log("- user " + id + " deleted");

        if (this.isEmpty())
            rm.removeRoom(this.name);
    };

    this.createMessage = function (text, from, to, type) {
        message = new Message(text, from, to, type);
        this.messages.push(message);
        io.in(this.name).emit('message-created', message);
        // socket.broadcast.to(this.name).emit('message-created', message);
    };

    this.modifyCanvas = function (properties, socket) {
        this.canvas.height = properties.height;
        this.canvas.width = properties.width;
        this.canvas.backgroundColor = properties.backgroundColor;
        socket.broadcast.to(room.name).emit('canvas-modified', this.canvas);
    };

    this.createObject = function (obj, socket) {
        this.objects[obj.id] = obj;
        socket.broadcast.to(room.name).emit('object-created', this.objects[obj.id]);
    };

    this.loadObjectImageFromUrl = function (url) {
        this.objects['loaded_image'] = {
            id: 'loaded_image',
            type: 'image',
            src: url,
            left: 0,
            top: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            index: 0
        }
    };

    this.removeObject = function (id, socket) {
        delete this.objects[id];
        socket.broadcast.to(room.name).emit('object-removed', id);
    };

    this.modifyObject = function (obj, socket) {
        obj.selectable = this.isSelectable(obj.id);
        obj.selectedBy = this.getSelectedBy(obj.id);
        this.objects[obj.id] = obj;
        socket.broadcast.to(this.name).emit('object-modified', this.objects[obj.id]);
    };


    this.isSelectable = function (id) {
        if (this.objects[id] === undefined) {
            return false;
        }
        return this.objects[id].selectable;
    };
    this.getSelectedBy = function (id) {
        if (this.objects[id] === undefined) {
            return undefined;
        }
        return this.objects[id].selectedBy;
    };
    this.deselectObjectsBy = function (user) {
        for (var id in this.objects) {
            var unselected = this.deselectObject(id, user);
            console.log("> unlocking object id: " + id + " user: " + user.id + " unselected: " + unselected);
            if (unselected) {
                io.in(this.name).emit('selection-changed', {id: id, selectable: this.isSelectable(id)});
            }
        }
    };
    this.deselectObject = function (id, user) {
        if (this.getSelectedBy(id) !== user.id) {
            return false;
        }
        else {
            this.objects[id].selectable = true;
            this.objects[id].selectedBy = undefined;

            return true;
        }
    };
    this.selectObject = function (id, user) {
        if (!this.isSelectable(id)) {
            return false;
        }
        else {
            this.objects[id].selectable = false;
            this.objects[id].selectedBy = user.id;
            return true;
        }
    };
    this.setSelectable = function (id, selectable, user, socket) {
        // console.log('selection-changed: ', id, selectable, user);
        // console.log(this.objects);
        var result = false;
        if (selectable)
            result = this.deselectObject(id, user);
        else
            result = this.selectObject(id, user);

        if (result)
            socket.broadcast.to(room.name).emit('selection-changed', {
                id: id,
                selectable: selectable,
                selectedBy: user.id
            });
        else
            socket.emit('selection-deny', id);
    };
    this.deselectAll = function () {
        for (var id in this.objects) {
            this.objects[id].selectable = true;
            this.objects[id].selectedBy = undefined;
        }
    }
}

function RoomManager() {
    this.rooms = [];

    this.isEmpty = function () {
        return Object.keys(this.rooms).length <= 0;
    };

    this.getRoom = function (file, endpoint) {
        return this.rooms[endpoint + "_" + file];
    };

    this.createRoom = function (file, endpoint) {
        room = this.getRoom(file, endpoint);
        if (room === undefined) {
            room = new Room(file, endpoint);
            this.rooms[room.name] = room;

            console.log("+ room " + room.name + " added");
            room.loadFromWiki();
        }
        return room;
    };

    this.removeRoom = function (name) {
        delete this.rooms[name];
        console.log("- room " + name + " deleted");
    }
}


function getRandomColor() {
    var letters = '0123456789ABCDE'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 14)];
    }
    return color;
}

Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};