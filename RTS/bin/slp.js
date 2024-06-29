let fs = require('fs')

let Palette = require('jascpal')
let mainPalette = Palette(fs.readFileSync('./palette.pal'))

function convertBuilding(id, name, player) {
    let SLP = require('genie-slp')
    let slp = SLP(fs.readFileSync(`../original/slp/${id}.slp`))
    let frame = slp.renderFrame(0, mainPalette, { player })

    console.log(id)
    console.log(frame)

    // let { PNG } = require('pngjs')
    // let png = new PNG({
    //     width: frame.width,
    //     height: frame.height
    // })
    // png.data = Buffer.from(frame.data.buffer)
    //
    // const dir = `../assets/buildings/${name}/${player}`
    // if (!fs.existsSync(dir)) {
    //     fs.mkdirSync(dir, { recursive: true });
    // }
    // png.pack().pipe(fs.createWriteStream(`${dir}/${id}.png`))
}

const player = 2;

convertBuilding(889, 'center_dark_age', player);
// convertBuilding(891, 'center_dark_age', player);
// convertBuilding(3594, 'center_dark_age', player);
// convertBuilding(3595, 'center_dark_age', player);
// convertBuilding(3596, 'center_dark_age', player);
// convertBuilding(4610, 'center_dark_age', player);
// convertBuilding(4611, 'center_dark_age', player);
// convertBuilding(4612, 'center_dark_age', player);
