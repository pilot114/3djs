class State {
    constructor(render) {
        this.render = render
        this.render.drawLayers()
        console.log('init game')
    }

    // has change in viewport
    isNeedRender() {
        return false
    }

    update() {
        // ...
        console.log('update game state')

        if (this.isNeedRender()) {
            this.render.drawLayers()
            console.log('render game')
        }
    }
}
