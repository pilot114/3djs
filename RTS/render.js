class Render {
    constructor(canvas) {
        this.canvas = canvas
        this.context = canvas.getContext("2d")
        this.cellSize = 64
        this.isometricCoef = 0.5
    }

    async drawLayers() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // layers
        await this.surface()
        this.grid()
        this.buildings()
    }

    toIsometric(x, y) {
        return {
            x: x - y,
            y: (x + y) * this.isometricCoef
        }
    }

    line(startX, startY, endX, endY) {
        const isoStart = this.toIsometric(startX, startY)
        const isoEnd = this.toIsometric(endX, endY)

        this.context.beginPath()
        this.context.moveTo(isoStart.x, isoStart.y)
        this.context.lineTo(isoEnd.x, isoEnd.y)
        this.context.stroke()
    }

    grid() {
        const { width, height } = this.canvas;

        for (let x = 0; x <= 2 * height; x += this.cellSize) {
            this.line(x, -height, x, height);
        }

        for (let y = -width; y <= width; y += this.cellSize) {
            this.line(0, y, 2 * width, y);
        }
    }

    async drawImageOnIsometricGrid(imgUrl, x, y) {
        const img = await this.loadImage(imgUrl)
        const shiftY = x + 8
        const isoCoords = this.toIsometric(
            x * this.cellSize - y,
            y * this.cellSize + shiftY
        )
        this.context.save()
        this.context.setTransform(1, -this.isometricCoef, 1, this.isometricCoef, isoCoords.x, isoCoords.y)
        this.context.drawImage(img, x, y)
        this.context.restore()
    }

    async drawImage(imgUrl, x, y) {
        const img = await this.loadImage(imgUrl)
        this.context.save()
        this.context.drawImage(img, x, y)
        this.context.restore()
    }

    async resizeImage(imageUrl, width, height) {
        const img = await this.loadImage(imageUrl)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        return canvas.toDataURL()
    }

    loadImage(imageUrl) {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = imageUrl
            img.onload = function() {
                resolve(img)
            }
        })
    }

    async surface() {
        const url = await this.resizeImage('./assets/grass.jpg', this.cellSize * 5, this.cellSize * 5)
        await this.drawImageOnIsometricGrid(url, 0, 0)
        await this.drawImageOnIsometricGrid(url, 5, 0)
        await this.drawImageOnIsometricGrid(url, 10, 0)
        await this.drawImageOnIsometricGrid(url, 10, 5)
        await this.drawImageOnIsometricGrid(url, 10, 10)
    }

    resources() {
    }
    buildings() {
        const buildings = [
            {
                'center_dark_age': [
                    {id: 889},
                    {id: 891},
                    {id: 3594},
                    {id: 3595},
                    {id: 3596},
                    {id: 4610},
                    {id: 4611},
                    {id: 4612},
              ]
            },
        ]
        const baseURL = './assets/buildings'
        const player = 2

        buildings.forEach(building => {
            for (const name in building) {
                building[name].forEach(async part => {
                    const imageUrl = `${baseURL}/${name}/${player}/${part.id}.png`
                    await this.drawImage(imageUrl, 560, 240)
                });
            }
        });
    }
    units() {
    }
    shadow() {
    }
    interface() {
    }
}
