import {Core} from './core'

import {
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    Vector3,
} from 'three';

let core = new Core({
    preset: 'default',
    enableModels: true
});

core.init = (scene, camera) => {
    let geometry = new BoxGeometry(1, 1, 1);
    let material = new MeshPhongMaterial({color: 0x44aa88});
    let cube = new Mesh(geometry, material);
    cube.name = 'cube_1';
    scene.add(cube);

    camera.position.y = 10;
    camera.rotation.x = -90 * (Math.PI / 180);

    core.addModel(
        ['./assets/models/gltf/scene.gltf', 'city_1'],
        new Vector3(0.01, 0.01, 0.01),
        new Vector3(0, -5, 0),
    ).then((model) => {
        // фиксим неправильно ориентированные машинки
        const loadedCars = model.getObjectByName('Cars').children;
        const fixes = [
            {prefix: 'CAR_03', rot: [0, Math.PI, 0],},
            {prefix: 'Car_04', rot: [0, Math.PI, 0],},
        ];

        for (const car of loadedCars) {
            const fix = fixes.find(fix => car.name.startsWith(fix.prefix));
            if (fix) {
                car.rotation.set(...fix.rot);
            } else {
                car.visible = false;
            }
        }
    });
};

core.tick = (scene, camera) => {
    let cube = scene.getObjectByName('cube_1');
    if (cube) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    let cars = scene.getObjectByName('Cars');
    if (cars) {
        for (const car of cars.children) {
            car.rotation.y += 0.05;
        }
    }
};

core.run();
