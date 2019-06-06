function Player() {
    this.state = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        isJump: false,
        isRun: false,
        isDuck: false,
        position: new BABYLON.Vector3(),
        velocity: new BABYLON.Vector3(),
        direction: new BABYLON.Vector3(),
    };

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
            case 32: // space
                if (this.state.isJump === false) this.state.velocity.y += 350;
                this.state.isJump = true;
                break;
            case 67: // c
                if (this.state.isJump === false) {
                    this.state.isDuck = true;
                    this.state.isRun = false;
                }
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
        this.state.velocity.x -= this.state.velocity.x * delta;
        this.state.velocity.z -= this.state.velocity.z * delta;
        this.state.velocity.y -= 9.8 * delta;

        // TODO: нормализовать для правильного расчета скорости
        this.state.direction.z = Number(this.state.moveForward) - Number(this.state.moveBackward);
        this.state.direction.x = Number(this.state.moveLeft) - Number(this.state.moveRight);

        // wasd перемещения
        if (this.state.moveForward || this.state.moveBackward) {
            this.state.velocity.z -= this.state.direction.z * delta * 1500.0;
        }
        if (this.state.moveLeft || this.state.moveRight) {
            this.state.velocity.x -= this.state.direction.x * delta * 1500.0;
        }

        // бег ускоряет движение ВПЕРЁД
        if (this.state.isRun) {
            this.state.velocity.z -= this.state.direction.z * 20.0;
        }
        // на кортах медленее в ЛЮБОМ НАПРАВЛЕНИИ
        if (this.state.isDuck) {
            this.state.velocity.z += this.state.direction.z * 10.0;
            this.state.velocity.x += this.state.direction.x * 10.0;
        }

        // TODO: use Babylon control
        // this.controls.getObject().translateX(this.state.velocity.x * delta);
        // this.controls.getObject().translateY(this.state.velocity.y * delta);
        // this.controls.getObject().translateZ(this.state.velocity.z * delta);
        //
        // if (this.controls.getObject().position.y < 20) {
        //     this.state.velocity.y = 0;
        //     this.controls.getObject().position.y = 20;
        //     this.state.isJump = false;
        // }
        //
        // if (this.state.isDuck) {
        //     this.controls.getObject().position.y = 10;
        // }

        if (this.state.position.y <= 0) {
            this.state.position.y = 0;
            this.state.velocity.y = 0;
        }
    };

    this.getInfo = () => {
        let playerInfo = Object.assign({}, this.state);
        // playerInfo.velocity.x = playerInfo.velocity.x.toFixed(0);
        // playerInfo.velocity.y = playerInfo.velocity.y.toFixed(0);
        // playerInfo.velocity.z = playerInfo.velocity.z.toFixed(0);
        delete (playerInfo.direction);
        return JSON.stringify(playerInfo);
    }
}

export {Player}