import {Player} from "./Player";

function Core(config) {
    this.config = config;
    this.canvas = document.getElementById("renderCanvas");
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.forUpdate = [];

    // хуки
    this.init = (scene, camera) => {};
    this.tick = (scene, camera) => {};

    this.run = () => {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color3.Black();

        if (this.config.preset === 'default') {
            this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(10, 10, 10), this.scene);
            this.camera.setTarget(BABYLON.Vector3.Zero());
            this.camera.attachControl(this.canvas, true);
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

            this.camera = new BABYLON.FreeCamera("FreeCamera", initVector, this.scene);
            this.camera.setTarget(BABYLON.Vector3.Zero());
            this.camera.angularSensibility = 800;
            this.camera.inertia = 0.5;
            this.camera.speed = 1;
            this.camera.minZ = 0;

            this.camera.checkCollisions = true;
            this.camera.applyGravity = true;

            this.scene.collisionsEnabled = true;

            this.cursor = {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
            };

            let player = new Player(this.camera, initVector);
            this.add(player);

            // привязываем камеру к курсору, чувствительность
            this.canvas.addEventListener('click', () => {
                this.canvas.requestPointerLock();
                this.camera.attachControl(this.canvas, true);

                // переназначаем управление на WASD
                this.camera.keysUp = [];
                this.camera.keysDown = [];
                this.camera.keysLeft = [];
                this.camera.keysRight = [];
                // this.camera.keysUp = [87];
                // this.camera.keysDown = [83];
                // this.camera.keysLeft = [65];
                // this.camera.keysRight = [68];
            }, false);
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

        // TODO
        if (this.config.minimap) {
            let mm = new BABYLON.FreeCamera("minimap", new BABYLON.Vector3(0, 100, 0), this.scene);
            mm.setTarget(new BABYLON.Vector3(0.1, 0.1, 0.1));
            mm.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

            mm.orthoLeft = -this.size / 2;
            mm.orthoRight = this.size / 2;
            mm.orthoTop = this.size / 2;
            mm.orthoBottom = -this.size / 2;
            mm.rotation.x = Math.PI / 2;

            mm.viewport = new BABYLON.Viewport(
                0.8,
                0.75,
                0.1,
                0.1
            );

            this.scene.activeCameras.push(mm);
            this.scene.activeCameras.push(this.camera);
            mm.layerMask = 1;
            this.camera.layerMask = 2;
        }

        this.init(this.scene, this.camera);

        this.engine.runRenderLoop(() => {
            this.update();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    };

    this.update = () => {
        let delta = this.engine.getDeltaTime() / 1000;
        this.forUpdate.forEach(obj => obj.update(delta));

        if (this.scene._frameId % 6 === 0) {
            let info = this.get('Player').getInfo();
            // info = JSON.stringify(info);
            document.getElementById('info').innerHTML = '';
            for (let key in info) {
                document.getElementById('info').appendChild(document.createTextNode(key + ': ' + info[key]));
                document.getElementById('info').appendChild(document.createElement('br'));
            }

        }

        this.tick(this.scene, this.camera);
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
