// используем глобальный THREE, для не es6 файлов

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as Stats from 'stats.js';

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
 *
 *   Пресеты
 *   default - орбит контрол (для демок)
 *   fps (first person shooter) - вид от первого лица, wasd управление
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

    // композер эффектов
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.setSize(window.innerWidth, window.innerHeight);

    // эффекты, сначала пробрасываем дефолтный рендер
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    this.light = new THREE.DirectionalLight(0xFFFFFF, 1);
    this.light.position.set(0, 1000, 0);
    this.scene.add(this.light);

    this.loadModels = {};

    this.shaders = [];

    // позиция курсора
    this.pickPosition = {x: 0, y: 0};

    // настройки
    if (this.config.grid) {
        const gridHelper = new THREE.GridHelper(10, 10);
        gridHelper.position.y = -1;
        this.scene.add(gridHelper);
    }
    if (this.config.stats) {
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );
    }

    // управление камерой - вынести в модули
    if (this.config.preset === 'fps') {
        this.controls = new THREE.PointerLockControls(this.camera);
        this.scene.add(this.controls.getObject());
        document.addEventListener('click', () => {
            this.controls.lock();
        }, false);

        this.player = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
            isJump: false,
            isRun: false,
            isDuck: false,
            velocity: new THREE.Vector3(),
            direction: new THREE.Vector3(),
        };

        // куда смотрим
        this.crosshair = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);

        // обработки событий
        var onKeyDown = (event) => {
            if (event.shiftKey && this.player.moveForward) {
                this.player.isRun = true;
            }

            switch (event.keyCode) {
                case 38: // up
                case 87: // w
                    this.player.moveForward = true;
                    break;
                case 37: // left
                case 65: // a
                    this.player.moveLeft = true;
                    break;
                case 40: // down
                case 83: // s
                    this.player.moveBackward = true;
                    break;
                case 39: // right
                case 68: // d
                    this.player.moveRight = true;
                    break;
                case 32: // space
                    if (this.player.isJump === false) this.player.velocity.y += 350;
                    this.player.isJump = true;
                    break;
                case 67: // c
                    if (this.player.isJump === false) {
                        this.player.isDuck = true;
                        this.player.isRun = false;
                    }
                    break;
            }
        };
        var onKeyUp = (event) => {
            switch (event.keyCode) {
                case 38: // up
                case 87: // w
                    this.player.moveForward = false;
                    this.player.isRun = false;
                    break;
                case 37: // left
                case 65: // a
                    this.player.moveLeft = false;
                    break;
                case 40: // down
                case 83: // s
                    this.player.moveBackward = false;
                    break;
                case 39: // right
                case 68: // d
                    this.player.moveRight = false;
                    break;
                case 67: // c
                    this.player.isDuck = false;
                    break;
            }

            if (!event.shiftKey) {
                this.player.isRun = false;
            }
        };

        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);

    }  else {
        this.controls = new OrbitControls(this.camera);
        this.camera.position.set(3, 2, 3);
        this.controls.update();
    }

    window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    this.init = (scene, camera) => {};
    this.tick = (scene, camera) => {};

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

        // кастомные эффекты
        for (let i in this.shaders)  {
            this.shaders[i].renderToScreen = true;
            this.composer.addPass(this.shaders[i]);
        }
    };

    let clock = new THREE.Clock(); // sec
    let delta = 0;

    this.update = () => {
        delta = clock.getDelta();

        this.pick();
        this.tick(this.scene, this.camera);

        // если есть эффекты, рендерим через менеджер эффектов
        if (this.composer) {
            this.composer.render(delta);
        } else {
            this.renderer.render(this.scene, this.camera);
        }

        if (this.stats) {
            this.stats.update();
        }

        // обработка физики персонажа
        if (this.player) {
            this.playerUpdate(delta/1000);
        }

        requestAnimationFrame(this.update);
    };

    /**
     * helpers
     */
    this.playerUpdate = (delta) => {
        this.player.velocity.x -= this.player.velocity.x * 10.0 * delta;
        this.player.velocity.z -= this.player.velocity.z * 10.0 * delta;
        this.player.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        this.player.direction.z = Number(this.player.moveForward) - Number(this.player.moveBackward);
        this.player.direction.x = Number(this.player.moveLeft) - Number(this.player.moveRight);
        this.player.direction.normalize();

        // wasd перемещения
        if (this.player.moveForward || this.player.moveBackward) {
            this.player.velocity.z -= this.player.direction.z * 1500.0 * delta;
        }
        if (this.player.moveLeft || this.player.moveRight) {
            this.player.velocity.x -= this.player.direction.x * 1500.0 * delta;
        }

        // бег ускоряет движение ВПЕРЁД
        if (this.player.isRun) {
            this.player.velocity.z -= this.player.direction.z * 20.0;
        }
        // на кортах медленее в ЛЮБОМ НАПРАВЛЕНИИ
        if (this.player.isDuck) {
            this.player.velocity.z += this.player.direction.z * 10.0;
            this.player.velocity.x += this.player.direction.x * 10.0;
        }

        this.controls.getObject().translateX(this.player.velocity.x * delta);
        this.controls.getObject().translateY(this.player.velocity.y * delta);
        this.controls.getObject().translateZ(this.player.velocity.z * delta);
        if (this.controls.getObject().position.y < 20) {
            this.player.velocity.y = 0;
            this.controls.getObject().position.y = 20;
            this.player.isJump = false;
        }

        if (this.player.isDuck) {
            this.controls.getObject().position.y = 10;
        }

        if (this.renderer.info.render.frame % 6 === 0) {
            var playerInfo = Object.assign({}, this.player);
            playerInfo.velocity.x = playerInfo.velocity.x.toFixed(0);
            playerInfo.velocity.y = playerInfo.velocity.y.toFixed(0);
            playerInfo.velocity.z = playerInfo.velocity.z.toFixed(0);
            delete (playerInfo.direction);
            console.log(JSON.stringify(playerInfo));
        }
    };

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
     *
     * продвинутый вариант - рисовать в отдельной сцене и пикать по уникальному цвету
     * https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
     */
    this.pick = () => {
        this.raycaster.setFromCamera(this.pickPosition, this.camera);
        const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);

        if (intersectedObjects.length) {
            // тут надо кастомно выбирать объекты, которые хотим "пикать"
            let filtered = intersectedObjects.filter(x => !(x.object instanceof THREE.GridHelper));
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
    };

    this.addShader = (shader) => {
        this.shaders.push(new THREE.ShaderPass(shader));
    }
}

export {Core};