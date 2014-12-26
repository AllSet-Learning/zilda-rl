var Dungeon = function(game, dungeonWidth, dungeonHeight, roomWidth, roomHeight) {
    this.game = game;
    this.width = dungeonWidth;
    this.height = dungeonHeight;
    this.roomWidth = roomWidth;
    this.roomHeight = roomHeight;
    this.tilesWidth  = dungeonWidth*roomWidth;
    this.tilesHeight = dungeonHeight*roomHeight;
    this.rooms = new RL.Array2d(dungeonWidth,dungeonHeight);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET","data/rooms.json",false);
    xmlHttp.send(null);
    this.roomTypes = JSON.parse(xmlHttp.responseText);
    console.log(this.roomTypes);

    this.validDirections = function(roomX, roomY) {
        var directions = ['n','s','e','w'];
        if (roomX===0) {
            directions.splice(directions.indexOf('w'),1);
        };
        if (roomX===this.width-1) {
            directions.splice(directions.indexOf('e'),1);
        };
        if (roomY===0) {
            directions.splice(directions.indexOf('n'),1);
        };
        if (roomY===this.height-1) {
            directions.splice(directions.indexOf('s'),1);
        };
        return directions;
    };

    this.getRoomToDirection = function(fromRoom,direction) {
        newRoomX = fromRoom.x;
        newRoomY = fromRoom.y;
        switch (direction) {
        case 'n':
            newRoomY -= 1;
            break;
        case 's':
            newRoomY += 1;
            break;
        case 'e':
            newRoomX += 1;
            break;
        case 'w':
            newRoomX -= 1;
            break;
        };
        return this.rooms.get(newRoomX,newRoomY);
    };

    this.getAllRooms = function() {
        var roomArray = [];
        for ( var x=0; x<this.width; x++ ) {
            for ( var y=0; y<this.height; y++ ) {
                roomArray.push(this.rooms.get(x,y));
            };
        };
        return roomArray;
    };

    this.getRoomsWithTag = function(tag) {
        var roomsWithTag = [];
        var roomArray = this.getAllRooms();
        console.log('Getting rooms with tag',tag);
        for ( var i=0; i<roomArray.length; i++ ) {
            var room = roomArray[i];
            if (room.hasTag(tag)) {
                console.log('Matched room is start:',room.hasTag('START'));
                roomsWithTag.push(room);
            };
        };
        return roomsWithTag;
    };

    this.tagDeadEnds = function() {
        var roomArray = this.getAllRooms();
        for ( var i=0; i<roomArray.length; i++ ) {
            var room = roomArray[i];
            var connections = room.countConnections();
            if ( !room.hasTag('START') ) {
                if (room.hasTag('START')) { console.log('WARNING: checking connections of start'); };
                if (connections===1) {
                    room.untag('ISOLATED');
                    room.tag('DEADEND');
                } else if (connections===0) {
                    room.untag('DEADEND');
                    room.tag('ISOLATED');
                } else {
                    room.untag('DEADEND');
                    room.untag('ISOLATED');
                };
            };
        };
    };

    this.roomsAreAdjacent = function(room1,room2) {
        return (Math.abs(room1.x-room2.x)+Math.abs(room1.y-room2.y)===1);
    };

    this.roomsAreConnected = function(room1,room2) {
        if (this.roomsAreAdjacent(room1,room2)) {
            if ( (room1.x > room2.x && room1.hasTag('W') && room2.hasTag('E')) ||
                 (room1.x < room2.x && room1.hasTag('E') && room2.hasTag('W')) ||
                 (room1.y > room2.y && room1.hasTag('N') && room2.hasTag('S')) ||
                 (room1.y < room2.y && room1.hasTag('S') && room2.hasTag('N')) ) {
                return true;
            } else { return false; };
        } else { return false; };
    };

    this.connectRooms = function(room1,room2) {
        if (this.roomsAreAdjacent(room1,room2)) {
            if (room1.x > room2.x) {
                room1.tag('W');
                room2.tag('E');
            } else if (room1.x < room2.x) {
                room1.tag('E');
                room2.tag('W');
            } else if (room1.y > room2.y) {
                room1.tag('N');
                room2.tag('S');
            } else if (room1.y < room2.y) {
                room1.tag('S');
                room2.tag('N');
            };
        };
    };

    this.disconnectRooms = function(room1,room2) {
        if (this.roomsAreConnected(room1,room2)) {
            if (room1.x > room2.x) {
                room1.untag('W');
                room2.untag('E');
            } else if (room1.x < room2.x) {
                room1.untag('E');
                room2.untag('W');
            } else if (room1.y > room2.y) {
                room1.untag('N');
                room2.untag('S');
            } else if (room1.y < room2.y) {
                room1.untag('S');
                room2.untag('N');
            };
        };
    };

    this.makeMaze = function(startX,startY) {
        this.rooms.get(startX,startY).tag('START');
        var inMaze = [ this.rooms.get(startX,startY) ];
        var walls = [];
        var directions = this.validDirections(startX,startY);
        for ( var i=0; i<directions.length; i++ ) {
            walls.push( [[startX,startY],directions[i]] );
        };

        console.log('Starting maze');
        while (walls.length) {
            var wall = RL.Util.randomChoice(walls);
            var room = this.rooms.get(wall[0][0],wall[0][1]);
            var toRoom = this.getRoomToDirection(room,wall[1]);
            if ( inMaze.indexOf(toRoom) === -1 ) {
                this.connectRooms(room,toRoom);
                inMaze.push(toRoom);
                var newWalls = this.validDirections(toRoom.x,toRoom.y);
                for ( var i=0; i<newWalls.length; i++ ) {
                    walls.push( [[toRoom.x,toRoom.y],newWalls[i]] );
                };
            };
            walls.splice(walls.indexOf(wall),1);
        };
        console.log('Finished maze');
    };

    this.isolateRoom = function(room) {
        if (room.hasTag('START')) { console.log('WARNING: isolated start'); };
        var directions = this.validDirections(room.x,room.y);
        for ( var i=0; i<directions.length; i++ ) {
            var d = directions[i];
            if (room.hasTag(d)) {
                room.untag(d);
                this.getRoomToDirection(room,d).untag(RL.Util.oppositeDirection(d));
            };
        };
        room.tags=[];
        room.tag('ISOLATED');
    };

    this.attemptNewConnection = function(room) {
        console.log('Connecting room',room.x,room.y);
        var validDirections = this.validDirections(room.x,room.y);
        var madeNewConnection = false;
        while ( (!madeNewConnection) && (validDirections.length) ) {
            var direction = RL.Util.randomChoice(validDirections);
            console.log('Trying direction',direction);
            validDirections.splice(validDirections.indexOf(direction),1);
            if (!room.hasTag(direction)) {
                var toRoom = this.getRoomToDirection(room,direction);
                if ( !toRoom.hasTag('ISOLATED') ) {
                    console.log('Success');
                    this.connectRooms(room,toRoom);
                } else {
                    console.log('Canceled connection to isolated room');
                };
            } else {console.log('Already connected to',direction);};
        };
    };


    this.digRooms = function() {
        var roomArray = this.getAllRooms();
        for ( var i=0; i<roomArray.length; i++ ) {
            var roomType = this.roomTypes[0];
            var room = roomArray[i];
            room.loadTilesFromArrayString(roomType.mapData,roomType.charToTileType,'floor');
            if (!room.hasTag('n')) {
                var roomY=0;
                for ( var roomX=0; roomX<room.width; roomX++ ) {
                    room.map.set(roomX,roomY,'wall');
                };
            };
            if (!room.hasTag('s')) {
                var roomY=room.height-1;
                for ( var roomX=0; roomX<room.width; roomX++ ) {
                    room.map.set(roomX,roomY,'wall');
                };
            };
            if (!room.hasTag('e')) {
                var roomX=room.width-1;
                for ( var roomY=0; roomY<room.height; roomY++ ) {
                    room.map.set(roomX,roomY,'wall');
                };
            };
            if (!room.hasTag('w')) {
                var roomX=0;
                for ( var roomY=0; roomY<room.height; roomY++ ) {
                    room.map.set(roomX,roomY,'wall');
                };
            };
        };
    };

    this.generate = function(startX,startY) {
        this.rooms.reset(this.width, this.height);
        for ( var x=0; x<this.width; x++ ) {
            for ( var y=0; y<this.height; y++ ) {
                this.rooms.set(x,y, new Room(game,x,y,this.roomWidth,this.roomHeight));
            };
        };
        this.makeMaze(startX,startY);
        //handle dead ends
        this.tagDeadEnds();
        var deadEnds = this.getRoomsWithTag('DEADEND');
        RL.Util.shuffle(deadEnds);
        for ( var i=0; i<deadEnds.length; i++ ) {
            if (deadEnds[i].hasTag('START')) {
                console.log('WARNING: start tagged as dead end');
            };
        };
        //delete some dead ends
        for ( var i=0; i<deadEnds.length/2; i++ ) {
            var room = deadEnds[i];
            this.isolateRoom(room);
        };
        this.tagDeadEnds();
        deadEnds = this.getRoomsWithTag('DEADEND');
        RL.Util.shuffle(deadEnds);
        //connect remaining dead ends
        for ( var i=0; i<deadEnds.length/2; i++ ) {
            var room = deadEnds[i];
            this.attemptNewConnection(room);
        };
        this.tagDeadEnds();
        this.digRooms();
        console.log(this.getRoomsWithTag('START')[0].tags);
    };
};
