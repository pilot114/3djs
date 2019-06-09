/**
 * Связывание управления с поворотом и расположением некоторого объекта.
 * Расположение камеры относительно этого объекта определяет тип камеры (от первого/третьего лица)
 */
function Player(camera, position) {
    this.name = 'Player';
    this.camera = camera;
    this.state = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        isRun: false,
        isDuck: false,

        // локальные значения - так удобнее для управления
        direction: new BABYLON.Vector3(),
        velocity: new BABYLON.Vector3(),
        rotation: new BABYLON.Vector3(),

        // абсолютные значения
        position: position || new BABYLON.Vector3(),
    };
    const WALK_VELOCITY = 0.1;
    const RUN_MULT = 2;
    const DUCK_MULT = 0.5;

    /**
     * using:
     *
     * document.addEventListener('keydown', onKeyDown, false);
     * document.addEventListener('keyup', onKeyUp, false);
     */
    this.onKeyDown = (event) => {
        if (event.shiftKey && this.state.moveForward) {
            this.state.isRun = true;
        }

        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.state.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.state.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.state.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.state.moveRight = true;
                break;
            case 67: // c
                this.state.isDuck = true;
                break;
        }
    };
    this.onKeyUp = (event) => {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.state.moveForward = false;
                this.state.isRun = false;
                break;
            case 37: // left
            case 65: // a
                this.state.moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                this.state.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.state.moveRight = false;
                break;
            case 67: // c
                this.state.isDuck = false;
                break;
        }

        if (!event.shiftKey) {
            this.state.isRun = false;
        }
    };

    this.update = (delta) => {
        // локальное нормальное направление (-1 до 1)
        this.state.direction.z = Number(this.state.moveForward) - Number(this.state.moveBackward);
        this.state.direction.x = (Number(this.state.moveLeft) - Number(this.state.moveRight));
        this.state.direction = this.state.direction.normalize();
        // Поправка на бег
        if (this.state.isRun && (this.state.moveLeft || this.state.moveRight)) {
            this.state.direction.z = this.state.direction.z * Math.sqrt(7) / 2;
        }

        this.state.velocity.z = this.state.direction.z;
        this.state.velocity.x = this.state.direction.x;

        // WASD
        if (this.state.moveForward || this.state.moveBackward) {
            this.state.velocity.z = this.state.direction.z * WALK_VELOCITY;
        }
        if (this.state.moveLeft || this.state.moveRight) {
            this.state.velocity.x = this.state.direction.x * WALK_VELOCITY;
        }

        // замедление в любую сторону + отменяет бег
        if (this.state.isDuck) {
            this.state.velocity.z = this.state.velocity.z * DUCK_MULT;
            this.state.velocity.x = this.state.velocity.x * DUCK_MULT;
            this.state.isRun = false;
        }

        // ускорение только вперёд
        if (this.state.isRun) {
            this.state.velocity.z = this.state.velocity.z * RUN_MULT;
        }

        let path = Math.sqrt(this.state.velocity.z * this.state.velocity.z + this.state.velocity.x * this.state.velocity.x);
        // проверка, что всё посчитано правильно, должно быть равно скорости
        // console.log(path);

        // rotation берём с камеры, а position наоборот передаём в неё
        this.state.rotation = this.camera.rotation;

        // последнее - обновляем глобальные координаты
        this.state.position.x += this.state.velocity.x * Math.cos(this.state.rotation.y - Math.PI) + this.state.velocity.z * Math.sin(this.state.rotation.y);
        this.state.position.z += this.state.velocity.z * Math.cos(this.state.rotation.y) + this.state.velocity.x * Math.sin(this.state.rotation.y);

        this.camera.position = this.state.position;
    };

    this.getInfo = () => {
        let playerInfo = Object.assign({}, this.state);
        playerInfo.direction.x = +playerInfo.direction.x.toFixed(2);
        playerInfo.direction.z = +playerInfo.direction.z.toFixed(2);
        playerInfo.velocity.x = +playerInfo.velocity.x.toFixed(2);
        playerInfo.velocity.z = +playerInfo.velocity.z.toFixed(2);
        playerInfo.position.x = +playerInfo.position.x.toFixed(2);
        playerInfo.position.z = +playerInfo.position.z.toFixed(2);
        playerInfo.position.y = +playerInfo.position.y.toFixed(2);
        playerInfo.rotation.x = +playerInfo.rotation.x.toFixed(2);
        playerInfo.rotation.z = +playerInfo.rotation.z.toFixed(2);
        playerInfo.rotation.y = +playerInfo.rotation.y.toFixed(2);
        return JSON.stringify(playerInfo);
    }
}

export {Player}