import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

/**
 *  Предустановки:
 *  render - webgl2
 *  Рендерится по размеру всего окна
 *  Угол обзора - 90 градусов
 *  Все камеры - с перспективой
 *  Все размеры из расчёта 1 условная единица = 1 метр
 *  Видимый "горизонт" - 1 км
 *  основной свет - направленный, "солнечный"
 *
 *  Конфигурация возможно задавать простейшие хелперы -
 *  статистика, биндинг параметров, оси
 *
 *  возможность гибко управлять шейдерами
 *
 *  возможность гибко управлять gltf моделями
 *
 *  В качестве физического движка используется oimo
 *
 *  Подгрузка ассетов - в json формате
 */
function Core(config) {
    this.config = config;

    let canvas = document.querySelector('#display');
    let context = canvas.getContext('webgl2');
    this.renderer = new THREE.WebGLRenderer({canvas: canvas, context: context});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.raycaster = new THREE.Raycaster();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 1001);

    this.light = new THREE.DirectionalLight(0xFFFFFF, 1);
    this.light.position.set(0, 1000, 0);
    this.scene.add(this.light);

    this.loadModels = {};

    // позиция курсора
    this.pickPosition = {x:0, y:0};

    // настройки
    if (this.config.grid) {
        const gridHelper = new THREE.GridHelper(10, 10);
        gridHelper.position.y = -1;
        this.scene.add(gridHelper);
    }

    // управление камерой
    this.controls = new OrbitControls(this.camera);
    this.camera.position.set(3, 3, 3);
    this.controls.update();

    window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    this.run = () => {
        this.init(this.scene, this.camera);

        // если init инициализирует загрузку моделей, ждём, когда все загрузки завершатся
        let timerId = setInterval(() => {
            let allTrue = Object.keys(this.loadModels).every(k => this.loadModels[k]);
            if (allTrue) {
                clearInterval(timerId);
                this.update();
            }
        }, 10);
    };

    this.update = (time) => {
        this.pick();
        this.controls.update();
        this.tick(this.scene, this.camera);
        requestAnimationFrame(this.update);
        this.renderer.render(this.scene, this.camera);
    };

    /**
     * helpers
     */
    this.addModel = (name, scale, position) => {
        this.loadModels[name[1]] = false;

        const gltfLoader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            gltfLoader.load(name[0], (gltf) => {
                let model = gltf.scene;
                model.name = name[1];

                model.scale.x = scale.x;
                model.scale.y = scale.y;
                model.scale.z = scale.z;
                model.position.x = position.x;
                model.position.y = position.y;
                model.position.z = position.z;

                this.scene.add(model);

                // дамп объекта, чтобы модели, чтобы посмотреть, какие объекты в неё входят
                // console.log(this.dumpObject(model).join('\n'));
                resolve(model);

                this.loadModels[name[1]] = true;
            });
        });
    };

    /**
     * тут нужно задать параметры "пика" - селектор на объекты и что с ними делаем
     */
    this.pick = (time) => {
        this.raycaster.setFromCamera(this.pickPosition, this.camera);
        const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);

        if (intersectedObjects.length) {
            // тут надо кастомно выбирать объекты, которые хотим "пикать"
            let filtered = intersectedObjects.filter(x => !(x.object instanceof THREE.GridHelper) );
            if (filtered.length) {
                filtered[0].object.material.emissive.setHex(0xFFFF00);
            }
        }
    };

    /**
     * utils
     */
    this.dumpObject = (obj, lines = [], isLast = true, prefix = '') => {
        const localPrefix = isLast ? '└─' : '├─';
        lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
        const dataPrefix = obj.children.length
            ? (isLast ? '  │ ' : '│ │ ')
            : (isLast ? '    ' : '│   ');
        lines.push(`${prefix}${dataPrefix}  pos: ${this.dumpVec3(obj.position)}`);
        lines.push(`${prefix}${dataPrefix}  rot: ${this.dumpVec3(obj.rotation)}`);
        lines.push(`${prefix}${dataPrefix}  scl: ${this.dumpVec3(obj.scale)}`);
        const newPrefix = prefix + (isLast ? '  ' : '│ ');
        const lastNdx = obj.children.length - 1;
        obj.children.forEach((child, ndx) => {
            const isLast = ndx === lastNdx;
            this.dumpObject(child, lines, isLast, newPrefix);
        });
        return lines;
    };

    this.dumpVec3 = (v3, precision = 3) => {
        return `${v3.x.toFixed(precision)}, ${v3.y.toFixed(precision)}, ${v3.z.toFixed(precision)}`;
    }
}

export {Core};