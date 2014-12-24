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

    this.generate = function (startX,startY) {
        this.rooms.reset(this.width, this.height);
        for ( var x=0; x<this.width; x++ ) {
            for ( var y=0; y<this.height; y++ ) {
                this.rooms.set(x,y, new Room(game,x,y,this.roomWidth,this.roomHeight));
            };
        };
        this.rooms.get(startX,startY).tag('START');
        var inMaze = [ this.rooms.get(startX,startY) ];
        var walls = []
        var directions = this.validDirections(startX,startY)
        for ( var i=0; i<directions.length; i++ ) {
            walls.push( [[startX,startY],directions[i]] );
        };

        console.log('Starting maze');
        while (walls.length) {
            var wall = RL.Util.randomChoice(walls);
            var oppositeRoomX = wall[0][0];
            var oppositeRoomY = wall[0][1];
            switch (wall[1]) {
                case 'n':
                    oppositeRoomY -= 1;
                    break;
                case 's':
                    oppositeRoomY += 1;
                    break;
                case 'e':
                    oppositeRoomX += 1;
                    break;
                case 'w':
                    oppositeRoomX -= 1;
                    break;
            };
            if ( inMaze.indexOf(this.rooms.get(oppositeRoomX,oppositeRoomY)) === -1 ) {
                this.rooms.get(wall[0][0],wall[0][1]).tag(wall[1]);
                this.rooms.get(oppositeRoomX,oppositeRoomY).tag(RL.Util.oppositeDirection(wall[1]));
                inMaze.push(this.rooms.get(oppositeRoomX,oppositeRoomY));
                var newWalls = this.validDirections(oppositeRoomX,oppositeRoomY);
                for ( var i=0; i<newWalls.length; i++ ) {
                    walls.push( [[oppositeRoomX,oppositeRoomY],newWalls[i]] );
                };
            };
            walls.splice(walls.indexOf(wall),1);
        };
        console.log('Finished maze');
        for ( var x=0; x<this.width; x++ ) {
            for ( var y=0; y<this.height; y++ ) {
                var roomType = this.roomTypes[0];
                var room = this.rooms.get(x,y)
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
    };
};
