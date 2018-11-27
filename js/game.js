const $ = id => document.getElementById(id);

let map = [];
let mapWidth = 0;
let mapHeight = 0;
const miniMapScale = 24; // scales the entire game

let pointsString = "000000";
let points = 0;
const diamondScore = 1;
let diamondsCollected = 0;
let countdown = 150;

let rockfordX = 1;
let rockfordY = 2;
let rockfordSpriteID = 1;

let time = 0;
let currentKeyPressed = 0;

var sprite = new Image();
sprite.src = "images/sprite.png";
const sprSize = 32;
const charHeight = 16;

const MAPTILE = {
    BLACK: 0,
    TITANIUM_WALL: 1,
    tile: 2,
    DIRT: 3,
    BOULDER: 4,
    DIAMOND: 5,
    ROCKFORD: 6
};

const MOVE = {
    LEFT: -1,
    RIGHT: +1
};

const KEYS = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
}

const boulderdash = {
    init() {
        boulderdash.setup();

        setInterval(() => {
            boulderdash.drawMap();
            boulderdash.objectFalling();
            rockfordSpriteID = 1;
            if (currentKeyPressed === KEYS.LEFT) {
                boulderdash.moveLeft();
            }
            if (currentKeyPressed === KEYS.UP) {
                boulderdash.moveUp();
            }
            if (currentKeyPressed === KEYS.RIGHT) {
                boulderdash.moveRight();
            }
            if (currentKeyPressed === KEYS.DOWN) {
                boulderdash.moveDown();
            }
            currentKeyPressed = 0;
            time++;
        }, 80);
    },
    setup() {
        map = level[2];
        mapWidth = map[0].length;
        mapHeight = map.length;
    },
    drawMap() {
        let locX = 0;
        let locY = 0;

        const miniMap = $("minimap");
        miniMap.width = mapWidth * miniMapScale;
        miniMap.height = mapHeight * miniMapScale;

        miniMap.style.width = `${mapWidth * miniMapScale}px`;
        miniMap.style.height = `${mapHeight * miniMapScale}px`;
        const ctx = miniMap.getContext("2d");

        let n = points % 10;
        let scoreX = 14 * miniMapScale
        //score
        pointsString = points.toString().padStart(6, '0');
        ctx.drawImage(sprite, 8 * sprSize, (16 + n) * charHeight, sprSize, charHeight,
            scoreX, 0, miniMapScale, miniMapScale / 2);

        for (y = 1; y < mapHeight; y++) {//optimize: don't redraw frame?
            for (x = 0; x < mapWidth; x++) {
                const tile = map[y][x];
                locX = x * miniMapScale;
                locY = y * miniMapScale;
                if (mapTile.isBlack(tile)) {
                    ctx.fillStyle = "rgb(000,000,000)";
                    ctx.fillRect(x * miniMapScale, y * miniMapScale, miniMapScale, miniMapScale);
                }
                else if (mapTile.isTitaniumWall(tile)) {
                    ctx.drawImage(sprite, 1 * sprSize, 6 * sprSize, sprSize, sprSize,
                        locX, locY, miniMapScale, miniMapScale);
                }
                else if (mapTile.isWall(tile)) {
                    ctx.drawImage(sprite, 3 * sprSize, 6 * sprSize, sprSize, sprSize,
                        locX, locY, miniMapScale, miniMapScale);
                }
                else if (mapTile.isDirt(tile)) {
                    ctx.drawImage(sprite, 1 * sprSize, 7 * sprSize, sprSize, sprSize,
                        locX, locY, miniMapScale, miniMapScale);
                }
                else if (mapTile.isBoulder(tile)) {
                    ctx.drawImage(sprite, 0 * sprSize, 7 * sprSize, sprSize, sprSize,
                        locX, locY, miniMapScale, miniMapScale);
                }
                else if (mapTile.isDiamond(tile)) {
                    ctx.drawImage(sprite, (time % 8) * sprSize, 10 * sprSize, sprSize, sprSize,
                        locX, locY, miniMapScale, miniMapScale);
                }
                else if (mapTile.isRockford(tile)) {
                    ctx.drawImage(sprite, (time % 8) * sprSize, rockfordSpriteID * sprSize, sprSize, sprSize,
                        rockfordX * miniMapScale, rockfordY * miniMapScale, miniMapScale, miniMapScale
                    );
                }
            }
        }

    },
    moveLeft() {
        if (mapTile.isObstacle(rockfordX - 1, rockfordY, MOVE.LEFT))
            return;
        boulderdash.moveBoulder(rockfordX - 1, rockfordY, MOVE.LEFT);
        map[rockfordY][rockfordX] = MAPTILE.BLACK;
        rockfordX--;
        map[rockfordY][rockfordX] = MAPTILE.ROCKFORD;
        rockfordSpriteID = 4;
    },
    moveRight() {
        if (mapTile.isObstacle(rockfordX + 1, rockfordY, MOVE.RIGHT))
            return;
        boulderdash.moveBoulder(rockfordX + 1, rockfordY, MOVE.RIGHT);
        map[rockfordY][rockfordX] = MAPTILE.BLACK;
        rockfordX++;
        map[rockfordY][rockfordX] = MAPTILE.ROCKFORD;
        rockfordSpriteID = 5;
    },
    moveUp() {
        if (mapTile.isObstacle(rockfordX, rockfordY - 1))
            return;
        map[rockfordY][rockfordX] = MAPTILE.BLACK;
        rockfordY--;
        map[rockfordY][rockfordX] = MAPTILE.ROCKFORD;
    },
    moveDown() {
        if (mapTile.isObstacle(rockfordX, rockfordY + 1))
            return;
        map[rockfordY][rockfordX] = MAPTILE.BLACK;
        rockfordY++;
        map[rockfordY][rockfordX] = MAPTILE.ROCKFORD;
    },
    objectFalling() {
        for (y = mapHeight - 3; y >= 0; y--) {
            for (x = mapWidth - 1; x >= 0; x--) {
                const currentTile = map[y][x];
                const tileBelow = map[y + 1][x];
                const tileBelower = map[y + 2][x];
                const tileNextToLeft = map[y][x - 1];
                const tileNextToRight = map[y][x + 1];
                const tileBelowLeft = map[y + 1][x - 1];
                const tileBelowRight = map[y + 1][x + 1];
                const isBoulderOrDiamond = mapTile.isBoulder(currentTile) || mapTile.isDiamond(currentTile);
                const isBoulderOrDiamondBelow = mapTile.isBoulder(tileBelow) || mapTile.isDiamond(tileBelow);

                // This kills the rockford
                if (isBoulderOrDiamond && mapTile.isBlack(tileBelow) && mapTile.isRockford(tileBelower)) {
                    map[rockfordY][rockfordX] = MAPTILE.tile;
                }
                // If current tile is boulder and the tile below it is black, the boulder can fall down
                else if (isBoulderOrDiamond && mapTile.isBlack(tileBelow)) {
                    map[y][x] = MAPTILE.BLACK;
                    map[y + 1][x] = currentTile;
                }
                // If current tile AND tile below is boulder/diamond AND tile below and to the left is black
                else if (isBoulderOrDiamond && isBoulderOrDiamondBelow && mapTile.isBlack(tileNextToLeft) && mapTile.isBlack(tileBelowLeft)) {
                    map[y][x] = MAPTILE.BLACK;
                    map[y + 1][x - 1] = currentTile;
                }
                // If current tile AND tile below is boulder/diamond AND tile below and to the right is black
                else if (isBoulderOrDiamond && isBoulderOrDiamondBelow && mapTile.isBlack(tileNextToRight) && mapTile.isBlack(tileBelowRight)) {
                    map[y][x] = MAPTILE.BLACK;
                    map[y + 1][x + 1] = currentTile;
                }
            }
        }
    },
    moveBoulder(positionX, positionY, direction) {
        const status = map[positionY][positionX];
        const tileNextTo = map[positionY][positionX + direction];
        if (mapTile.canPush(status, tileNextTo)) {
            map[positionY][positionX + direction] = MAPTILE.BOULDER;
        }
    },
};

const mapTile = {
    isBlack(tile) {
        return tile === MAPTILE.BLACK;
    },
    isTitaniumWall(tile) {
        return tile === MAPTILE.TITANIUM_WALL;
    },
    isWall(tile) {
        return tile === MAPTILE.tile;
    },
    isDirt(tile) {
        return tile === MAPTILE.DIRT;
    },
    isBoulder(tile) {
        return tile === MAPTILE.BOULDER;
    },
    isDiamond(tile) {
        return tile === MAPTILE.DIAMOND;
    },
    isRockford(tile) {
        return tile === MAPTILE.ROCKFORD;
    },
    isObstacle(positionX, positionY, direction) {
        const currentTile = map[positionY][positionX];
        const tileNextTo = map[positionY][positionX + direction]
        if (mapTile.isDiamond(currentTile)) {
            points += diamondScore;
        }

        if (mapTile.isBlack(currentTile) ||
            mapTile.isDirt(currentTile) ||
            mapTile.isDiamond(currentTile) ||
            mapTile.canPush(currentTile, tileNextTo)) {
            return false;
        }

        return true;
    },
    canPush(tile, tileNextTo) {
        return mapTile.isBoulder(tile) && mapTile.isBlack(tileNextTo);
    },
}

window.addEventListener('keydown', event => {
    switch (event.keyCode) {
        case KEYS.LEFT:
            currentKeyPressed = KEYS.LEFT;
            break;

        case KEYS.UP:
            currentKeyPressed = KEYS.UP;
            break;

        case KEYS.RIGHT:
            currentKeyPressed = KEYS.RIGHT;
            break;

        case KEYS.DOWN:
            event.preventDefault();
            currentKeyPressed = KEYS.DOWN;
            break;
    }
}, false);

setTimeout(boulderdash.init, 1);
