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
};

core.tick = (scene, camera) => {
};

core.run();
