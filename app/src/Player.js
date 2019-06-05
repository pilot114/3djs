function Player() {
    this.state = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        isJump: false,
        isRun: false,
        isDuck: false,
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
    this.onKeyUp = (event) => {
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

    this.update = (delta) => {
        this.state.velocity.x -= this.state.velocity.x * 10.0 * delta;
        this.state.velocity.z -= this.state.velocity.z * 10.0 * delta;
        this.state.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        this.state.direction.z = Number(this.state.moveForward) - Number(this.state.moveBackward);
        this.state.direction.x = Number(this.state.moveLeft) - Number(this.state.moveRight);
        this.state.direction.normalize();

        // wasd перемещения
        if (this.state.moveForward || this.state.moveBackward) {
            this.state.velocity.z -= this.state.direction.z * 1500.0 * delta;
        }
        if (this.state.moveLeft || this.state.moveRight) {
            this.state.velocity.x -= this.state.direction.x * 1500.0 * delta;
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
    };

    this.getInfo = () => {
        let playerInfo = Object.assign({}, this.state);
        playerInfo.velocity.x = playerInfo.velocity.x.toFixed(0);
        playerInfo.velocity.y = playerInfo.velocity.y.toFixed(0);
        playerInfo.velocity.z = playerInfo.velocity.z.toFixed(0);
        delete (playerInfo.direction);
        return JSON.stringify(playerInfo);
    }
}

export {Player}