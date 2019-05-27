function Core(config) {
    this.config = config;

    // хуки
    this.init = (scene, camera) => {
    };
    this.tick = (scene, camera) => {
    };

    this.run = () => {
        let canvas = document.getElementById("renderCanvas");

        let engine = new BABYLON.Engine(canvas, true);

        this.scene = new BABYLON.Scene(engine);
        this.scene.clearColor = BABYLON.Color3.Black();

        if (this.config.preset === 'default') {
            this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(10, 10, 10), this.scene);
            this.camera.setTarget(BABYLON.Vector3.Zero());
            this.camera.attachControl(canvas, true);
        }

        // First person - специальные настройки для камеры и управления,  см
        // https://www.babylonjs-playground.com/#E8C51D#35
        if (this.config.preset === 'fp') {
            let initVector = new BABYLON.Vector3(this.config.initPos.x, 2, this.config.initPos.z);
            this.camera = new BABYLON.FreeCamera("FreeCamera", initVector, this.scene);
            this.camera.setTarget(BABYLON.Vector3.Zero());

            this.camera.angularSensibility = 800;
            this.camera.inertia = 0.5;
            this.camera.speed = 1;
            this.camera.minZ = 0;

            this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
            this.scene.collisionsEnabled = true;

            this.camera.checkCollisions = true;
            this.camera.applyGravity = true;

            // размер "тела" камеры
            this.camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);

            // привязываем камеру к курсору, чувствительность
            canvas.addEventListener('click', () => {
                canvas.requestPointerLock();
                this.camera.attachControl(canvas, true);

                // переназначаем управление на WASD
                this.camera.keysUp = [87];
                this.camera.keysDown = [83];
                this.camera.keysLeft = [65];
                this.camera.keysRight = [68];
            }, false);

            this.cursor = {
                x: canvas.width / 2,
                y: canvas.height / 2,
            };

            let inputMap = {};
            this.scene.actionManager = new BABYLON.ActionManager(this.scene);
            this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
                inputMap[evt.sourceEvent.keyCode] = evt.sourceEvent.type === "keydown";
            }));
            this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
                inputMap[evt.sourceEvent.keyCode] = evt.sourceEvent.type === "keydown";
            }));

            this.scene.onBeforeRenderObservable.add(() => {


                let countPressed = Object.values(inputMap).filter(x => x).length;

                // бег только вперёд
                let speed = (inputMap[87] && inputMap[16]) ? this.config.runSpeed : this.config.walkSpeed;

                // по диагонали
                if ((inputMap[87] || inputMap[83]) && (inputMap[65] || inputMap[68])) {
                    this.camera.speed = speed * 0.707; // Math.sqrt(speed) / (2*speed);
                } else {
                    this.camera.speed = speed;
                }
            })
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

        if (this.config.grid) {
            let ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 100, 0, 10, this.scene, false);
            ground.material = new BABYLON.GridMaterial("groundMaterial", this.scene);

            //
            ground.checkCollisions = true;
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

        engine.runRenderLoop(() => {
            this.update();
        });

        window.addEventListener("resize", function () {
            engine.resize();
        });
    };

    this.update = () => {


        this.tick(this.scene, this.camera);
        this.scene.render();
    }
}

export {Core};