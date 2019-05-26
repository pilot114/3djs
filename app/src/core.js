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
            this.camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(3, 2, 3), this.scene);
            this.camera.setTarget(BABYLON.Vector3.Zero());

            this.camera.angularSensibility = 600;
            this.camera.inertia = 0.1;

            this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
            this.scene.collisionsEnabled = true;

            this.camera.checkCollisions = true;
            this.camera.applyGravity = true;

            // размер "тела" камеры
            this.camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);

            // привязываем камеру к курсору, чувствительность
            if (!this.config.debug) {
                window.addEventListener( 'click', () => {
                    canvas.requestPointerLock();
                    this.camera.attachControl(canvas, true);
                }, false );
            }
        }

        if (this.config.debug) {
            this.scene.debugLayer.show({
                overlay: true
            });
        }

        if (this.config.grid) {
            let ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 100, 0, 10, this.scene, false);
            ground.material = new BABYLON.GridMaterial("groundMaterial", this.scene);

            //
            ground.checkCollisions = true;
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