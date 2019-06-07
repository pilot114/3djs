/**
 * Связывание управления с поворотом и расположением некоторого объекта.
 * Расположение камеры относительно этого объекта определяет тип камеры (от первого/третьего лица)
 */
function Player(position) {
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
    // TODO: добавить использование констант, сделать расчет итогового position
    const WALK_VELOCITY = 2;
    const RUN_MULT   = 2;
    const DUCK_MULT  = 0.5;
    const STRAFE_MULT  = 1;

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
        // локальное нормальное направление (-1,0 или 1)
        this.state.direction.z = Number(this.state.moveForward) - Number(this.state.moveBackward);
        this.state.direction.x = Number(this.state.moveLeft) - Number(this.state.moveRight);

        this.state.velocity.z = this.state.direction.z;
        this.state.velocity.x = this.state.direction.x;

        if (this.state.moveForward || this.state.moveBackward) {
            this.state.velocity.z = WALK_VELOCITY * this.state.direction.z;
        }
        if (this.state.moveLeft || this.state.moveRight) {
            this.state.velocity.x = WALK_VELOCITY * this.state.direction.x;
        }
    };

    this.getInfo = () => {
        let playerInfo = Object.assign({}, this.state);
        return JSON.stringify(playerInfo);
    }
}

export {Player}