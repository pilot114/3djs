var Maze = function (options) {
    for (var p in options) {
        this[p] = options[p];
    }
};


Maze.prototype = {
    constructor: Maze,

    width: 0,
    height: 0,
    grid: null,

    currentDir: 0,
    currentDirCount: 0,

    currentNode: null,
    startNode: null,
    endNode: null,

    alwaysBacktrace: false,

    init: function () {
        this.trace = [];

        this.size = this.width * this.height;
        this.initGrid();
        this.onInit();
    },

    initGrid: function () {
        var grid = this.grid = [];
        for (var r = 0; r < this.height; r++) {
            var row = [];
            grid.push(row);
            for (var c = 0; c < this.width; c++) {
                var node = {
                    x: c,
                    y: r,
                    value: 0,
                };
                row.push(node);
            }
        }

    },

    onInit: function () {
    },

    random: function (min, max) {
        return ((max - min + 1) * Math.random() + min) >> 0;
    },
    getNode: function (c, r) {
        return this.grid[r][c];
    },
    getRandomNode: function () {
        var r = this.random(0, this.height - 1);
        var c = this.random(0, this.width - 1);
        return this.grid[r][c];
    },
    setMark: function (node, value) {
        return node.value |= value;
    },
    removeMark: function (node, value) {
        return node.value &= ~value;
    },
    isMarked: function (node, value) {
        return (node.value & value) === value;
    },

    setStart: function (c, r) {
        var node = this.grid[r][c];
        this.startNode = node;
    },
    setEnd: function (c, r) {
        var node = this.grid[r][c];
        this.endNode = node;
    },

    getRoadCount: function (node) {
        var count = 0;
        this.isMarked(node, Maze.Direction.N) && count++;
        this.isMarked(node, Maze.Direction.E) && count++;
        this.isMarked(node, Maze.Direction.S) && count++;
        this.isMarked(node, Maze.Direction.W) && count++;
        return count;
    },

    setCurrent: function (node) {
        this.currentNode = node;

        this.neighbors = this.getValidNeighbors(node);

        if (this.neighbors && node.value === 0) {
            this.trace.push(node);
            this.onTrace(node);
        }
    },
    onTrace: function (node) {

    },
    moveTo: function (node, dir) {
        this.beforeMove(node);
        if (this.currentDir == dir) {
            this.currentDirCount++;
        } else {
            this.currentDir = dir;
            this.currentDirCount = 1;
        }
        this.currentNode.value |= dir;
        this.setCurrent(node);
        node.value |= Maze.Direction.opposite[dir];
        this.afterMove(node);
    },
    beforeMove: function (node) {

    },
    afterMove: function (node) {

    },

    generate: function () {
        this.beforeGenrate();
        this.setCurrent(this.startNode);
        this.stepCount = 0;
        while (this.nextStep()) {
            this.stepCount++;
        }
        console.log("Step Count : " + this.stepCount);
        this.afterGenrate();
    },
    beforeGenrate: function () {
    },
    afterGenrate: function () {
    },

    nextStep: function () {
        if (!this.neighbors) {
            this.beforeBacktrace();
            return this.backtrace();
        }
        var n = this.getNeighbor();
        this.moveTo(n[0], n[1]);
        this.updateCurrent();
        return true;
    },
    beforeBacktrace: function () {
    },
    backtrace: function () {
        var len = this.trace.length;
        while (len > 0) {
            var idx = this.getTraceIndex();
            var node = this.trace[idx];
            var nm = this.getValidNeighbors(node);
            if (nm) {
                this.currentNode = node;
                this.neighbors = nm;
                return true;
            } else {
                this.trace.splice(idx, 1);
                len--;
            }
        }
        return false;
    },

    setRoom: function (x, y, width, height) {
        var grid = this.grid;
        var ex = x + width;
        var ey = y + height;

        for (var r = y; r < ey; r++) {
            var row = grid[r];
            if (!row) {
                continue;
            }
            for (var c = x; c < ex; c++) {
                var node = row[c];
                if (node) {
                    node.value = Maze.Direction.ALL;
                }
            }
        }
    },
    setBlock: function (x, y, width, height) {
        var grid = this.grid;
        var ex = x + width;
        var ey = y + height;
        for (var r = y; r < ey; r++) {
            var row = grid[r];
            if (!row) {
                continue;
            }
            for (var c = x; c < ex; c++) {
                var node = row[c]
                if (node) {
                    node.value = null;
                }
            }
        }
    },

    getValidNeighbors: function (node) {
        var nList = [];
        var nMap = {};

        var c = node.x;
        var r = node.y;
        var dir, nearNode;

        dir = Maze.Direction.N;
        nearNode = r > 0 ? this.grid[r - 1][c] : null;
        this.isValid(nearNode, node, dir) && nList.push((nMap[dir] = [nearNode, dir]));

        dir = Maze.Direction.E;
        nearNode = this.grid[r][c + 1];
        this.isValid(nearNode, node, dir) && nList.push((nMap[dir] = [nearNode, dir]));

        dir = Maze.Direction.S;
        nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
        this.isValid(nearNode, node, dir) && nList.push((nMap[dir] = [nearNode, dir]));

        dir = Maze.Direction.W;
        nearNode = this.grid[r][c - 1];
        this.isValid(nearNode, node, dir) && nList.push((nMap[dir] = [nearNode, dir]));

        this.updateValidNeighbors(nList, nMap);

        if (nList.length > 0) {
            nMap.list = nList;
            return nMap;
        }
        return null;
    },

    updateValidNeighbors: function (nList, nMap) {

    },

    isValid: function (nearNode, node, dir) {
        return nearNode && nearNode.value === 0;
    },

    updateCurrent: function () {
        if (this.alwaysBacktrace) {
            this.backtrace();
        }
    },

    getNeighbor: function () {
        var list = this.neighbors.list;
        var n = list[list.length * Math.random() >> 0];
        return n;
    },

    getTraceIndex: function () {
        var idx = this.trace.length - 1;
        return idx;
    },

};


Maze.Direction = {
    N: 1,
    S: 2,
    E: 4,
    W: 8,
    ALL: 1 | 2 | 4 | 8,

    opposite: {
        1: 2,
        2: 1,
        4: 8,
        8: 4
    },
    stepX: {
        1: 0,
        2: 0,
        4: 1,
        8: -1
    },
    stepY: {
        1: -1,
        2: 1,
        4: 0,
        8: 0
    },
};

///////////////////////////////////////////////////

var maze = new Maze({
    width: 20,
    height: 20,

    perfect: true,
    braid: false,

    onInit: function () {
        this.checkCount = {};
        this.foundEndNode = false;
    },

    getNeighbor: function () {
        var list = this.neighbors.list;
        var n = list[list.length * Math.random() >> 0];
        return n;
    },

    isValid: function (nearNode, node, dir) {
        if (!nearNode || nearNode.value === null) {
            return false;
        }
        if (nearNode.value === 0) {
            return true;
        }
        if (this.perfect || this.braid) {
            return false;
        }
        var c = nearNode.x,
            r = nearNode.y;
        this.checkCount[c + "-" + r] = this.checkCount[c + "-" + r] || 0;
        var count = ++this.checkCount[c + "-" + r];
        return Math.random() < 0.3 && count < 3;
    },

    beforeBacktrace: function () {
        if (!this.braid) {
            return;
        }
        var n = [];
        var node = this.currentNode;
        var c = node.x;
        var r = node.y;
        var nearNode, dir, op;

        var first = null;
        var currentDir = this.currentDir;
        var updateNear = function () {
            op = Maze.Direction.opposite[dir];
            if (nearNode && nearNode.value !== null && (nearNode.value & op) !== op) {
                n.push([nearNode, dir]);
                if (dir == currentDir) {
                    first = [nearNode, dir];
                }
            }
        };

        dir = Maze.Direction.N;
        nearNode = r > 0 ? this.grid[r - 1][c] : null;
        updateNear();

        if (!first) {
            dir = Maze.Direction.E;
            nearNode = this.grid[r][c + 1];
            updateNear();
        }

        if (!first) {
            dir = Maze.Direction.S;
            nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
            updateNear();
        }

        if (!first) {
            dir = Maze.Direction.W;
            nearNode = this.grid[r][c - 1];
            updateNear();
        }

        n = first || n[n.length * Math.random() >> 0];
        this.moveTo(n[0], n[1]);
    },

    updateCurrent: function () {
        if (this.braid) {
            return;
        }
        if (Math.random() <= 0.10) {
            this.backtrace();
        }
    },

    getTraceIndex: function () {
        var len = this.trace.length;

        if (this.braid) {
            return len - 1;
        }

        var r = Math.random();
        var idx = 0;
        if (r < 0.5) {
            idx = len - 1;
        } else if (r < 0.7) {
            idx = len >> 1;
        } else if (r < 0.8) {
            idx = len * Math.random() >> 0;
        }
        return idx;
    },

    afterGenrate: function () {
        if (this.braid && this.getRoadCount(this.startNode) < 2) {
            this.currentDirCount = 1000;
            this.setCurrent(this.startNode);
            this.nextStep();
        }
    },
});


function createMaze(perfect, braid, width, height) {
    maze.perfect = perfect || false;
    maze.braid = braid || false;
    maze.width = width || 20;
    maze.height = height || 20;

    maze.init();

    maze.startNode = maze.getRandomNode();
    do {
        maze.endNode = maze.getRandomNode();
    } while (maze.startNode == maze.endNode);

    maze.generate();
}

function createPerfectMaze(width, height) {
    createMaze(true, false, width, height);
    return prettyGrid(maze.grid);
}

function createBraidMaze() {
    createMaze(false, true, width, height);
    return prettyGrid(maze.grid);
}

function prettyGrid(grid) {
    let cellH = 1;
    let padding = 0;

    let x = y = padding;

    let cellY = y;
    let mazeHeight = 0;

    let gridData = [];

    for (let r = 0; r < grid.length; r++) {
        let row = grid[r];

        for (let c = 0; c < row.length; c++) {
            let node = row[c];
            let cy = cellY;
            if (!node.value) {
                continue;
            }

            let right = (node.value & Maze.Direction.W) !== Maze.Direction.W;
            let bottom = (node.value & Maze.Direction.N) !== Maze.Direction.N;
            if (right && bottom) {
                gridData.push([c, cy, 'rightBottom']);
            } else if (right) {
                gridData.push([c, cy, 'right']);
            } else if (bottom) {
                gridData.push([c, cy, 'bottom']);
            }
        }
        cellY += cellH;
        mazeHeight += cellH;
    }
    return gridData;
}