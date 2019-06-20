import {FPControl} from "./FPControl";

function Core(config) {
    this.config = config;
    this.canvas = document.getElementById("renderCanvas");
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.forUpdate = [];
    this.playlist = [
        'audio/i_am_program.mp3'
    ];

    // хуки
    this.init = (scene, camera) => {};
    this.tick = (scene, camera) => {};

    this.run = () => {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color3.Black();

        if (this.config.preset === 'default') {
            let camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(10, 10, 10), this.scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(this.canvas, true);
        }

        this.scene.enablePhysics(
            new BABYLON.Vector3(0, -9.81, 0),
            new BABYLON.OimoJSPlugin()
        );

        this.ground = null;
        if (this.config.grid) {
            this.ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 100, 0, 10, this.scene, false);
            this.ground.material = new BABYLON.GridMaterial("groundMaterial", this.scene);
            this.ground.checkCollisions = true;

            this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(
                this.ground,
                BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.0, restitution: 0.7 },
                this.scene
            );
        }

        // First person - специальные настройки для камеры и управления
        // https://www.babylonjs-playground.com/#E8C51D#35
        if (this.config.preset === 'fp') {
            let initVector = new BABYLON.Vector3(this.config.initPos.x, 2, this.config.initPos.z);


            this.scene.collisionsEnabled = true;

            this.cursor = {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
            };

            let camera = new BABYLON.FreeCamera("FreeCamera", BABYLON.Vector3.Zero(), this.scene);
            camera.position.y = 2;
            camera.setTarget(initVector);
            camera.angularSensibility = 1500;
            camera.inertia = 0.5;

            // привязываем камеру к курсору, чувствительность
            this.canvas.addEventListener('click', () => {
                this.canvas.requestPointerLock();
                camera.attachControl(this.canvas, true);

                // переназначаем управление на WASD
                camera.keysUp = [];
                camera.keysDown = [];
                camera.keysLeft = [];
                camera.keysRight = [];
            }, false);

            let body = BABYLON.Mesh.CreateBox("PlayerBody", 2, this.scene);
            body.checkCollisions = true;

            let pControl = new FPControl(camera, body, initVector);
            this.add(pControl);
        }

        if (this.config.debug) {
            this.scene.debugLayer.show({
                overlay: true
            });
        }

        if (this.config.fog) {
            this.scene.clearColor = BABYLON.Color3.FromInts(127, 165, 13);

            this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
            this.scene.fogDensity = 0.05;
            this.scene.fogColor = this.scene.clearColor;
        }

        this.init(this.scene);

        this.engine.runRenderLoop(() => {
            this.update();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        new BABYLON.Sound("Music", this.playlist[0], this.scene, null, { loop: true, autoplay: true });
    };

    this.update = () => {
        let delta = this.engine.getDeltaTime() / 1000;
        this.forUpdate.forEach(obj => obj.update(delta));

        if (this.scene._frameId % 6 === 0) {
            let info = this.get('PlayerControl').getInfo();
            document.getElementById('info').innerHTML = '';
            for (let key in info) {
                document.getElementById('info').appendChild(document.createTextNode(key + ': ' + info[key]));
                document.getElementById('info').appendChild(document.createElement('br'));
            }

        }

        this.tick(this.scene);
        this.scene.render();
    };

    /**
     * Добавляет объекты с цикл обработки
     */
    this.add = (obj) => {
        if(obj.hasOwnProperty('onKeyDown')){
            document.addEventListener('keydown', obj.onKeyDown, false);
        }
        if(obj.hasOwnProperty('onKeyUp')){
            document.addEventListener('keyup', obj.onKeyUp, false);
        }
        this.forUpdate.push(obj);
    };
    /**
     * Получаем объект
     */
    this.get = (name) => {
        return this.forUpdate.filter(x => x.name === name)[0];
    }
}

export {Core};
