import {Core} from './core'

import {
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    Vector3,
} from 'three';

let core = new Core({
    preset: 'fps',
    grid: true,
    stats: true
});

core.init = (scene, camera) => {
};

core.tick = (scene, camera) => {
};

core.run();
