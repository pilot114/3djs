/**
 * Связывание управления с поворотом и расположением некоторого объекта (игрока).
 * Расположение камеры относительно этого объекта определяет тип камеры (от первого/третьего лица)
 */
function FPControl(camera, body, position, gravity) {
    this.name = 'PlayerControl';
    this.camera = camera;
    this.body = body;

    this.state = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        isRun: false,
        isDuck: false,
        isJump: false,

        // локальные значения - так удобнее для управления
        direction: new BABYLON.Vector3(),
        velocity: new BABYLON.Vector3(),
        rotation: new BABYLON.Vector3(),

        // абсолютные значения
        position: position || new BABYLON.Vector3(),
    };
    this.eventQueue = [];

    const WALK_VELOCITY = 0.1;
    const RUN_MULT = 2;
    const DUCK_MULT = 0.5;
    const JUMP_IMPULSE = 0.2;
    const GRAVITY = gravity || 9.8 / 1000;

    /**
     * using:
     *
     * document.addEventListener('keydown', onKeyDown, false);
     * document.addEventListener('keyup', onKeyUp, false);
     */
    this.onKeyDown = (event) => {
        // во время прыжка WASD не доступен, только присесть
        if (this.state.isJump && event.keyCode !== 67) {
            this.eventQueue.push(event);
            return;
        }

        if (event.shiftKey && this.state.moveForward) {
            this.state.isRun = true;
        }

        switch (event.keyCode) {
            case 67: // c
                this.state.isDuck = true;
                break;
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
                this.state.isJump = true;
                this.state.velocity.y = JUMP_IMPULSE;
                break;
        }
    };
    this.onKeyUp = (event) => {
        // во время прыжка WASD не доступен, только присесть
        if (this.state.isJump && event.keyCode !== 67) {
            this.eventQueue.push(event);
            return;
        }

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
        // TODO направление по y определим, разобравшись с гравитацией
        // this.state.direction.y = 1;

        this.state.direction = this.state.direction.normalize();
        // Поправка на бег
        if (this.state.isRun && (this.state.moveLeft || this.state.moveRight)) {
            this.state.direction.z = this.state.direction.z * Math.sqrt(7) / 2;
        }

        // пока нет инерции, можно завязывать скорость на направлении
        this.state.velocity.x = this.state.direction.x;
        this.state.velocity.z = this.state.direction.z;

        // WASD
        if (this.state.moveForward || this.state.moveBackward) {
            this.state.velocity.z = this.state.direction.z * WALK_VELOCITY;
        }
        if (this.state.moveLeft || this.state.moveRight) {
            this.state.velocity.x = this.state.direction.x * WALK_VELOCITY;
        }

        // "гравитация"
        if (this.state.isJump) {
            this.state.velocity.y -= GRAVITY;
        }

        // замедление в любую сторону + отменяет бег
        if (this.state.isDuck && !this.state.isJump) {
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
        this.state.position.y += this.state.velocity.y;
        
        if (this.state.position.y < 2) {
            this.state.position.y = 2;
            this.state.velocity.y = 0;
            this.state.isJump = false;

            // т.к. во время прыжка мы игнорили контроль, нужно накидать события из очереди (кроме прыжков)
            for (let i in this.eventQueue) {
                let event = this.eventQueue[i];
                if (event.type === 'keydown' && event.keyCode === 32) continue;
                if (event.type === 'keyup') this.onKeyUp(event);
                if (event.type === 'keydown') this.onKeyDown(event);
            }
            this.eventQueue = [];
        }

        this.body.position = this.state.position;
        this.body.rotation = this.camera.rotation;
        this.camera.position = this.state.position;
    };

    this.getInfo = () => {
        let playerInfo = Object.assign({}, this.state);
        let round = item => {
            let precision = 2;
            item.x = +item.x.toFixed(precision);
            item.y = +item.y.toFixed(precision);
            item.z = +item.z.toFixed(precision);
            return item;
        };
        playerInfo.direction = round(playerInfo.direction);
        playerInfo.velocity = round(playerInfo.velocity);
        playerInfo.position = round(playerInfo.position);
        playerInfo.rotation = round(playerInfo.rotation);
        return playerInfo;
    }
}

export {FPControl}