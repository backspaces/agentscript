// A generalized flood fill, designed to work on any agentset type.
//
// Floodfill arguments:
//
// * startingSet: initial array of agents, often a single agent: [a]
//
// * fCandidate(a, nextFront)
//   True if a is elegible to be added to the set of flooded agents
//
// * fJoin(a, prevFront)
//   Add a to the set of flooded agents(for example by setting a.flooded flag)
//
// * fNeighbors(a)
//   Return neighbors of this agent, those this flood will attempt to spread to
//
// To flood patches, you might want
//     fNeighbors = (patch) -> patch.neighbors()
// whereas to flood agents connected by links, you might want
//     fNeighbors = (node) -> node.linkNeighbors()

export default class FloodFill {
    constructor(startingSet, fCandidate, fJoin, fNeighbors) {
        Object.assign(this, { fCandidate, fJoin, fNeighbors })
        this.nextFront = startingSet
        this.prevFront = []
        this.done = false
        this.step = 0
    }
    floodOnce() {
        if (this.done) return

        // Apply thee 3 functions
        // const { fCandidate, fJoin, fNeighbors } = this
        for (const p of this.nextFront) this.fJoin(p, this.prevFront)
        const asetNext = [] // convert to js Sets
        for (const p of this.nextFront)
            for (const n of this.fNeighbors(p))
                if (this.fCandidate(n, this.nextFront))
                    if (asetNext.indexOf(n) < 0) asetNext.push(n)
        // Done w/ 3 functions

        this.prevFront = this.nextFront
        this.nextFront = asetNext
        this.step++

        this.done = this.nextFront.length === 0
    }
    flood() {
        while (!this.done) this.floodOnce()
    }
}
