import {Core} from './core'


let core = new Core({
    // preset: 'default',
    preset: 'fp',
    grid: true,
    debug: false,
});

core.init = (scene, camera) => {
    // добавление объектов
    new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
    BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2}, scene);
};

core.tick = (scene, camera) => {
};

core.run();
