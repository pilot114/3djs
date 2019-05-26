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

        // First person - специальные настройки для камеры и управления
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
            }, false);

            this.cursor = {
                x: canvas.width / 2,
                y: canvas.height / 2,
            };

            // TODO: 1) координаты абсолютные, 2) по диагонали слишком быстро 3) на WASD не чекаются коллизии
            // let inputMap = {};
            // this.scene.actionManager = new BABYLON.ActionManager(this.scene);
            // this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            //     inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
            // }));
            // this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            //     inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
            // }));
            // this.scene.onBeforeRenderObservable.add(() => {
            //     if(inputMap["w"]){
            //         this.camera.position.z-=0.1;
            //     }
            //     if(inputMap["a"]){
            //         this.camera.position.x+=0.1;
            //     }
            //     if(inputMap["s"]){
            //         this.camera.position.z+=0.1;
            //     }
            //     if(inputMap["d"]){
            //         this.camera.position.x-=0.1;
            //     }
            // })
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