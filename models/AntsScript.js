const util = AS.util
const Model = AS.Model
// import ColorMap from '../src/ColorMap.js'

class AntsModel extends Model {
    static defaults() {
        return {
            population: 255,
            speed: 1.0,
            maxPheromone: 35,
            diffusionRate: 0.3,
            evaporationRate: 0.01,
            wiggleAngle: util.radians(30),
        }
    }

    // ======================

    constructor(options) {
        super(options)
        Object.assign(this, this.constructor.defaults())
        // this.animRate = 30
    }

    setup() {
        // this.nestColor = 'yellow'
        // this.foodColor = 'blue'
        // this.nestColorMap = ColorMap.gradientColorMap(20, [
        //     'black',
        //     this.nestColor,
        // ])
        // this.foodColorMap = ColorMap.gradientColorMap(20, [
        //     'black',
        //     this.foodColor,
        // ])
        // this.nestSprite = this.spriteSheet.newSprite('bug', this.nestColor)
        // this.foodSprite = this.spriteSheet.newSprite('bug', this.foodColor)

        this.turtles.setDefault('atEdge', 'bounce')
        // this.turtles.setDefault('shape', 'bug')
        // this.turtles.setDefault('size', 3)
        // this.anim.setRate(this.animRate)

        // this.turtles.setDefault('color', this.foodColor)
        // Set a default sprite so turtles don't choose a random color
        // this.turtles.setDefault('sprite', this.foodSprite)

        // this.patches.ask(p => {
        //   p.color = ColorMap.LightGray.randomColor()
        // })
        // util.repeat(this.nestColorMap.length, i => {
        //   this.patches.patch(i, 0).color = this.nestColorMap[i]
        //   this.patches.patch(i, 1).color = this.foodColorMap[i]
        // })

        this.setupPatches()
        this.setupTurtles()
    }
    setupPatches() {
        this.patches.ask(p => {
            p.isNest = p.isFood = false
            p.nestPheromone = p.foodPheromone = 0
        })
        const { maxX, minX } = this.world
        this.patches.patchRectXY(maxX - 6, 0, 3, 3).ask(p => {
            p.isNest = true
            // p.color = this.nestColor
        })
        this.patches.patchRectXY(minX + 6, 0, 3, 3).ask(p => {
            p.isFood = true
            // p.color = this.foodColor
        })
        // const patches = this.patches
        // patches.patchRect(patches.patch(maxX - 6, 0), 3, 3).ask(p => {
        //   p.isNest = true; p.color = this.nestColor
        // })
        // patches.patchRect(patches.patch(minX + 6, 0), 3, 3).ask(p => {
        //   p.isFood = true; p.color = this.foodColor
        // })
    }
    setupTurtles() {
        this.turtles.create(this.population, t => {
            // const patch = this.patches.oneOf()
            // t.setxy(patch.x, patch.y)
            // t.sprite = (Math.random() < 0.5) ? this.nestSprite : this.foodSprite
            t.setxy(this.world.maxX - 6, 0)
            this.resetTurtle(t, false) // sets t.pheromone to max
        })
    }
    resetTurtle(t, withFood) {
        t.carryingFood = withFood
        // t.sprite = withFood ? this.nestSprite : this.foodSprite
        t.pheromone = this.maxPheromone
    }

    step() {
        // this.turtles.ask(t => {
        //   t.direction += util.randomCentered(this.wiggleAngle)
        //   t.forward(0.1)
        // })
        this.updateTurtles()
        this.updatePatches()
        // this.tick()
    }
    updateTurtles() {
        this.turtles.ask(t => {
            if (t.id >= this.ticks) return // slowly release ants
            this.wiggleUphill(t)
            this.dropPheromone(t)
            // t.direction += util.randomCentered(this.wiggleAngle)
            // t.forward(0.1)
        })
    }
    // wiggleUphill (t) {
    //   const p = t.patch
    //   const nAhead = p.neighbors.inCone(p, 2, Math.PI, t.theta)
    //   if (!nAhead.isEmpty()) { // happens at edge .. let edge handler manage.
    //   // if (nAhead.isEmpty() || p.isOnEdge()) {
    //   //   // t.rotate(Math.PI)
    //   //   // t.forward(1)
    //   // } else { // happens at edge .. let edge handler manage.
    //     const pheromone = t.carryingFood ? 'nestPheromone' : 'foodPheromone'
    //     const [n, max] = nAhead.maxValOf(pheromone)
    //     if (max > 0.001 / this.maxPheromone) t.face(n)
    //   }
    //   t.rotate(util.randomCentered(this.wiggleAngle))
    //   t.forward(this.speed)
    // }
    wiggleUphill(t) {
        const p = t.patch
        if (p.isOnEdge()) {
            t.rotate(Math.PI)
        } else {
            const nAhead = p.neighbors.inCone(p, 2, Math.PI, t.theta)
            // if (!nAhead.isEmpty()) { // happens at edge .. let edge handler manage.
            // if (nAhead.isEmpty() || p.isOnEdge) {
            //   // t.rotate(Math.PI)
            //   // t.forward(1)
            // } else { // happens at edge .. let edge handler manage.
            const pheromone = t.carryingFood ? 'nestPheromone' : 'foodPheromone'
            const [n, max] = nAhead.maxValOf(pheromone)
            if (max > 0.001 / this.maxPheromone) t.face(n)
            // }
        }
        t.rotate(util.randomCentered(this.wiggleAngle))
        t.forward(this.speed)
    }
    dropPheromone(t) {
        const p = t.patch
        // if (p.isOnEdge()) return
        // if (p.isOnEdge()) {
        //   p.nestPheromone = p.foodPheromone = 0
        //   return
        // }
        if ((!t.carryingFood && p.isFood) || (t.carryingFood && p.isNest)) {
            this.resetTurtle(t, !t.carryingFood)
        }
        const pheromone = t.carryingFood ? 'foodPheromone' : 'nestPheromone'
        p[pheromone] += 0.1 * t.pheromone
        // if t.carryingFood
        //   p.foodPheromone += 0.1*t.pheromone
        // else
        //   p.nestPheromone += 0.1*t.pheromone
        t.pheromone *= 0.9
    }
    // targetPheromone (t, n) {
    //   return t.carryingFood ? n.nestPheromone : n.foodPheromone
    // }

    updatePatches() {
        this.patches.diffuse('nestPheromone', this.diffusionRate)
        this.patches.diffuse('foodPheromone', this.diffusionRate)
        this.patches.ask(p => {
            // if (p.isOnEdge()) return
            // if (p.isOnEdge()) {
            //   p.nestPheromone = p.foodPheromone = 0
            //   return
            // }
            p.foodPheromone *= 1 - this.evaporationRate
            p.nestPheromone *= 1 - this.evaporationRate
            // p.foodPheromone = p.nestPheromone = 0 if p.isOnEdge()
            // if (p.isNest || p.isFood || p.isOnEdge()) return
            // if (p.isNest || p.isFood) return

            // if (!p.isNest && !p.isFood) {
            //     p.color =
            //         p.foodPheromone > p.nestPheromone
            //             ? this.foodColorMap.scaleColor(p.foodPheromone, 0, 1)
            //             : this.nestColorMap.scaleColor(p.nestPheromone, 0, 1)
            // }
        })
    }
}
