import {Core} from './core'

import {
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    Vector3,
} from 'three';

let core = new Core({
    preset: 'default',
    enableModels: true,
    grid: true
});

core.init = (scene, camera) => {
    const geometry2 = new BoxGeometry(1, 1, 1);

    function rand(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + (max - min) * Math.random();
    }

    const numObjects = 10;
    for (let i = 0; i < numObjects; ++i) {
        const material = new MeshPhongMaterial({
            color: `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`,
        });

        const cube = new Mesh(geometry2, material);
        scene.add(cube);

        cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
        cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
        cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
    }

    /*
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
    */
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
