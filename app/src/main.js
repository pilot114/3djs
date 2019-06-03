import {Core} from './core'


let core = new Core({
    // preset: 'default',
    preset: 'fp',
    grid: true,
    debug: false,
    fog: true,
    minimap: true,
    initPos: {x:0, z: 0},
    walkSpeed: 1,
    runSpeed: 2
});

core.init = (scene, camera) => {
    // добавление объектов
    new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);

    let wall = BABYLON.MeshBuilder.CreateBox("wall", {height: 8, width: 0.1, depth: 8}, scene);
    wall.position.y = 0;
    wall.isVisible = true;
    wall.checkCollisions = true;

    var range = 60;
    var count = 10;
    for (let index = 0; index < count; index++) {
        let newInstance = wall.createInstance("i" + index);
        let x = range / 2 - Math.random() * range;
        let z = range / 2 - Math.random() * range;
        let y = 0;

        newInstance.position = new BABYLON.Vector3(x, y, z);
        newInstance.rotate(BABYLON.Axis.Y, Math.random() * Math.PI * 2, BABYLON.Space.WORLD);
        newInstance.checkCollisions = true;
    }
};

core.tick = (scene, camera) => {
    // var pickResult = scene.pick(core.cursor.x, core.cursor.y);
    // if (pickResult.hit) {
    //     console.log(pickResult.pickedMesh.id);
    // }
};

core.run();
