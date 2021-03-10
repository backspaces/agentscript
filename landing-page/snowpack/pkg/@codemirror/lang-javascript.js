import { D as DefaultBufferLength, e as NodeSet, d as NodeType, h as stringInput, T as Tree, j as TreeBuffer, N as NodeProp, L as LezerLanguage, k as indentNodeProp, l as continuedIndent, m as flatIndent, n as delimitedIndent, o as foldNodeProp, p as foldInside, q as LanguageSupport } from '../common/index-a9e9ab30.js';
import { s as snippetCompletion, b as styleTags, t as tags, i as ifNotIn, e as completeFromList } from '../common/index-46799c0c.js';
import '../common/index-0264ae51.js';

/* SNOWPACK PROCESS POLYFILL (based on https://github.com/calvinmetcalf/node-process-es6) */
function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
var globalContext;
if (typeof window !== 'undefined') {
    globalContext = window;
} else if (typeof self !== 'undefined') {
    globalContext = self;
} else {
    globalContext = {};
}
if (typeof globalContext.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof globalContext.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
var title = 'browser';
var platform = 'browser';
var browser = true;
var argv = [];
var version = ''; // empty string to avoid regexp issues
var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;

function binding(name) {
    throw new Error('process.binding is not supported');
}

function cwd () { return '/' }
function chdir (dir) {
    throw new Error('process.chdir is not supported');
}function umask() { return 0; }

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = globalContext.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp){
  var clocktime = performanceNow.call(performance)*1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor((clocktime%1)*1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds<0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds,nanoseconds]
}

var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1000;
}

var process = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: {"NODE_ENV":"production"},
  argv: argv,
  version: version,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

/// A parse stack. These are used internally by the parser to track
/// parsing progress. They also provide some properties and methods
/// that external code such as a tokenizer can use to get information
/// about the parse state.
class Stack {
    /// @internal
    constructor(
    /// A the parse that this stack is part of @internal
    p, 
    /// Holds state, pos, value stack pos (15 bits array index, 15 bits
    /// buffer index) triplets for all but the top state
    /// @internal
    stack, 
    /// The current parse state @internal
    state, 
    // The position at which the next reduce should take place. This
    // can be less than `this.pos` when skipped expressions have been
    // added to the stack (which should be moved outside of the next
    // reduction)
    /// @internal
    reducePos, 
    /// The input position up to which this stack has parsed.
    pos, 
    /// The dynamic score of the stack, including dynamic precedence
    /// and error-recovery penalties
    /// @internal
    score, 
    // The output buffer. Holds (type, start, end, size) quads
    // representing nodes created by the parser, where `size` is
    // amount of buffer array entries covered by this node.
    /// @internal
    buffer, 
    // The base offset of the buffer. When stacks are split, the split
    // instance shared the buffer history with its parent up to
    // `bufferBase`, which is the absolute offset (including the
    // offset of previous splits) into the buffer at which this stack
    // starts writing.
    /// @internal
    bufferBase, 
    /// @internal
    curContext, 
    // A parent stack from which this was split off, if any. This is
    // set up so that it always points to a stack that has some
    // additional buffer content, never to a stack with an equal
    // `bufferBase`.
    /// @internal
    parent) {
        this.p = p;
        this.stack = stack;
        this.state = state;
        this.reducePos = reducePos;
        this.pos = pos;
        this.score = score;
        this.buffer = buffer;
        this.bufferBase = bufferBase;
        this.curContext = curContext;
        this.parent = parent;
    }
    /// @internal
    toString() {
        return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
    }
    // Start an empty stack
    /// @internal
    static start(p, state, pos = 0) {
        let cx = p.parser.context;
        return new Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, null);
    }
    /// The stack's current [context](#lezer.ContextTracker) value, if
    /// any. Its type will depend on the context tracker's type
    /// parameter, or it will be `null` if there is no context
    /// tracker.
    get context() { return this.curContext ? this.curContext.context : null; }
    // Push a state onto the stack, tracking its start position as well
    // as the buffer base at that point.
    /// @internal
    pushState(state, start) {
        this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
        this.state = state;
    }
    // Apply a reduce action
    /// @internal
    reduce(action) {
        let depth = action >> 19 /* ReduceDepthShift */, type = action & 65535 /* ValueMask */;
        let { parser } = this.p;
        let dPrec = parser.dynamicPrecedence(type);
        if (dPrec)
            this.score += dPrec;
        if (depth == 0) {
            // Zero-depth reductions are a special case—they add stuff to
            // the stack without popping anything off.
            if (type < parser.minRepeatTerm)
                this.storeNode(type, this.reducePos, this.reducePos, 4, true);
            this.pushState(parser.getGoto(this.state, type, true), this.reducePos);
            this.reduceContext(type);
            return;
        }
        // Find the base index into `this.stack`, content after which will
        // be dropped. Note that with `StayFlag` reductions we need to
        // consume two extra frames (the dummy parent node for the skipped
        // expression and the state that we'll be staying in, which should
        // be moved to `this.state`).
        let base = this.stack.length - ((depth - 1) * 3) - (action & 262144 /* StayFlag */ ? 6 : 0);
        let start = this.stack[base - 2];
        let bufferBase = this.stack[base - 1], count = this.bufferBase + this.buffer.length - bufferBase;
        // Store normal terms or `R -> R R` repeat reductions
        if (type < parser.minRepeatTerm || (action & 131072 /* RepeatFlag */)) {
            let pos = parser.stateFlag(this.state, 1 /* Skipped */) ? this.pos : this.reducePos;
            this.storeNode(type, start, pos, count + 4, true);
        }
        if (action & 262144 /* StayFlag */) {
            this.state = this.stack[base];
        }
        else {
            let baseStateID = this.stack[base - 3];
            this.state = parser.getGoto(baseStateID, type, true);
        }
        while (this.stack.length > base)
            this.stack.pop();
        this.reduceContext(type);
    }
    // Shift a value into the buffer
    /// @internal
    storeNode(term, start, end, size = 4, isReduce = false) {
        if (term == 0 /* Err */) { // Try to omit/merge adjacent error nodes
            let cur = this, top = this.buffer.length;
            if (top == 0 && cur.parent) {
                top = cur.bufferBase - cur.parent.bufferBase;
                cur = cur.parent;
            }
            if (top > 0 && cur.buffer[top - 4] == 0 /* Err */ && cur.buffer[top - 1] > -1) {
                if (start == end)
                    return;
                if (cur.buffer[top - 2] >= start) {
                    cur.buffer[top - 2] = end;
                    return;
                }
            }
        }
        if (!isReduce || this.pos == end) { // Simple case, just append
            this.buffer.push(term, start, end, size);
        }
        else { // There may be skipped nodes that have to be moved forward
            let index = this.buffer.length;
            if (index > 0 && this.buffer[index - 4] != 0 /* Err */)
                while (index > 0 && this.buffer[index - 2] > end) {
                    // Move this record forward
                    this.buffer[index] = this.buffer[index - 4];
                    this.buffer[index + 1] = this.buffer[index - 3];
                    this.buffer[index + 2] = this.buffer[index - 2];
                    this.buffer[index + 3] = this.buffer[index - 1];
                    index -= 4;
                    if (size > 4)
                        size -= 4;
                }
            this.buffer[index] = term;
            this.buffer[index + 1] = start;
            this.buffer[index + 2] = end;
            this.buffer[index + 3] = size;
        }
    }
    // Apply a shift action
    /// @internal
    shift(action, next, nextEnd) {
        if (action & 131072 /* GotoFlag */) {
            this.pushState(action & 65535 /* ValueMask */, this.pos);
        }
        else if ((action & 262144 /* StayFlag */) == 0) { // Regular shift
            let start = this.pos, nextState = action, { parser } = this.p;
            if (nextEnd > this.pos || next <= parser.maxNode) {
                this.pos = nextEnd;
                if (!parser.stateFlag(nextState, 1 /* Skipped */))
                    this.reducePos = nextEnd;
            }
            this.pushState(nextState, start);
            if (next <= parser.maxNode)
                this.buffer.push(next, start, nextEnd, 4);
            this.shiftContext(next);
        }
        else { // Shift-and-stay, which means this is a skipped token
            if (next <= this.p.parser.maxNode)
                this.buffer.push(next, this.pos, nextEnd, 4);
            this.pos = nextEnd;
        }
    }
    // Apply an action
    /// @internal
    apply(action, next, nextEnd) {
        if (action & 65536 /* ReduceFlag */)
            this.reduce(action);
        else
            this.shift(action, next, nextEnd);
    }
    // Add a prebuilt node into the buffer. This may be a reused node or
    // the result of running a nested parser.
    /// @internal
    useNode(value, next) {
        let index = this.p.reused.length - 1;
        if (index < 0 || this.p.reused[index] != value) {
            this.p.reused.push(value);
            index++;
        }
        let start = this.pos;
        this.reducePos = this.pos = start + value.length;
        this.pushState(next, start);
        this.buffer.push(index, start, this.reducePos, -1 /* size < 0 means this is a reused value */);
        if (this.curContext)
            this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this.p.input, this));
    }
    // Split the stack. Due to the buffer sharing and the fact
    // that `this.stack` tends to stay quite shallow, this isn't very
    // expensive.
    /// @internal
    split() {
        let parent = this;
        let off = parent.buffer.length;
        // Because the top of the buffer (after this.pos) may be mutated
        // to reorder reductions and skipped tokens, and shared buffers
        // should be immutable, this copies any outstanding skipped tokens
        // to the new buffer, and puts the base pointer before them.
        while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
            off -= 4;
        let buffer = parent.buffer.slice(off), base = parent.bufferBase + off;
        // Make sure parent points to an actual parent with content, if there is such a parent.
        while (parent && base == parent.bufferBase)
            parent = parent.parent;
        return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base, this.curContext, parent);
    }
    // Try to recover from an error by 'deleting' (ignoring) one token.
    /// @internal
    recoverByDelete(next, nextEnd) {
        let isNode = next <= this.p.parser.maxNode;
        if (isNode)
            this.storeNode(next, this.pos, nextEnd);
        this.storeNode(0 /* Err */, this.pos, nextEnd, isNode ? 8 : 4);
        this.pos = this.reducePos = nextEnd;
        this.score -= 200 /* Token */;
    }
    /// Check if the given term would be able to be shifted (optionally
    /// after some reductions) on this stack. This can be useful for
    /// external tokenizers that want to make sure they only provide a
    /// given token when it applies.
    canShift(term) {
        for (let sim = new SimulatedStack(this);;) {
            let action = this.p.parser.stateSlot(sim.top, 4 /* DefaultReduce */) || this.p.parser.hasAction(sim.top, term);
            if ((action & 65536 /* ReduceFlag */) == 0)
                return true;
            if (action == 0)
                return false;
            sim.reduce(action);
        }
    }
    /// Find the start position of the rule that is currently being parsed.
    get ruleStart() {
        for (let state = this.state, base = this.stack.length;;) {
            let force = this.p.parser.stateSlot(state, 5 /* ForcedReduce */);
            if (!(force & 65536 /* ReduceFlag */))
                return 0;
            base -= 3 * (force >> 19 /* ReduceDepthShift */);
            if ((force & 65535 /* ValueMask */) < this.p.parser.minRepeatTerm)
                return this.stack[base + 1];
            state = this.stack[base];
        }
    }
    /// Find the start position of an instance of any of the given term
    /// types, or return `null` when none of them are found.
    ///
    /// **Note:** this is only reliable when there is at least some
    /// state that unambiguously matches the given rule on the stack.
    /// I.e. if you have a grammar like this, where the difference
    /// between `a` and `b` is only apparent at the third token:
    ///
    ///     a { b | c }
    ///     b { "x" "y" "x" }
    ///     c { "x" "y" "z" }
    ///
    /// Then a parse state after `"x"` will not reliably tell you that
    /// `b` is on the stack. You _can_ pass `[b, c]` to reliably check
    /// for either of those two rules (assuming that `a` isn't part of
    /// some rule that includes other things starting with `"x"`).
    ///
    /// When `before` is given, this keeps scanning up the stack until
    /// it finds a match that starts before that position.
    ///
    /// Note that you have to be careful when using this in tokenizers,
    /// since it's relatively easy to introduce data dependencies that
    /// break incremental parsing by using this method.
    startOf(types, before) {
        let state = this.state, frame = this.stack.length, { parser } = this.p;
        for (;;) {
            let force = parser.stateSlot(state, 5 /* ForcedReduce */);
            let depth = force >> 19 /* ReduceDepthShift */, term = force & 65535 /* ValueMask */;
            if (types.indexOf(term) > -1) {
                let base = frame - (3 * (force >> 19 /* ReduceDepthShift */)), pos = this.stack[base + 1];
                if (before == null || before > pos)
                    return pos;
            }
            if (frame == 0)
                return null;
            if (depth == 0) {
                frame -= 3;
                state = this.stack[frame];
            }
            else {
                frame -= 3 * (depth - 1);
                state = parser.getGoto(this.stack[frame - 3], term, true);
            }
        }
    }
    // Apply up to Recover.MaxNext recovery actions that conceptually
    // inserts some missing token or rule.
    /// @internal
    recoverByInsert(next) {
        if (this.stack.length >= 300 /* MaxInsertStackDepth */)
            return [];
        let nextStates = this.p.parser.nextStates(this.state);
        if (nextStates.length > 4 /* MaxNext */ << 1 || this.stack.length >= 120 /* DampenInsertStackDepth */) {
            let best = [];
            for (let i = 0, s; i < nextStates.length; i += 2) {
                if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
                    best.push(nextStates[i], s);
            }
            if (this.stack.length < 120 /* DampenInsertStackDepth */)
                for (let i = 0; best.length < 4 /* MaxNext */ << 1 && i < nextStates.length; i += 2) {
                    let s = nextStates[i + 1];
                    if (!best.some((v, i) => (i & 1) && v == s))
                        best.push(nextStates[i], s);
                }
            nextStates = best;
        }
        let result = [];
        for (let i = 0; i < nextStates.length && result.length < 4 /* MaxNext */; i += 2) {
            let s = nextStates[i + 1];
            if (s == this.state)
                continue;
            let stack = this.split();
            stack.storeNode(0 /* Err */, stack.pos, stack.pos, 4, true);
            stack.pushState(s, this.pos);
            stack.shiftContext(nextStates[i]);
            stack.score -= 200 /* Token */;
            result.push(stack);
        }
        return result;
    }
    // Force a reduce, if possible. Return false if that can't
    // be done.
    /// @internal
    forceReduce() {
        let reduce = this.p.parser.stateSlot(this.state, 5 /* ForcedReduce */);
        if ((reduce & 65536 /* ReduceFlag */) == 0)
            return false;
        if (!this.p.parser.validAction(this.state, reduce)) {
            this.storeNode(0 /* Err */, this.reducePos, this.reducePos, 4, true);
            this.score -= 100 /* Reduce */;
        }
        this.reduce(reduce);
        return true;
    }
    /// @internal
    forceAll() {
        while (!this.p.parser.stateFlag(this.state, 2 /* Accepting */) && this.forceReduce()) { }
        return this;
    }
    /// Check whether this state has no further actions (assumed to be a direct descendant of the
    /// top state, since any other states must be able to continue
    /// somehow). @internal
    get deadEnd() {
        if (this.stack.length != 3)
            return false;
        let { parser } = this.p;
        return parser.data[parser.stateSlot(this.state, 1 /* Actions */)] == 65535 /* End */ &&
            !parser.stateSlot(this.state, 4 /* DefaultReduce */);
    }
    /// Restart the stack (put it back in its start state). Only safe
    /// when this.stack.length == 3 (state is directly below the top
    /// state). @internal
    restart() {
        this.state = this.stack[0];
        this.stack.length = 0;
    }
    /// @internal
    sameState(other) {
        if (this.state != other.state || this.stack.length != other.stack.length)
            return false;
        for (let i = 0; i < this.stack.length; i += 3)
            if (this.stack[i] != other.stack[i])
                return false;
        return true;
    }
    /// Get the parser used by this stack.
    get parser() { return this.p.parser; }
    /// Test whether a given dialect (by numeric ID, as exported from
    /// the terms file) is enabled.
    dialectEnabled(dialectID) { return this.p.parser.dialect.flags[dialectID]; }
    shiftContext(term) {
        if (this.curContext)
            this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this.p.input, this));
    }
    reduceContext(term) {
        if (this.curContext)
            this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this.p.input, this));
    }
    /// @internal
    emitContext() {
        let cx = this.curContext;
        if (!cx.tracker.strict)
            return;
        let last = this.buffer.length - 1;
        if (last < 0 || this.buffer[last] != -2)
            this.buffer.push(cx.hash, this.reducePos, this.reducePos, -2);
    }
    updateContext(context) {
        if (context != this.curContext.context) {
            let newCx = new StackContext(this.curContext.tracker, context);
            if (newCx.hash != this.curContext.hash)
                this.emitContext();
            this.curContext = newCx;
        }
    }
}
class StackContext {
    constructor(tracker, context) {
        this.tracker = tracker;
        this.context = context;
        this.hash = tracker.hash(context);
    }
}
var Recover;
(function (Recover) {
    Recover[Recover["Token"] = 200] = "Token";
    Recover[Recover["Reduce"] = 100] = "Reduce";
    Recover[Recover["MaxNext"] = 4] = "MaxNext";
    Recover[Recover["MaxInsertStackDepth"] = 300] = "MaxInsertStackDepth";
    Recover[Recover["DampenInsertStackDepth"] = 120] = "DampenInsertStackDepth";
})(Recover || (Recover = {}));
// Used to cheaply run some reductions to scan ahead without mutating
// an entire stack
class SimulatedStack {
    constructor(stack) {
        this.stack = stack;
        this.top = stack.state;
        this.rest = stack.stack;
        this.offset = this.rest.length;
    }
    reduce(action) {
        let term = action & 65535 /* ValueMask */, depth = action >> 19 /* ReduceDepthShift */;
        if (depth == 0) {
            if (this.rest == this.stack.stack)
                this.rest = this.rest.slice();
            this.rest.push(this.top, 0, 0);
            this.offset += 3;
        }
        else {
            this.offset -= (depth - 1) * 3;
        }
        let goto = this.stack.p.parser.getGoto(this.rest[this.offset - 3], term, true);
        this.top = goto;
    }
}
// This is given to `Tree.build` to build a buffer, and encapsulates
// the parent-stack-walking necessary to read the nodes.
class StackBufferCursor {
    constructor(stack, pos, index) {
        this.stack = stack;
        this.pos = pos;
        this.index = index;
        this.buffer = stack.buffer;
        if (this.index == 0)
            this.maybeNext();
    }
    static create(stack) {
        return new StackBufferCursor(stack, stack.bufferBase + stack.buffer.length, stack.buffer.length);
    }
    maybeNext() {
        let next = this.stack.parent;
        if (next != null) {
            this.index = this.stack.bufferBase - next.bufferBase;
            this.stack = next;
            this.buffer = next.buffer;
        }
    }
    get id() { return this.buffer[this.index - 4]; }
    get start() { return this.buffer[this.index - 3]; }
    get end() { return this.buffer[this.index - 2]; }
    get size() { return this.buffer[this.index - 1]; }
    next() {
        this.index -= 4;
        this.pos -= 4;
        if (this.index == 0)
            this.maybeNext();
    }
    fork() {
        return new StackBufferCursor(this.stack, this.pos, this.index);
    }
}

/// Tokenizers write the tokens they read into instances of this class.
class Token {
    constructor() {
        /// The start of the token. This is set by the parser, and should not
        /// be mutated by the tokenizer.
        this.start = -1;
        /// This starts at -1, and should be updated to a term id when a
        /// matching token is found.
        this.value = -1;
        /// When setting `.value`, you should also set `.end` to the end
        /// position of the token. (You'll usually want to use the `accept`
        /// method.)
        this.end = -1;
    }
    /// Accept a token, setting `value` and `end` to the given values.
    accept(value, end) {
        this.value = value;
        this.end = end;
    }
}
/// @internal
class TokenGroup {
    constructor(data, id) {
        this.data = data;
        this.id = id;
    }
    token(input, token, stack) { readToken(this.data, input, token, stack, this.id); }
}
TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
/// Exports that are used for `@external tokens` in the grammar should
/// export an instance of this class.
class ExternalTokenizer {
    /// Create a tokenizer. The first argument is the function that,
    /// given an input stream and a token object,
    /// [fills](#lezer.Token.accept) the token object if it recognizes a
    /// token. `token.start` should be used as the start position to
    /// scan from.
    constructor(
    /// @internal
    token, options = {}) {
        this.token = token;
        this.contextual = !!options.contextual;
        this.fallback = !!options.fallback;
        this.extend = !!options.extend;
    }
}
// Tokenizer data is stored a big uint16 array containing, for each
// state:
//
//  - A group bitmask, indicating what token groups are reachable from
//    this state, so that paths that can only lead to tokens not in
//    any of the current groups can be cut off early.
//
//  - The position of the end of the state's sequence of accepting
//    tokens
//
//  - The number of outgoing edges for the state
//
//  - The accepting tokens, as (token id, group mask) pairs
//
//  - The outgoing edges, as (start character, end character, state
//    index) triples, with end character being exclusive
//
// This function interprets that data, running through a stream as
// long as new states with the a matching group mask can be reached,
// and updating `token` when it matches a token.
function readToken(data, input, token, stack, group) {
    let state = 0, groupMask = 1 << group, dialect = stack.p.parser.dialect;
    scan: for (let pos = token.start;;) {
        if ((groupMask & data[state]) == 0)
            break;
        let accEnd = data[state + 1];
        // Check whether this state can lead to a token in the current group
        // Accept tokens in this state, possibly overwriting
        // lower-precedence / shorter tokens
        for (let i = state + 3; i < accEnd; i += 2)
            if ((data[i + 1] & groupMask) > 0) {
                let term = data[i];
                if (dialect.allows(term) &&
                    (token.value == -1 || token.value == term || stack.p.parser.overrides(term, token.value))) {
                    token.accept(term, pos);
                    break;
                }
            }
        let next = input.get(pos++);
        // Do a binary search on the state's edges
        for (let low = 0, high = data[state + 2]; low < high;) {
            let mid = (low + high) >> 1;
            let index = accEnd + mid + (mid << 1);
            let from = data[index], to = data[index + 1];
            if (next < from)
                high = mid;
            else if (next >= to)
                low = mid + 1;
            else {
                state = data[index + 2];
                continue scan;
            }
        }
        break;
    }
}

// See lezer-generator/src/encode.ts for comments about the encoding
// used here
function decodeArray(input, Type = Uint16Array) {
    if (typeof input != "string")
        return input;
    let array = null;
    for (let pos = 0, out = 0; pos < input.length;) {
        let value = 0;
        for (;;) {
            let next = input.charCodeAt(pos++), stop = false;
            if (next == 126 /* BigValCode */) {
                value = 65535 /* BigVal */;
                break;
            }
            if (next >= 92 /* Gap2 */)
                next--;
            if (next >= 34 /* Gap1 */)
                next--;
            let digit = next - 32 /* Start */;
            if (digit >= 46 /* Base */) {
                digit -= 46 /* Base */;
                stop = true;
            }
            value += digit;
            if (stop)
                break;
            value *= 46 /* Base */;
        }
        if (array)
            array[out++] = value;
        else
            array = new Type(value);
    }
    return array;
}

// FIXME find some way to reduce recovery work done when the input
// doesn't match the grammar at all.
// Environment variable used to control console output
const verbose = typeof process != "undefined" && /\bparse\b/.test(process.env.LOG);
let stackIDs = null;
function cutAt(tree, pos, side) {
    let cursor = tree.cursor(pos);
    for (;;) {
        if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
            for (;;) {
                if ((side < 0 ? cursor.to <= pos : cursor.from >= pos) && !cursor.type.isError)
                    return side < 0 ? Math.max(0, Math.min(cursor.to - 1, pos - 5)) : Math.min(tree.length, Math.max(cursor.from + 1, pos + 5));
                if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
                    break;
                if (!cursor.parent())
                    return side < 0 ? 0 : tree.length;
            }
    }
}
class FragmentCursor {
    constructor(fragments) {
        this.fragments = fragments;
        this.i = 0;
        this.fragment = null;
        this.safeFrom = -1;
        this.safeTo = -1;
        this.trees = [];
        this.start = [];
        this.index = [];
        this.nextFragment();
    }
    nextFragment() {
        let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
        if (fr) {
            this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
            this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
            while (this.trees.length) {
                this.trees.pop();
                this.start.pop();
                this.index.pop();
            }
            this.trees.push(fr.tree);
            this.start.push(-fr.offset);
            this.index.push(0);
            this.nextStart = this.safeFrom;
        }
        else {
            this.nextStart = 1e9;
        }
    }
    // `pos` must be >= any previously given `pos` for this cursor
    nodeAt(pos) {
        if (pos < this.nextStart)
            return null;
        while (this.fragment && this.safeTo <= pos)
            this.nextFragment();
        if (!this.fragment)
            return null;
        for (;;) {
            let last = this.trees.length - 1;
            if (last < 0) { // End of tree
                this.nextFragment();
                return null;
            }
            let top = this.trees[last], index = this.index[last];
            if (index == top.children.length) {
                this.trees.pop();
                this.start.pop();
                this.index.pop();
                continue;
            }
            let next = top.children[index];
            let start = this.start[last] + top.positions[index];
            if (start > pos) {
                this.nextStart = start;
                return null;
            }
            else if (start == pos && start + next.length <= this.safeTo) {
                return start == pos && start >= this.safeFrom ? next : null;
            }
            if (next instanceof TreeBuffer) {
                this.index[last]++;
                this.nextStart = start + next.length;
            }
            else {
                this.index[last]++;
                if (start + next.length >= pos) { // Enter this node
                    this.trees.push(next);
                    this.start.push(start);
                    this.index.push(0);
                }
            }
        }
    }
}
class CachedToken extends Token {
    constructor() {
        super(...arguments);
        this.extended = -1;
        this.mask = 0;
        this.context = 0;
    }
    clear(start) {
        this.start = start;
        this.value = this.extended = -1;
    }
}
const dummyToken = new Token;
class TokenCache {
    constructor(parser) {
        this.tokens = [];
        this.mainToken = dummyToken;
        this.actions = [];
        this.tokens = parser.tokenizers.map(_ => new CachedToken);
    }
    getActions(stack, input) {
        let actionIndex = 0;
        let main = null;
        let { parser } = stack.p, { tokenizers } = parser;
        let mask = parser.stateSlot(stack.state, 3 /* TokenizerMask */);
        let context = stack.curContext ? stack.curContext.hash : 0;
        for (let i = 0; i < tokenizers.length; i++) {
            if (((1 << i) & mask) == 0)
                continue;
            let tokenizer = tokenizers[i], token = this.tokens[i];
            if (main && !tokenizer.fallback)
                continue;
            if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
                this.updateCachedToken(token, tokenizer, stack, input);
                token.mask = mask;
                token.context = context;
            }
            if (token.value != 0 /* Err */) {
                let startIndex = actionIndex;
                if (token.extended > -1)
                    actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
                actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
                if (!tokenizer.extend) {
                    main = token;
                    if (actionIndex > startIndex)
                        break;
                }
            }
        }
        while (this.actions.length > actionIndex)
            this.actions.pop();
        if (!main) {
            main = dummyToken;
            main.start = stack.pos;
            if (stack.pos == input.length)
                main.accept(stack.p.parser.eofTerm, stack.pos);
            else
                main.accept(0 /* Err */, stack.pos + 1);
        }
        this.mainToken = main;
        return this.actions;
    }
    updateCachedToken(token, tokenizer, stack, input) {
        token.clear(stack.pos);
        tokenizer.token(input, token, stack);
        if (token.value > -1) {
            let { parser } = stack.p;
            for (let i = 0; i < parser.specialized.length; i++)
                if (parser.specialized[i] == token.value) {
                    let result = parser.specializers[i](input.read(token.start, token.end), stack);
                    if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
                        if ((result & 1) == 0 /* Specialize */)
                            token.value = result >> 1;
                        else
                            token.extended = result >> 1;
                        break;
                    }
                }
        }
        else if (stack.pos == input.length) {
            token.accept(stack.p.parser.eofTerm, stack.pos);
        }
        else {
            token.accept(0 /* Err */, stack.pos + 1);
        }
    }
    putAction(action, token, end, index) {
        // Don't add duplicate actions
        for (let i = 0; i < index; i += 3)
            if (this.actions[i] == action)
                return index;
        this.actions[index++] = action;
        this.actions[index++] = token;
        this.actions[index++] = end;
        return index;
    }
    addActions(stack, token, end, index) {
        let { state } = stack, { parser } = stack.p, { data } = parser;
        for (let set = 0; set < 2; set++) {
            for (let i = parser.stateSlot(state, set ? 2 /* Skip */ : 1 /* Actions */);; i += 3) {
                if (data[i] == 65535 /* End */) {
                    if (data[i + 1] == 1 /* Next */) {
                        i = pair(data, i + 2);
                    }
                    else {
                        if (index == 0 && data[i + 1] == 2 /* Other */)
                            index = this.putAction(pair(data, i + 1), token, end, index);
                        break;
                    }
                }
                if (data[i] == token)
                    index = this.putAction(pair(data, i + 1), token, end, index);
            }
        }
        return index;
    }
}
var Rec;
(function (Rec) {
    Rec[Rec["Distance"] = 5] = "Distance";
    Rec[Rec["MaxRemainingPerStep"] = 3] = "MaxRemainingPerStep";
    Rec[Rec["MinBufferLengthPrune"] = 200] = "MinBufferLengthPrune";
    Rec[Rec["ForceReduceLimit"] = 10] = "ForceReduceLimit";
})(Rec || (Rec = {}));
/// A parse context can be used for step-by-step parsing. After
/// creating it, you repeatedly call `.advance()` until it returns a
/// tree to indicate it has reached the end of the parse.
class Parse {
    constructor(parser, input, startPos, context) {
        this.parser = parser;
        this.input = input;
        this.startPos = startPos;
        this.context = context;
        // The position to which the parse has advanced.
        this.pos = 0;
        this.recovering = 0;
        this.nextStackID = 0x2654;
        this.nested = null;
        this.nestEnd = 0;
        this.nestWrap = null;
        this.reused = [];
        this.tokens = new TokenCache(parser);
        this.topTerm = parser.top[1];
        this.stacks = [Stack.start(this, parser.top[0], this.startPos)];
        let fragments = context === null || context === void 0 ? void 0 : context.fragments;
        this.fragments = fragments && fragments.length ? new FragmentCursor(fragments) : null;
    }
    // Move the parser forward. This will process all parse stacks at
    // `this.pos` and try to advance them to a further position. If no
    // stack for such a position is found, it'll start error-recovery.
    //
    // When the parse is finished, this will return a syntax tree. When
    // not, it returns `null`.
    advance() {
        if (this.nested) {
            let result = this.nested.advance();
            this.pos = this.nested.pos;
            if (result) {
                this.finishNested(this.stacks[0], result);
                this.nested = null;
            }
            return null;
        }
        let stacks = this.stacks, pos = this.pos;
        // This will hold stacks beyond `pos`.
        let newStacks = this.stacks = [];
        let stopped, stoppedTokens;
        let maybeNest;
        // Keep advancing any stacks at `pos` until they either move
        // forward or can't be advanced. Gather stacks that can't be
        // advanced further in `stopped`.
        for (let i = 0; i < stacks.length; i++) {
            let stack = stacks[i], nest;
            for (;;) {
                if (stack.pos > pos) {
                    newStacks.push(stack);
                }
                else if (nest = this.checkNest(stack)) {
                    if (!maybeNest || maybeNest.stack.score < stack.score)
                        maybeNest = nest;
                }
                else if (this.advanceStack(stack, newStacks, stacks)) {
                    continue;
                }
                else {
                    if (!stopped) {
                        stopped = [];
                        stoppedTokens = [];
                    }
                    stopped.push(stack);
                    let tok = this.tokens.mainToken;
                    stoppedTokens.push(tok.value, tok.end);
                }
                break;
            }
        }
        if (maybeNest) {
            this.startNested(maybeNest);
            return null;
        }
        if (!newStacks.length) {
            let finished = stopped && findFinished(stopped);
            if (finished)
                return this.stackToTree(finished);
            if (this.parser.strict) {
                if (verbose && stopped)
                    console.log("Stuck with token " + this.parser.getName(this.tokens.mainToken.value));
                throw new SyntaxError("No parse at " + pos);
            }
            if (!this.recovering)
                this.recovering = 5 /* Distance */;
        }
        if (this.recovering && stopped) {
            let finished = this.runRecovery(stopped, stoppedTokens, newStacks);
            if (finished)
                return this.stackToTree(finished.forceAll());
        }
        if (this.recovering) {
            let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3 /* MaxRemainingPerStep */;
            if (newStacks.length > maxRemaining) {
                newStacks.sort((a, b) => b.score - a.score);
                while (newStacks.length > maxRemaining)
                    newStacks.pop();
            }
            if (newStacks.some(s => s.reducePos > pos))
                this.recovering--;
        }
        else if (newStacks.length > 1) {
            // Prune stacks that are in the same state, or that have been
            // running without splitting for a while, to avoid getting stuck
            // with multiple successful stacks running endlessly on.
            outer: for (let i = 0; i < newStacks.length - 1; i++) {
                let stack = newStacks[i];
                for (let j = i + 1; j < newStacks.length; j++) {
                    let other = newStacks[j];
                    if (stack.sameState(other) ||
                        stack.buffer.length > 200 /* MinBufferLengthPrune */ && other.buffer.length > 200 /* MinBufferLengthPrune */) {
                        if (((stack.score - other.score) || (stack.buffer.length - other.buffer.length)) > 0) {
                            newStacks.splice(j--, 1);
                        }
                        else {
                            newStacks.splice(i--, 1);
                            continue outer;
                        }
                    }
                }
            }
        }
        this.pos = newStacks[0].pos;
        for (let i = 1; i < newStacks.length; i++)
            if (newStacks[i].pos < this.pos)
                this.pos = newStacks[i].pos;
        return null;
    }
    // Returns an updated version of the given stack, or null if the
    // stack can't advance normally. When `split` and `stacks` are
    // given, stacks split off by ambiguous operations will be pushed to
    // `split`, or added to `stacks` if they move `pos` forward.
    advanceStack(stack, stacks, split) {
        let start = stack.pos, { input, parser } = this;
        let base = verbose ? this.stackID(stack) + " -> " : "";
        if (this.fragments) {
            let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
            for (let cached = this.fragments.nodeAt(start); cached;) {
                let match = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser.getGoto(stack.state, cached.type.id) : -1;
                if (match > -1 && cached.length && (!strictCx || (cached.contextHash || 0) == cxHash)) {
                    stack.useNode(cached, match);
                    if (verbose)
                        console.log(base + this.stackID(stack) + ` (via reuse of ${parser.getName(cached.type.id)})`);
                    return true;
                }
                if (!(cached instanceof Tree) || cached.children.length == 0 || cached.positions[0] > 0)
                    break;
                let inner = cached.children[0];
                if (inner instanceof Tree)
                    cached = inner;
                else
                    break;
            }
        }
        let defaultReduce = parser.stateSlot(stack.state, 4 /* DefaultReduce */);
        if (defaultReduce > 0) {
            stack.reduce(defaultReduce);
            if (verbose)
                console.log(base + this.stackID(stack) + ` (via always-reduce ${parser.getName(defaultReduce & 65535 /* ValueMask */)})`);
            return true;
        }
        let actions = this.tokens.getActions(stack, input);
        for (let i = 0; i < actions.length;) {
            let action = actions[i++], term = actions[i++], end = actions[i++];
            let last = i == actions.length || !split;
            let localStack = last ? stack : stack.split();
            localStack.apply(action, term, end);
            if (verbose)
                console.log(base + this.stackID(localStack) + ` (via ${(action & 65536 /* ReduceFlag */) == 0 ? "shift"
                    : `reduce of ${parser.getName(action & 65535 /* ValueMask */)}`} for ${parser.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
            if (last)
                return true;
            else if (localStack.pos > start)
                stacks.push(localStack);
            else
                split.push(localStack);
        }
        return false;
    }
    // Advance a given stack forward as far as it will go. Returns the
    // (possibly updated) stack if it got stuck, or null if it moved
    // forward and was given to `pushStackDedup`.
    advanceFully(stack, newStacks) {
        let pos = stack.pos;
        for (;;) {
            let nest = this.checkNest(stack);
            if (nest)
                return nest;
            if (!this.advanceStack(stack, null, null))
                return false;
            if (stack.pos > pos) {
                pushStackDedup(stack, newStacks);
                return true;
            }
        }
    }
    runRecovery(stacks, tokens, newStacks) {
        let finished = null, restarted = false;
        let maybeNest;
        for (let i = 0; i < stacks.length; i++) {
            let stack = stacks[i], token = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
            let base = verbose ? this.stackID(stack) + " -> " : "";
            if (stack.deadEnd) {
                if (restarted)
                    continue;
                restarted = true;
                stack.restart();
                if (verbose)
                    console.log(base + this.stackID(stack) + " (restarted)");
                let done = this.advanceFully(stack, newStacks);
                if (done) {
                    if (done !== true)
                        maybeNest = done;
                    continue;
                }
            }
            let force = stack.split(), forceBase = base;
            for (let j = 0; force.forceReduce() && j < 10 /* ForceReduceLimit */; j++) {
                if (verbose)
                    console.log(forceBase + this.stackID(force) + " (via force-reduce)");
                let done = this.advanceFully(force, newStacks);
                if (done) {
                    if (done !== true)
                        maybeNest = done;
                    break;
                }
                if (verbose)
                    forceBase = this.stackID(force) + " -> ";
            }
            for (let insert of stack.recoverByInsert(token)) {
                if (verbose)
                    console.log(base + this.stackID(insert) + " (via recover-insert)");
                this.advanceFully(insert, newStacks);
            }
            if (this.input.length > stack.pos) {
                if (tokenEnd == stack.pos) {
                    tokenEnd++;
                    token = 0 /* Err */;
                }
                stack.recoverByDelete(token, tokenEnd);
                if (verbose)
                    console.log(base + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
                pushStackDedup(stack, newStacks);
            }
            else if (!finished || finished.score < stack.score) {
                finished = stack;
            }
        }
        if (finished)
            return finished;
        if (maybeNest)
            for (let s of this.stacks)
                if (s.score > maybeNest.stack.score) {
                    maybeNest = undefined;
                    break;
                }
        if (maybeNest)
            this.startNested(maybeNest);
        return null;
    }
    forceFinish() {
        let stack = this.stacks[0].split();
        if (this.nested)
            this.finishNested(stack, this.nested.forceFinish());
        return this.stackToTree(stack.forceAll());
    }
    // Convert the stack's buffer to a syntax tree.
    stackToTree(stack, pos = stack.pos) {
        if (this.parser.context)
            stack.emitContext();
        return Tree.build({ buffer: StackBufferCursor.create(stack),
            nodeSet: this.parser.nodeSet,
            topID: this.topTerm,
            maxBufferLength: this.parser.bufferLength,
            reused: this.reused,
            start: this.startPos,
            length: pos - this.startPos,
            minRepeatType: this.parser.minRepeatTerm });
    }
    checkNest(stack) {
        let info = this.parser.findNested(stack.state);
        if (!info)
            return null;
        let spec = info.value;
        if (typeof spec == "function")
            spec = spec(this.input, stack);
        return spec ? { stack, info, spec } : null;
    }
    startNested(nest) {
        let { stack, info, spec } = nest;
        this.stacks = [stack];
        this.nestEnd = this.scanForNestEnd(stack, info.end, spec.filterEnd);
        this.nestWrap = typeof spec.wrapType == "number" ? this.parser.nodeSet.types[spec.wrapType] : spec.wrapType || null;
        if (spec.startParse) {
            this.nested = spec.startParse(this.input.clip(this.nestEnd), stack.pos, this.context);
        }
        else {
            this.finishNested(stack);
        }
    }
    scanForNestEnd(stack, endToken, filter) {
        for (let pos = stack.pos; pos < this.input.length; pos++) {
            dummyToken.start = pos;
            dummyToken.value = -1;
            endToken.token(this.input, dummyToken, stack);
            if (dummyToken.value > -1 && (!filter || filter(this.input.read(pos, dummyToken.end))))
                return pos;
        }
        return this.input.length;
    }
    finishNested(stack, tree) {
        if (this.nestWrap)
            tree = new Tree(this.nestWrap, tree ? [tree] : [], tree ? [0] : [], this.nestEnd - stack.pos);
        else if (!tree)
            tree = new Tree(NodeType.none, [], [], this.nestEnd - stack.pos);
        let info = this.parser.findNested(stack.state);
        stack.useNode(tree, this.parser.getGoto(stack.state, info.placeholder, true));
        if (verbose)
            console.log(this.stackID(stack) + ` (via unnest)`);
    }
    stackID(stack) {
        let id = (stackIDs || (stackIDs = new WeakMap)).get(stack);
        if (!id)
            stackIDs.set(stack, id = String.fromCodePoint(this.nextStackID++));
        return id + stack;
    }
}
function pushStackDedup(stack, newStacks) {
    for (let i = 0; i < newStacks.length; i++) {
        let other = newStacks[i];
        if (other.pos == stack.pos && other.sameState(stack)) {
            if (newStacks[i].score < stack.score)
                newStacks[i] = stack;
            return;
        }
    }
    newStacks.push(stack);
}
class Dialect {
    constructor(source, flags, disabled) {
        this.source = source;
        this.flags = flags;
        this.disabled = disabled;
    }
    allows(term) { return !this.disabled || this.disabled[term] == 0; }
}
/// A parser holds the parse tables for a given grammar, as generated
/// by `lezer-generator`.
class Parser {
    /// @internal
    constructor(spec) {
        /// @internal
        this.bufferLength = DefaultBufferLength;
        /// @internal
        this.strict = false;
        this.cachedDialect = null;
        if (spec.version != 13 /* Version */)
            throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${13 /* Version */})`);
        let tokenArray = decodeArray(spec.tokenData);
        let nodeNames = spec.nodeNames.split(" ");
        this.minRepeatTerm = nodeNames.length;
        this.context = spec.context;
        for (let i = 0; i < spec.repeatNodeCount; i++)
            nodeNames.push("");
        let nodeProps = [];
        for (let i = 0; i < nodeNames.length; i++)
            nodeProps.push([]);
        function setProp(nodeID, prop, value) {
            nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
        }
        if (spec.nodeProps)
            for (let propSpec of spec.nodeProps) {
                let prop = propSpec[0];
                for (let i = 1; i < propSpec.length;) {
                    let next = propSpec[i++];
                    if (next >= 0) {
                        setProp(next, prop, propSpec[i++]);
                    }
                    else {
                        let value = propSpec[i + -next];
                        for (let j = -next; j > 0; j--)
                            setProp(propSpec[i++], prop, value);
                        i++;
                    }
                }
            }
        this.specialized = new Uint16Array(spec.specialized ? spec.specialized.length : 0);
        this.specializers = [];
        if (spec.specialized)
            for (let i = 0; i < spec.specialized.length; i++) {
                this.specialized[i] = spec.specialized[i].term;
                this.specializers[i] = spec.specialized[i].get;
            }
        this.states = decodeArray(spec.states, Uint32Array);
        this.data = decodeArray(spec.stateData);
        this.goto = decodeArray(spec.goto);
        let topTerms = Object.keys(spec.topRules).map(r => spec.topRules[r][1]);
        this.nodeSet = new NodeSet(nodeNames.map((name, i) => NodeType.define({
            name: i >= this.minRepeatTerm ? undefined : name,
            id: i,
            props: nodeProps[i],
            top: topTerms.indexOf(i) > -1,
            error: i == 0,
            skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
        })));
        this.maxTerm = spec.maxTerm;
        this.tokenizers = spec.tokenizers.map(value => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
        this.topRules = spec.topRules;
        this.nested = (spec.nested || []).map(([name, value, endToken, placeholder]) => {
            return { name, value, end: new TokenGroup(decodeArray(endToken), 0), placeholder };
        });
        this.dialects = spec.dialects || {};
        this.dynamicPrecedences = spec.dynamicPrecedences || null;
        this.tokenPrecTable = spec.tokenPrec;
        this.termNames = spec.termNames || null;
        this.maxNode = this.nodeSet.types.length - 1;
        this.dialect = this.parseDialect();
        this.top = this.topRules[Object.keys(this.topRules)[0]];
    }
    /// Parse a given string or stream.
    parse(input, startPos = 0, context = {}) {
        if (typeof input == "string")
            input = stringInput(input);
        let cx = new Parse(this, input, startPos, context);
        for (;;) {
            let done = cx.advance();
            if (done)
                return done;
        }
    }
    /// Start an incremental parse.
    startParse(input, startPos = 0, context = {}) {
        if (typeof input == "string")
            input = stringInput(input);
        return new Parse(this, input, startPos, context);
    }
    /// Get a goto table entry @internal
    getGoto(state, term, loose = false) {
        let table = this.goto;
        if (term >= table[0])
            return -1;
        for (let pos = table[term + 1];;) {
            let groupTag = table[pos++], last = groupTag & 1;
            let target = table[pos++];
            if (last && loose)
                return target;
            for (let end = pos + (groupTag >> 1); pos < end; pos++)
                if (table[pos] == state)
                    return target;
            if (last)
                return -1;
        }
    }
    /// Check if this state has an action for a given terminal @internal
    hasAction(state, terminal) {
        let data = this.data;
        for (let set = 0; set < 2; set++) {
            for (let i = this.stateSlot(state, set ? 2 /* Skip */ : 1 /* Actions */), next;; i += 3) {
                if ((next = data[i]) == 65535 /* End */) {
                    if (data[i + 1] == 1 /* Next */)
                        next = data[i = pair(data, i + 2)];
                    else if (data[i + 1] == 2 /* Other */)
                        return pair(data, i + 2);
                    else
                        break;
                }
                if (next == terminal || next == 0 /* Err */)
                    return pair(data, i + 1);
            }
        }
        return 0;
    }
    /// @internal
    stateSlot(state, slot) {
        return this.states[(state * 6 /* Size */) + slot];
    }
    /// @internal
    stateFlag(state, flag) {
        return (this.stateSlot(state, 0 /* Flags */) & flag) > 0;
    }
    /// @internal
    findNested(state) {
        let flags = this.stateSlot(state, 0 /* Flags */);
        return flags & 4 /* StartNest */ ? this.nested[flags >> 10 /* NestShift */] : null;
    }
    /// @internal
    validAction(state, action) {
        if (action == this.stateSlot(state, 4 /* DefaultReduce */))
            return true;
        for (let i = this.stateSlot(state, 1 /* Actions */);; i += 3) {
            if (this.data[i] == 65535 /* End */) {
                if (this.data[i + 1] == 1 /* Next */)
                    i = pair(this.data, i + 2);
                else
                    return false;
            }
            if (action == pair(this.data, i + 1))
                return true;
        }
    }
    /// Get the states that can follow this one through shift actions or
    /// goto jumps. @internal
    nextStates(state) {
        let result = [];
        for (let i = this.stateSlot(state, 1 /* Actions */);; i += 3) {
            if (this.data[i] == 65535 /* End */) {
                if (this.data[i + 1] == 1 /* Next */)
                    i = pair(this.data, i + 2);
                else
                    break;
            }
            if ((this.data[i + 2] & (65536 /* ReduceFlag */ >> 16)) == 0) {
                let value = this.data[i + 1];
                if (!result.some((v, i) => (i & 1) && v == value))
                    result.push(this.data[i], value);
            }
        }
        return result;
    }
    /// @internal
    overrides(token, prev) {
        let iPrev = findOffset(this.data, this.tokenPrecTable, prev);
        return iPrev < 0 || findOffset(this.data, this.tokenPrecTable, token) < iPrev;
    }
    /// Configure the parser. Returns a new parser instance that has the
    /// given settings modified. Settings not provided in `config` are
    /// kept from the original parser.
    configure(config) {
        // Hideous reflection-based kludge to make it easy to create a
        // slightly modified copy of a parser.
        let copy = Object.assign(Object.create(Parser.prototype), this);
        if (config.props)
            copy.nodeSet = this.nodeSet.extend(...config.props);
        if (config.top) {
            let info = this.topRules[config.top];
            if (!info)
                throw new RangeError(`Invalid top rule name ${config.top}`);
            copy.top = info;
        }
        if (config.tokenizers)
            copy.tokenizers = this.tokenizers.map(t => {
                let found = config.tokenizers.find(r => r.from == t);
                return found ? found.to : t;
            });
        if (config.dialect)
            copy.dialect = this.parseDialect(config.dialect);
        if (config.nested)
            copy.nested = this.nested.map(obj => {
                if (!Object.prototype.hasOwnProperty.call(config.nested, obj.name))
                    return obj;
                return { name: obj.name, value: config.nested[obj.name], end: obj.end, placeholder: obj.placeholder };
            });
        if (config.strict != null)
            copy.strict = config.strict;
        if (config.bufferLength != null)
            copy.bufferLength = config.bufferLength;
        return copy;
    }
    /// Returns the name associated with a given term. This will only
    /// work for all terms when the parser was generated with the
    /// `--names` option. By default, only the names of tagged terms are
    /// stored.
    getName(term) {
        return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
    }
    /// The eof term id is always allocated directly after the node
    /// types. @internal
    get eofTerm() { return this.maxNode + 1; }
    /// Tells you whether this grammar has any nested grammars.
    get hasNested() { return this.nested.length > 0; }
    /// The type of top node produced by the parser.
    get topNode() { return this.nodeSet.types[this.top[1]]; }
    /// @internal
    dynamicPrecedence(term) {
        let prec = this.dynamicPrecedences;
        return prec == null ? 0 : prec[term] || 0;
    }
    /// @internal
    parseDialect(dialect) {
        if (this.cachedDialect && this.cachedDialect.source == dialect)
            return this.cachedDialect;
        let values = Object.keys(this.dialects), flags = values.map(() => false);
        if (dialect)
            for (let part of dialect.split(" ")) {
                let id = values.indexOf(part);
                if (id >= 0)
                    flags[id] = true;
            }
        let disabled = null;
        for (let i = 0; i < values.length; i++)
            if (!flags[i]) {
                for (let j = this.dialects[values[i]], id; (id = this.data[j++]) != 65535 /* End */;)
                    (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id] = 1;
            }
        return this.cachedDialect = new Dialect(dialect, flags, disabled);
    }
    /// (used by the output of the parser generator) @internal
    static deserialize(spec) {
        return new Parser(spec);
    }
}
function pair(data, off) { return data[off] | (data[off + 1] << 16); }
function findOffset(data, start, term) {
    for (let i = start, next; (next = data[i]) != 65535 /* End */; i++)
        if (next == term)
            return i - start;
    return -1;
}
function findFinished(stacks) {
    let best = null;
    for (let stack of stacks) {
        if (stack.pos == stack.p.input.length &&
            stack.p.parser.stateFlag(stack.state, 2 /* Accepting */) &&
            (!best || best.score < stack.score))
            best = stack;
    }
    return best;
}

// This file was generated by lezer-generator. You probably shouldn't edit it.
const noSemi = 269,
  incdec = 1,
  incdecPrefix = 2,
  templateContent = 270,
  templateDollarBrace = 271,
  templateEnd = 272,
  insertSemi = 273,
  TSExtends = 3,
  Dialect_ts = 1;

/* Hand-written tokenizers for JavaScript tokens that can't be
   expressed by lezer's built-in tokenizer. */

const newline = [10, 13, 8232, 8233];
const space = [9, 11, 12, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288];

const braceR = 125, braceL = 123, semicolon = 59, slash = 47, star = 42,
      plus = 43, minus = 45, dollar = 36, backtick = 96, backslash = 92;

// FIXME this should technically enter block comments
function newlineBefore(input, pos) {
  for (let i = pos - 1; i >= 0; i--) {
    let prev = input.get(i);
    if (newline.indexOf(prev) > -1) return true
    if (space.indexOf(prev) < 0) break
  }
  return false
}

const insertSemicolon = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start, next = input.get(pos);
  if ((next == braceR || next == -1 || newlineBefore(input, pos)) && stack.canShift(insertSemi))
    token.accept(insertSemi, token.start);
}, {contextual: true, fallback: true});

const noSemicolon = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start, next = input.get(pos++);
  if (space.indexOf(next) > -1 || newline.indexOf(next) > -1) return
  if (next == slash) {
    let after = input.get(pos++);
    if (after == slash || after == star) return
  }
  if (next != braceR && next != semicolon && next != -1 && !newlineBefore(input, token.start) &&
      stack.canShift(noSemi))
    token.accept(noSemi, token.start);
}, {contextual: true});

const incdecToken = new ExternalTokenizer((input, token, stack) => {
  let pos = token.start, next = input.get(pos);
  if ((next == plus || next == minus) && next == input.get(pos + 1)) {
    let mayPostfix = !newlineBefore(input, token.start) && stack.canShift(incdec);
    token.accept(mayPostfix ? incdec : incdecPrefix, pos + 2);
  }
}, {contextual: true});

const template = new ExternalTokenizer((input, token) => {
  let pos = token.start, afterDollar = false;
  for (;;) {
    let next = input.get(pos++);
    if (next < 0) {
      if (pos - 1 > token.start) token.accept(templateContent, pos - 1);
      break
    } else if (next == backtick) {
      if (pos == token.start + 1) token.accept(templateEnd, pos);
      else token.accept(templateContent, pos - 1);
      break
    } else if (next == braceL && afterDollar) {
      if (pos == token.start + 2) token.accept(templateDollarBrace, pos);
      else token.accept(templateContent, pos - 2);
      break
    } else if (next == 10 /* "\n" */ && pos > token.start + 1) {
      // Break up template strings on lines, to avoid huge tokens
      token.accept(templateContent, pos);
      break
    } else if (next == backslash && pos != input.length) {
      pos++;
    }
    afterDollar = next == dollar;
  }
});

function tsExtends(value, stack) {
  return value == "extends" && stack.dialectEnabled(Dialect_ts) ? TSExtends : -1
}

// This file was generated by lezer-generator. You probably shouldn't edit it.
const spec_identifier = {__proto__:null,export:16, as:21, from:25, default:30, async:35, function:36, this:46, true:54, false:54, void:58, typeof:62, null:76, super:78, new:112, await:129, yield:131, delete:132, class:142, extends:144, public:181, private:181, protected:181, readonly:183, in:202, instanceof:204, import:236, keyof:287, unique:291, infer:297, is:331, abstract:351, implements:353, type:355, let:358, var:360, const:362, interface:369, enum:373, namespace:379, module:381, declare:385, global:389, for:410, of:419, while:422, with:426, do:430, if:434, else:436, switch:440, case:446, try:452, catch:454, finally:456, return:460, throw:464, break:468, continue:472, debugger:476};
const spec_word = {__proto__:null,async:99, get:101, set:103, public:151, private:151, protected:151, static:153, abstract:155, readonly:159, new:335};
const spec_LessThan = {__proto__:null,"<":119};
const parser = Parser.deserialize({
  version: 13,
  states: "$8xO]QYOOO&zQ!LdO'#CgO'ROSO'#DRO)ZQYO'#DWO)kQYO'#DcO)rQYO'#DmO-iQYO'#DsOOQO'#ET'#ETO-|QWO'#ESO.RQWO'#ESO.ZQ!LdO'#IgO2dQ!LdO'#IhO3QQWO'#EpO3VQpO'#FVOOQ!LS'#Ex'#ExO3_O!bO'#ExO3mQWO'#F^O4wQWO'#F]OOQ!LS'#Ih'#IhOOQ!LS'#Ig'#IgOOQQ'#JR'#JRO4|QWO'#HeO5RQ!LYO'#HfOOQQ'#I['#I[OOQQ'#Hg'#HgQ]QYOOO)rQYO'#DeO5ZQWO'#GQO5`Q#tO'#ClO5nQWO'#ERO5yQ#tO'#EwO6eQWO'#GQO6jQWO'#GUO6uQWO'#GUO7TQWO'#GYO7TQWO'#GZO7TQWO'#G]O5ZQWO'#G`O7tQWO'#GcO9SQWO'#CcO9dQWO'#GpO9lQWO'#GvO9lQWO'#GxO]QYO'#GzO9lQWO'#G|O9lQWO'#HPO9qQWO'#HVO9vQ!LZO'#HZO)rQYO'#H]O:RQ!LZO'#H_O:^Q!LZO'#HaO5RQ!LYO'#HcO)rQYO'#IjOOOS'#Hh'#HhO:iOSO,59mOOQ!LS,59m,59mO<zQbO'#CgO=UQYO'#HiO=cQWO'#IlO?bQbO'#IlO'^QYO'#IlO?iQWO,59rO@PQ&jO'#D]O@xQWO'#ETOAVQWO'#IvOAbQWO'#IuOAjQWO,5:qOAoQWO'#ItOAvQWO'#DtO5`Q#tO'#EROBUQWO'#EROBaQ`O'#EwOOQ!LS,59},59}OBiQYO,59}ODgQ!LdO,5:XOETQWO,5:_OEnQ!LYO'#IsO6jQWO'#IrOEuQWO'#IrOE}QWO,5:pOFSQWO'#IrOFbQYO,5:nOH_QWO'#EPOIfQWO,5:nOJrQWO'#DgOJyQYO'#DlOKTQ&jO,5:wO)rQYO,5:wOOQQ'#Eh'#EhOOQQ'#Ej'#EjO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xO)rQYO,5:xOOQQ'#En'#EnOKYQYO,5;XOOQ!LS,5;^,5;^OOQ!LS,5;_,5;_OMVQWO,5;_OOQ!LS,5;`,5;`O)rQYO'#HsOM[Q!LYO,5;yOH_QWO,5:xO)rQYO,5;[ONXQpO'#IzOMvQpO'#IzON`QpO'#IzONqQpO,5;gOOQO,5;q,5;qO!!|QYO'#FXOOOO'#Hr'#HrO3_O!bO,5;dO!#TQpO'#FZOOQ!LS,5;d,5;dO!#qQ,UO'#CqOOQ!LS'#Ct'#CtO!$UQWO'#CtO!$lQ#tO,5;vO!$sQWO,5;xO!%|QWO'#FhO!&ZQWO'#FiO!&`QWO'#FmO!'bQ&jO'#FqO!(TQ,UO'#IeOOQ!LS'#Ie'#IeO!(_QWO'#IdO!(mQWO'#IcOOQ!LS'#Cr'#CrOOQ!LS'#Cx'#CxO!(uQWO'#CzOIkQWO'#F`OIkQWO'#FbO!(zQWO'#FdOIaQWO'#FeO!)PQWO'#FkOIkQWO'#FpO!)UQWO'#EUO!)mQWO,5;wO]QYO,5>POOQQ'#I_'#I_OOQQ,5>Q,5>QOOQQ-E;e-E;eO!+iQ!LdO,5:POOQ!LQ'#Co'#CoO!,YQ#tO,5<lOOQO'#Ce'#CeO!,kQWO'#CpO!,sQ!LYO'#I`O4wQWO'#I`O9qQWO,59WO!-RQpO,59WO!-ZQ#tO,59WO5`Q#tO,59WO!-fQWO,5:nO!-nQWO'#GoO!-vQWO'#JVO!.OQYO,5;aOKTQ&jO,5;cO!/{QWO,5=YO!0QQWO,5=YO!0VQWO,5=YO5RQ!LYO,5=YO5ZQWO,5<lO!0eQWO'#EVO!0vQ&jO'#EWOOQ!LQ'#It'#ItO!1XQ!LYO'#JSO5RQ!LYO,5<pO7TQWO,5<wOOQO'#Cq'#CqO!1dQpO,5<tO!1lQ#tO,5<uO!1wQWO,5<wO!1|Q`O,5<zO9qQWO'#GeO5ZQWO'#GgO!2UQWO'#GgO5`Q#tO'#GjO!2ZQWO'#GjOOQQ,5<},5<}O!2`QWO'#GkO!2hQWO'#ClO!2mQWO,58}O!2wQWO,58}O!4vQYO,58}OOQQ,58},58}O!5TQ!LYO,58}O)rQYO,58}O!5`QYO'#GrOOQQ'#Gs'#GsOOQQ'#Gt'#GtO]QYO,5=[O!5pQWO,5=[O)rQYO'#DsO]QYO,5=bO]QYO,5=dO!5uQWO,5=fO]QYO,5=hO!5zQWO,5=kO!6PQYO,5=qOOQQ,5=u,5=uO)rQYO,5=uO5RQ!LYO,5=wOOQQ,5=y,5=yO!9}QWO,5=yOOQQ,5={,5={O!9}QWO,5={OOQQ,5=},5=}O!:SQ`O,5?UOOOS-E;f-E;fOOQ!LS1G/X1G/XO!:XQbO,5>TO)rQYO,5>TOOQO-E;g-E;gO!:cQWO,5?WO!:kQbO,5?WO!:rQWO,5?aOOQ!LS1G/^1G/^O!:zQpO'#DPOOQO'#In'#InO)rQYO'#InO!;iQpO'#InO!<WQpO'#D^O!<iQ&jO'#D^O!>qQYO'#D^O!>xQWO'#ImO!?QQWO,59wO!?VQWO'#EXO!?eQWO'#IwO!?mQWO,5:rO!@TQ&jO'#D^O)rQYO,5?bO!@_QWO'#HnO!:rQWO,5?aOOQ!LQ1G0]1G0]O!AeQ&jO'#DwOOQ!LS,5:`,5:`O)rQYO,5:`OH_QWO,5:`O!AlQWO,5:`O9qQWO,5:mO!-RQpO,5:mO!-ZQ#tO,5:mO5`Q#tO,5:mOOQ!LS1G/i1G/iOOQ!LS1G/y1G/yOOQ!LQ'#EO'#EOO)rQYO,5?_O!AwQ!LYO,5?_O!BYQ!LYO,5?_O!BaQWO,5?^O!BiQWO'#HpO!BaQWO,5?^OOQ!LQ1G0[1G0[O6jQWO,5?^OOQ!LS1G0Y1G0YO!CTQ!LbO,5:kOOQ!LS'#Fg'#FgO!CqQ!LdO'#IeOFbQYO1G0YO!EpQ#tO'#IoO!EzQWO,5:RO!FPQbO'#IpO)rQYO'#IpO!FZQWO,5:WOOQ!LS'#DP'#DPOOQ!LS1G0c1G0cO!F`QWO1G0cO!HqQ!LdO1G0dO!HxQ!LdO1G0dO!K]Q!LdO1G0dO!KdQ!LdO1G0dO!MkQ!LdO1G0dO!NOQ!LdO1G0dO#!oQ!LdO1G0dO#!vQ!LdO1G0dO#%ZQ!LdO1G0dO#%bQ!LdO1G0dO#'VQ!LdO1G0dO#*PQ7^O'#CgO#+zQ7^O1G0sO#-xQ7^O'#IhOOQ!LS1G0y1G0yO#.SQ!LdO,5>_OOQ!LS-E;q-E;qO#.sQ!LdO1G0dO#0uQ!LdO1G0vO#1fQpO,5;iO#1kQpO,5;jO#1pQpO'#FQO#2UQWO'#FPOOQO'#I{'#I{OOQO'#Hq'#HqO#2ZQpO1G1ROOQ!LS1G1R1G1ROOQO1G1[1G1[O#2iQ7^O'#IgO#4cQWO,5;sO! PQYO,5;sOOOO-E;p-E;pOOQ!LS1G1O1G1OOOQ!LS,5;u,5;uO#4hQpO,5;uOOQ!LS,59`,59`O)rQYO1G1bOKTQ&jO'#HuO#4mQWO,5<ZOOQ!LS,5<W,5<WOOQO'#F{'#F{OIkQWO,5<fOOQO'#F}'#F}OIkQWO,5<hOIkQWO,5<jOOQO1G1d1G1dO#4xQ`O'#CoO#5]Q`O,5<SO#5dQWO'#JOO5ZQWO'#JOO#5rQWO,5<UOIkQWO,5<TO#5wQ`O'#FgO#6UQ`O'#JPO#6`QWO'#JPOH_QWO'#JPO#6eQWO,5<XOOQ!LQ'#Db'#DbO#6jQWO'#FjO#6uQpO'#FrO!']Q&jO'#FrO!']Q&jO'#FtO#7WQWO'#FuO!)PQWO'#FxOOQO'#Hw'#HwO#7]Q&jO,5<]OOQ!LS,5<],5<]O#7dQ&jO'#FrO#7rQ&jO'#FsO#7zQ&jO'#FsOOQ!LS,5<k,5<kOIkQWO,5?OOIkQWO,5?OO#8PQWO'#HxO#8[QWO,5>}OOQ!LS'#Cg'#CgO#9OQ#tO,59fOOQ!LS,59f,59fO#9qQ#tO,5;zO#:dQ#tO,5;|O#:nQWO,5<OOOQ!LS,5<P,5<PO#:sQWO,5<VO#:xQ#tO,5<[OFbQYO1G1cO#;YQWO1G1cOOQQ1G3k1G3kOOQ!LS1G/k1G/kOMVQWO1G/kOOQQ1G2W1G2WOH_QWO1G2WO)rQYO1G2WOH_QWO1G2WO#;_QWO1G2WO#;mQWO,59[O#<sQWO'#EPOOQ!LQ,5>z,5>zO#<}Q!LYO,5>zOOQQ1G.r1G.rO9qQWO1G.rO!-RQpO1G.rO!-ZQ#tO1G.rO#=]QWO1G0YO#=bQWO'#CgO#=mQWO'#JWO#=uQWO,5=ZO#=zQWO'#JWO#>PQWO'#IQO#>_QWO,5?qO#@ZQbO1G0{OOQ!LS1G0}1G0}O5ZQWO1G2tO#@bQWO1G2tO#@gQWO1G2tO#@lQWO1G2tOOQQ1G2t1G2tO#@qQ#tO1G2WO6jQWO'#IuO6jQWO'#EXO6jQWO'#HzO#ASQ!LYO,5?nOOQQ1G2[1G2[O!1wQWO1G2cOH_QWO1G2`O#A_QWO1G2`OOQQ1G2a1G2aOH_QWO1G2aO#AdQWO1G2aO#AlQ&jO'#G_OOQQ1G2c1G2cO!']Q&jO'#H|O!1|Q`O1G2fOOQQ1G2f1G2fOOQQ,5=P,5=PO#AtQ#tO,5=RO5ZQWO,5=RO#7WQWO,5=UO4wQWO,5=UO!-RQpO,5=UO!-ZQ#tO,5=UO5`Q#tO,5=UO#BVQWO'#JUO#BbQWO,5=VOOQQ1G.i1G.iO#BgQ!LYO1G.iO#BrQWO1G.iO!(uQWO1G.iO5RQ!LYO1G.iO#BwQbO,5?sO#CRQWO,5?sO#C^QYO,5=^O#CeQWO,5=^O6jQWO,5?sOOQQ1G2v1G2vO]QYO1G2vOOQQ1G2|1G2|OOQQ1G3O1G3OO9lQWO1G3QO#CjQYO1G3SO#GbQYO'#HROOQQ1G3V1G3VO9qQWO1G3]O#GoQWO1G3]O5RQ!LYO1G3aOOQQ1G3c1G3cOOQ!LQ'#Fn'#FnO5RQ!LYO1G3eO5RQ!LYO1G3gOOOS1G4p1G4pO#IkQ!LdO,5;yO#JOQbO1G3oO#JYQWO1G4rO#JbQWO1G4{O#JjQWO,5?YO! PQYO,5:sO6jQWO,5:sO9qQWO,59xO! PQYO,59xO!-RQpO,59xO#LcQ7^O,59xOOQO,5:s,5:sO#LmQ&jO'#HjO#MTQWO,5?XOOQ!LS1G/c1G/cO#M]Q&jO'#HoO#MqQWO,5?cOOQ!LQ1G0^1G0^O!<iQ&jO,59xO#MyQbO1G4|OOQO,5>Y,5>YO6jQWO,5>YOOQO-E;l-E;lO#NTQ!LrO'#D|O!']Q&jO'#DxOOQO'#Hm'#HmO#NoQ&jO,5:cOOQ!LS,5:c,5:cO#NvQ&jO'#DxO$ UQ&jO'#D|O$ jQ&jO'#D|O!']Q&jO'#D|O$ tQWO1G/zO$ yQ`O1G/zOOQ!LS1G/z1G/zO)rQYO1G/zOH_QWO1G/zOOQ!LS1G0X1G0XO9qQWO1G0XO!-RQpO1G0XO!-ZQ#tO1G0XO$!QQ!LdO1G4yO)rQYO1G4yO$!bQ!LYO1G4yO$!sQWO1G4xO6jQWO,5>[OOQO,5>[,5>[O$!{QWO,5>[OOQO-E;n-E;nO$!sQWO1G4xOOQ!LS,5;y,5;yO$#ZQ!LdO,59fO$%YQ!LdO,5;zO$'[Q!LdO,5;|O$)^Q!LdO,5<[OOQ!LS7+%t7+%tO$+fQWO'#HkO$+pQWO,5?ZOOQ!LS1G/m1G/mO$+xQYO'#HlO$,VQWO,5?[O$,_QbO,5?[OOQ!LS1G/r1G/rOOQ!LS7+%}7+%}O$,iQ7^O,5:XO)rQYO7+&_O$,sQ7^O,5:POOQO1G1T1G1TOOQO1G1U1G1UO$,zQMhO,5;lO! PQYO,5;kOOQO-E;o-E;oOOQ!LS7+&m7+&mOOQO7+&v7+&vOOOO1G1_1G1_O$-VQWO1G1_OOQ!LS1G1a1G1aO$-[Q!LdO7+&|OOQ!LS,5>a,5>aO$-{QWO,5>aOOQ!LS1G1u1G1uP$.QQWO'#HuPOQ!LS-E;s-E;sO$.qQ#tO1G2QO$/dQ#tO1G2SO$/nQ#tO1G2UOOQ!LS1G1n1G1nO$/uQWO'#HtO$0TQWO,5?jO$0TQWO,5?jO$0]QWO,5?jO$0hQWO,5?jOOQO1G1p1G1pO$0vQ#tO1G1oO$1WQWO'#HvO$1hQWO,5?kOH_QWO,5?kO$1pQ`O,5?kOOQ!LS1G1s1G1sO5RQ!LYO,5<^O5RQ!LYO,5<_O$1zQWO,5<_O#7RQWO,5<_O!-RQpO,5<^O$2PQWO,5<`O5RQ!LYO,5<aO$1zQWO,5<dOOQO-E;u-E;uOOQ!LS1G1w1G1wO!']Q&jO,5<^O$2XQWO,5<_O!']Q&jO,5<`O!']Q&jO,5<_O$2dQ#tO1G4jO$2nQ#tO1G4jOOQO,5>d,5>dOOQO-E;v-E;vOKTQ&jO,59hO)rQYO,59hO$2{QWO1G1jOIkQWO1G1qOOQ!LS7+&}7+&}OFbQYO7+&}OOQ!LS7+%V7+%VO$3QQ`O'#JQO$ tQWO7+'rO$3[QWO7+'rO$3dQ`O7+'rOOQQ7+'r7+'rOH_QWO7+'rO)rQYO7+'rOH_QWO7+'rOOQO1G.v1G.vO$3nQ!LbO'#CgO$4OQ!LbO,5<bO$4mQWO,5<bOOQ!LQ1G4f1G4fOOQQ7+$^7+$^O9qQWO7+$^O!-RQpO7+$^OFbQYO7+%tO$4rQWO'#IPO$4}QWO,5?rOOQO1G2u1G2uO5ZQWO,5?rOOQO,5>l,5>lOOQO-E<O-E<OOOQ!LS7+&g7+&gO$5VQWO7+(`O5RQ!LYO7+(`O5ZQWO7+(`O$5[QWO7+(`O$5aQWO7+'rOOQ!LQ,5>f,5>fOOQ!LQ-E;x-E;xOOQQ7+'}7+'}O$5oQ!LbO7+'zOH_QWO7+'zO$5yQ`O7+'{OOQQ7+'{7+'{OH_QWO7+'{O$6QQWO'#JTO$6]QWO,5<yOOQO,5>h,5>hOOQO-E;z-E;zOOQQ7+(Q7+(QO$7SQ&jO'#GhOOQQ1G2m1G2mOH_QWO1G2mO)rQYO1G2mOH_QWO1G2mO$7ZQWO1G2mO$7iQ#tO1G2mO5RQ!LYO1G2pO#7WQWO1G2pO4wQWO1G2pO!-RQpO1G2pO!-ZQ#tO1G2pO$7zQWO'#IOO$8VQWO,5?pO$8_Q&jO,5?pOOQ!LQ1G2q1G2qOOQQ7+$T7+$TO$8dQWO7+$TO5RQ!LYO7+$TO$8iQWO7+$TO)rQYO1G5_O)rQYO1G5`O$8nQYO1G2xO$8uQWO1G2xO$8zQYO1G2xO$9RQ!LYO1G5_OOQQ7+(b7+(bO5RQ!LYO7+(lO]QYO7+(nOOQQ'#JZ'#JZOOQQ'#IR'#IRO$9]QYO,5=mOOQQ,5=m,5=mO)rQYO'#HSO$9jQWO'#HUOOQQ7+(w7+(wO$9oQYO7+(wO6jQWO7+(wOOQQ7+({7+({OOQQ7+)P7+)POOQQ7+)R7+)ROOQO1G4t1G4tO$=jQ7^O1G0_O$=tQWO1G0_OOQO1G/d1G/dO$>PQ7^O1G/dO9qQWO1G/dO! PQYO'#D^OOQO,5>U,5>UOOQO-E;h-E;hOOQO,5>Z,5>ZOOQO-E;m-E;mO!-RQpO1G/dOOQO1G3t1G3tO9qQWO,5:dOOQO,5:h,5:hO!.OQYO,5:hO$>ZQ!LYO,5:hO$>fQ!LYO,5:hO!-RQpO,5:dOOQO-E;k-E;kOOQ!LS1G/}1G/}O!']Q&jO,5:dO$>tQ!LrO,5:hO$?`Q&jO,5:dO!']Q&jO,5:hO$?nQ&jO,5:hO$@SQ!LYO,5:hOOQ!LS7+%f7+%fO$ tQWO7+%fO$ yQ`O7+%fOOQ!LS7+%s7+%sO9qQWO7+%sO!-RQpO7+%sO$@hQ!LdO7+*eO)rQYO7+*eOOQO1G3v1G3vO6jQWO1G3vO$@xQWO7+*dO$AQQ!LdO1G2QO$CSQ!LdO1G2SO$EUQ!LdO1G1oO$G^Q#tO,5>VOOQO-E;i-E;iO$GhQbO,5>WO)rQYO,5>WOOQO-E;j-E;jO$GrQWO1G4vO$ItQ7^O1G0dO$KoQ7^O1G0dO$MjQ7^O1G0dO$MqQ7^O1G0dO% `Q7^O1G0dO% sQ7^O1G0dO%#zQ7^O1G0dO%$RQ7^O1G0dO%%|Q7^O1G0dO%&TQ7^O1G0dO%'xQ7^O1G0dO%(VQ!LdO<<IyO%(vQ7^O1G0dO%*fQ7^O'#IeO%,cQ7^O1G0vO! PQYO'#FSOOQO'#I|'#I|OOQO1G1W1G1WO%,jQWO1G1VO%,oQ7^O,5>_OOOO7+&y7+&yOOQ!LS1G3{1G3{OIkQWO7+'pO%,|QWO,5>`O5ZQWO,5>`OOQO-E;r-E;rO%-[QWO1G5UO%-[QWO1G5UO%-dQWO1G5UO%-oQ`O,5>bO%-yQWO,5>bOH_QWO,5>bOOQO-E;t-E;tO%.OQ`O1G5VO%.YQWO1G5VOOQO1G1x1G1xOOQO1G1y1G1yO5RQ!LYO1G1yO$1zQWO1G1yO5RQ!LYO1G1xO%.bQWO1G1zOH_QWO1G1zOOQO1G1{1G1{O5RQ!LYO1G2OO!-RQpO1G1xO#7RQWO1G1yO%.gQWO1G1zO%.oQWO1G1yOIkQWO7+*UOOQ!LS1G/S1G/SO%.zQWO1G/SOOQ!LS7+'U7+'UO%/PQ#tO7+']OOQ!LS<<Ji<<JiOH_QWO'#HyO%/aQWO,5?lOOQQ<<K^<<K^OH_QWO<<K^O$ tQWO<<K^O%/iQWO<<K^O%/qQ`O<<K^OH_QWO1G1|OOQQ<<Gx<<GxO9qQWO<<GxOOQ!LS<<I`<<I`OOQO,5>k,5>kO%/{QWO,5>kOOQO-E;}-E;}O%0QQWO1G5^O%0YQWO<<KzOOQQ<<Kz<<KzO%0_QWO<<KzO5RQ!LYO<<KzO)rQYO<<K^OH_QWO<<K^OOQQ<<Kf<<KfO$5oQ!LbO<<KfOOQQ<<Kg<<KgO$5yQ`O<<KgO%0dQ&jO'#H{O%0oQWO,5?oO! PQYO,5?oOOQQ1G2e1G2eO#NTQ!LrO'#D|O!']Q&jO'#GiOOQO'#H}'#H}O%0wQ&jO,5=SOOQQ,5=S,5=SO#7rQ&jO'#D|O%1OQ&jO'#D|O%1dQ&jO'#D|O%1nQ&jO'#GiO%1|QWO7+(XO%2RQWO7+(XO%2ZQ`O7+(XOOQQ7+(X7+(XOH_QWO7+(XO)rQYO7+(XOH_QWO7+(XO%2eQWO7+(XOOQQ7+([7+([O5RQ!LYO7+([O#7WQWO7+([O4wQWO7+([O!-RQpO7+([O%2sQWO,5>jOOQO-E;|-E;|OOQO'#Gl'#GlO%3OQWO1G5[O5RQ!LYO<<GoOOQQ<<Go<<GoO%3WQWO<<GoO%3]QWO7+*yO%3bQWO7+*zOOQQ7+(d7+(dO%3gQWO7+(dO%3lQYO7+(dO%3sQWO7+(dO)rQYO7+*yO)rQYO7+*zOOQQ<<LW<<LWOOQQ<<LY<<LYOOQQ-E<P-E<POOQQ1G3X1G3XO%3xQWO,5=nOOQQ,5=p,5=pO9qQWO<<LcO%3}QWO<<LcO! PQYO7+%yOOQO7+%O7+%OO%4SQ7^O1G4|O9qQWO7+%OOOQO1G0O1G0OO%4^Q!LdO1G0SOOQO1G0S1G0SO!.OQYO1G0SO%4hQ!LYO1G0SO9qQWO1G0OO!-RQpO1G0OO%4sQ!LYO1G0SO!']Q&jO1G0OO%5RQ!LYO1G0SO%5gQ!LrO1G0SO%5qQ&jO1G0OO!']Q&jO1G0SOOQ!LS<<IQ<<IQOOQ!LS<<I_<<I_O9qQWO<<I_O%6PQ!LdO<<NPOOQO7+)b7+)bO%6aQ!LdO7+']O%8iQbO1G3rO%8sQ7^O,5;yO%8}Q7^O,59fO%:zQ7^O,5;zO%<wQ7^O,5;|O%>tQ7^O,5<[O%@dQ7^O7+&|O%@kQWO,5;nOOQO7+&q7+&qO%@pQ#tO<<K[OOQO1G3z1G3zO%AQQWO1G3zO%A]QWO1G3zO%AkQWO7+*pO%AkQWO7+*pOH_QWO1G3|O%AsQ`O1G3|O%A}QWO7+*qOOQO7+'e7+'eO5RQ!LYO7+'eOOQO7+'d7+'dO$1zQWO7+'fO%BVQ`O7+'fOOQO7+'j7+'jO5RQ!LYO7+'dO$1zQWO7+'eO%B^QWO7+'fOH_QWO7+'fO#7RQWO7+'eO%BcQ#tO<<MpOOQ!LS7+$n7+$nO%BmQ`O,5>eOOQO-E;w-E;wO$ tQWOAN@xOOQQAN@xAN@xOH_QWOAN@xO%BwQ!LbO7+'hOOQQAN=dAN=dO5ZQWO1G4VO%CUQWO7+*xO5RQ!LYOANAfO%C^QWOANAfOOQQANAfANAfO%CcQWOAN@xO%CkQ`OAN@xOOQQANAQANAQOOQQANARANARO%CuQWO,5>gOOQO-E;y-E;yO%DQQ7^O1G5ZO#7WQWO,5=TO4wQWO,5=TO!-RQpO,5=TOOQO-E;{-E;{OOQQ1G2n1G2nO$>tQ!LrO,5:hO!']Q&jO,5=TO%D[Q&jO,5=TO%DjQ&jO,5:hOOQQ<<Ks<<KsOH_QWO<<KsO%1|QWO<<KsO%EOQWO<<KsO%EWQ`O<<KsO)rQYO<<KsOH_QWO<<KsOOQQ<<Kv<<KvO5RQ!LYO<<KvO#7WQWO<<KvO4wQWO<<KvO%EbQ&jO1G4UO%EgQWO7+*vOOQQAN=ZAN=ZO5RQ!LYOAN=ZOOQQ<<Ne<<NeOOQQ<<Nf<<NfOOQQ<<LO<<LOO%EoQWO<<LOO%EtQYO<<LOO%E{QWO<<NeO%FQQWO<<NfOOQQ1G3Y1G3YOOQQANA}ANA}O9qQWOANA}O%FVQ7^O<<IeOOQO<<Hj<<HjOOQO7+%n7+%nO%4^Q!LdO7+%nO!.OQYO7+%nOOQO7+%j7+%jO9qQWO7+%jO%FaQ!LYO7+%nO!-RQpO7+%jO%FlQ!LYO7+%nO!']Q&jO7+%jO%FzQ!LYO7+%nOOQ!LSAN>yAN>yO%G`Q!LdO<<K[O%IhQ7^O<<IyO%IoQ7^O1G1oO%K_Q7^O1G2QO%M[Q7^O1G2SOOQO1G1Y1G1YOOQO7+)f7+)fO& XQWO7+)fO& dQWO<<N[O& lQ`O7+)hOOQO<<KP<<KPO5RQ!LYO<<KQO$1zQWO<<KQOOQO<<KO<<KOO5RQ!LYO<<KPO& vQ`O<<KQO$1zQWO<<KPOOQQG26dG26dO$ tQWOG26dOOQO7+)q7+)qOOQQG27QG27QO5RQ!LYOG27QOH_QWOG26dO! PQYO1G4RO& }QWO7+*uO5RQ!LYO1G2oO#7WQWO1G2oO4wQWO1G2oO!-RQpO1G2oO!']Q&jO1G2oO%5gQ!LrO1G0SO&!VQ&jO1G2oO%1|QWOANA_OOQQANA_ANA_OH_QWOANA_O&!eQWOANA_O&!mQ`OANA_OOQQANAbANAbO5RQ!LYOANAbO#7WQWOANAbOOQO'#Gm'#GmOOQO7+)p7+)pOOQQG22uG22uOOQQANAjANAjO&!wQWOANAjOOQQANDPANDPOOQQANDQANDQO&!|QYOG27iOOQO<<IY<<IYO%4^Q!LdO<<IYOOQO<<IU<<IUO!.OQYO<<IYO9qQWO<<IUO&&wQ!LYO<<IYO!-RQpO<<IUO&'SQ!LYO<<IYO&'bQ7^O7+']OOQO<<MQ<<MQOOQOAN@lAN@lO5RQ!LYOAN@lOOQOAN@kAN@kO$1zQWOAN@lO5RQ!LYOAN@kOOQQLD,OLD,OOOQQLD,lLD,lO$ tQWOLD,OO&)QQ7^O7+)mOOQO7+(Z7+(ZO5RQ!LYO7+(ZO#7WQWO7+(ZO4wQWO7+(ZO!-RQpO7+(ZO!']Q&jO7+(ZOOQQG26yG26yO%1|QWOG26yOH_QWOG26yOOQQG26|G26|O5RQ!LYOG26|OOQQG27UG27UO9qQWOLD-TOOQOAN>tAN>tO%4^Q!LdOAN>tOOQOAN>pAN>pO!.OQYOAN>tO9qQWOAN>pO&)[Q!LYOAN>tO&)gQ7^O<<K[OOQOG26WG26WO5RQ!LYOG26WOOQOG26VG26VOOQQ!$( j!$( jOOQO<<Ku<<KuO5RQ!LYO<<KuO#7WQWO<<KuO4wQWO<<KuO!-RQpO<<KuOOQQLD,eLD,eO%1|QWOLD,eOOQQLD,hLD,hOOQQ!$(!o!$(!oOOQOG24`G24`O%4^Q!LdOG24`OOQOG24[G24[O!.OQYOG24`OOQOLD+rLD+rOOQOANAaANAaO5RQ!LYOANAaO#7WQWOANAaO4wQWOANAaOOQQ!$(!P!$(!POOQOLD)zLD)zO%4^Q!LdOLD)zOOQOG26{G26{O5RQ!LYOG26{O#7WQWOG26{OOQO!$'Mf!$'MfOOQOLD,gLD,gO5RQ!LYOLD,gOOQO!$(!R!$(!ROKYQYO'#DmO&+VQ!LdO'#IgO&+jQ!LdO'#IgOKYQYO'#DeO&+qQ!LdO'#CgO&,[QbO'#CgO&,lQYO,5:nOFbQYO,5:nOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xOKYQYO,5:xO! PQYO'#HsO&.iQWO,5;yO&.qQWO,5:xOKYQYO,5;[O!(uQWO'#CzO!(uQWO'#CzOH_QWO'#F`O&.qQWO'#F`OH_QWO'#FbO&.qQWO'#FbOH_QWO'#FpO&.qQWO'#FpO! PQYO,5?bO&,lQYO1G0YOFbQYO1G0YO&/xQ7^O'#CgO&0SQ7^O'#IgO&0^Q7^O'#IgOKYQYO1G1bOH_QWO,5<fO&.qQWO,5<fOH_QWO,5<hO&.qQWO,5<hOH_QWO,5<TO&.qQWO,5<TO&,lQYO1G1cOFbQYO1G1cO&,lQYO1G1cO&,lQYO1G0YOKYQYO7+&_OH_QWO1G1qO&.qQWO1G1qO&,lQYO7+&}OFbQYO7+&}O&,lQYO7+&}O&,lQYO7+%tOFbQYO7+%tO&,lQYO7+%tOH_QWO7+'pO&.qQWO7+'pO&0eQWO'#ESO&0jQWO'#ESO&0oQWO'#ESO&0wQWO'#ESO&1PQWO'#EpO!.OQYO'#DeO!.OQYO'#DmO&1UQWO'#IvO&1aQWO'#ItO&1lQWO,5:nO&1qQWO,5:nO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5:xO!.OQYO,5;[O&1vQ#tO,5;vO&1}QWO'#FiO&2SQWO'#FiO&2XQWO,5;wO&2aQWO,5;wO&2iQWO,5;wO&2qQ!LdO,5:PO&3OQWO,5:nO&3TQWO,5:nO&3]QWO,5:nO&3eQWO,5:nO&5aQ!LdO1G0dO&5nQ!LdO1G0dO&7uQ!LdO1G0dO&7|Q!LdO1G0dO&9}Q!LdO1G0dO&:UQ!LdO1G0dO&<VQ!LdO1G0dO&<^Q!LdO1G0dO&>_Q!LdO1G0dO&>fQ!LdO1G0dO&>mQ7^O1G0sO&>tQ!LdO1G0vO!.OQYO1G1bO&?RQWO,5<VO&?WQWO,5<VO&?]QWO1G1cO&?bQWO1G1cO&?gQWO1G1cO&?lQWO1G0YO&?qQWO1G0YO&?vQWO1G0YO!.OQYO7+&_O&?{Q!LdO7+&|O&@YQ#tO1G2UO&@aQ#tO1G2UO&@hQ!LdO<<IyO&,lQYO,5:nO&BiQ!LdO'#IhO&B|QWO'#EpO3mQWO'#F^O4wQWO'#F]O4wQWO'#F]O4wQWO'#F]OBUQWO'#EROBUQWO'#EROBUQWO'#EROKYQYO,5;XO&CRQ#tO,5;vO!)PQWO'#FkO!)PQWO'#FkO&CYQ7^O1G0sOIkQWO,5<jOIkQWO,5<jO! PQYO'#DmO! PQYO'#DeO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5:xO! PQYO,5;[O! PQYO1G1bO! PQYO7+&_O&CaQWO'#ESO&CfQWO'#ESO&CnQWO'#EpO&CsQ#tO,5;vO&CzQ7^O1G0sO3mQWO'#F^OKYQYO,5;XO&DRQ7^O'#IhO&DcQ7^O,5:PO&DpQ7^O1G0dO&FqQ7^O1G0dO&FxQ7^O1G0dO&HmQ7^O1G0dO&IQQ7^O1G0dO&K_Q7^O1G0dO&KfQ7^O1G0dO&MgQ7^O1G0dO&MnQ7^O1G0dO' cQ7^O1G0dO' vQ7^O1G0vO'!TQ7^O7+&|O'!bQ7^O<<IyO3mQWO'#F^OKYQYO,5;X",
  stateData: "'#b~O&}OSSOSTOS~OPTOQTOWwO]bO^gOamOblOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!OSO!YjO!_UO!bTO!cTO!dTO!eTO!fTO!ikO#jnO#n]O$uoO$wrO$ypO$zpO${qO%OsO%QtO%TuO%UuO%WvO%exO%kyO%mzO%o{O%q|O%t}O%z!OO&O!PO&Q!QO&S!RO&U!SO&W!TO'PPO']QO'q`O~OPZXYZX^ZXiZXqZXrZXtZX|ZX![ZX!]ZX!_ZX!eZX!tZX#OcX#RZX#SZX#TZX#UZX#VZX#WZX#XZX#YZX#ZZX#]ZX#_ZX#`ZX#eZX&{ZX']ZX'eZX'lZX'mZX~O!W$bX~P$tO&x!VO&y!UO&z!XO~OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!O!`O!YjO!_UO!bTO!cTO!dTO!eTO!fTO!i!fO#j!iO#n]O'P!YO']QO'q`O~O{!^O|!ZOy'`Py'iP~P'^O}!jO~P]OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!O!`O!YjO!_UO!bTO!cTO!dTO!eTO!fTO!i!fO#j!iO#n]O'P8ZO']QO'q`O~OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!O!`O!YjO!_UO!bTO!cTO!dTO!eTO!fTO!i!fO#j!iO#n]O']QO'q`O~O{!oO!|!rO!}!oO'P8[O!^'fP~P+oO#O!sO~O!W!tO#O!sO~OP#ZOY#aOi#OOq!xOr!xOt!yO|#_O![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO#_#VO#`#WO']QO'e#XO'l!zO'm!{O^'ZX&{'ZX!^'ZXy'ZX!O'ZX$v'ZX!W'ZX~O!t#bO#e#bOP'[XY'[X^'[Xi'[Xq'[Xr'[Xt'[X|'[X!['[X!]'[X!_'[X!e'[X#R'[X#S'[X#T'[X#U'[X#V'[X#W'[X#Y'[X#Z'[X#]'[X#_'[X#`'[X']'[X'e'[X'l'[X'm'[X~O#X'[X&{'[Xy'[X!^'[X'_'[X!O'[X$v'[X!W'[X~P0gO!t#bO~O#p#cO#w#gO~O!O#hO#n]O#z#iO#|#kO~O]#nOg#zOi#oOj#nOk#nOm#{Oo#|Ot#tO!O#uO!Y$RO!_#rO!}$SO#j$PO$T#}O$V$OO$Y$QO'P#mO'T'VP~O!_$TO~O!W$VO~O^$WO&{$WO~O'P$[O~O!_$TO'P$[O'Q$^O'U$_O~Ob$eO!_$TO'P$[O~O]$nOq$jO!O$gO!_$iO$w$mO'P$[O'Q$^O['yP~O!i$oO~Ot$pO!O$qO'P$[O~Ot$pO!O$qO%Q$uO'P$[O~O'P$vO~O$wrO$ypO$zpO${qO%OsO%QtO%TuO%UuO~Oa%POb%OO!i$|O$u$}O%Y${O~P7YOa%SOblO!O%RO!ikO$uoO$ypO$zpO${qO%OsO%QtO%TuO%UuO%WvO~O_%VO!t%YO$w%TO'Q$^O~P8XO!_%ZO!b%_O~O!_%`O~O!OSO~O^$WO&w%hO&{$WO~O^$WO&w%kO&{$WO~O^$WO&w%mO&{$WO~O&x!VO&y!UO&z%qO~OPZXYZXiZXqZXrZXtZX|ZX|cX![ZX!]ZX!_ZX!eZX!tZX!tcX#OcX#RZX#SZX#TZX#UZX#VZX#WZX#XZX#YZX#ZZX#]ZX#_ZX#`ZX#eZX']ZX'eZX'lZX'mZX~OyZXycX~P:tO{%sOy&]X|&]X~P)rO|!ZOy'`X~OP#ZOY#aOi#OOq!xOr!xOt!yO|!ZO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO#_#VO#`#WO']QO'e#XO'l!zO'm!{O~Oy'`X~P=kOy%xO~Ot%{O!R&VO!S&OO!T&OO'Q$^O~O]%|Oj%|O{&PO'Y%yO}'aP}'kP~P?nOy'hX|'hX!W'hX!^'hX'e'hX~O!t'hX#O!wX}'hX~P@gO!t&WOy'jX|'jX~O|&XOy'iX~Oy&ZO~O!t#bO~P@gOR&_O!O&[O!j&^O'P$[O~Ob&dO!_$TO'P$[O~Oq$jO!_$iO~O}&eO~P]Oq!xOr!xOt!yO!]!vO!_!wO']QOP!aaY!aai!aa|!aa![!aa!e!aa#R!aa#S!aa#T!aa#U!aa#V!aa#W!aa#X!aa#Y!aa#Z!aa#]!aa#_!aa#`!aa'e!aa'l!aa'm!aa~O^!aa&{!aay!aa!^!aa'_!aa!O!aa$v!aa!W!aa~PBpO!^&fO~O!W!tO!t&hO'e&gO|'gX^'gX&{'gX~O!^'gX~PEYO|&lO!^'fX~O!^&nO~Ot$pO!O$qO!}&oO'P$[O~OPTOQTO]bOa!hOb!gOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!OSO!YjO!_UO!bTO!cTO!dTO!eTO!fTO!i!fO#j!iO#n]O'P8ZO']QO'q`O~O]#nOg#zOi#oOj#nOk#nOm#{Oo8nOt#tO!O#uO!Y;OO!_#rO!}8tO#j$PO$T8pO$V8rO$Y$QO'P&rO~O#O&tO~O]#nOg#zOi#oOj#nOk#nOm#{Oo#|Ot#tO!O#uO!Y$RO!_#rO!}$SO#j$PO$T#}O$V$OO$Y$QO'P&rO~O'T'cP~PIkO{&xO!^'dP~P)rO'Y&zO~OP8VOQ8VO]bOa:yOb!gOgbOi8VOjbOkbOm8VOo8VOtROvbOwbOxbO!O!`O!Y8YO!_UO!b8VO!c8VO!d8VO!e8VO!f8VO!i!fO#j!iO#n]O'P'YO']QO'q:uO~O!_!wO~O|#_O^$Ra&{$Ra!^$Ray$Ra!O$Ra$v$Ra!W$Ra~O!W'bO!O'nX#m'nX#p'nX#w'nX~Oq'cO~PMvOq'cO!O'nX#m'nX#p'nX#w'nX~O!O'eO#m'iO#p'dO#w'jO~OP;TOQ;TO]bOa:{Ob!gOgbOi;TOjbOkbOm;TOo;TOtROvbOwbOxbO!O!`O!Y;UO!_UO!b;TO!c;TO!d;TO!e;TO!f;TO!i!fO#j!iO#n]O'P'YO']QO'q;{O~O{'mO~P! PO#p#cO#w'pO~Oq$ZXt$ZX!]$ZX'e$ZX'l$ZX'm$ZX~OReX|eX!teX'TeX'T$ZX~P!#]Oj'rO~Oq'tOt'uO'e#XO'l'wO'm'yO~O'T'sO~P!$ZO'T'|O~O]#nOg#zOi#oOj#nOk#nOm#{Oo8nOt#tO!O#uO!Y;OO!_#rO!}8tO#j$PO$T8pO$V8rO$Y$QO~O{(QO'P'}O!^'rP~P!$xO#O(SO~O{(WO'P(TOy'sP~P!$xO^(aOi(fOt(^O!R(dO!S(]O!T(]O!_(ZO!q(eO$m(`O'Q$^O'Y(YO~O}(cO~P!&mO!]!vOq'XXt'XX'e'XX'l'XX'm'XX|'XX!t'XX~O'T'XX#c'XX~P!'iOR(iO!t(hO|'WX'T'WX~O|(jO'T'VX~O'P(lO~O!_(qO~O!_(ZO~Ot$pO{!oO!O$qO!|!rO!}!oO'P$[O!^'fP~O!W!tO#O(uO~OP#ZOY#aOi#OOq!xOr!xOt!yO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO#_#VO#`#WO']QO'e#XO'l!zO'm!{O~O^!Xa|!Xa&{!Xay!Xa!^!Xa'_!Xa!O!Xa$v!Xa!W!Xa~P!)uOR(}O!O&[O!j(|O$v({O'U$_O~O'P$vO'T'VP~O!W)QO!O'SX^'SX&{'SX~O!_$TO'U$_O~O!_$TO'P$[O'U$_O~O!W!tO#O&tO~O'P)YO}'zP~O|)^O['yX~OP9jOQ9jO]bOa:zOb!gOgbOi9jOjbOkbOm9jOo9jOtROvbOwbOxbO!O!`O!Y9iO!_UO!b9jO!c9jO!d9jO!e9jO!f9jO!i!fO#j!iO#n]O'P8ZO']QO'q;jO~OY)bO~O[)cO~O!O$gO'P$[O'Q$^O['yP~Ot$pO{)hO!O$qO'P$[Oy'iP~O]&SOj&SO{)iO'Y&zO}'kP~O|)jO^'vX&{'vX~O!t)nO'U$_O~OR)qO!O#uO'U$_O~O!O)sO~Oq)uO!OSO~O!i)zO~Ob*PO~O'P(lO}'xP~Ob$eO~O$wrO'P$vO~P8XOY*VO[*UO~OPTOQTO]bOamOblOgbOiTOjbOkbOmTOoTOtROvbOwbOxbO!YjO!_UO!bTO!cTO!dTO!eTO!fTO!ikO#n]O$uoO']QO'q`O~O!O!`O#j!iO'P8ZO~P!3PO[*UO^$WO&{$WO~O^*ZO$y*]O$z*]O${*]O~P)rO!_%ZO~O%k*bO~O!O*dO~O%{*gO%|*fOP%yaQ%yaW%ya]%ya^%yaa%yab%yag%yai%yaj%yak%yam%yao%yat%yav%yaw%yax%ya!O%ya!Y%ya!_%ya!b%ya!c%ya!d%ya!e%ya!f%ya!i%ya#j%ya#n%ya$u%ya$w%ya$y%ya$z%ya${%ya%O%ya%Q%ya%T%ya%U%ya%W%ya%e%ya%k%ya%m%ya%o%ya%q%ya%t%ya%z%ya&O%ya&Q%ya&S%ya&U%ya&W%ya&v%ya'P%ya']%ya'q%ya}%ya%r%ya_%ya%w%ya~O'P*jO~O'_*mO~Oy&]a|&]a~P!)uO|!ZOy'`a~Oy'`a~P=kO|&XOy'ia~O|sX|!UX}sX}!UX!WsX!W!UX!_!UX!tsX'U!UX~O!W*tO!t*sO|!{X|'bX}!{X}'bX!W'bX!_'bX'U'bX~O!W*vO!_$TO'U$_O|!QX}!QX~O]%zOj%zOt%{O'Y(YO~OP;TOQ;TO]bOa:{Ob!gOgbOi;TOjbOkbOm;TOo;TOtROvbOwbOxbO!O!`O!Y;UO!_UO!b;TO!c;TO!d;TO!e;TO!f;TO!i!fO#j!iO#n]O']QO'q;{O~O'P8yO~P!<wO|*zO}'aX~O}*|O~O!W*tO!t*sO|!{X}!{X~O|*}O}'kX~O}+PO~O]%zOj%zOt%{O'Q$^O'Y(YO~O!S+QO!T+QO~P!?rOt$pO{+TO!O$qO'P$[Oy&bX|&bX~O^+XO!R+[O!S+WO!T+WO!m+^O!n+]O!o+]O!q+_O'Q$^O'Y(YO~O}+ZO~P!@sOR+dO!O&[O!j+cO~O!t+jO|'ga!^'ga^'ga&{'ga~O!W!tO~P!AwO|&lO!^'fa~Ot$pO{+mO!O$qO!|+oO!}+mO'P$[O|&dX!^&dX~O#O!sa|!sa!^!sa!t!sa!O!sa^!sa&{!say!sa~P!$ZO#O'XXP'XXY'XX^'XXi'XXr'XX!['XX!_'XX!e'XX#R'XX#S'XX#T'XX#U'XX#V'XX#W'XX#X'XX#Y'XX#Z'XX#]'XX#_'XX#`'XX&{'XX']'XX!^'XXy'XX!O'XX$v'XX'_'XX!W'XX~P!'iO|+xO'T'cX~P!$ZO'T+zO~O|+{O!^'dX~P!)uO!^,OO~Oy,PO~OP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO']QOY#Qi^#Qii#Qi|#Qi![#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi&{#Qi'e#Qi'l#Qi'm#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~O#R#Qi~P!FeO#R!|O~P!FeOP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O']QOY#Qi^#Qi|#Qi![#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi&{#Qi'e#Qi'l#Qi'm#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~Oi#Qi~P!IPOi#OO~P!IPOP#ZOi#OOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO']QO^#Qi|#Qi#Z#Qi#]#Qi#_#Qi#`#Qi&{#Qi'e#Qi'l#Qi'm#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~OY#Qi![#Qi#W#Qi#X#Qi#Y#Qi~P!KkOY#aO![#QO#W#QO#X#QO#Y#QO~P!KkOP#ZOY#aOi#OOq!xOr!xOt!yO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO']QO^#Qi|#Qi#]#Qi#_#Qi#`#Qi&{#Qi'e#Qi'm#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~O'l#Qi~P!NcO'l!zO~P!NcOP#ZOY#aOi#OOq!xOr!xOt!yO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO']QO'l!zO^#Qi|#Qi#_#Qi#`#Qi&{#Qi'e#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~O'm#Qi~P#!}O'm!{O~P#!}OP#ZOY#aOi#OOq!xOr!xOt!yO![#QO!]!vO!_!wO!e#ZO#R!|O#S!}O#T!}O#U!}O#V#PO#W#QO#X#QO#Y#QO#Z#RO#]#TO#_#VO']QO'l!zO'm!{O~O^#Qi|#Qi#`#Qi&{#Qi'e#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~P#%iOPZXYZXiZXqZXrZXtZX![ZX!]ZX!_ZX!eZX!tZX#OcX#RZX#SZX#TZX#UZX#VZX#WZX#XZX#YZX#ZZX#]ZX#_ZX#`ZX#eZX']ZX'eZX'lZX'mZX|ZX}ZX~O#cZX~P#'|OP#ZOY8lOi8aOq!xOr!xOt!yO![8cO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO#W8cO#X8cO#Y8cO#Z8dO#]8fO#_8hO#`8iO']QO'e#XO'l!zO'm!{O~O#c,RO~P#*WOP'[XY'[Xi'[Xq'[Xr'[Xt'[X!['[X!]'[X!_'[X!e'[X#R'[X#S'[X#T'[X#U'[X#V'[X#W'[X#X'[X#Y'[X#Z'[X#]'[X#_'[X#`'[X#c'[X']'[X'e'[X'l'[X'm'[X~O!t8mO#e8mO~P#,RO^&ga|&ga&{&ga!^&ga'_&gay&ga!O&ga$v&ga!W&ga~P!)uOP#QiY#Qi^#Qii#Qir#Qi|#Qi![#Qi!]#Qi!_#Qi!e#Qi#R#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi&{#Qi']#Qiy#Qi!^#Qi'_#Qi!O#Qi$v#Qi!W#Qi~P!$ZO^#di|#di&{#diy#di!^#di'_#di!O#di$v#di!W#di~P!)uO#p,TO~O#p,UO~O!W'bO!t,VO!O#tX#m#tX#p#tX#w#tX~O{,WO~O!O'eO#m,YO#p'dO#w,ZO~OP#ZOY8lOi;XOq!xOr!xOt!yO|8jO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O#];^O#_;`O#`;aO']QO'e#XO'l!zO'm!{O}'ZX~O},[O~O#w,^O~O],aOj,aOy,bO~O|cX!WcX!^cX!^$ZX'ecX~P!#]O!^,hO~P!$ZO|,iO!W!tO'e&gO!^'rX~O!^,nO~Oy$ZX|$ZX!W$bX~P!#]O|,pOy'sX~P!$ZO!W,rO~Oy,tO~O{(QO'P$[O!^'rP~Oi,xO!W!tO!_$TO'U$_O'e&gO~O!W)QO~O}-OO~P!&mO!S-PO!T-PO'Q$^O'Y(YO~Ot-RO'Y(YO~O!q-SO~O'P$vO|&lX'T&lX~O|(jO'T'Va~Oq-XOr-XOt-YO'ena'lna'mna|na!tna~O'Tna#cna~P#8dOq'tOt'uO'e$Sa'l$Sa'm$Sa|$Sa!t$Sa~O'T$Sa#c$Sa~P#9YOq'tOt'uO'e$Ua'l$Ua'm$Ua|$Ua!t$Ua~O'T$Ua#c$Ua~P#9{O]-ZO~O#O-[O~O'T$da|$da#c$da!t$da~P!$ZO#O-^O~OR-gO!O&[O!j-fO$v-eO~O'T-hO~O]#nOi#oOj#nOk#nOm#{Oo8nOt#tO!O#uO!Y;OO!_#rO!}8tO#j$PO$T8pO$V8rO$Y$QO~Og-jO'P-iO~P#;rO!W)QO!O'Sa^'Sa&{'Sa~O#O-pO~OYZX|cX}cX~O|-qO}'zX~O}-sO~OY-tO~O!O$gO'P$[O[&tX|&tX~O|)^O['ya~OP#ZOY#aOi9qOq!xOr!xOt!yO![9sO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO#V9rO#W9sO#X9sO#Y9sO#Z9tO#]9vO#_9xO#`9yO']QO'e#XO'l!zO'm!{O~O!^-wO~P#>gO]-yO~OY-zO~O[-{O~OR-gO!O&[O!j-fO$v-eO'U$_O~O|)jO^'va&{'va~O!t.RO~OR.UO!O#uO~O'Y&zO}'wP~OR.`O!O.[O!j._O$v.^O'U$_O~OY.jO|.hO}'xX~O}.kO~O[.mO^$WO&{$WO~O].nO~O#X.pO%i.qO~P0gO!t#bO#X.pO%i.qO~O^.rO~P)rO^.tO~O%r.xOP%piQ%piW%pi]%pi^%pia%pib%pig%pii%pij%pik%pim%pio%pit%piv%piw%pix%pi!O%pi!Y%pi!_%pi!b%pi!c%pi!d%pi!e%pi!f%pi!i%pi#j%pi#n%pi$u%pi$w%pi$y%pi$z%pi${%pi%O%pi%Q%pi%T%pi%U%pi%W%pi%e%pi%k%pi%m%pi%o%pi%q%pi%t%pi%z%pi&O%pi&Q%pi&S%pi&U%pi&W%pi&v%pi'P%pi']%pi'q%pi}%pi_%pi%w%pi~O_/OO}.|O%w.}O~P]O!OSO!_/RO~OP$RaY$Rai$Raq$Rar$Rat$Ra![$Ra!]$Ra!_$Ra!e$Ra#R$Ra#S$Ra#T$Ra#U$Ra#V$Ra#W$Ra#X$Ra#Y$Ra#Z$Ra#]$Ra#_$Ra#`$Ra']$Ra'e$Ra'l$Ra'm$Ra~O|#_O'_$Ra!^$Ra^$Ra&{$Ra~P#GwOy&]i|&]i~P!)uO|!ZOy'`i~O|&XOy'ii~Oy/VO~OP#ZOY8lOi;XOq!xOr!xOt!yO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O#];^O#_;`O#`;aO']QO'e#XO'l!zO'm!{O~O|!Qa}!Qa~P#JoO]%zOj%zO{/]O'Y(YO|&^X}&^X~P?nO|*zO}'aa~O]&SOj&SO{)iO'Y&zO|&cX}&cX~O|*}O}'ka~Oy'ji|'ji~P!)uO^$WO!W!tO!_$TO!e/hO!t/fO&{$WO'U$_O'e&gO~O}/kO~P!@sO!S/lO!T/lO'Q$^O'Y(YO~O!R/nO!S/lO!T/lO!q/oO'Q$^O'Y(YO~O!n/pO!o/pO~P$ UO!O&[O~O!O&[O~P!$ZO|'gi!^'gi^'gi&{'gi~P!)uO!t/yO|'gi!^'gi^'gi&{'gi~O|&lO!^'fi~Ot$pO!O$qO!}/{O'P$[O~O#OnaPnaYna^naina![na!]na!_na!ena#Rna#Sna#Tna#Una#Vna#Wna#Xna#Yna#Zna#]na#_na#`na&{na']na!^nayna!Ona$vna'_na!Wna~P#8dO#O$SaP$SaY$Sa^$Sai$Sar$Sa![$Sa!]$Sa!_$Sa!e$Sa#R$Sa#S$Sa#T$Sa#U$Sa#V$Sa#W$Sa#X$Sa#Y$Sa#Z$Sa#]$Sa#_$Sa#`$Sa&{$Sa']$Sa!^$Say$Sa!O$Sa$v$Sa'_$Sa!W$Sa~P#9YO#O$UaP$UaY$Ua^$Uai$Uar$Ua![$Ua!]$Ua!_$Ua!e$Ua#R$Ua#S$Ua#T$Ua#U$Ua#V$Ua#W$Ua#X$Ua#Y$Ua#Z$Ua#]$Ua#_$Ua#`$Ua&{$Ua']$Ua!^$Uay$Ua!O$Ua$v$Ua'_$Ua!W$Ua~P#9{O#O$daP$daY$da^$dai$dar$da|$da![$da!]$da!_$da!e$da#R$da#S$da#T$da#U$da#V$da#W$da#X$da#Y$da#Z$da#]$da#_$da#`$da&{$da']$da!^$day$da!O$da!t$da$v$da'_$da!W$da~P!$ZO|&_X'T&_X~PIkO|+xO'T'ca~O{0TO|&`X!^&`X~P)rO|+{O!^'da~O|+{O!^'da~P!)uO#c!aa}!aa~PBpO#c!Xa~P#*WO!O0gO#n]O#u0hO~O}0lO~O^$Oq|$Oq&{$Oqy$Oq!^$Oq'_$Oq!O$Oq$v$Oq!W$Oq~P!)uOy0mO~O],aOj,aO~Oq'tOt'uO'm'yO'e$ni'l$ni|$ni!t$ni~O'T$ni#c$ni~P$.YOq'tOt'uO'e$pi'l$pi'm$pi|$pi!t$pi~O'T$pi#c$pi~P$.{O#c0nO~P!$ZO{0pO'P$[O|&hX!^&hX~O|,iO!^'ra~O|,iO!W!tO!^'ra~O|,iO!W!tO'e&gO!^'ra~O'T$]i|$]i#c$]i!t$]i~P!$ZO{0wO'P(TOy&jX|&jX~P!$xO|,pOy'sa~O|,pOy'sa~P!$ZO!W!tO~O!W!tO#X1RO~Oi1VO!W!tO'e&gO~O|'Wi'T'Wi~P!$ZO!t1YO|'Wi'T'Wi~P!$ZO!^1]O~O|1`O!O'tX~P!$ZO!O&[O$v1cO~O!O&[O$v1cO~P!$ZO!O$ZX$kZX^$ZX&{$ZX~P!#]O$k1gOqfXtfX!OfX'efX'lfX'mfX^fX&{fX~O$k1gO~O'P)YO|&sX}&sX~O|-qO}'za~O[1oO~O]1rO~OR1tO!O&[O!j1sO$v1cO~O^$WO&{$WO~P!$ZO!O#uO~P!$ZO|1yO!t1{O}'wX~O}1|O~Ot(^O!R2VO!S2OO!T2OO!m2UO!n2TO!o2TO!q2SO'Q$^O'Y(YO~O}2RO~P$6bOR2^O!O.[O!j2]O$v2[O~OR2^O!O.[O!j2]O$v2[O'U$_O~O'P(lO|&rX}&rX~O|.hO}'xa~O'Y2gO~O]2iO~O[2kO~O!^2nO~P)rO^2pO~O^2pO~P)rO#X2rO%i2sO~PEYO_/OO}2wO%w.}O~P]O!W2yO~O%|2zOP%yqQ%yqW%yq]%yq^%yqa%yqb%yqg%yqi%yqj%yqk%yqm%yqo%yqt%yqv%yqw%yqx%yq!O%yq!Y%yq!_%yq!b%yq!c%yq!d%yq!e%yq!f%yq!i%yq#j%yq#n%yq$u%yq$w%yq$y%yq$z%yq${%yq%O%yq%Q%yq%T%yq%U%yq%W%yq%e%yq%k%yq%m%yq%o%yq%q%yq%t%yq%z%yq&O%yq&Q%yq&S%yq&U%yq&W%yq&v%yq'P%yq']%yq'q%yq}%yq%r%yq_%yq%w%yq~O|!{i}!{i~P#JoO!t2|O|!{i}!{i~O|!Qi}!Qi~P#JoO^$WO!t3TO&{$WO~O^$WO!W!tO!t3TO&{$WO~O^$WO!W!tO!_$TO!e3XO!t3TO&{$WO'U$_O'e&gO~O!S3YO!T3YO'Q$^O'Y(YO~O!R3]O!S3YO!T3YO!q3^O'Q$^O'Y(YO~O^$WO!W!tO!e3XO!t3TO&{$WO'e&gO~O|'gq!^'gq^'gq&{'gq~P!)uO|&lO!^'fq~O#O$niP$niY$ni^$nii$nir$ni![$ni!]$ni!_$ni!e$ni#R$ni#S$ni#T$ni#U$ni#V$ni#W$ni#X$ni#Y$ni#Z$ni#]$ni#_$ni#`$ni&{$ni']$ni!^$niy$ni!O$ni$v$ni'_$ni!W$ni~P$.YO#O$piP$piY$pi^$pii$pir$pi![$pi!]$pi!_$pi!e$pi#R$pi#S$pi#T$pi#U$pi#V$pi#W$pi#X$pi#Y$pi#Z$pi#]$pi#_$pi#`$pi&{$pi']$pi!^$piy$pi!O$pi$v$pi'_$pi!W$pi~P$.{O#O$]iP$]iY$]i^$]ii$]ir$]i|$]i![$]i!]$]i!_$]i!e$]i#R$]i#S$]i#T$]i#U$]i#V$]i#W$]i#X$]i#Y$]i#Z$]i#]$]i#_$]i#`$]i&{$]i']$]i!^$]iy$]i!O$]i!t$]i$v$]i'_$]i!W$]i~P!$ZO|&_a'T&_a~P!$ZO|&`a!^&`a~P!)uO|+{O!^'di~OP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO']QOY#Qii#Qi![#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'l#Qi'm#Qi|#Qi}#Qi~O#R#Qi~P$GzOP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO']QOY#Qii#Qi![#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'l#Qi'm#Qi~O#R8_O~P$I{OP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O']QOY#Qi![#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'l#Qi'm#Qi~Oi#Qi~P$KvOi8aO~P$KvOP#ZOi8aOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO']QO#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'l#Qi'm#Qi~OY#Qi![#Qi#W#Qi#X#Qi#Y#Qi~P$MxOY8lO![8cO#W8cO#X8cO#Y8cO~P$MxOP#ZOY8lOi8aOq!xOr!xOt!yO![8cO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO#W8cO#X8cO#Y8cO#Z8dO']QO#]#Qi#_#Qi#`#Qi#c#Qi'e#Qi'm#Qi~O'l#Qi~P%!WO'l!zO~P%!WOP#ZOY8lOi8aOq!xOr!xOt!yO![8cO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO#W8cO#X8cO#Y8cO#Z8dO#]8fO']QO'l!zO#_#Qi#`#Qi#c#Qi'e#Qi~O'm#Qi~P%$YO'm!{O~P%$YOP#ZOY8lOi8aOq!xOr!xOt!yO![8cO!]!vO!_!wO!e#ZO#R8_O#S8`O#T8`O#U8`O#V8bO#W8cO#X8cO#Y8cO#Z8dO#]8fO#_8hO']QO'l!zO'm!{O~O#`#Qi#c#Qi'e#Qi~P%&[O^#ay|#ay&{#ayy#ay!^#ay'_#ay!O#ay$v#ay!W#ay~P!)uOP#QiY#Qii#Qir#Qi![#Qi!]#Qi!_#Qi!e#Qi#R#Qi#S#Qi#T#Qi#U#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi#c#Qi']#Qi|#Qi}#Qi~P!$ZO!]!vOP'XXY'XXi'XXq'XXr'XXt'XX!['XX!_'XX!e'XX#R'XX#S'XX#T'XX#U'XX#V'XX#W'XX#X'XX#Y'XX#Z'XX#]'XX#_'XX#`'XX#c'XX']'XX'e'XX'l'XX'm'XX|'XX}'XX~O#c#di~P#*WO}3mO~O|&ga}&ga#c&ga~P#JoO!W!tO'e&gO|&ha!^&ha~O|,iO!^'ri~O|,iO!W!tO!^'ri~Oy&ja|&ja~P!$ZO!W3tO~O|,pOy'si~P!$ZO|,pOy'si~Oy3zO~O!W!tO#X4QO~Oi4RO!W!tO'e&gO~Oy4TO~O'T$_q|$_q#c$_q!t$_q~P!$ZO|1`O!O'ta~O!O&[O$v4YO~O!O&[O$v4YO~P!$ZOY4]O~O|-qO}'zi~O]4_O~O[4`O~O'Y&zO|&oX}&oX~O|1yO}'wa~O}4mO~P$6bO!R4pO!S4oO!T4oO!q/oO'Q$^O'Y(YO~O!n4qO!o4qO~P%1OO!S4oO!T4oO'Q$^O'Y(YO~O!O.[O~O!O.[O$v4sO~O!O.[O$v4sO~P!$ZOR4xO!O.[O!j4wO$v4sO~OY4}O|&ra}&ra~O|.hO}'xi~O]5QO~O!^5RO~O!^5SO~O!^5TO~O!^5TO~P)rO^5VO~O!W5YO~O!^5[O~O|'ji}'ji~P#JoO^$WO&{$WO~P#>gO^$WO!t5aO&{$WO~O^$WO!W!tO!t5aO&{$WO~O^$WO!W!tO!e5fO!t5aO&{$WO'e&gO~O!_$TO'U$_O~P%5RO!S5gO!T5gO'Q$^O'Y(YO~O|'gy!^'gy^'gy&{'gy~P!)uO#O$_qP$_qY$_q^$_qi$_qr$_q|$_q![$_q!]$_q!_$_q!e$_q#R$_q#S$_q#T$_q#U$_q#V$_q#W$_q#X$_q#Y$_q#Z$_q#]$_q#_$_q#`$_q&{$_q']$_q!^$_qy$_q!O$_q!t$_q$v$_q'_$_q!W$_q~P!$ZO|&`i!^&`i~P!)uO|8jO#c$Ra~P#GwOq-XOr-XOt-YOPnaYnaina![na!]na!_na!ena#Rna#Sna#Tna#Una#Vna#Wna#Xna#Yna#Zna#]na#_na#`na#cna']na'ena'lna'mna|na}na~Oq'tOt'uOP$SaY$Sai$Sar$Sa![$Sa!]$Sa!_$Sa!e$Sa#R$Sa#S$Sa#T$Sa#U$Sa#V$Sa#W$Sa#X$Sa#Y$Sa#Z$Sa#]$Sa#_$Sa#`$Sa#c$Sa']$Sa'e$Sa'l$Sa'm$Sa|$Sa}$Sa~Oq'tOt'uOP$UaY$Uai$Uar$Ua![$Ua!]$Ua!_$Ua!e$Ua#R$Ua#S$Ua#T$Ua#U$Ua#V$Ua#W$Ua#X$Ua#Y$Ua#Z$Ua#]$Ua#_$Ua#`$Ua#c$Ua']$Ua'e$Ua'l$Ua'm$Ua|$Ua}$Ua~OP$daY$dai$dar$da![$da!]$da!_$da!e$da#R$da#S$da#T$da#U$da#V$da#W$da#X$da#Y$da#Z$da#]$da#_$da#`$da#c$da']$da|$da}$da~P!$ZO#c$Oq~P#*WO}5oO~O'T$ry|$ry#c$ry!t$ry~P!$ZO!W!tO|&hi!^&hi~O!W!tO'e&gO|&hi!^&hi~O|,iO!^'rq~Oy&ji|&ji~P!$ZO|,pOy'sq~Oy5vO~P!$ZOy5vO~O|'Wy'T'Wy~P!$ZO|&ma!O&ma~P!$ZO!O$jq^$jq&{$jq~P!$ZO|-qO}'zq~O]6PO~O!O&[O$v6QO~O!O&[O$v6QO~P!$ZO!t6RO|&oa}&oa~O|1yO}'wi~P#JoO!S6XO!T6XO'Q$^O'Y(YO~O!R6ZO!S6XO!T6XO!q3^O'Q$^O'Y(YO~O!O.[O$v6^O~O!O.[O$v6^O~P!$ZO'Y6dO~O|.hO}'xq~O!^6gO~O!^6gO~P)rO!^6iO~O!^6jO~O|!{y}!{y~P#JoO^$WO!t6oO&{$WO~O^$WO!W!tO!t6oO&{$WO~O^$WO!W!tO!e6sO!t6oO&{$WO'e&gO~O#O$ryP$ryY$ry^$ryi$ryr$ry|$ry![$ry!]$ry!_$ry!e$ry#R$ry#S$ry#T$ry#U$ry#V$ry#W$ry#X$ry#Y$ry#Z$ry#]$ry#_$ry#`$ry&{$ry']$ry!^$ryy$ry!O$ry!t$ry$v$ry'_$ry!W$ry~P!$ZO#c#ay~P#*WOP$]iY$]ii$]ir$]i![$]i!]$]i!_$]i!e$]i#R$]i#S$]i#T$]i#U$]i#V$]i#W$]i#X$]i#Y$]i#Z$]i#]$]i#_$]i#`$]i#c$]i']$]i|$]i}$]i~P!$ZOq'tOt'uO'm'yOP$niY$nii$nir$ni![$ni!]$ni!_$ni!e$ni#R$ni#S$ni#T$ni#U$ni#V$ni#W$ni#X$ni#Y$ni#Z$ni#]$ni#_$ni#`$ni#c$ni']$ni'e$ni'l$ni|$ni}$ni~Oq'tOt'uOP$piY$pii$pir$pi![$pi!]$pi!_$pi!e$pi#R$pi#S$pi#T$pi#U$pi#V$pi#W$pi#X$pi#Y$pi#Z$pi#]$pi#_$pi#`$pi#c$pi']$pi'e$pi'l$pi'm$pi|$pi}$pi~O!W!tO|&hq!^&hq~O|,iO!^'ry~Oy&jq|&jq~P!$ZOy6yO~P!$ZO|1yO}'wq~O!S7UO!T7UO'Q$^O'Y(YO~O!O.[O$v7XO~O!O.[O$v7XO~P!$ZO!^7[O~O%|7]OP%y!ZQ%y!ZW%y!Z]%y!Z^%y!Za%y!Zb%y!Zg%y!Zi%y!Zj%y!Zk%y!Zm%y!Zo%y!Zt%y!Zv%y!Zw%y!Zx%y!Z!O%y!Z!Y%y!Z!_%y!Z!b%y!Z!c%y!Z!d%y!Z!e%y!Z!f%y!Z!i%y!Z#j%y!Z#n%y!Z$u%y!Z$w%y!Z$y%y!Z$z%y!Z${%y!Z%O%y!Z%Q%y!Z%T%y!Z%U%y!Z%W%y!Z%e%y!Z%k%y!Z%m%y!Z%o%y!Z%q%y!Z%t%y!Z%z%y!Z&O%y!Z&Q%y!Z&S%y!Z&U%y!Z&W%y!Z&v%y!Z'P%y!Z']%y!Z'q%y!Z}%y!Z%r%y!Z_%y!Z%w%y!Z~O^$WO!t7aO&{$WO~O^$WO!W!tO!t7aO&{$WO~OP$_qY$_qi$_qr$_q![$_q!]$_q!_$_q!e$_q#R$_q#S$_q#T$_q#U$_q#V$_q#W$_q#X$_q#Y$_q#Z$_q#]$_q#_$_q#`$_q#c$_q']$_q|$_q}$_q~P!$ZO|&oq}&oq~P#JoO^$WO!t7uO&{$WO~OP$ryY$ryi$ryr$ry![$ry!]$ry!_$ry!e$ry#R$ry#S$ry#T$ry#U$ry#V$ry#W$ry#X$ry#Y$ry#Z$ry#]$ry#_$ry#`$ry#c$ry']$ry|$ry}$ry~P!$ZO|#_O'_'ZX!^'ZX^'ZX&{'ZX~P!)uO'_'ZX~P.ZO'_ZXyZX!^ZX%iZX!OZX$vZX!WZX~P$tO!WcX!^ZX!^cX'ecX~P:tOP;TOQ;TO]bOa:{Ob!gOgbOi;TOjbOkbOm;TOo;TOtROvbOwbOxbO!OSO!Y;UO!_UO!b;TO!c;TO!d;TO!e;TO!f;TO!i!fO#j!iO#n]O'P'YO']QO'q;{O~O|8jO}$Ra~O]#nOg#zOi#oOj#nOk#nOm#{Oo8oOt#tO!O#uO!Y;PO!_#rO!}8uO#j$PO$T8qO$V8sO$Y$QO'P&rO~O}ZX}cX~P:tO|8jO#c'ZX~P#JoO#c'ZX~P#2iO#O8]O~O#O8^O~O!W!tO#O8]O~O!W!tO#O8^O~O!t8mO~O!t8vO|'jX}'jX~O!t;bO|'hX}'hX~O#O8wO~O#O8xO~O'T8|O~P!$ZO#O9RO~O#O9SO~O!W!tO#O9TO~O!W!tO#O9UO~O!W!tO#O9VO~O!^!Xa^!Xa&{!Xa~P#>gO#O9WO~O!W!tO#O8wO~O!W!tO#O8xO~O!W!tO#O9WO~OP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R9oO']QOY#Qii#Qi![#Qi!^#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi^#Qi&{#Qi~O#S#Qi#T#Qi#U#Qi~P&3mO#S9pO#T9pO#U9pO~P&3mOP#ZOi9qOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO']QOY#Qi![#Qi!^#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi^#Qi&{#Qi~O#V#Qi~P&5{O#V9rO~P&5{OP#ZOY#aOi9qOq!xOr!xOt!yO![9sO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO#V9rO#W9sO#X9sO#Y9sO']QO!^#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi^#Qi&{#Qi~O#Z#Qi~P&8TO#Z9tO~P&8TOP#ZOY#aOi9qOq!xOr!xOt!yO![9sO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO#V9rO#W9sO#X9sO#Y9sO#Z9tO']QO'l!zO!^#Qi#_#Qi#`#Qi'e#Qi'm#Qi^#Qi&{#Qi~O#]#Qi~P&:]O#]9vO~P&:]OP#ZOY#aOi9qOq!xOr!xOt!yO![9sO!]!vO!_!wO!e#ZO#R9oO#S9pO#T9pO#U9pO#V9rO#W9sO#X9sO#Y9sO#Z9tO#]9vO']QO'l!zO'm!{O!^#Qi#`#Qi'e#Qi^#Qi&{#Qi~O#_#Qi~P&<eO#_9xO~P&<eO#c9XO~P#*WO!^#di^#di&{#di~P#>gO#O9YO~O#O9ZO~O#O9[O~O#O9]O~O#O9^O~O#O9_O~O#O9`O~O#O9aO~O!^$Oq^$Oq&{$Oq~P#>gO#c9bO~P!$ZO#c9cO~P!$ZO!^#ay^#ay&{#ay~P#>gOP'[XY'[Xi'[Xq'[Xr'[Xt'[X!['[X!]'[X!_'[X!e'[X#R'[X#S'[X#T'[X#U'[X#V'[X#W'[X#X'[X#Y'[X#Z'[X#]'[X#_'[X#`'[X']'[X'e'[X'l'[X'm'[X~O!t9zO#e9zO!^'[X^'[X&{'[X~P&@uO!t9zO~O'T:dO~P!$ZO#c:mO~P#*WO#O:rO~O!W!tO#O:rO~O!t;bO~O'T;cO~P!$ZO#c;dO~P#*WO!t;bO#e;bO|'[X}'[X~P#,RO|!Xa}!Xa#c!Xa~P#JoO#R;VO~P$GzOP#ZOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO']QOY#Qi|#Qi}#Qi![#Qi#V#Qi#W#Qi#X#Qi#Y#Qi#Z#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi#c#Qi~Oi#Qi~P&DwOi;XO~P&DwOP#ZOi;XOq!xOr!xOt!yO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO']QO|#Qi}#Qi#Z#Qi#]#Qi#_#Qi#`#Qi'e#Qi'l#Qi'm#Qi#c#Qi~OY#Qi![#Qi#W#Qi#X#Qi#Y#Qi~P&GPOY8lO![;ZO#W;ZO#X;ZO#Y;ZO~P&GPOP#ZOY8lOi;XOq!xOr!xOt!yO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O']QO|#Qi}#Qi#]#Qi#_#Qi#`#Qi'e#Qi'm#Qi#c#Qi~O'l#Qi~P&IeO'l!zO~P&IeOP#ZOY8lOi;XOq!xOr!xOt!yO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O#];^O']QO'l!zO|#Qi}#Qi#_#Qi#`#Qi'e#Qi#c#Qi~O'm#Qi~P&KmO'm!{O~P&KmOP#ZOY8lOi;XOq!xOr!xOt!yO![;ZO!]!vO!_!wO!e#ZO#R;VO#S;WO#T;WO#U;WO#V;YO#W;ZO#X;ZO#Y;ZO#Z;[O#];^O#_;`O']QO'l!zO'm!{O~O|#Qi}#Qi#`#Qi'e#Qi#c#Qi~P&MuO|#di}#di#c#di~P#JoO|$Oq}$Oq#c$Oq~P#JoO|#ay}#ay#c#ay~P#JoO#n~!]!m!o!|!}'q$T$V$Y$k$u$v$w%O%Q%T%U%W%Y~TS#n'q#p'Y'P&}#Sx~",
  goto: "$!x(OPPPPPPP(PP(aP)|PPPP._PP.t4x6k7QP7QPPP7QP7QP8oPP8tP9]PPPP?RPPPP?RBoPPPBuDxP?RPGgPPPPIv?RPPPPPLW?RPP!!T!#QPPP!#UP!#^!$_P?R?R!'x!+y!1w!1w!6WPPP!6_?RPPPPPPPPP!:TP!;uPP?R!=_P?RP?R?R?R?RP?R!?zPP!CoP!G`!Gh!Gl!GlP!ClP!Gp!GpP!KaP!Ke?R?R!Kk# _7QP7QP7Q7QP#!v7Q7Q#$l7Q7Q7Q#&o7Q7Q#']#)W#)W#)[#)W#)dP#)WP7Q#*`7Q#+k7Q7Q._PPP#,yPPP#-c#-cP#-cP#-x#-cPP#.OP#-uP#-u#.b!#Y#-u#/P#/V#/Y(P#/](PP#/d#/d#/dP(PP(PP(PP(PPP(PP#/j#/mP#/m(PPPP(PP(PP(PP(PP(PP(P(P#/q#/{#0R#0a#0g#0m#0w#0}#1X#1_#1m#1s#1y#2a#2v#4Z#4i#4o#4u#4{#5R#5]#5c#5i#5s#5}#6TPPPPPPPP#6ZPP#6}#:{PP#<`#<i#<sP#AS#DVP#K}P#LR#LU#LX#Ld#LgP#Lj#Ln#M]#NQ#NU#NhPP#Nl#Nr#NvP#Ny#N}$ Q$ p$!W$!]$!`$!c$!i$!l$!p$!tmgOSi{!k$V%^%a%b%d*_*d.x.{Q$dlQ$knQ%UwS&O!`*zQ&c!gS(]#u(bQ)W$eQ)d$mQ*O%OQ+Q&VS+W&[+YQ+h&dQ-P(dQ.g*PU/l+[+]+^S2O.[2QS3Y/n/pU4o2T2U2VQ5g3]S6X4p4qR7U6Z$hZORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`x'[#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|Q(m#|Q)]$gQ*Q%RQ*X%ZQ+s8nQ-k)QQ.o*VQ1l-qQ2e.hQ3g8o!O:s$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m!q;l#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;dpdOSiw{!k$V%T%^%a%b%d*_*d.x.{R*S%V(WVOSTijm{!Q!U!Z!h!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:y:z:{:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|W!aRU!^&PQ$]kQ$clS$hn$mv$rpq!o!r$T$p&X&l&o)h)i)j*]*t+T+m+o/R/{Q$zuQ&`!fQ&b!gS(P#r(ZS)V$d$eQ)Z$gQ)g$oQ)y$|Q)}%OS+g&c&dQ,m(QQ-o)WQ-u)^Q-x)bQ.b)zS.f*O*PQ/w+hQ0o,iQ1k-qQ1n-tQ1q-zQ2d.gQ3q0pR5}4]!W$al!g$c$d$e%}&b&c&d([)V)W*w+V+g+h,y-o/b/i/m/w1U3W3[5e6rQ)O$]Q)o$wQ)r$xQ)|%OQ-|)gQ.a)yU.e)}*O*PQ2_.bS2c.f.gQ4j1}Q4|2dS6V4k4nS7S6W6YQ7l7TR7z7m[#x`$_(j:u;j;{S$wr%TQ$xsQ$ytR)m$u$X#w`!t!v#a#r#t#}$O$S&_'x'z'{(S(W(h(i({(})Q)n)q+d+x,p,r-[-e-g.R.U.^.`0n0w1R1Y1`1c1g1t2[2^3t4Q4Y4s4x6Q6^7X8l8p8q8r8s8t8u8}9O9P9Q9R9S9Y9Z9b9c:u;R;S;j;{V(n#|8n8oU&S!`$q*}Q&{!xQ)a$jQ,`'tQ.V)sQ1Z-XR4f1y(UbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|%]#^Y!]!l$Z%r%v&w&}'O'P'Q'R'S'T'U'V'W'X'Z'^'a'k)`*o*x+R+i+},Q,S,_/W/Z/x0S0W0X0Y0Z0[0]0^0_0`0a0b0c0f0k3O3R3b3e3k4h5]5`5k6m7O7_7s7}8W8X8z8{:R:W:X:Y:Z:[:]:^:_:`:a:b:c:n:q;Q;i;m;n;o;p;q;r;s;t;u;v;w;x;y;z(VbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|Q&Q!`R/^*zY%z!`&O&V*z+QS([#u(bS+V&[+YS,y(](dQ,z(^Q-Q(eQ.X)uS/i+W+[S/m+]+^S/q+_2SQ1U-PQ1W-RQ1X-SS1}.[2QS3W/l/nQ3Z/oQ3[/pS4k2O2VS4n2T2US5e3Y3]Q5h3^S6W4o4pQ6Y4qQ6r5gS7T6X6ZR7m7UlgOSi{!k$V%^%a%b%d*_*d.x.{Q%f!OW&p!s8]8^:rQ)T$bQ)w$zQ)x${Q+e&aW+w&t8w8x9WW-](u9T9U9VQ-m)UQ.Z)vQ/P*fQ/Q*gQ/Y*uQ/u+fW1_-^9[9]9^Q1h-nW1j-p9_9`9aQ2}/[Q3Q/dQ3`/vQ4[1iQ5Z2zQ5^3PQ5b3VQ5i3aQ6k5[Q6n5cQ7`6pQ7q7]R7t7b%S#]Y!]!l%r%v&w&}'O'P'Q'R'S'T'U'V'W'X'Z'^'a'k)`*o*x+R+i+},Q,_/W/Z/x0S0W0X0Y0Z0[0]0^0_0`0a0b0c0f0k3O3R3b3e3k4h5]5`5k6m7O7_7s7}8W8X8z8{:W:X:Y:Z:[:]:^:_:`:a:b:c:n:q;Q;i;n;o;p;q;r;s;t;u;v;w;x;y;zU(g#v&s0eX(y$Z,S:R;m%S#[Y!]!l%r%v&w&}'O'P'Q'R'S'T'U'V'W'X'Z'^'a'k)`*o*x+R+i+},Q,_/W/Z/x0S0W0X0Y0Z0[0]0^0_0`0a0b0c0f0k3O3R3b3e3k4h5]5`5k6m7O7_7s7}8W8X8z8{:W:X:Y:Z:[:]:^:_:`:a:b:c:n:q;Q;i;n;o;p;q;r;s;t;u;v;w;x;y;zQ']#]W(x$Z,S:R;mR-_(y(UbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|Q%ayQ%bzQ%d|Q%e}R.w*bQ&]!fQ(z$]Q+b&`S-d)O)gS/r+`+aW1b-a-b-c-|S3_/s/tU4X1d1e1fU5{4W4b4cQ6{5|R7h6}T+X&[+YS+X&[+YT2P.[2QS&j!n.uQ,l(PQ,w([S/h+V1}Q0t,mS1O,x-QU3X/m/q4nQ3p0oS4O1V1XU5f3Z3[6YQ5q3qQ5z4RR6s5hQ!uXS&i!n.uQ(v$UQ)R$`Q)X$fQ+k&jQ,k(PQ,v([Q,{(_Q-l)SQ.c){S/g+V1}S0s,l,mS0},w-QQ1Q,zQ1T,|Q2a.dW3U/h/m/q4nQ3o0oQ3s0tS3x1O1XQ4P1WQ4z2bW5d3X3Z3[6YS5p3p3qQ5u3zQ5x4OQ6T4iQ6b4{S6q5f5hQ6u5qQ6w5vQ6z5zQ7Q6UQ7Z6cQ7c6sQ7f6yQ7j7RQ7x7kQ8P7yQ8T8QQ9m9fQ9n9gQ:S;fQ:g:OQ:h:PQ:i:QQ:j:TQ:k:UR:l:V$jWORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%Z%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`S!um!hx9d#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|!O9e$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:mQ9m:yQ9n:zQ:S:{!q;e#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d$jXORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%Z%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`Q$Ua!W$`l!g$c$d$e%}&b&c&d([)V)W*w+V+g+h,y-o/b/i/m/w1U3W3[5e6rS$fm!hQ)S$aQ){%OW.d)|)}*O*PU2b.e.f.gQ4i1}S4{2c2dU6U4j4k4nQ6c4|U7R6V6W6YS7k7S7TS7y7l7mQ8Q7zx9f#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|!O9g$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:mQ:O:vQ:P:wQ:Q:xQ:T:yQ:U:zQ:V:{!q;f#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d$b[OSTij{!Q!U!Z!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`U!eRU!^v$rpq!o!r$T$p&X&l&o)h)i)j*]*t+T+m+o/R/{Q*Y%Zx9h#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|Q9l&P!O:t$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m!o;g#h'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;dS&T!`$qR/`*}$hZORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`x'[#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|Q*X%Z!O:s$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m!q;l#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d!Q#SY!]$Z%r%v&w'U'V'W'X'^'a*o+R+i+},_/x0S0c3b3e8W8Xh8e'Z,S0_0`0a0b0f3k5k:b;Q;in9u)`3R5`6m7_7s7}:R:^:_:`:a:c:n:qw;]'k*x/W/Z0k3O4h5]7O8z8{;m;t;u;v;w;x;y;z|#UY!]$Z%r%v&w'W'X'^'a*o+R+i+},_/x0S0c3b3e8W8Xd8g'Z,S0a0b0f3k5k:b;Q;ij9w)`3R5`6m7_7s7}:R:`:a:c:n:qs;_'k*x/W/Z0k3O4h5]7O8z8{;m;v;w;x;y;zx#YY!]$Z%r%v&w'^'a*o+R+i+},_/x0S0c3b3e8W8Xp'{#p&u(t,g,o-T-U0Q1^3n4S9{:o:p:};h`:|'Z,S0f3k5k:b;Q;i!^;R&q'`(O(U+a+v,s-`-c.Q.S/t0P0u0y1f1v1x2Y3d3u3{4U4Z4c4v5j5s5y6`Y;S0d3j5l6t7df;k)`3R5`6m7_7s7}:R:c:n:qo;|'k*x/W/Z0k3O4h5]7O8z8{;m;x;y;z(UbORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|S#i_#jR0h,V(]^ORSTU_ij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h#j$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,V,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|S#d]#kT'd#f'hT#e]#kT'f#f'h(]_ORSTU_ij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#Y#_#b#h#j$V$i%V%Y%Z%^%`%a%b%d%h%s%{&P&W&^&h&t&x'm's(u(|*Z*_*d*s*v+c+j+{,R,V,W-Y-^-f-p._.p.q.r.t.x.{.}/]/f/y0T0g1s1{2]2p2r2s2|3T4w5V5a6R6o7a7u8V8Y8]8^8_8`8a8b8c8d8e8f8g8h8i8j8m8v8w8x8|9T9U9V9W9X9[9]9^9_9`9a9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m:r:|;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d;k;|T#i_#jQ#l_R'o#j$jaORSTUij{!Q!U!Z!^!k!s!w!y!|!}#O#P#Q#R#S#T#U#V#W#_#b$V%V%Y%Z%^%`%a%b%d%h%s%{&W&^&h&t&x's(u(|*Z*_*d+c+j+{,R-Y-^-f-p._.p.q.r.t.x.{.}/y0T1s2]2p2r2s4w5V8^8x9U9]9`x:v#Y8V8Y8_8`8a8b8c8d8e8f8g8h8i8m8|9X:|;k;|!O:w$i/f3T5a6o7a7u9i9j9o9p9q9r9s9t9u9v9w9x9y9z:d:m!q:x#h&P'm*s*v,W/]0g1{2|6R8]8j8v8w9T9V9W9[9^9_9a:r;T;U;V;W;X;Y;Z;[;];^;_;`;a;b;c;d#{cOSUi{!Q!U!k!s!y#h$V%V%Y%Z%^%`%a%b%d%h%{&^&t'm(u(|*Z*_*d+c,W-Y-^-f-p._.p.q.r.t.x.{.}0g1s2]2p2r2s4w5V8]8^8w8x9T9U9V9W9[9]9^9_9`9a:rx#v`!v#}$O$S'x'z'{(S(h(i+x-[0n1Y:u;R;S;j;{!z&s!t#a#r#t&_(W({(})Q)n)q+d,p,r-e-g.R.U.^.`0w1R1`1c1g1t2[2^3t4Q4Y4s4x6Q6^7X8p8r8t8}9P9R9Y9bQ(r$Qc0e8l8q8s8u9O9Q9S9Z9cx#s`!v#}$O$S'x'z'{(S(h(i+x-[0n1Y:u;R;S;j;{S(_#u(bQ(s$RQ,|(`!z9|!t#a#r#t&_(W({(})Q)n)q+d,p,r-e-g.R.U.^.`0w1R1`1c1g1t2[2^3t4Q4Y4s4x6Q6^7X8p8r8t8}9P9R9Y9bb9}8l8q8s8u9O9Q9S9Z9cQ:e;OR:f;PleOSi{!k$V%^%a%b%d*_*d.x.{Q(V#tQ*k%kQ*l%mR0v,p$W#w`!t!v#a#r#t#}$O$S&_'x'z'{(S(W(h(i({(})Q)n)q+d+x,p,r-[-e-g.R.U.^.`0n0w1R1Y1`1c1g1t2[2^3t4Q4Y4s4x6Q6^7X8l8p8q8r8s8t8u8}9O9P9Q9R9S9Y9Z9b9c:u;R;S;j;{Q)p$xQ.T)rQ1w.SR4e1xT(a#u(bS(a#u(bT2P.[2QQ)R$`Q,{(_Q-l)SQ.c){Q2a.dQ4z2bQ6T4iQ6b4{Q7Q6UQ7Z6cQ7j7RQ7x7kQ8P7yR8T8Qp'x#p&u(t,g,o-T-U0Q1^3n4S9{:o:p:};h!^8}&q'`(O(U+a+v,s-`-c.Q.S/t0P0u0y1f1v1x2Y3d3u3{4U4Z4c4v5j5s5y6`Z9O0d3j5l6t7dr'z#p&u(t,e,g,o-T-U0Q1^3n4S9{:o:p:};h!`9P&q'`(O(U+a+v,s-`-c.Q.S/t/}0P0u0y1f1v1x2Y3d3u3{4U4Z4c4v5j5s5y6`]9Q0d3j5l5m6t7dpdOSiw{!k$V%T%^%a%b%d*_*d.x.{Q%QvR*Z%ZpdOSiw{!k$V%T%^%a%b%d*_*d.x.{R%QvQ)t$yR.P)mqdOSiw{!k$V%T%^%a%b%d*_*d.x.{Q.])yS2Z.a.bW4r2W2X2Y2_U6]4t4u4vU7V6[6_6`Q7n7WR7{7oQ%XwR*T%TR2h.jR6e4}S$hn$mR-u)^Q%^xR*_%_R*e%eT.y*d.{QiOQ!kST$Yi!kQ!WQR%p!WQ![RU%t![%u*pQ%u!]R*p%vQ*{&QR/_*{Q+y&uR0R+yQ+|&wS0U+|0VR0V+}Q+Y&[R/j+YQ&Y!cQ*q%wT+U&Y*qQ+O&TR/a+OQ&m!pQ+l&kU+p&m+l/|R/|+qQ'h#fR,X'hQ#j_R'n#jQ#`YW'_#`*n3f8kQ*n8WS+r8X8{Q3f8zR8k'kQ,j(PW0q,j0r3r5rU0r,k,l,mS3r0s0tR5r3s#s'v#p&q&u'`(O(U(o(p(t+a+t+u+v,e,f,g,o,s-T-U-`-c.Q.S/t/}0O0P0Q0d0u0y1^1f1v1x2Y3d3h3i3j3n3u3{4S4U4Z4c4v5j5l5m5n5s5y6`6t7d9{:o:p:};hQ,q(UU0x,q0z3vQ0z,sR3v0yQ(b#uR,}(bQ(k#yR-W(kQ1a-`R4V1aQ)k$sR.O)kQ1z.VS4g1z6SR6S4hQ)v$zR.Y)vQ2Q.[R4l2QQ.i*QS2f.i5OR5O2hQ-r)ZS1m-r4^R4^1nQ)_$hR-v)_Q.{*dR2v.{WhOSi!kQ%c{Q(w$VQ*^%^Q*`%aQ*a%bQ*c%dQ.v*_S.y*d.{R2u.xQ$XfQ%g!PQ%j!RQ%l!SQ%n!TQ)f$nQ)l$tQ*S%XQ*i%iS.l*T*WQ/S*hQ/T*kQ/U*lS/e+V1}Q0{,uQ0|,vQ1S,{Q1p-yQ1u.QQ2`.cQ2j.nQ2t.wY3S/g/h/m/q4nQ3w0}Q3y1PQ3|1TQ4a1rQ4d1vQ4y2aQ5P2i[5_3R3U3X3Z3[6YQ5t3xQ5w3}Q6O4_Q6a4zQ6f5QW6l5`5d5f5hQ6v5uQ6x5xQ6|6PQ7P6TQ7Y6bU7^6m6q6sQ7e6wQ7g6zQ7i7QQ7p7ZS7r7_7cQ7v7fQ7w7jQ7|7sQ8O7xQ8R7}Q8S8PR8U8TQ$blQ&a!gU)U$c$d$eQ*u%}U+f&b&c&dQ,u([S-n)V)WQ/[*wQ/d+VS/v+g+hQ1P,yQ1i-oQ3P/bS3V/i/mQ3a/wQ3}1US5c3W3[Q6p5eR7b6rW#q`:u;j;{R)P$_Y#y`$_:u;j;{R-V(jQ#p`S&q!t)QQ&u!vQ'`#aQ(O#rQ(U#tQ(o#}Q(p$OQ(t$SQ+a&_Q+t8pQ+u8rQ+v8tQ,e'xQ,f'zQ,g'{Q,o(SQ,s(WQ-T(hQ-U(id-`({-e.^1c2[4Y4s6Q6^7XQ-c(}Q.Q)nQ.S)qQ/t+dQ/}8}Q0O9PQ0P9RQ0Q+xQ0d8lQ0u,pQ0y,rQ1^-[Q1f-gQ1v.RQ1x.UQ2Y.`Q3d9YQ3h8qQ3i8sQ3j8uQ3n0nQ3u0wQ3{1RQ4S1YQ4U1`Q4Z1gQ4c1tQ4v2^Q5j9bQ5l9SQ5m9OQ5n9QQ5s3tQ5y4QQ6`4xQ6t9ZQ7d9cQ9{:uQ:o;RQ:p;SQ:};jR;h;{lfOSi{!k$V%^%a%b%d*_*d.x.{S!mU%`Q%i!QQ%o!UW&p!s8]8^:rQ&|!yQ'l#hS*W%V%YQ*[%ZQ*h%hQ*r%{Q+`&^W+w&t8w8x9WQ,]'mW-](u9T9U9VQ-b(|Q.s*ZQ/s+cQ0j,WQ1[-YW1_-^9[9]9^Q1e-fW1j-p9_9`9aQ2X._Q2l.pQ2m.qQ2o.rQ2q.tQ2x.}Q3l0gQ4b1sQ4u2]Q5U2pQ5W2rQ5X2sQ6_4wR6h5V!vYOSUi{!Q!k!y$V%V%Y%Z%^%`%a%b%d%h%{&^(|*Z*_*d+c-Y-f._.p.q.r.t.x.{.}1s2]2p2r2s4w5VQ!]RS!lT9jQ$ZjQ%r!ZQ%v!^Q&w!wS&}!|9oQ'O!}Q'P#OQ'Q#PQ'R#QQ'S#RQ'T#SQ'U#TQ'V#UQ'W#VQ'X#WQ'Z#YQ'^#_Q'a#bW'k#h'm,W0gQ)`$iQ*o%sS*x&P/]Q+R&WQ+i&hQ+}&xS,Q8V;TQ,S8YQ,_'sQ/W*sQ/Z*vQ/x+jQ0S+{S0W8_;VQ0X8`Q0Y8aQ0Z8bQ0[8cQ0]8dQ0^8eQ0_8fQ0`8gQ0a8hQ0b8iQ0c,RQ0f8mQ0k8jQ3O8vQ3R/fQ3b/yQ3e0TQ3k8|Q4h1{Q5]2|Q5`3TQ5k9XQ6m5aQ7O6RQ7_6oQ7s7aQ7}7u[8W!U8^8x9U9]9`Y8X!s&t(u-^-pY8z8]8w9T9[9_Y8{9V9W9^9a:rQ:R9iQ:W9pQ:X9qQ:Y9rQ:Z9sQ:[9tQ:]9uQ:^9vQ:_9wQ:`9xQ:a9yQ:b:|Q:c9zQ:n:dQ:q:mQ;Q;kQ;i;|Q;m;UQ;n;WQ;o;XQ;p;YQ;q;ZQ;r;[Q;s;]Q;t;^Q;u;_Q;v;`Q;w;aQ;x;bQ;y;cR;z;dT!VQ!WR!_RR&R!`S%}!`*zS*w&O&VR/b+QR&v!vR&y!wT!qU$TS!pU$TU$spq*]S&k!o!rQ+n&lQ+q&oQ-})jS/z+m+oR3c/{[!bR!^$p&X)h+Th!nUpq!o!r$T&l&o)j+m+o/{Q.u*]Q/X*tQ2{/RT9k&P)iT!dR$pS!cR$pS%w!^)hS*y&P)iQ+S&XR/c+TT&U!`$qQ#f]R'q#kT'g#f'hR0i,VT(R#r(ZR(X#tQ-a({Q1d-eQ2W.^Q4W1cQ4t2[Q5|4YQ6[4sQ6}6QQ7W6^R7o7XlgOSi{!k$V%^%a%b%d*_*d.x.{Q%WwR*S%TV$tpq*]R.W)sR*R%RQ$lnR)e$mR)[$gT%[x%_T%]x%_T.z*d.{",
  nodeNames: "⚠ ArithOp ArithOp extends LineComment BlockComment Script ExportDeclaration export Star as VariableName from String ; default FunctionDeclaration async function VariableDefinition TypeParamList TypeDefinition ThisType this LiteralType ArithOp Number BooleanLiteral VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString null super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyNameDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression await yield delete LogicOp BitOp ParenthesizedExpression ClassExpression class extends ClassBody MethodDeclaration Privacy static abstract PropertyDeclaration readonly Optional TypeAnnotation Equals FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp in instanceof CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplatExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXStartTag JSXSelfClosingTag JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var const TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody MethodDeclaration AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try catch finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement",
  maxTerm: 321,
  nodeProps: [
    [NodeProp.group, -26,7,14,16,53,174,178,182,183,185,188,191,202,204,210,212,214,216,219,225,229,231,233,235,237,239,240,"Statement",-30,11,13,23,26,27,37,38,39,40,42,47,55,63,69,70,83,84,93,94,109,112,114,115,116,117,119,120,138,139,141,"Expression",-21,22,24,28,30,142,144,146,147,149,150,151,153,154,155,157,158,159,168,170,172,173,"Type",-2,74,78,"ClassItem"],
    [NodeProp.closedBy, 36,"]",46,"}",61,")",122,"JSXSelfCloseEndTag JSXEndTag",136,"JSXEndTag"],
    [NodeProp.openedBy, 41,"[",45,"{",60,"(",121,"JSXStartTag",131,"JSXStartTag JSXStartCloseTag"]
  ],
  skippedNodes: [0,4,5],
  repeatNodeCount: 27,
  tokenData: "!Ck~R!ZOX$tX^%S^p$tpq%Sqr&rrs'zst$ttu/wuv2Xvw2|wx3zxy:byz:rz{;S{|<S|}<g}!O<S!O!P<w!P!QAT!Q!R!0Z!R![!2j![!]!8Y!]!^!8l!^!_!8|!_!`!9y!`!a!;U!a!b!<{!b!c$t!c!}/w!}#O!>^#O#P$t#P#Q!>n#Q#R!?O#R#S/w#S#T!?c#T#o/w#o#p!?s#p#q!?x#q#r!@`#r#s!@r#s#y$t#y#z%S#z$f$t$f$g%S$g#BY/w#BY#BZ!AS#BZ$IS/w$IS$I_!AS$I_$I|/w$I|$JO!AS$JO$JT/w$JT$JU!AS$JU$KV/w$KV$KW!AS$KW&FU/w&FU&FV!AS&FV~/wW$yR#zWO!^$t!_#o$t#p~$t,T%Zg#zW&}+{OX$tX^%S^p$tpq%Sq!^$t!_#o$t#p#y$t#y#z%S#z$f$t$f$g%S$g#BY$t#BY#BZ%S#BZ$IS$t$IS$I_%S$I_$I|$t$I|$JO%S$JO$JT$t$JT$JU%S$JU$KV$t$KV$KW%S$KW&FU$t&FU&FV%S&FV~$t$T&yS#zW!e#{O!^$t!_!`'V!`#o$t#p~$t$O'^S#Z#v#zWO!^$t!_!`'j!`#o$t#p~$t$O'qR#Z#v#zWO!^$t!_#o$t#p~$t'u(RZ#zW]!ROY'zYZ(tZr'zrs*Rs!^'z!^!_*e!_#O'z#O#P,q#P#o'z#o#p*e#p~'z&r(yV#zWOr(trs)`s!^(t!^!_)p!_#o(t#o#p)p#p~(t&r)gR#u&j#zWO!^$t!_#o$t#p~$t&j)sROr)prs)|s~)p&j*RO#u&j'u*[R#u&j#zW]!RO!^$t!_#o$t#p~$t'm*jV]!ROY*eYZ)pZr*ers+Ps#O*e#O#P+W#P~*e'm+WO#u&j]!R'm+ZROr*ers+ds~*e'm+kU#u&j]!ROY+}Zr+}rs,fs#O+}#O#P,k#P~+}!R,SU]!ROY+}Zr+}rs,fs#O+}#O#P,k#P~+}!R,kO]!R!R,nPO~+}'u,vV#zWOr'zrs-]s!^'z!^!_*e!_#o'z#o#p*e#p~'z'u-fZ#u&j#zW]!ROY.XYZ$tZr.Xrs/Rs!^.X!^!_+}!_#O.X#O#P/c#P#o.X#o#p+}#p~.X!Z.`Z#zW]!ROY.XYZ$tZr.Xrs/Rs!^.X!^!_+}!_#O.X#O#P/c#P#o.X#o#p+}#p~.X!Z/YR#zW]!RO!^$t!_#o$t#p~$t!Z/hT#zWO!^.X!^!_+}!_#o.X#o#p+}#p~.X&i0S_#zW#pS'Yp'P%kOt$ttu/wu}$t}!O1R!O!Q$t!Q![/w![!^$t!_!c$t!c!}/w!}#R$t#R#S/w#S#T$t#T#o/w#p$g$t$g~/w[1Y_#zW#pSOt$ttu1Ru}$t}!O1R!O!Q$t!Q![1R![!^$t!_!c$t!c!}1R!}#R$t#R#S1R#S#T$t#T#o1R#p$g$t$g~1R$O2`S#T#v#zWO!^$t!_!`2l!`#o$t#p~$t$O2sR#zW#e#vO!^$t!_#o$t#p~$t%r3TU'm%j#zWOv$tvw3gw!^$t!_!`2l!`#o$t#p~$t$O3nS#zW#_#vO!^$t!_!`2l!`#o$t#p~$t'u4RZ#zW]!ROY3zYZ4tZw3zwx*Rx!^3z!^!_5l!_#O3z#O#P7l#P#o3z#o#p5l#p~3z&r4yV#zWOw4twx)`x!^4t!^!_5`!_#o4t#o#p5`#p~4t&j5cROw5`wx)|x~5`'m5qV]!ROY5lYZ5`Zw5lwx+Px#O5l#O#P6W#P~5l'm6ZROw5lwx6dx~5l'm6kU#u&j]!ROY6}Zw6}wx,fx#O6}#O#P7f#P~6}!R7SU]!ROY6}Zw6}wx,fx#O6}#O#P7f#P~6}!R7iPO~6}'u7qV#zWOw3zwx8Wx!^3z!^!_5l!_#o3z#o#p5l#p~3z'u8aZ#u&j#zW]!ROY9SYZ$tZw9Swx/Rx!^9S!^!_6}!_#O9S#O#P9|#P#o9S#o#p6}#p~9S!Z9ZZ#zW]!ROY9SYZ$tZw9Swx/Rx!^9S!^!_6}!_#O9S#O#P9|#P#o9S#o#p6}#p~9S!Z:RT#zWO!^9S!^!_6}!_#o9S#o#p6}#p~9S%V:iR!_$}#zWO!^$t!_#o$t#p~$tZ:yR!^R#zWO!^$t!_#o$t#p~$t%R;]U'Q!R#U#v#zWOz$tz{;o{!^$t!_!`2l!`#o$t#p~$t$O;vS#R#v#zWO!^$t!_!`2l!`#o$t#p~$t$u<ZSi$m#zWO!^$t!_!`2l!`#o$t#p~$t&i<nR|&a#zWO!^$t!_#o$t#p~$t&i=OVq%n#zWO!O$t!O!P=e!P!Q$t!Q![>Z![!^$t!_#o$t#p~$ty=jT#zWO!O$t!O!P=y!P!^$t!_#o$t#p~$ty>QR{q#zWO!^$t!_#o$t#p~$ty>bZ#zWjqO!Q$t!Q![>Z![!^$t!_!g$t!g!h?T!h#R$t#R#S>Z#S#X$t#X#Y?T#Y#o$t#p~$ty?YZ#zWO{$t{|?{|}$t}!O?{!O!Q$t!Q![@g![!^$t!_#R$t#R#S@g#S#o$t#p~$ty@QV#zWO!Q$t!Q![@g![!^$t!_#R$t#R#S@g#S#o$t#p~$ty@nV#zWjqO!Q$t!Q![@g![!^$t!_#R$t#R#S@g#S#o$t#p~$t,TA[`#zW#S#vOYB^YZ$tZzB^z{HT{!PB^!P!Q!*|!Q!^B^!^!_Da!_!`!+u!`!a!,t!a!}B^!}#O!-s#O#P!/o#P#oB^#o#pDa#p~B^XBe[#zWxPOYB^YZ$tZ!PB^!P!QCZ!Q!^B^!^!_Da!_!}B^!}#OFY#O#PGi#P#oB^#o#pDa#p~B^XCb_#zWxPO!^$t!_#Z$t#Z#[CZ#[#]$t#]#^CZ#^#a$t#a#bCZ#b#g$t#g#hCZ#h#i$t#i#jCZ#j#m$t#m#nCZ#n#o$t#p~$tPDfVxPOYDaZ!PDa!P!QD{!Q!}Da!}#OEd#O#PFP#P~DaPEQUxP#Z#[D{#]#^D{#a#bD{#g#hD{#i#jD{#m#nD{PEgTOYEdZ#OEd#O#PEv#P#QDa#Q~EdPEyQOYEdZ~EdPFSQOYDaZ~DaXF_Y#zWOYFYYZ$tZ!^FY!^!_Ed!_#OFY#O#PF}#P#QB^#Q#oFY#o#pEd#p~FYXGSV#zWOYFYYZ$tZ!^FY!^!_Ed!_#oFY#o#pEd#p~FYXGnV#zWOYB^YZ$tZ!^B^!^!_Da!_#oB^#o#pDa#p~B^,TH[^#zWxPOYHTYZIWZzHTz{Ki{!PHT!P!Q!)j!Q!^HT!^!_Mt!_!}HT!}#O!%e#O#P!(x#P#oHT#o#pMt#p~HT,TI]V#zWOzIWz{Ir{!^IW!^!_Jt!_#oIW#o#pJt#p~IW,TIwX#zWOzIWz{Ir{!PIW!P!QJd!Q!^IW!^!_Jt!_#oIW#o#pJt#p~IW,TJkR#zWT+{O!^$t!_#o$t#p~$t+{JwROzJtz{KQ{~Jt+{KTTOzJtz{KQ{!PJt!P!QKd!Q~Jt+{KiOT+{,TKp^#zWxPOYHTYZIWZzHTz{Ki{!PHT!P!QLl!Q!^HT!^!_Mt!_!}HT!}#O!%e#O#P!(x#P#oHT#o#pMt#p~HT,TLu_#zWT+{xPO!^$t!_#Z$t#Z#[CZ#[#]$t#]#^CZ#^#a$t#a#bCZ#b#g$t#g#hCZ#h#i$t#i#jCZ#j#m$t#m#nCZ#n#o$t#p~$t+{MyYxPOYMtYZJtZzMtz{Ni{!PMt!P!Q!$a!Q!}Mt!}#O! w#O#P!#}#P~Mt+{NnYxPOYMtYZJtZzMtz{Ni{!PMt!P!Q! ^!Q!}Mt!}#O! w#O#P!#}#P~Mt+{! eUT+{xP#Z#[D{#]#^D{#a#bD{#g#hD{#i#jD{#m#nD{+{! zWOY! wYZJtZz! wz{!!d{#O! w#O#P!#k#P#QMt#Q~! w+{!!gYOY! wYZJtZz! wz{!!d{!P! w!P!Q!#V!Q#O! w#O#P!#k#P#QMt#Q~! w+{!#[TT+{OYEdZ#OEd#O#PEv#P#QDa#Q~Ed+{!#nTOY! wYZJtZz! wz{!!d{~! w+{!$QTOYMtYZJtZzMtz{Ni{~Mt+{!$f_xPOzJtz{KQ{#ZJt#Z#[!$a#[#]Jt#]#^!$a#^#aJt#a#b!$a#b#gJt#g#h!$a#h#iJt#i#j!$a#j#mJt#m#n!$a#n~Jt,T!%j[#zWOY!%eYZIWZz!%ez{!&`{!^!%e!^!_! w!_#O!%e#O#P!(W#P#QHT#Q#o!%e#o#p! w#p~!%e,T!&e^#zWOY!%eYZIWZz!%ez{!&`{!P!%e!P!Q!'a!Q!^!%e!^!_! w!_#O!%e#O#P!(W#P#QHT#Q#o!%e#o#p! w#p~!%e,T!'hY#zWT+{OYFYYZ$tZ!^FY!^!_Ed!_#OFY#O#PF}#P#QB^#Q#oFY#o#pEd#p~FY,T!(]X#zWOY!%eYZIWZz!%ez{!&`{!^!%e!^!_! w!_#o!%e#o#p! w#p~!%e,T!(}X#zWOYHTYZIWZzHTz{Ki{!^HT!^!_Mt!_#oHT#o#pMt#p~HT,T!)qc#zWxPOzIWz{Ir{!^IW!^!_Jt!_#ZIW#Z#[!)j#[#]IW#]#^!)j#^#aIW#a#b!)j#b#gIW#g#h!)j#h#iIW#i#j!)j#j#mIW#m#n!)j#n#oIW#o#pJt#p~IW,T!+TV#zWS+{OY!*|YZ$tZ!^!*|!^!_!+j!_#o!*|#o#p!+j#p~!*|+{!+oQS+{OY!+jZ~!+j$P!,O[#zW#e#vxPOYB^YZ$tZ!PB^!P!QCZ!Q!^B^!^!_Da!_!}B^!}#OFY#O#PGi#P#oB^#o#pDa#p~B^]!,}[#mS#zWxPOYB^YZ$tZ!PB^!P!QCZ!Q!^B^!^!_Da!_!}B^!}#OFY#O#PGi#P#oB^#o#pDa#p~B^X!-xY#zWOY!-sYZ$tZ!^!-s!^!_!.h!_#O!-s#O#P!/T#P#QB^#Q#o!-s#o#p!.h#p~!-sP!.kTOY!.hZ#O!.h#O#P!.z#P#QDa#Q~!.hP!.}QOY!.hZ~!.hX!/YV#zWOY!-sYZ$tZ!^!-s!^!_!.h!_#o!-s#o#p!.h#p~!-sX!/tV#zWOYB^YZ$tZ!^B^!^!_Da!_#oB^#o#pDa#p~B^y!0bd#zWjqO!O$t!O!P!1p!P!Q$t!Q![!2j![!^$t!_!g$t!g!h?T!h#R$t#R#S!2j#S#U$t#U#V!4Q#V#X$t#X#Y?T#Y#b$t#b#c!3p#c#d!5`#d#l$t#l#m!6h#m#o$t#p~$ty!1wZ#zWjqO!Q$t!Q![!1p![!^$t!_!g$t!g!h?T!h#R$t#R#S!1p#S#X$t#X#Y?T#Y#o$t#p~$ty!2q_#zWjqO!O$t!O!P!1p!P!Q$t!Q![!2j![!^$t!_!g$t!g!h?T!h#R$t#R#S!2j#S#X$t#X#Y?T#Y#b$t#b#c!3p#c#o$t#p~$ty!3wR#zWjqO!^$t!_#o$t#p~$ty!4VW#zWO!Q$t!Q!R!4o!R!S!4o!S!^$t!_#R$t#R#S!4o#S#o$t#p~$ty!4vW#zWjqO!Q$t!Q!R!4o!R!S!4o!S!^$t!_#R$t#R#S!4o#S#o$t#p~$ty!5eV#zWO!Q$t!Q!Y!5z!Y!^$t!_#R$t#R#S!5z#S#o$t#p~$ty!6RV#zWjqO!Q$t!Q!Y!5z!Y!^$t!_#R$t#R#S!5z#S#o$t#p~$ty!6mZ#zWO!Q$t!Q![!7`![!^$t!_!c$t!c!i!7`!i#R$t#R#S!7`#S#T$t#T#Z!7`#Z#o$t#p~$ty!7gZ#zWjqO!Q$t!Q![!7`![!^$t!_!c$t!c!i!7`!i#R$t#R#S!7`#S#T$t#T#Z!7`#Z#o$t#p~$t%w!8cR!WV#zW#c%hO!^$t!_#o$t#p~$t!P!8sR^w#zWO!^$t!_#o$t#p~$t+c!9XR'Ud![%Y#n&s'qP!P!Q!9b!^!_!9g!_!`!9tW!9gO#|W#v!9lP#V#v!_!`!9o#v!9tO#e#v#v!9yO#W#v%w!:QT!t%o#zWO!^$t!_!`!:a!`!a!:t!a#o$t#p~$t$O!:hS#Z#v#zWO!^$t!_!`'j!`#o$t#p~$t$P!:{R#O#w#zWO!^$t!_#o$t#p~$t%w!;aT'T!s#W#v#wS#zWO!^$t!_!`!;p!`!a!<Q!a#o$t#p~$t$O!;wR#W#v#zWO!^$t!_#o$t#p~$t$O!<XT#V#v#zWO!^$t!_!`2l!`!a!<h!a#o$t#p~$t$O!<oS#V#v#zWO!^$t!_!`2l!`#o$t#p~$t%w!=SV'e%o#zWO!O$t!O!P!=i!P!^$t!_!a$t!a!b!=y!b#o$t#p~$t$`!=pRr$W#zWO!^$t!_#o$t#p~$t$O!>QS#zW#`#vO!^$t!_!`2l!`#o$t#p~$t&e!>eRt&]#zWO!^$t!_#o$t#p~$tZ!>uRyR#zWO!^$t!_#o$t#p~$t$O!?VS#]#v#zWO!^$t!_!`2l!`#o$t#p~$t$P!?jR#zW']#wO!^$t!_#o$t#p~$t~!?xO!O~%r!@PT'l%j#zWO!^$t!_!`2l!`#o$t#p#q!=y#q~$t$u!@iR}$k#zW'_QO!^$t!_#o$t#p~$tX!@yR!fP#zWO!^$t!_#o$t#p~$t,T!Aar#zW#pS'Yp'P%k&}+{OX$tX^%S^p$tpq%Sqt$ttu/wu}$t}!O1R!O!Q$t!Q![/w![!^$t!_!c$t!c!}/w!}#R$t#R#S/w#S#T$t#T#o/w#p#y$t#y#z%S#z$f$t$f$g%S$g#BY/w#BY#BZ!AS#BZ$IS/w$IS$I_!AS$I_$I|/w$I|$JO!AS$JO$JT/w$JT$JU!AS$JU$KV/w$KV$KW!AS$KW&FU/w&FU&FV!AS&FV~/w",
  tokenizers: [noSemicolon, incdecToken, template, 0, 1, 2, 3, 4, 5, 6, 7, 8, insertSemicolon],
  topRules: {"Script":[0,6]},
  dialects: {jsx: 12773, ts: 12775},
  dynamicPrecedences: {"139":1,"166":1},
  specialized: [{term: 277, get: (value, stack) => (tsExtends(value, stack) << 1) | 1},{term: 277, get: value => spec_identifier[value] || -1},{term: 286, get: value => spec_word[value] || -1},{term: 58, get: value => spec_LessThan[value] || -1}],
  tokenPrec: 12795
});

/// A collection of JavaScript-related
/// [snippets](#autocomplete.snippet).
const snippets = [
    snippetCompletion("function ${name}(${params}) {\n\t${}\n}", {
        label: "function",
        detail: "definition",
        type: "keyword"
    }),
    snippetCompletion("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n\t${}\n}", {
        label: "for",
        detail: "loop",
        type: "keyword"
    }),
    snippetCompletion("for (let ${name} of ${collection}) {\n\t${}\n}", {
        label: "for",
        detail: "of loop",
        type: "keyword"
    }),
    snippetCompletion("try {\n\t${}\n} catch (${error}) {\n\t${}\n}", {
        label: "try",
        detail: "block",
        type: "keyword"
    }),
    snippetCompletion("class ${name} {\n\tconstructor(${params}) {\n\t\t${}\n\t}\n}", {
        label: "class",
        detail: "definition",
        type: "keyword"
    }),
    snippetCompletion("import {${names}} from \"${module}\"\n${}", {
        label: "import",
        detail: "named",
        type: "keyword"
    }),
    snippetCompletion("import ${name} from \"${module}\"\n${}", {
        label: "import",
        detail: "default",
        type: "keyword"
    })
];

/// A language provider based on the [Lezer JavaScript
/// parser](https://github.com/lezer-parser/javascript), extended with
/// highlighting and indentation information.
const javascriptLanguage = LezerLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                IfStatement: continuedIndent({ except: /^\s*({|else\b)/ }),
                TryStatement: continuedIndent({ except: /^\s*({|catch|finally)\b/ }),
                LabeledStatement: flatIndent,
                SwitchBody: context => {
                    let after = context.textAfter, closed = /^\s*\}/.test(after), isCase = /^\s*(case|default)\b/.test(after);
                    return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit;
                },
                Block: delimitedIndent({ closing: "}" }),
                ArrowFunction: cx => cx.baseIndent + cx.unit,
                "TemplateString BlockComment": () => -1,
                "Statement Property": continuedIndent({ except: /^{/ }),
                JSXElement(context) {
                    let closed = /^\s*<\//.test(context.textAfter);
                    return context.lineIndent(context.state.doc.lineAt(context.node.from)) + (closed ? 0 : context.unit);
                },
                JSXEscape(context) {
                    let closed = /\s*\}/.test(context.textAfter);
                    return context.lineIndent(context.state.doc.lineAt(context.node.from)) + (closed ? 0 : context.unit);
                },
                "JSXOpenTag JSXSelfClosingTag"(context) {
                    return context.column(context.node.from) + context.unit;
                }
            }),
            foldNodeProp.add({
                "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression": foldInside,
                BlockComment(tree) { return { from: tree.from + 2, to: tree.to - 2 }; }
            }),
            styleTags({
                "get set async static": tags.modifier,
                "for while do if else switch try catch finally return throw break continue default case": tags.controlKeyword,
                "in of await yield void typeof delete instanceof": tags.operatorKeyword,
                "export import let var const function class extends": tags.definitionKeyword,
                "with debugger from as new": tags.keyword,
                TemplateString: tags.special(tags.string),
                Super: tags.atom,
                BooleanLiteral: tags.bool,
                this: tags.self,
                null: tags.null,
                Star: tags.modifier,
                VariableName: tags.variableName,
                "CallExpression/VariableName": tags.function(tags.variableName),
                VariableDefinition: tags.definition(tags.variableName),
                Label: tags.labelName,
                PropertyName: tags.propertyName,
                "CallExpression/MemberExpression/PropertyName": tags.function(tags.propertyName),
                "FunctionDeclaration/VariableDefinition": tags.function(tags.definition(tags.variableName)),
                "ClassDeclaration/VariableDefinition": tags.definition(tags.className),
                PropertyNameDefinition: tags.definition(tags.propertyName),
                UpdateOp: tags.updateOperator,
                LineComment: tags.lineComment,
                BlockComment: tags.blockComment,
                Number: tags.number,
                String: tags.string,
                ArithOp: tags.arithmeticOperator,
                LogicOp: tags.logicOperator,
                BitOp: tags.bitwiseOperator,
                CompareOp: tags.compareOperator,
                RegExp: tags.regexp,
                Equals: tags.definitionOperator,
                "Arrow : Spread": tags.punctuation,
                "( )": tags.paren,
                "[ ]": tags.squareBracket,
                "{ }": tags.brace,
                ".": tags.derefOperator,
                ", ;": tags.separator,
                TypeName: tags.typeName,
                TypeDefinition: tags.definition(tags.typeName),
                "type enum interface implements namespace module declare": tags.definitionKeyword,
                "abstract global privacy readonly": tags.modifier,
                "is keyof unique infer": tags.operatorKeyword,
                JSXAttributeValue: tags.string,
                JSXText: tags.content,
                "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": tags.angleBracket,
                "JSXIdentifier JSXNameSpacedName": tags.tagName,
                "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": tags.propertyName
            })
        ]
    }),
    languageData: {
        closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
        commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
        indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
        wordChars: "$"
    }
});
/// A language provider for TypeScript.
const typescriptLanguage = javascriptLanguage.configure({ dialect: "ts" });
/// Language provider for JSX.
const jsxLanguage = javascriptLanguage.configure({ dialect: "jsx" });
/// Language provider for JSX + TypeScript.
const tsxLanguage = javascriptLanguage.configure({ dialect: "jsx ts" });
/// JavaScript support. Includes [snippet](#lang-javascript.snippets)
/// completion.
function javascript(config = {}) {
    let lang = config.jsx ? (config.typescript ? tsxLanguage : jsxLanguage)
        : config.typescript ? typescriptLanguage : javascriptLanguage;
    return new LanguageSupport(lang, javascriptLanguage.data.of({
        autocomplete: ifNotIn(["LineComment", "BlockComment", "String"], completeFromList(snippets))
    }));
}

export { javascript };
