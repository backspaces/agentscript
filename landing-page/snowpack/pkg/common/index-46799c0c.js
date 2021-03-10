import { V as ViewPlugin, D as Direction, E as EditorView, F as Facet, a as StateEffect, S as StateField, M as MapMode, t as Text, g as EditorSelection, c as combineConfig, T as Transaction, u as logException, d as Decoration, W as WidgetType, i as Prec, s as keymap, f as codePointAt, e as codePointSize, h as fromCodePoint, v as StyleModule, k as RangeSetBuilder } from './index-0264ae51.js';
import { s as syntaxTree, c as indentUnit, N as NodeProp, d as NodeType } from './index-a9e9ab30.js';

const ios = typeof navigator != "undefined" &&
    !/Edge\/(\d+)/.exec(navigator.userAgent) && /Apple Computer/.test(navigator.vendor) &&
    (/Mobile\/\w+/.test(navigator.userAgent) || navigator.maxTouchPoints > 2);
const Outside = "-10000px";
const tooltipPlugin = ViewPlugin.fromClass(class {
    constructor(view) {
        this.view = view;
        this.inView = true;
        this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this };
        this.tooltips = view.state.facet(showTooltip);
        this.tooltipViews = this.tooltips.map(tp => this.createTooltip(tp));
    }
    update(update) {
        let tooltips = update.state.facet(showTooltip);
        if (tooltips == this.tooltips) {
            for (let t of this.tooltipViews)
                if (t.update)
                    t.update(update);
        }
        else {
            let views = [];
            for (let i = 0; i < tooltips.length; i++) {
                let tip = tooltips[i], known = -1;
                for (let i = 0; i < this.tooltips.length; i++)
                    if (this.tooltips[i].create == tip.create)
                        known = i;
                if (known < 0) {
                    views[i] = this.createTooltip(tip);
                }
                else {
                    let tooltipView = views[i] = this.tooltipViews[known];
                    if (tooltipView.update)
                        tooltipView.update(update);
                }
            }
            for (let t of this.tooltipViews)
                if (views.indexOf(t) < 0)
                    t.dom.remove();
            this.tooltips = tooltips;
            this.tooltipViews = views;
            this.maybeMeasure();
        }
    }
    createTooltip(tooltip) {
        let tooltipView = tooltip.create(this.view);
        tooltipView.dom.classList.add("cm-tooltip");
        if (tooltip.class)
            tooltipView.dom.classList.add(tooltip.class);
        this.view.dom.appendChild(tooltipView.dom);
        if (tooltipView.mount)
            tooltipView.mount(this.view);
        return tooltipView;
    }
    destroy() {
        for (let { dom } of this.tooltipViews)
            dom.remove();
    }
    readMeasure() {
        return {
            editor: this.view.dom.getBoundingClientRect(),
            pos: this.tooltips.map(t => this.view.coordsAtPos(t.pos)),
            size: this.tooltipViews.map(({ dom }) => dom.getBoundingClientRect()),
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight
        };
    }
    writeMeasure(measured) {
        let { editor } = measured;
        for (let i = 0; i < this.tooltipViews.length; i++) {
            let tooltip = this.tooltips[i], tView = this.tooltipViews[i], { dom } = tView;
            let pos = measured.pos[i], size = measured.size[i];
            // Hide tooltips that are outside of the editor.
            if (!pos || pos.bottom <= editor.top || pos.top >= editor.bottom || pos.right <= editor.left || pos.left >= editor.right) {
                dom.style.top = Outside;
                continue;
            }
            let width = size.right - size.left, height = size.bottom - size.top;
            let left = this.view.textDirection == Direction.LTR ? Math.min(pos.left, measured.innerWidth - width)
                : Math.max(0, pos.left - width);
            let above = !!tooltip.above;
            if (!tooltip.strictSide &&
                (above ? pos.top - (size.bottom - size.top) < 0 : pos.bottom + (size.bottom - size.top) > measured.innerHeight))
                above = !above;
            if (ios) {
                dom.style.top = ((above ? pos.top - height : pos.bottom) - editor.top) + "px";
                dom.style.left = (left - editor.left) + "px";
                dom.style.position = "absolute";
            }
            else {
                dom.style.top = (above ? pos.top - height : pos.bottom) + "px";
                dom.style.left = left + "px";
            }
            dom.classList.toggle("cm-tooltip-above", above);
            dom.classList.toggle("cm-tooltip-below", !above);
            if (tView.positioned)
                tView.positioned();
        }
    }
    maybeMeasure() {
        if (this.tooltips.length) {
            if (this.view.inView || this.inView)
                this.view.requestMeasure(this.measureReq);
            this.inView = this.view.inView;
        }
    }
}, {
    eventHandlers: {
        scroll() { this.maybeMeasure(); }
    }
});
const baseTheme$1 = EditorView.baseTheme({
    ".cm-tooltip": {
        position: "fixed",
        border: "1px solid #ddd",
        backgroundColor: "#f5f5f5",
        zIndex: 100
    }
});
/// Supporting extension for displaying tooltips. Allows
/// [`showTooltip`](#tooltip.showTooltip) to be used to create
/// tooltips.
function tooltips() {
    return [tooltipPlugin, baseTheme$1];
}
/// Behavior by which an extension can provide a tooltip to be shown.
const showTooltip = Facet.define();
const HoverTime = 750, HoverMaxDist = 6;
class HoverPlugin {
    constructor(view, source, field, setHover) {
        this.view = view;
        this.source = source;
        this.field = field;
        this.setHover = setHover;
        this.lastMouseMove = null;
        this.hoverTimeout = -1;
        this.restartTimeout = -1;
        this.pending = null;
        this.checkHover = this.checkHover.bind(this);
        view.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this));
        view.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
    }
    update() {
        if (this.pending) {
            this.pending = null;
            clearTimeout(this.restartTimeout);
            this.restartTimeout = setTimeout(() => this.startHover(), 20);
        }
    }
    get active() {
        return this.view.state.field(this.field);
    }
    checkHover() {
        this.hoverTimeout = -1;
        if (this.active)
            return;
        let now = Date.now(), lastMove = this.lastMouseMove;
        if (now - lastMove.timeStamp < HoverTime)
            this.hoverTimeout = setTimeout(this.checkHover, HoverTime - (now - lastMove.timeStamp));
        else
            this.startHover();
    }
    startHover() {
        var _a;
        clearTimeout(this.restartTimeout);
        let lastMove = this.lastMouseMove;
        let coords = { x: lastMove.clientX, y: lastMove.clientY };
        let pos = this.view.contentDOM.contains(lastMove.target)
            ? this.view.posAtCoords(coords) : null;
        if (pos == null)
            return;
        let posCoords = this.view.coordsAtPos(pos);
        if (posCoords == null || coords.y < posCoords.top || coords.y > posCoords.bottom ||
            coords.x < posCoords.left - this.view.defaultCharacterWidth ||
            coords.x > posCoords.right + this.view.defaultCharacterWidth)
            return;
        let bidi = this.view.bidiSpans(this.view.state.doc.lineAt(pos)).find(s => s.from <= pos && s.to >= pos);
        let rtl = bidi && bidi.dir == Direction.RTL ? -1 : 1;
        let open = this.source(this.view, pos, (coords.x < posCoords.left ? -rtl : rtl));
        if ((_a = open) === null || _a === void 0 ? void 0 : _a.then) {
            let pending = this.pending = { pos };
            open.then(result => {
                if (this.pending == pending) {
                    this.pending = null;
                    if (result)
                        this.view.dispatch({ effects: this.setHover.of(result) });
                }
            });
        }
        else if (open) {
            this.view.dispatch({ effects: this.setHover.of(open) });
        }
    }
    mousemove(event) {
        var _a;
        this.lastMouseMove = event;
        if (this.hoverTimeout < 0)
            this.hoverTimeout = setTimeout(this.checkHover, HoverTime);
        let tooltip = this.active;
        if (tooltip && !isInTooltip(event.target) || this.pending) {
            let { pos } = tooltip || this.pending, end = (_a = tooltip === null || tooltip === void 0 ? void 0 : tooltip.end) !== null && _a !== void 0 ? _a : pos;
            if ((pos == end ? this.view.posAtCoords({ x: event.clientX, y: event.clientY }) != pos
                : !isOverRange(this.view, pos, end, event.clientX, event.clientY, HoverMaxDist))) {
                this.view.dispatch({ effects: this.setHover.of(null) });
                this.pending = null;
            }
        }
    }
    mouseleave() {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = -1;
        if (this.active)
            this.view.dispatch({ effects: this.setHover.of(null) });
    }
    destroy() {
        clearTimeout(this.hoverTimeout);
        this.view.dom.removeEventListener("mouseleave", this.mouseleave);
        this.view.dom.removeEventListener("mousemove", this.mousemove);
    }
}
function isInTooltip(elt) {
    for (let cur = elt; cur; cur = cur.parentNode)
        if (cur.nodeType == 1 && cur.classList.contains("cm-tooltip"))
            return true;
    return false;
}
function isOverRange(view, from, to, x, y, margin) {
    let range = document.createRange();
    let fromDOM = view.domAtPos(from), toDOM = view.domAtPos(to);
    range.setEnd(toDOM.node, toDOM.offset);
    range.setStart(fromDOM.node, fromDOM.offset);
    let rects = range.getClientRects();
    range.detach();
    for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        let dist = Math.max(rect.top - y, y - rect.bottom, rect.left - x, x - rect.right);
        if (dist <= margin)
            return true;
    }
    return false;
}
/// Enable a hover tooltip, which shows up when the pointer hovers
/// over ranges of text. The callback is called when the mouse hovers
/// over the document text. It should, if there is a tooltip
/// associated with position `pos` return the tooltip description
/// (either directly or in a promise). The `side` argument indicates
/// on which side of the position the pointer is—it will be -1 if the
/// pointer is before the position, 1 if after the position.
function hoverTooltip(source, options = {}) {
    const setHover = StateEffect.define();
    const hoverState = StateField.define({
        create() { return null; },
        update(value, tr) {
            if (value && (options.hideOnChange && (tr.docChanged || tr.selection)))
                return null;
            for (let effect of tr.effects)
                if (effect.is(setHover))
                    return effect.value;
            if (value && tr.docChanged) {
                let newPos = tr.changes.mapPos(value.pos, -1, MapMode.TrackDel);
                if (newPos == null)
                    return null;
                let copy = Object.assign(Object.create(null), value);
                copy.pos = newPos;
                if (value.end != null)
                    copy.end = tr.changes.mapPos(value.end);
                return copy;
            }
            return value;
        },
        provide: f => showTooltip.computeN([f], s => { let val = s.field(f); return val ? [val] : []; })
    });
    return [
        hoverState,
        ViewPlugin.define(view => new HoverPlugin(view, source, hoverState, setHover)),
        tooltips()
    ];
}

/// An instance of this is passed to completion source functions.
class CompletionContext {
    /// Create a new completion context. (Mostly useful for testing
    /// completion sources—in the editor, the extension will create
    /// these for you.)
    constructor(
    /// The editor state that the completion happens in.
    state, 
    /// The position at which the completion is happening.
    pos, 
    /// Indicates whether completion was activated explicitly, or
    /// implicitly by typing. The usual way to respond to this is to
    /// only return completions when either there is part of a
    /// completable entity before the cursor, or `explicit` is true.
    explicit) {
        this.state = state;
        this.pos = pos;
        this.explicit = explicit;
        /// @internal
        this.abortListeners = [];
    }
    /// Get the extent, content, and (if there is a token) type of the
    /// token before `this.pos`.
    tokenBefore(types) {
        let token = syntaxTree(this.state).resolve(this.pos, -1);
        while (token && types.indexOf(token.name) < 0)
            token = token.parent;
        return token ? { from: token.from, to: this.pos,
            text: this.state.sliceDoc(token.from, this.pos),
            type: token.type } : null;
    }
    /// Get the match of the given expression directly before the
    /// cursor.
    matchBefore(expr) {
        let line = this.state.doc.lineAt(this.pos);
        let start = Math.max(line.from, this.pos - 250);
        let str = line.text.slice(start - line.from, this.pos - line.from);
        let found = str.search(ensureAnchor(expr, false));
        return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
    }
    /// Yields true when the query has been aborted. Can be useful in
    /// asynchronous queries to avoid doing work that will be ignored.
    get aborted() { return this.abortListeners == null; }
    /// Allows you to register abort handlers, which will be called when
    /// the query is
    /// [aborted](#autocomplete.CompletionContext.aborted).
    addEventListener(type, listener) {
        if (type == "abort" && this.abortListeners)
            this.abortListeners.push(listener);
    }
}
function toSet(chars) {
    let flat = Object.keys(chars).join("");
    let words = /\w/.test(flat);
    if (words)
        flat = flat.replace(/\w/g, "");
    return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}
function prefixMatch(options) {
    let first = Object.create(null), rest = Object.create(null);
    for (let { label } of options) {
        first[label[0]] = true;
        for (let i = 1; i < label.length; i++)
            rest[label[i]] = true;
    }
    let source = toSet(first) + toSet(rest) + "*$";
    return [new RegExp("^" + source), new RegExp(source)];
}
/// Given a a fixed array of options, return an autocompleter that
/// completes them.
function completeFromList(list) {
    let options = list.map(o => typeof o == "string" ? { label: o } : o);
    let [span, match] = options.every(o => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
    return (context) => {
        let token = context.matchBefore(match);
        return token || context.explicit ? { from: token ? token.from : context.pos, options, span } : null;
    };
}
/// Wrap the given completion source so that it will not fire when the
/// cursor is in a syntax node with one of the given names.
function ifNotIn(nodes, source) {
    return (context) => {
        for (let pos = syntaxTree(context.state).resolve(context.pos, -1); pos; pos = pos.parent)
            if (nodes.indexOf(pos.name) > -1)
                return null;
        return source(context);
    };
}
class Option {
    constructor(completion, source, match) {
        this.completion = completion;
        this.source = source;
        this.match = match;
    }
}
function cur(state) { return state.selection.main.head; }
// Make sure the given regexp has a $ at its end and, if `start` is
// true, a ^ at its start.
function ensureAnchor(expr, start) {
    var _a;
    let { source } = expr;
    let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
    if (!addStart && !addEnd)
        return expr;
    return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a = expr.flags) !== null && _a !== void 0 ? _a : (expr.ignoreCase ? "i" : ""));
}
function applyCompletion(view, option) {
    let apply = option.completion.apply || option.completion.label;
    let result = option.source;
    if (typeof apply == "string") {
        view.dispatch({
            changes: { from: result.from, to: result.to, insert: apply },
            selection: { anchor: result.from + apply.length }
        });
    }
    else {
        apply(view, option.completion, result.from, result.to);
    }
}
const SourceCache = new WeakMap();
function asSource(source) {
    if (!Array.isArray(source))
        return source;
    let known = SourceCache.get(source);
    if (!known)
        SourceCache.set(source, known = completeFromList(source));
    return known;
}

// A pattern matcher for fuzzy completion matching. Create an instance
// once for a pattern, and then use that to match any number of
// completions.
class FuzzyMatcher {
    constructor(pattern) {
        this.pattern = pattern;
        this.chars = [];
        this.folded = [];
        // Buffers reused by calls to `match` to track matched character
        // positions.
        this.any = [];
        this.precise = [];
        this.byWord = [];
        for (let p = 0; p < pattern.length;) {
            let char = codePointAt(pattern, p), size = codePointSize(char);
            this.chars.push(char);
            let part = pattern.slice(p, p + size), upper = part.toUpperCase();
            this.folded.push(codePointAt(upper == part ? part.toLowerCase() : upper, 0));
            p += size;
        }
        this.astral = pattern.length != this.chars.length;
    }
    // Matches a given word (completion) against the pattern (input).
    // Will return null for no match, and otherwise an array that starts
    // with the match score, followed by any number of `from, to` pairs
    // indicating the matched parts of `word`.
    //
    // The score is a number that is more negative the worse the match
    // is. See `Penalty` above.
    match(word) {
        if (this.pattern.length == 0)
            return [0];
        if (word.length < this.pattern.length)
            return null;
        let { chars, folded, any, precise, byWord } = this;
        // For single-character queries, only match when they occur right
        // at the start
        if (chars.length == 1) {
            let first = codePointAt(word, 0);
            return first == chars[0] ? [0, 0, codePointSize(first)]
                : first == folded[0] ? [-200 /* CaseFold */, 0, codePointSize(first)] : null;
        }
        let direct = word.indexOf(this.pattern);
        if (direct == 0)
            return [0, 0, this.pattern.length];
        let len = chars.length, anyTo = 0;
        if (direct < 0) {
            for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len;) {
                let next = codePointAt(word, i);
                if (next == chars[anyTo] || next == folded[anyTo])
                    any[anyTo++] = i;
                i += codePointSize(next);
            }
            // No match, exit immediately
            if (anyTo < len)
                return null;
        }
        // This tracks the extent of the precise (non-folded, not
        // necessarily adjacent) match
        let preciseTo = 0;
        // Tracks whether there is a match that hits only characters that
        // appear to be starting words. `byWordFolded` is set to true when
        // a case folded character is encountered in such a match
        let byWordTo = 0, byWordFolded = false;
        // If we've found a partial adjacent match, these track its state
        let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
        let hasLower = /[a-z]/.test(word);
        // Go over the option's text, scanning for the various kinds of matches
        for (let i = 0, e = Math.min(word.length, 200), prevType = 0 /* NonWord */; i < e && byWordTo < len;) {
            let next = codePointAt(word, i);
            if (direct < 0) {
                if (preciseTo < len && next == chars[preciseTo])
                    precise[preciseTo++] = i;
                if (adjacentTo < len) {
                    if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
                        if (adjacentTo == 0)
                            adjacentStart = i;
                        adjacentEnd = i;
                        adjacentTo++;
                    }
                    else {
                        adjacentTo = 0;
                    }
                }
            }
            let ch, type = next < 0xff
                ? (next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 /* Lower */ : next >= 65 && next <= 90 ? 1 /* Upper */ : 0 /* NonWord */)
                : ((ch = fromCodePoint(next)) != ch.toLowerCase() ? 1 /* Upper */ : ch != ch.toUpperCase() ? 2 /* Lower */ : 0 /* NonWord */);
            if ((type == 1 /* Upper */ && hasLower || prevType == 0 /* NonWord */ && type != 0 /* NonWord */) &&
                (chars[byWordTo] == next || (folded[byWordTo] == next && (byWordFolded = true))))
                byWord[byWordTo++] = i;
            prevType = type;
            i += codePointSize(next);
        }
        if (byWordTo == len && byWord[0] == 0)
            return this.result(-100 /* ByWord */ + (byWordFolded ? -200 /* CaseFold */ : 0), byWord, word);
        if (adjacentTo == len && adjacentStart == 0)
            return [-200 /* CaseFold */, 0, adjacentEnd];
        if (direct > -1)
            return [-700 /* NotStart */, direct, direct + this.pattern.length];
        if (adjacentTo == len)
            return [-200 /* CaseFold */ + -700 /* NotStart */, adjacentStart, adjacentEnd];
        if (byWordTo == len)
            return this.result(-100 /* ByWord */ + (byWordFolded ? -200 /* CaseFold */ : 0) + -700 /* NotStart */, byWord, word);
        return chars.length == 2 ? null : this.result((any[0] ? -700 /* NotStart */ : 0) + -200 /* CaseFold */ + -1100 /* Gap */, any, word);
    }
    result(score, positions, word) {
        let result = [score], i = 1;
        for (let pos of positions) {
            let to = pos + (this.astral ? codePointSize(codePointAt(word, pos)) : 1);
            if (i > 1 && result[i - 1] == pos)
                result[i - 1] = to;
            else {
                result[i++] = pos;
                result[i++] = to;
            }
        }
        return result;
    }
}

const completionConfig = Facet.define({
    combine(configs) {
        return combineConfig(configs, {
            activateOnTyping: true,
            override: null,
            maxRenderedOptions: 100,
            defaultKeymap: true
        }, {
            defaultKeymap: (a, b) => a && b
        });
    }
});

const MaxInfoWidth = 300;
const baseTheme = EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-autocomplete": {
        "& > ul": {
            fontFamily: "monospace",
            overflowY: "auto",
            whiteSpace: "nowrap",
            maxHeight: "10em",
            listStyle: "none",
            margin: 0,
            padding: 0,
            "& > li": {
                cursor: "pointer",
                padding: "1px 1em 1px 3px",
                lineHeight: 1.2
            },
            "& > li[aria-selected]": {
                background_fallback: "#bdf",
                backgroundColor: "Highlight",
                color_fallback: "white",
                color: "HighlightText"
            }
        }
    },
    ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
        content: '"···"',
        opacity: 0.5,
        display: "block",
        textAlign: "center"
    },
    ".cm-tooltip.cm-completionInfo": {
        position: "absolute",
        padding: "3px 9px",
        width: "max-content",
        maxWidth: MaxInfoWidth + "px",
    },
    ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
    ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
    "&light .cm-snippetField": { backgroundColor: "#00000022" },
    "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
    ".cm-snippetFieldPosition": {
        verticalAlign: "text-top",
        width: 0,
        height: "1.15em",
        margin: "0 -0.7px -.7em",
        borderLeft: "1.4px dotted #888"
    },
    ".cm-completionMatchedText": {
        textDecoration: "underline"
    },
    ".cm-completionDetail": {
        marginLeft: "0.5em",
        fontStyle: "italic"
    },
    ".cm-completionIcon": {
        fontSize: "90%",
        width: ".8em",
        display: "inline-block",
        textAlign: "center",
        paddingRight: ".6em",
        opacity: "0.6"
    },
    ".cm-completionIcon-function, .cm-completionIcon-method": {
        "&:after": { content: "'ƒ'" }
    },
    ".cm-completionIcon-class": {
        "&:after": { content: "'○'" }
    },
    ".cm-completionIcon-interface": {
        "&:after": { content: "'◌'" }
    },
    ".cm-completionIcon-variable": {
        "&:after": { content: "'𝑥'" }
    },
    ".cm-completionIcon-constant": {
        "&:after": { content: "'𝐶'" }
    },
    ".cm-completionIcon-type": {
        "&:after": { content: "'𝑡'" }
    },
    ".cm-completionIcon-enum": {
        "&:after": { content: "'∪'" }
    },
    ".cm-completionIcon-property": {
        "&:after": { content: "'□'" }
    },
    ".cm-completionIcon-keyword": {
        "&:after": { content: "'🔑\uFE0E'" } // Disable emoji rendering
    },
    ".cm-completionIcon-namespace": {
        "&:after": { content: "'▢'" }
    },
    ".cm-completionIcon-text": {
        "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
    }
});

function createListBox(options, id, range) {
    const ul = document.createElement("ul");
    ul.id = id;
    ul.setAttribute("role", "listbox");
    ul.setAttribute("aria-expanded", "true");
    for (let i = range.from; i < range.to; i++) {
        let { completion, match } = options[i];
        const li = ul.appendChild(document.createElement("li"));
        li.id = id + "-" + i;
        let icon = li.appendChild(document.createElement("div"));
        icon.classList.add("cm-completionIcon");
        if (completion.type)
            icon.classList.add("cm-completionIcon-" + completion.type);
        icon.setAttribute("aria-hidden", "true");
        let labelElt = li.appendChild(document.createElement("span"));
        labelElt.className = "cm-completionLabel";
        let { label, detail } = completion, off = 0;
        for (let j = 1; j < match.length;) {
            let from = match[j++], to = match[j++];
            if (from > off)
                labelElt.appendChild(document.createTextNode(label.slice(off, from)));
            let span = labelElt.appendChild(document.createElement("span"));
            span.appendChild(document.createTextNode(label.slice(from, to)));
            span.className = "cm-completionMatchedText";
            off = to;
        }
        if (off < label.length)
            labelElt.appendChild(document.createTextNode(label.slice(off)));
        if (detail) {
            let detailElt = li.appendChild(document.createElement("span"));
            detailElt.className = "cm-completionDetail";
            detailElt.textContent = detail;
        }
        li.setAttribute("role", "option");
    }
    if (range.from)
        ul.classList.add("cm-completionListIncompleteTop");
    if (range.to < options.length)
        ul.classList.add("cm-completionListIncompleteBottom");
    return ul;
}
function createInfoDialog(option) {
    let dom = document.createElement("div");
    dom.className = "cm-tooltip cm-completionInfo";
    let { info } = option.completion;
    if (typeof info == "string")
        dom.textContent = info;
    else
        dom.appendChild(info(option.completion));
    return dom;
}
function rangeAroundSelected(total, selected, max) {
    if (total <= max)
        return { from: 0, to: total };
    if (selected <= (total >> 1)) {
        let off = Math.floor(selected / max);
        return { from: off * max, to: (off + 1) * max };
    }
    let off = Math.floor((total - selected) / max);
    return { from: total - (off + 1) * max, to: total - off * max };
}
class CompletionTooltip {
    constructor(view, stateField) {
        this.view = view;
        this.stateField = stateField;
        this.info = null;
        this.placeInfo = {
            read: () => this.measureInfo(),
            write: (pos) => this.positionInfo(pos),
            key: this
        };
        let cState = view.state.field(stateField);
        let { options, selected } = cState.open;
        let config = view.state.facet(completionConfig);
        this.range = rangeAroundSelected(options.length, selected, config.maxRenderedOptions);
        this.dom = document.createElement("div");
        this.dom.addEventListener("mousedown", (e) => {
            for (let dom = e.target, match; dom && dom != this.dom; dom = dom.parentNode) {
                if (dom.nodeName == "LI" && (match = /-(\d+)$/.exec(dom.id)) && +match[1] < options.length) {
                    applyCompletion(view, options[+match[1]]);
                    e.preventDefault();
                    return;
                }
            }
        });
        this.list = this.dom.appendChild(createListBox(options, cState.id, this.range));
        this.list.addEventListener("scroll", () => {
            if (this.info)
                this.view.requestMeasure(this.placeInfo);
        });
    }
    mount() { this.updateSel(); }
    update(update) {
        if (update.state.field(this.stateField) != update.startState.field(this.stateField))
            this.updateSel();
    }
    positioned() {
        if (this.info)
            this.view.requestMeasure(this.placeInfo);
    }
    updateSel() {
        let cState = this.view.state.field(this.stateField), open = cState.open;
        if (open.selected < this.range.from || open.selected >= this.range.to) {
            this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
            this.list.remove();
            this.list = this.dom.appendChild(createListBox(open.options, cState.id, this.range));
            this.list.addEventListener("scroll", () => {
                if (this.info)
                    this.view.requestMeasure(this.placeInfo);
            });
        }
        if (this.updateSelectedOption(open.selected)) {
            if (this.info) {
                this.info.remove();
                this.info = null;
            }
            let option = open.options[open.selected];
            if (option.completion.info) {
                this.info = this.dom.appendChild(createInfoDialog(option));
                this.view.requestMeasure(this.placeInfo);
            }
        }
    }
    updateSelectedOption(selected) {
        let set = null;
        for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
            if (i == selected) {
                if (!opt.hasAttribute("aria-selected")) {
                    opt.setAttribute("aria-selected", "true");
                    set = opt;
                }
            }
            else {
                if (opt.hasAttribute("aria-selected"))
                    opt.removeAttribute("aria-selected");
            }
        }
        if (set)
            scrollIntoView(this.list, set);
        return set;
    }
    measureInfo() {
        let sel = this.dom.querySelector("[aria-selected]");
        if (!sel)
            return null;
        let rect = this.dom.getBoundingClientRect();
        let top = sel.getBoundingClientRect().top - rect.top;
        if (top < 0 || top > this.list.clientHeight - 10)
            return null;
        let left = this.view.textDirection == Direction.RTL;
        let spaceLeft = rect.left, spaceRight = innerWidth - rect.right;
        if (left && spaceLeft < Math.min(MaxInfoWidth, spaceRight))
            left = false;
        else if (!left && spaceRight < Math.min(MaxInfoWidth, spaceLeft))
            left = true;
        return { top, left };
    }
    positionInfo(pos) {
        if (this.info && pos) {
            this.info.style.top = pos.top + "px";
            this.info.classList.toggle("cm-completionInfo-left", pos.left);
            this.info.classList.toggle("cm-completionInfo-right", !pos.left);
        }
    }
}
// We allocate a new function instance every time the completion
// changes to force redrawing/repositioning of the tooltip
function completionTooltip(stateField) {
    return (view) => new CompletionTooltip(view, stateField);
}
function scrollIntoView(container, element) {
    let parent = container.getBoundingClientRect();
    let self = element.getBoundingClientRect();
    if (self.top < parent.top)
        container.scrollTop -= parent.top - self.top;
    else if (self.bottom > parent.bottom)
        container.scrollTop += self.bottom - parent.bottom;
}

const MaxOptions = 300;
// Used to pick a preferred option when two options with the same
// label occur in the result.
function score(option) {
    return (option.boost || 0) * 100 + (option.apply ? 10 : 0) + (option.info ? 5 : 0) +
        (option.type ? 1 : 0);
}
function sortOptions(active, state) {
    let options = [];
    for (let a of active)
        if (a.hasResult()) {
            let matcher = new FuzzyMatcher(state.sliceDoc(a.from, a.to)), match;
            for (let option of a.result.options)
                if (match = matcher.match(option.label)) {
                    if (option.boost != null)
                        match[0] += option.boost;
                    options.push(new Option(option, a, match));
                }
        }
    options.sort(cmpOption);
    let result = [], prev = null;
    for (let opt of options.sort(cmpOption)) {
        if (result.length == MaxOptions)
            break;
        if (!prev || prev.label != opt.completion.label || prev.detail != opt.completion.detail)
            result.push(opt);
        else if (score(opt.completion) > score(prev))
            result[result.length - 1] = opt;
        prev = opt.completion;
    }
    return result;
}
class CompletionDialog {
    constructor(options, attrs, tooltip, timestamp, selected) {
        this.options = options;
        this.attrs = attrs;
        this.tooltip = tooltip;
        this.timestamp = timestamp;
        this.selected = selected;
    }
    setSelected(selected, id) {
        return selected == this.selected || selected >= this.options.length ? this
            : new CompletionDialog(this.options, makeAttrs(id, selected), this.tooltip, this.timestamp, selected);
    }
    static build(active, state, id, prev) {
        let options = sortOptions(active, state);
        if (!options.length)
            return null;
        let selected = 0;
        if (prev && prev.selected) {
            let selectedValue = prev.options[prev.selected].completion;
            for (let i = 0; i < options.length && !selected; i++) {
                if (options[i].completion == selectedValue)
                    selected = i;
            }
        }
        return new CompletionDialog(options, makeAttrs(id, selected), [{
                pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
                class: "cm-tooltip-autocomplete",
                create: completionTooltip(completionState)
            }], prev ? prev.timestamp : Date.now(), selected);
    }
    map(changes) {
        return new CompletionDialog(this.options, this.attrs, [Object.assign(Object.assign({}, this.tooltip[0]), { pos: changes.mapPos(this.tooltip[0].pos) })], this.timestamp, this.selected);
    }
}
class CompletionState {
    constructor(active, id, open) {
        this.active = active;
        this.id = id;
        this.open = open;
    }
    static start() {
        return new CompletionState(none, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
    }
    update(tr) {
        let { state } = tr, conf = state.facet(completionConfig);
        let sources = conf.override ||
            state.languageDataAt("autocomplete", cur(state)).map(asSource);
        let active = sources.map(source => {
            let value = this.active.find(s => s.source == source) || new ActiveSource(source, 0 /* Inactive */, false);
            return value.update(tr, conf);
        });
        if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
            active = this.active;
        let open = tr.selection || active.some(a => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) ||
            !sameResults(active, this.active) ? CompletionDialog.build(active, state, this.id, this.open)
            : this.open && tr.docChanged ? this.open.map(tr.changes) : this.open;
        for (let effect of tr.effects)
            if (effect.is(setSelectedEffect))
                open = open && open.setSelected(effect.value, this.id);
        return active == this.active && open == this.open ? this : new CompletionState(active, this.id, open);
    }
    get tooltip() { return this.open ? this.open.tooltip : none; }
    get attrs() { return this.open ? this.open.attrs : baseAttrs; }
}
function sameResults(a, b) {
    if (a == b)
        return true;
    for (let iA = 0, iB = 0;;) {
        while (iA < a.length && !a[iA].hasResult)
            iA++;
        while (iB < b.length && !b[iB].hasResult)
            iB++;
        let endA = iA == a.length, endB = iB == b.length;
        if (endA || endB)
            return endA == endB;
        if (a[iA++].result != b[iB++].result)
            return false;
    }
}
function makeAttrs(id, selected) {
    return {
        "aria-autocomplete": "list",
        "aria-activedescendant": id + "-" + selected,
        "aria-owns": id
    };
}
const baseAttrs = { "aria-autocomplete": "list" }, none = [];
function cmpOption(a, b) {
    let dScore = b.match[0] - a.match[0];
    if (dScore)
        return dScore;
    let lA = a.completion.label, lB = b.completion.label;
    return lA < lB ? -1 : lA == lB ? 0 : 1;
}
class ActiveSource {
    constructor(source, state, explicit) {
        this.source = source;
        this.state = state;
        this.explicit = explicit;
    }
    hasResult() { return false; }
    update(tr, conf) {
        let event = tr.annotation(Transaction.userEvent), value = this;
        if (event == "input" || event == "delete")
            value = value.handleUserEvent(tr, event, conf);
        else if (tr.docChanged)
            value = value.handleChange(tr);
        else if (tr.selection && value.state != 0 /* Inactive */)
            value = new ActiveSource(value.source, 0 /* Inactive */, false);
        for (let effect of tr.effects) {
            if (effect.is(startCompletionEffect))
                value = new ActiveSource(value.source, 1 /* Pending */, effect.value);
            else if (effect.is(closeCompletionEffect))
                value = new ActiveSource(value.source, 0 /* Inactive */, false);
            else if (effect.is(setActiveEffect))
                for (let active of effect.value)
                    if (active.source == value.source)
                        value = active;
        }
        return value;
    }
    handleUserEvent(_tr, type, conf) {
        return type == "delete" || !conf.activateOnTyping ? this : new ActiveSource(this.source, 1 /* Pending */, false);
    }
    handleChange(tr) {
        return tr.changes.touchesRange(cur(tr.startState)) ? new ActiveSource(this.source, 0 /* Inactive */, false) : this;
    }
}
class ActiveResult extends ActiveSource {
    constructor(source, explicit, result, from, to, span) {
        super(source, 2 /* Result */, explicit);
        this.result = result;
        this.from = from;
        this.to = to;
        this.span = span;
    }
    hasResult() { return true; }
    handleUserEvent(tr, type, conf) {
        let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
        let pos = cur(tr.state);
        if ((this.explicit ? pos < from : pos <= from) || pos > to)
            return new ActiveSource(this.source, type == "input" && conf.activateOnTyping ? 1 /* Pending */ : 0 /* Inactive */, false);
        if (this.span && (from == to || this.span.test(tr.state.sliceDoc(from, to))))
            return new ActiveResult(this.source, this.explicit, this.result, from, to, this.span);
        return new ActiveSource(this.source, 1 /* Pending */, this.explicit);
    }
    handleChange(tr) {
        return tr.changes.touchesRange(this.from, this.to)
            ? new ActiveSource(this.source, 0 /* Inactive */, false)
            : new ActiveResult(this.source, this.explicit, this.result, tr.changes.mapPos(this.from), tr.changes.mapPos(this.to, 1), this.span);
    }
    map(mapping) {
        return new ActiveResult(this.source, this.explicit, this.result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1), this.span);
    }
}
const startCompletionEffect = StateEffect.define();
const closeCompletionEffect = StateEffect.define();
const setActiveEffect = StateEffect.define({
    map(sources, mapping) { return sources.map(s => s.hasResult() && !mapping.empty ? s.map(mapping) : s); }
});
const setSelectedEffect = StateEffect.define();
const completionState = StateField.define({
    create() { return CompletionState.start(); },
    update(value, tr) { return value.update(tr); },
    provide: f => [
        showTooltip.computeN([f], state => state.field(f).tooltip),
        EditorView.contentAttributes.from(f, state => state.attrs)
    ]
});

const CompletionInteractMargin = 75;
/// Returns a command that moves the completion selection forward or
/// backward by the given amount.
function moveCompletionSelection(forward, by = "option") {
    return (view) => {
        let cState = view.state.field(completionState, false);
        if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
            return false;
        let step = 1, tooltip;
        if (by == "page" && (tooltip = view.dom.querySelector(".cm-tooltip-autocomplete")))
            step = Math.max(2, Math.floor(tooltip.offsetHeight / tooltip.firstChild.offsetHeight));
        let selected = cState.open.selected + step * (forward ? 1 : -1), { length } = cState.open.options;
        if (selected < 0)
            selected = by == "page" ? 0 : length - 1;
        else if (selected >= length)
            selected = by == "page" ? length - 1 : 0;
        view.dispatch({ effects: setSelectedEffect.of(selected) });
        return true;
    };
}
/// Accept the current completion.
const acceptCompletion = (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
        return false;
    applyCompletion(view, cState.open.options[cState.open.selected]);
    return true;
};
/// Explicitly start autocompletion.
const startCompletion = (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState)
        return false;
    view.dispatch({ effects: startCompletionEffect.of(true) });
    return true;
};
/// Close the currently active completion.
const closeCompletion = (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState || !cState.active.some(a => a.state != 0 /* Inactive */))
        return false;
    view.dispatch({ effects: closeCompletionEffect.of(null) });
    return true;
};
class RunningQuery {
    constructor(source, context) {
        this.source = source;
        this.context = context;
        this.time = Date.now();
        this.updates = [];
        // Note that 'undefined' means 'not done yet', whereas 'null' means
        // 'query returned null'.
        this.done = undefined;
    }
}
const DebounceTime = 50, MaxUpdateCount = 50, MinAbortTime = 1000;
const completionPlugin = ViewPlugin.fromClass(class {
    constructor(view) {
        this.view = view;
        this.debounceUpdate = -1;
        this.running = [];
        this.debounceAccept = -1;
        this.composing = 0 /* None */;
        for (let active of view.state.field(completionState).active)
            if (active.state == 1 /* Pending */)
                this.startQuery(active);
    }
    update(update) {
        let cState = update.state.field(completionState);
        if (!update.selectionSet && !update.docChanged && update.startState.field(completionState) == cState)
            return;
        let doesReset = update.transactions.some(tr => {
            let event = tr.annotation(Transaction.userEvent);
            return (tr.selection || tr.docChanged) && event != "input" && event != "delete";
        });
        for (let i = 0; i < this.running.length; i++) {
            let query = this.running[i];
            if (doesReset ||
                query.updates.length + update.transactions.length > MaxUpdateCount && query.time - Date.now() > MinAbortTime) {
                for (let handler of query.context.abortListeners) {
                    try {
                        handler();
                    }
                    catch (e) {
                        logException(this.view.state, e);
                    }
                }
                query.context.abortListeners = null;
                this.running.splice(i--, 1);
            }
            else {
                query.updates.push(...update.transactions);
            }
        }
        if (this.debounceUpdate > -1)
            clearTimeout(this.debounceUpdate);
        this.debounceUpdate = cState.active.some(a => a.state == 1 /* Pending */ && !this.running.some(q => q.source == a.source))
            ? setTimeout(() => this.startUpdate(), DebounceTime) : -1;
        if (this.composing != 0 /* None */)
            for (let tr of update.transactions) {
                if (tr.annotation(Transaction.userEvent) == "input")
                    this.composing = 2 /* Changed */;
                else if (this.composing == 2 /* Changed */ && tr.selection)
                    this.composing = 3 /* ChangedAndMoved */;
            }
    }
    startUpdate() {
        this.debounceUpdate = -1;
        let { state } = this.view, cState = state.field(completionState);
        for (let active of cState.active) {
            if (active.state == 1 /* Pending */ && !this.running.some(r => r.source == active.source))
                this.startQuery(active);
        }
    }
    startQuery(active) {
        let { state } = this.view, pos = cur(state);
        let context = new CompletionContext(state, pos, active.explicit);
        let pending = new RunningQuery(active.source, context);
        this.running.push(pending);
        Promise.resolve(active.source(context)).then(result => {
            if (!pending.context.aborted) {
                pending.done = result || null;
                this.scheduleAccept();
            }
        }, err => {
            this.view.dispatch({ effects: closeCompletionEffect.of(null) });
            logException(this.view.state, err);
        });
    }
    scheduleAccept() {
        if (this.running.every(q => q.done !== undefined))
            this.accept();
        else if (this.debounceAccept < 0)
            this.debounceAccept = setTimeout(() => this.accept(), DebounceTime);
    }
    // For each finished query in this.running, try to create a result
    // or, if appropriate, restart the query.
    accept() {
        var _a;
        if (this.debounceAccept > -1)
            clearTimeout(this.debounceAccept);
        this.debounceAccept = -1;
        let updated = [];
        let conf = this.view.state.facet(completionConfig);
        for (let i = 0; i < this.running.length; i++) {
            let query = this.running[i];
            if (query.done === undefined)
                continue;
            this.running.splice(i--, 1);
            if (query.done) {
                let active = new ActiveResult(query.source, query.context.explicit, query.done, query.done.from, (_a = query.done.to) !== null && _a !== void 0 ? _a : cur(query.updates.length ? query.updates[0].startState : this.view.state), query.done.span ? ensureAnchor(query.done.span, true) : null);
                // Replay the transactions that happened since the start of
                // the request and see if that preserves the result
                for (let tr of query.updates)
                    active = active.update(tr, conf);
                if (active.hasResult()) {
                    updated.push(active);
                    continue;
                }
            }
            let current = this.view.state.field(completionState).active.find(a => a.source == query.source);
            if (current && current.state == 1 /* Pending */) {
                if (query.done == null) {
                    // Explicitly failed. Should clear the pending status if it
                    // hasn't been re-set in the meantime.
                    let active = new ActiveSource(query.source, 0 /* Inactive */, false);
                    for (let tr of query.updates)
                        active = active.update(tr, conf);
                    if (active.state != 1 /* Pending */)
                        updated.push(active);
                }
                else {
                    // Cleared by subsequent transactions. Restart.
                    this.startQuery(current);
                }
            }
        }
        if (updated.length)
            this.view.dispatch({ effects: setActiveEffect.of(updated) });
    }
}, {
    eventHandlers: {
        compositionstart() {
            this.composing = 1 /* Started */;
        },
        compositionend() {
            if (this.composing == 3 /* ChangedAndMoved */)
                this.view.dispatch({ effects: startCompletionEffect.of(false) });
            this.composing = 0 /* None */;
        }
    }
});

class FieldPos {
    constructor(field, line, from, to) {
        this.field = field;
        this.line = line;
        this.from = from;
        this.to = to;
    }
}
class FieldRange {
    constructor(field, from, to) {
        this.field = field;
        this.from = from;
        this.to = to;
    }
    map(changes) {
        return new FieldRange(this.field, changes.mapPos(this.from, -1), changes.mapPos(this.to, 1));
    }
}
class Snippet {
    constructor(lines, fieldPositions) {
        this.lines = lines;
        this.fieldPositions = fieldPositions;
    }
    instantiate(state, pos) {
        let text = [], lineStart = [pos];
        let lineObj = state.doc.lineAt(pos), baseIndent = /^\s*/.exec(lineObj.text)[0];
        for (let line of this.lines) {
            if (text.length) {
                let indent = baseIndent, tabs = /^\t*/.exec(line)[0].length;
                for (let i = 0; i < tabs; i++)
                    indent += state.facet(indentUnit);
                lineStart.push(pos + indent.length - tabs);
                line = indent + line.slice(tabs);
            }
            text.push(line);
            pos += line.length + 1;
        }
        let ranges = this.fieldPositions.map(pos => new FieldRange(pos.field, lineStart[pos.line] + pos.from, lineStart[pos.line] + pos.to));
        return { text, ranges };
    }
    static parse(template) {
        let fields = [];
        let lines = [], positions = [], m;
        for (let line of template.split(/\r\n?|\n/)) {
            while (m = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(line)) {
                let seq = m[1] ? +m[1] : null, name = m[2] || m[3], found = -1;
                for (let i = 0; i < fields.length; i++) {
                    if (name ? fields[i].name == name : seq != null && fields[i].seq == seq)
                        found = i;
                }
                if (found < 0) {
                    let i = 0;
                    while (i < fields.length && (seq == null || (fields[i].seq != null && fields[i].seq < seq)))
                        i++;
                    fields.splice(i, 0, { seq, name: name || null });
                    found = i;
                }
                positions.push(new FieldPos(found, lines.length, m.index, m.index + name.length));
                line = line.slice(0, m.index) + name + line.slice(m.index + m[0].length);
            }
            lines.push(line);
        }
        return new Snippet(lines, positions);
    }
}
let fieldMarker = Decoration.widget({ widget: new class extends WidgetType {
        toDOM() {
            let span = document.createElement("span");
            span.className = "cm-snippetFieldPosition";
            return span;
        }
        ignoreEvent() { return false; }
    } });
let fieldRange = Decoration.mark({ class: "cm-snippetField" });
class ActiveSnippet {
    constructor(ranges, active) {
        this.ranges = ranges;
        this.active = active;
        this.deco = Decoration.set(ranges.map(r => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)));
    }
    map(changes) {
        return new ActiveSnippet(this.ranges.map(r => r.map(changes)), this.active);
    }
    selectionInsideField(sel) {
        return sel.ranges.every(range => this.ranges.some(r => r.field == this.active && r.from <= range.from && r.to >= range.to));
    }
}
const setActive = StateEffect.define({
    map(value, changes) { return value && value.map(changes); }
});
const moveToField = StateEffect.define();
const snippetState = StateField.define({
    create() { return null; },
    update(value, tr) {
        for (let effect of tr.effects) {
            if (effect.is(setActive))
                return effect.value;
            if (effect.is(moveToField) && value)
                return new ActiveSnippet(value.ranges, effect.value);
        }
        if (value && tr.docChanged)
            value = value.map(tr.changes);
        if (value && tr.selection && !value.selectionInsideField(tr.selection))
            value = null;
        return value;
    },
    provide: f => EditorView.decorations.from(f, val => val ? val.deco : Decoration.none)
});
function fieldSelection(ranges, field) {
    return EditorSelection.create(ranges.filter(r => r.field == field).map(r => EditorSelection.range(r.from, r.to)));
}
/// Convert a snippet template to a function that can apply it.
/// Snippets are written using syntax like this:
///
///     "for (let ${index} = 0; ${index} < ${end}; ${index}++) {\n\t${}\n}"
///
/// Each `${}` placeholder (you may also use `#{}`) indicates a field
/// that the user can fill in. Its name, if any, will be the default
/// content for the field.
///
/// When the snippet is activated by calling the returned function,
/// the code is inserted at the given position. Newlines in the
/// template are indented by the indentation of the start line, plus
/// one [indent unit](#language.indentUnit) per tab character after
/// the newline.
///
/// On activation, (all instances of) the first field are selected.
/// The user can move between fields with Tab and Shift-Tab as long as
/// the fields are active. Moving to the last field or moving the
/// cursor out of the current field deactivates the fields.
///
/// The order of fields defaults to textual order, but you can add
/// numbers to placeholders (`${1}` or `${1:defaultText}`) to provide
/// a custom order.
function snippet(template) {
    let snippet = Snippet.parse(template);
    return (editor, _completion, from, to) => {
        let { text, ranges } = snippet.instantiate(editor.state, from);
        let spec = { changes: { from, to, insert: Text.of(text) } };
        if (ranges.length)
            spec.selection = fieldSelection(ranges, 0);
        if (ranges.length > 1) {
            let effects = spec.effects = [setActive.of(new ActiveSnippet(ranges, 0))];
            if (editor.state.field(snippetState, false) === undefined)
                effects.push(StateEffect.appendConfig.of([snippetState, addSnippetKeymap, snippetPointerHandler, baseTheme]));
        }
        editor.dispatch(editor.state.update(spec));
    };
}
function moveField(dir) {
    return ({ state, dispatch }) => {
        let active = state.field(snippetState, false);
        if (!active || dir < 0 && active.active == 0)
            return false;
        let next = active.active + dir, last = dir > 0 && !active.ranges.some(r => r.field == next + dir);
        dispatch(state.update({
            selection: fieldSelection(active.ranges, next),
            effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next))
        }));
        return true;
    };
}
/// A command that clears the active snippet, if any.
const clearSnippet = ({ state, dispatch }) => {
    let active = state.field(snippetState, false);
    if (!active)
        return false;
    dispatch(state.update({ effects: setActive.of(null) }));
    return true;
};
/// Move to the next snippet field, if available.
const nextSnippetField = moveField(1);
/// Move to the previous snippet field, if available.
const prevSnippetField = moveField(-1);
const defaultSnippetKeymap = [
    { key: "Tab", run: nextSnippetField, shift: prevSnippetField },
    { key: "Escape", run: clearSnippet }
];
/// A facet that can be used to configure the key bindings used by
/// snippets. The default binds Tab to
/// [`nextSnippetField`](#autocomplete.nextSnippetField), Shift-Tab to
/// [`prevSnippetField`](#autocomplete.prevSnippetField), and Escape
/// to [`clearSnippet`](#autocomplete.clearSnippet).
const snippetKeymap = Facet.define({
    combine(maps) { return maps.length ? maps[0] : defaultSnippetKeymap; }
});
const addSnippetKeymap = Prec.override(keymap.compute([snippetKeymap], state => state.facet(snippetKeymap)));
/// Create a completion from a snippet. Returns an object with the
/// properties from `completion`, plus an `apply` function that
/// applies the snippet.
function snippetCompletion(template, completion) {
    return Object.assign(Object.assign({}, completion), { apply: snippet(template) });
}
const snippetPointerHandler = EditorView.domEventHandlers({
    mousedown(event, view) {
        let active = view.state.field(snippetState, false), pos;
        if (!active || (pos = view.posAtCoords({ x: event.clientX, y: event.clientY })) == null)
            return false;
        let match = active.ranges.find(r => r.from <= pos && r.to >= pos);
        if (!match || match.field == active.active)
            return false;
        view.dispatch({
            selection: fieldSelection(active.ranges, match.field),
            effects: setActive.of(active.ranges.some(r => r.field > match.field) ? new ActiveSnippet(active.ranges, match.field) : null)
        });
        return true;
    }
});

/// Returns an extension that enables autocompletion.
function autocompletion(config = {}) {
    return [
        completionState,
        completionConfig.of(config),
        completionPlugin,
        completionKeymapExt,
        baseTheme,
        tooltips()
    ];
}
/// Basic keybindings for autocompletion.
///
///  - Ctrl-Space: [`startCompletion`](#autocomplete.startCompletion)
///  - Escape: [`closeCompletion`](#autocomplete.closeCompletion)
///  - ArrowDown: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(true)`
///  - ArrowUp: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(false)`
///  - PageDown: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(true, "page")`
///  - PageDown: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(true, "page")`
///  - Enter: [`acceptCompletion`](#autocomplete.acceptCompletion)
const completionKeymap = [
    { key: "Ctrl-Space", run: startCompletion },
    { key: "Escape", run: closeCompletion },
    { key: "ArrowDown", run: moveCompletionSelection(true) },
    { key: "ArrowUp", run: moveCompletionSelection(false) },
    { key: "PageDown", run: moveCompletionSelection(true, "page") },
    { key: "PageUp", run: moveCompletionSelection(false, "page") },
    { key: "Enter", run: acceptCompletion }
];
const completionKeymapExt = Prec.override(keymap.computeN([completionConfig], state => state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));

let nextTagID = 0;
/// Highlighting tags are markers that denote a highlighting category.
/// They are [associated](#highlight.styleTags) with parts of a syntax
/// tree by a language mode, and then mapped to an actual CSS style by
/// a [highlight style](#highlight.HighlightStyle).
///
/// Because syntax tree node types and highlight styles have to be
/// able to talk the same language, CodeMirror uses a mostly _closed_
/// [vocabulary](#highlight.tags) of syntax tags (as opposed to
/// traditional open string-based systems, which make it hard for
/// highlighting themes to cover all the tokens produced by the
/// various languages).
///
/// It _is_ possible to [define](#highlight.Tag^define) your own
/// highlighting tags for system-internal use (where you control both
/// the language package and the highlighter), but such tags will not
/// be picked up by regular highlighters (though you can derive them
/// from standard tags to allow highlighters to fall back to those).
class Tag {
    /// @internal
    constructor(
    /// The set of tags that match this tag, starting with this one
    /// itself, sorted in order of decreasing specificity. @internal
    set, 
    /// The base unmodified tag that this one is based on, if it's
    /// modified @internal
    base, 
    /// The modifiers applied to this.base @internal
    modified) {
        this.set = set;
        this.base = base;
        this.modified = modified;
        /// @internal
        this.id = nextTagID++;
    }
    /// Define a new tag. If `parent` is given, the tag is treated as a
    /// sub-tag of that parent, and [highlight
    /// styles](#highlight.HighlightStyle) that don't mention this tag
    /// will try to fall back to the parent tag (or grandparent tag,
    /// etc).
    static define(parent) {
        if (parent === null || parent === void 0 ? void 0 : parent.base)
            throw new Error("Can not derive from a modified tag");
        let tag = new Tag([], null, []);
        tag.set.push(tag);
        if (parent)
            for (let t of parent.set)
                tag.set.push(t);
        return tag;
    }
    /// Define a tag _modifier_, which is a function that, given a tag,
    /// will return a tag that is a subtag of the original. Applying the
    /// same modifier to a twice tag will return the same value (`m1(t1)
    /// == m1(t1)`) and applying multiple modifiers will, regardless or
    /// order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
    ///
    /// When multiple modifiers are applied to a given base tag, each
    /// smaller set of modifiers is registered as a parent, so that for
    /// example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
    /// `m1(m3(t1)`, and so on.
    static defineModifier() {
        let mod = new Modifier;
        return (tag) => {
            if (tag.modified.indexOf(mod) > -1)
                return tag;
            return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
        };
    }
}
let nextModifierID = 0;
class Modifier {
    constructor() {
        this.instances = [];
        this.id = nextModifierID++;
    }
    static get(base, mods) {
        if (!mods.length)
            return base;
        let exists = mods[0].instances.find(t => t.base == base && sameArray(mods, t.modified));
        if (exists)
            return exists;
        let set = [], tag = new Tag(set, base, mods);
        for (let m of mods)
            m.instances.push(tag);
        let configs = permute(mods);
        for (let parent of base.set)
            for (let config of configs)
                set.push(Modifier.get(parent, config));
        return tag;
    }
}
function sameArray(a, b) {
    return a.length == b.length && a.every((x, i) => x == b[i]);
}
function permute(array) {
    let result = [array];
    for (let i = 0; i < array.length; i++) {
        for (let a of permute(array.slice(0, i).concat(array.slice(i + 1))))
            result.push(a);
    }
    return result;
}
/// This function is used to add a set of tags to a language syntax
/// via
/// [`Parser.configure`](https://lezer.codemirror.net/docs/ref#lezer.Parser.configure).
///
/// The argument object maps node selectors to [highlighting
/// tags](#highlight.Tag) or arrays of tags.
///
/// Node selectors may hold one or more (space-separated) node paths.
/// Such a path can be a [node
/// name](https://lezer.codemirror.net/docs/ref#tree.NodeType.name),
/// or multiple node names (or `*` wildcards) separated by slash
/// characters, as in `"Block/Declaration/VariableName"`. Such a path
/// matches the final node but only if its direct parent nodes are the
/// other nodes mentioned. A `*` in such a path matches any parent,
/// but only a single level—wildcards that match multiple parents
/// aren't supported, both for efficiency reasons and because Lezer
/// trees make it rather hard to reason about what they would match.)
///
/// A path can be ended with `/...` to indicate that the tag assigned
/// to the node should also apply to all child nodes, even if they
/// match their own style (by default, only the innermost style is
/// used).
///
/// When a path ends in `!`, as in `Attribute!`, no further matching
/// happens for the node's child nodes, and the entire node gets the
/// given style.
///
/// In this notation, node names that contain `/`, `!`, `*`, or `...`
/// must be quoted as JSON strings.
///
/// For example:
///
/// ```javascript
/// parser.withProps(
///   styleTags({
///     // Style Number and BigNumber nodes
///     "Number BigNumber": tags.number,
///     // Style Escape nodes whose parent is String
///     "String/Escape": tags.escape,
///     // Style anything inside Attributes nodes
///     "Attributes!": tags.meta,
///     // Add a style to all content inside Italic nodes
///     "Italic/...": tags.emphasis,
///     // Style InvalidString nodes as both `string` and `invalid`
///     "InvalidString": [tags.string, tags.invalid],
///     // Style the node named "/" as punctuation
///     '"/"': tags.punctuation
///   })
/// )
/// ```
function styleTags(spec) {
    let byName = Object.create(null);
    for (let prop in spec) {
        let tags = spec[prop];
        if (!Array.isArray(tags))
            tags = [tags];
        for (let part of prop.split(" "))
            if (part) {
                let pieces = [], mode = 2 /* Normal */, rest = part;
                for (let pos = 0;;) {
                    if (rest == "..." && pos > 0 && pos + 3 == part.length) {
                        mode = 1 /* Inherit */;
                        break;
                    }
                    let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
                    if (!m)
                        throw new RangeError("Invalid path: " + part);
                    pieces.push(m[0] == "*" ? null : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
                    pos += m[0].length;
                    if (pos == part.length)
                        break;
                    let next = part[pos++];
                    if (pos == part.length && next == "!") {
                        mode = 0 /* Opaque */;
                        break;
                    }
                    if (next != "/")
                        throw new RangeError("Invalid path: " + part);
                    rest = part.slice(pos);
                }
                let last = pieces.length - 1, inner = pieces[last];
                if (!inner)
                    throw new RangeError("Invalid path: " + part);
                let rule = new Rule(tags, mode, last > 0 ? pieces.slice(0, last) : null);
                byName[inner] = rule.sort(byName[inner]);
            }
    }
    return ruleNodeProp.add(byName);
}
const ruleNodeProp = new NodeProp();
const highlightStyle = Facet.define({
    combine(stylings) { return stylings.length ? HighlightStyle.combinedMatch(stylings) : null; }
});
const fallbackHighlightStyle = Facet.define({
    combine(values) { return values.length ? values[0].match : null; }
});
function noHighlight() { return null; }
function getHighlightStyle(state) {
    return state.facet(highlightStyle) || state.facet(fallbackHighlightStyle) || noHighlight;
}
class Rule {
    constructor(tags, mode, context, next) {
        this.tags = tags;
        this.mode = mode;
        this.context = context;
        this.next = next;
    }
    sort(other) {
        if (!other || other.depth < this.depth) {
            this.next = other;
            return this;
        }
        other.next = this.sort(other.next);
        return other;
    }
    get depth() { return this.context ? this.context.length : 0; }
}
/// A highlight style associates CSS styles with higlighting
/// [tags](#highlight.Tag).
class HighlightStyle {
    constructor(spec, options) {
        this.map = Object.create(null);
        let modSpec;
        function def(spec) {
            let cls = StyleModule.newName();
            (modSpec || (modSpec = Object.create(null)))["." + cls] = spec;
            return cls;
        }
        this.all = typeof options.all == "string" ? options.all : options.all ? def(options.all) : null;
        for (let style of spec) {
            let cls = (style.class || def(Object.assign({}, style, { tag: null }))) +
                (this.all ? " " + this.all : "");
            let tags = style.tag;
            if (!Array.isArray(tags))
                this.map[tags.id] = cls;
            else
                for (let tag of tags)
                    this.map[tag.id] = cls;
        }
        this.module = modSpec ? new StyleModule(modSpec) : null;
        this.scope = options.scope || null;
        this.match = this.match.bind(this);
        let ext = [treeHighlighter];
        if (this.module)
            ext.push(EditorView.styleModule.of(this.module));
        this.extension = ext.concat(highlightStyle.of(this));
        this.fallback = ext.concat(fallbackHighlightStyle.of(this));
    }
    /// Returns the CSS class associated with the given tag, if any.
    /// This method is bound to the instance by the constructor.
    match(tag, scope) {
        if (this.scope && scope != this.scope)
            return null;
        for (let t of tag.set) {
            let match = this.map[t.id];
            if (match !== undefined) {
                if (t != tag)
                    this.map[tag.id] = match;
                return match;
            }
        }
        return this.map[tag.id] = this.all;
    }
    /// Combines an array of highlight styles into a single match
    /// function that returns all of the classes assigned by the styles
    /// for a given tag.
    static combinedMatch(styles) {
        if (styles.length == 1)
            return styles[0].match;
        let cache = styles.some(s => s.scope) ? undefined : Object.create(null);
        return (tag, scope) => {
            let cached = cache && cache[tag.id];
            if (cached !== undefined)
                return cached;
            let result = null;
            for (let style of styles) {
                let value = style.match(tag, scope);
                if (value)
                    result = result ? result + " " + value : value;
            }
            if (cache)
                cache[tag.id] = result;
            return result;
        };
    }
    /// Create a highlighter style that associates the given styles to
    /// the given tags. The spec must be objects that hold a style tag
    /// or array of tags in their `tag` property, and either a single
    /// `class` property providing a static CSS class (for highlighters
    /// like [`classHighlightStyle`](#highlight.classHighlightStyle)
    /// that rely on external styling), or a
    /// [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
    /// set of CSS properties (which define the styling for those tags).
    ///
    /// The CSS rules created for a highlighter will be emitted in the
    /// order of the spec's properties. That means that for elements that
    /// have multiple tags associated with them, styles defined further
    /// down in the list will have a higher CSS precedence than styles
    /// defined earlier.
    static define(specs, options) {
        return new HighlightStyle(specs, options || {});
    }
    /// Returns the CSS classes (if any) that the highlight styles
    /// active in the given state would assign to the given a style
    /// [tag](#highlight.Tag) and (optional) language
    /// [scope](#highlight.HighlightStyle^define^options.scope).
    static get(state, tag, scope) {
        return getHighlightStyle(state)(tag, scope || NodeType.none);
    }
}
class TreeHighlighter {
    constructor(view) {
        this.markCache = Object.create(null);
        this.tree = syntaxTree(view.state);
        this.decorations = this.buildDeco(view, getHighlightStyle(view.state));
    }
    update(update) {
        let tree = syntaxTree(update.state), style = getHighlightStyle(update.state);
        let styleChange = style != update.startState.facet(highlightStyle);
        if (tree.length < update.view.viewport.to && !styleChange) {
            this.decorations = this.decorations.map(update.changes);
        }
        else if (tree != this.tree || update.viewportChanged || styleChange) {
            this.tree = tree;
            this.decorations = this.buildDeco(update.view, style);
        }
    }
    buildDeco(view, match) {
        if (match == noHighlight || !this.tree.length)
            return Decoration.none;
        let builder = new RangeSetBuilder();
        for (let { from, to } of view.visibleRanges) {
            highlightTreeRange(this.tree, from, to, match, (from, to, style) => {
                builder.add(from, to, this.markCache[style] || (this.markCache[style] = Decoration.mark({ class: style })));
            });
        }
        return builder.finish();
    }
}
// This extension installs a highlighter that highlights based on the
// syntax tree and highlight style.
const treeHighlighter = Prec.fallback(ViewPlugin.fromClass(TreeHighlighter, {
    decorations: v => v.decorations
}));
const nodeStack = [""];
function highlightTreeRange(tree, from, to, style, span) {
    let spanStart = from, spanClass = "";
    let cursor = tree.topNode.cursor;
    function node(inheritedClass, depth, scope) {
        let { type, from: start, to: end } = cursor;
        if (start >= to || end <= from)
            return;
        nodeStack[depth] = type.name;
        if (type.isTop)
            scope = type;
        let cls = inheritedClass;
        let rule = type.prop(ruleNodeProp), opaque = false;
        while (rule) {
            if (!rule.context || matchContext(rule.context, nodeStack, depth)) {
                for (let tag of rule.tags) {
                    let st = style(tag, scope);
                    if (st) {
                        if (cls)
                            cls += " ";
                        cls += st;
                        if (rule.mode == 1 /* Inherit */)
                            inheritedClass += (inheritedClass ? " " : "") + st;
                        else if (rule.mode == 0 /* Opaque */)
                            opaque = true;
                    }
                }
                break;
            }
            rule = rule.next;
        }
        if (cls != spanClass) {
            if (start > spanStart && spanClass)
                span(spanStart, cursor.from, spanClass);
            spanStart = start;
            spanClass = cls;
        }
        if (!opaque && cursor.firstChild()) {
            do {
                let end = cursor.to;
                node(inheritedClass, depth + 1, scope);
                if (spanClass != cls) {
                    let pos = Math.min(to, end);
                    if (pos > spanStart && spanClass)
                        span(spanStart, pos, spanClass);
                    spanStart = pos;
                    spanClass = cls;
                }
            } while (cursor.nextSibling());
            cursor.parent();
        }
    }
    node("", 0, tree.type);
}
function matchContext(context, stack, depth) {
    if (context.length > depth - 1)
        return false;
    for (let d = depth - 1, i = context.length - 1; i >= 0; i--, d--) {
        let check = context[i];
        if (check && check != stack[d])
            return false;
    }
    return true;
}
const t = Tag.define;
const comment = t(), name = t(), typeName = t(name), literal = t(), string = t(literal), number = t(literal), content = t(), heading = t(content), keyword = t(), operator = t(), punctuation = t(), bracket = t(punctuation), meta = t();
/// The default set of highlighting [tags](#highlight.Tag^define) used
/// by regular language packages and themes.
///
/// This collection is heavily biased towards programming languages,
/// and necessarily incomplete. A full ontology of syntactic
/// constructs would fill a stack of books, and be impractical to
/// write themes for. So try to make do with this set. If all else
/// fails, [open an
/// issue](https://github.com/codemirror/codemirror.next) to propose a
/// new tag, or [define](#highlight.Tag^define) a local custom tag for
/// your use case.
///
/// Note that it is not obligatory to always attach the most specific
/// tag possible to an element—if your grammar can't easily
/// distinguish a certain type of element (such as a local variable),
/// it is okay to style it as its more general variant (a variable).
/// 
/// For tags that extend some parent tag, the documentation links to
/// the parent.
const tags = {
    /// A comment.
    comment,
    /// A line [comment](#highlight.tags.comment).
    lineComment: t(comment),
    /// A block [comment](#highlight.tags.comment).
    blockComment: t(comment),
    /// A documentation [comment](#highlight.tags.comment).
    docComment: t(comment),
    /// Any kind of identifier.
    name,
    /// The [name](#highlight.tags.name) of a variable.
    variableName: t(name),
    /// A type [name](#highlight.tags.name).
    typeName: typeName,
    /// A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
    tagName: t(typeName),
    /// A property, field, or attribute [name](#highlight.tags.name).
    propertyName: t(name),
    /// The [name](#highlight.tags.name) of a class.
    className: t(name),
    /// A label [name](#highlight.tags.name).
    labelName: t(name),
    /// A namespace [name](#highlight.tags.name).
    namespace: t(name),
    /// The [name](#highlight.tags.name) of a macro.
    macroName: t(name),
    /// A literal value.
    literal,
    /// A string [literal](#highlight.tags.literal).
    string,
    /// A documentation [string](#highlight.tags.string).
    docString: t(string),
    /// A character literal (subtag of [string](#highlight.tags.string)).
    character: t(string),
    /// A number [literal](#highlight.tags.literal).
    number,
    /// An integer [number](#highlight.tags.number) literal.
    integer: t(number),
    /// A floating-point [number](#highlight.tags.number) literal.
    float: t(number),
    /// A boolean [literal](#highlight.tags.literal).
    bool: t(literal),
    /// Regular expression [literal](#highlight.tags.literal).
    regexp: t(literal),
    /// An escape [literal](#highlight.tags.literal), for example a
    /// backslash escape in a string.
    escape: t(literal),
    /// A color [literal](#highlight.tags.literal).
    color: t(literal),
    /// A URL [literal](#highlight.tags.literal).
    url: t(literal),
    /// A language keyword.
    keyword,
    /// The [keyword](#highlight.tags.keyword) for the self or this
    /// object.
    self: t(keyword),
    /// The [keyword](#highlight.tags.keyword) for null.
    null: t(keyword),
    /// A [keyword](#highlight.tags.keyword) denoting some atomic value.
    atom: t(keyword),
    /// A [keyword](#highlight.tags.keyword) that represents a unit.
    unit: t(keyword),
    /// A modifier [keyword](#highlight.tags.keyword).
    modifier: t(keyword),
    /// A [keyword](#highlight.tags.keyword) that acts as an operator.
    operatorKeyword: t(keyword),
    /// A control-flow related [keyword](#highlight.tags.keyword).
    controlKeyword: t(keyword),
    /// A [keyword](#highlight.tags.keyword) that defines something.
    definitionKeyword: t(keyword),
    /// An operator.
    operator,
    /// An [operator](#highlight.tags.operator) that defines something.
    derefOperator: t(operator),
    /// Arithmetic-related [operator](#highlight.tags.operator).
    arithmeticOperator: t(operator),
    /// Logical [operator](#highlight.tags.operator).
    logicOperator: t(operator),
    /// Bit [operator](#highlight.tags.operator).
    bitwiseOperator: t(operator),
    /// Comparison [operator](#highlight.tags.operator).
    compareOperator: t(operator),
    /// [Operator](#highlight.tags.operator) that updates its operand.
    updateOperator: t(operator),
    /// [Operator](#highlight.tags.operator) that defines something.
    definitionOperator: t(operator),
    /// Type-related [operator](#highlight.tags.operator).
    typeOperator: t(operator),
    /// Control-flow [operator](#highlight.tags.operator).
    controlOperator: t(operator),
    /// Program or markup punctuation.
    punctuation,
    /// [Punctuation](#highlight.tags.punctuation) that separates
    /// things.
    separator: t(punctuation),
    /// Bracket-style [punctuation](#highlight.tags.punctuation).
    bracket,
    /// Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
    /// tokens).
    angleBracket: t(bracket),
    /// Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
    /// tokens).
    squareBracket: t(bracket),
    /// Parentheses (usually `(` and `)` tokens). Subtag of
    /// [bracket](#highlight.tags.bracket).
    paren: t(bracket),
    /// Braces (usually `{` and `}` tokens). Subtag of
    /// [bracket](#highlight.tags.bracket).
    brace: t(bracket),
    /// Content, for example plain text in XML or markup documents.
    content,
    /// [Content](#highlight.tags.content) that represents a heading.
    heading,
    /// A level 1 [heading](#highlight.tags.heading).
    heading1: t(heading),
    /// A level 2 [heading](#highlight.tags.heading).
    heading2: t(heading),
    /// A level 3 [heading](#highlight.tags.heading).
    heading3: t(heading),
    /// A level 4 [heading](#highlight.tags.heading).
    heading4: t(heading),
    /// A level 5 [heading](#highlight.tags.heading).
    heading5: t(heading),
    /// A level 6 [heading](#highlight.tags.heading).
    heading6: t(heading),
    /// A prose separator (such as a horizontal rule).
    contentSeparator: t(content),
    /// [Content](#highlight.tags.content) that represents a list.
    list: t(content),
    /// [Content](#highlight.tags.content) that represents a quote.
    quote: t(content),
    /// [Content](#highlight.tags.content) that is emphasized.
    emphasis: t(content),
    /// [Content](#highlight.tags.content) that is styled strong.
    strong: t(content),
    /// [Content](#highlight.tags.content) that is part of a link.
    link: t(content),
    /// [Content](#highlight.tags.content) that is styled as code or
    /// monospace.
    monospace: t(content),
    /// Inserted text in a change-tracking format.
    inserted: t(),
    /// Deleted text.
    deleted: t(),
    /// Changed text.
    changed: t(),
    /// An invalid or unsyntactic element.
    invalid: t(),
    /// Metadata or meta-instruction.
    meta,
    /// [Metadata](#highlight.tags.meta) that applies to the entire
    /// document.
    documentMeta: t(meta),
    /// [Metadata](#highlight.tags.meta) that annotates or adds
    /// attributes to a given syntactic element.
    annotation: t(meta),
    /// Processing instruction or preprocessor directive. Subtag of
    /// [meta](#highlight.tags.meta).
    processingInstruction: t(meta),
    /// [Modifier](#highlight.Tag^defineModifier) that indicates that a
    /// given element is being defined. Expected to be used with the
    /// various [name](#highlight.tags.name) tags.
    definition: Tag.defineModifier(),
    /// [Modifier](#highlight.Tag^defineModifier) that indicates that
    /// something is constant. Mostly expected to be used with
    /// [variable names](#highlight.tags.variableName).
    constant: Tag.defineModifier(),
    /// [Modifier](#highlight.Tag^defineModifier) used to indicate that
    /// a [variable](#highlight.tags.variableName) or [property
    /// name](#highlight.tags.propertyName) is being called or defined
    /// as a function.
    function: Tag.defineModifier(),
    /// [Modifier](#highlight.Tag^defineModifier) that can be applied to
    /// [names](#highlight.tags.name) to indicate that they belong to
    /// the language's standard environment.
    standard: Tag.defineModifier(),
    /// [Modifier](#highlight.Tag^defineModifier) that indicates a given
    /// [names](#highlight.tags.name) is local to some scope.
    local: Tag.defineModifier(),
    /// A generic variant [modifier](#highlight.Tag^defineModifier) that
    /// can be used to tag language-specific alternative variants of
    /// some common tag. It is recommended for themes to define special
    /// forms of at least the [string](#highlight.tags.string) and
    /// [variable name](#highlight.tags.variableName) tags, since those
    /// come up a lot.
    special: Tag.defineModifier()
};
/// A default highlight style (works well with light themes).
const defaultHighlightStyle = HighlightStyle.define([
    { tag: tags.link,
        textDecoration: "underline" },
    { tag: tags.heading,
        textDecoration: "underline",
        fontWeight: "bold" },
    { tag: tags.emphasis,
        fontStyle: "italic" },
    { tag: tags.strong,
        fontWeight: "bold" },
    { tag: tags.keyword,
        color: "#708" },
    { tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
        color: "#219" },
    { tag: [tags.literal, tags.inserted],
        color: "#164" },
    { tag: [tags.string, tags.deleted],
        color: "#a11" },
    { tag: [tags.regexp, tags.escape, tags.special(tags.string)],
        color: "#e40" },
    { tag: tags.definition(tags.variableName),
        color: "#00f" },
    { tag: tags.local(tags.variableName),
        color: "#30a" },
    { tag: [tags.typeName, tags.namespace],
        color: "#085" },
    { tag: tags.className,
        color: "#167" },
    { tag: [tags.special(tags.variableName), tags.macroName],
        color: "#256" },
    { tag: tags.definition(tags.propertyName),
        color: "#00c" },
    { tag: tags.comment,
        color: "#940" },
    { tag: tags.meta,
        color: "#7a757a" },
    { tag: tags.invalid,
        color: "#f00" }
]);
/// This is a highlight style that adds stable, predictable classes to
/// tokens, for styling with external CSS.
///
/// These tags are mapped to their name prefixed with `"cmt-"` (for
/// example `"cmt-comment"`):
///
/// * [`link`](#highlight.tags.link)
/// * [`heading`](#highlight.tags.heading)
/// * [`emphasis`](#highlight.tags.emphasis)
/// * [`strong`](#highlight.tags.strong)
/// * [`keyword`](#highlight.tags.keyword)
/// * [`atom`](#highlight.tags.atom) [`bool`](#highlight.tags.bool)
/// * [`url`](#highlight.tags.url)
/// * [`labelName`](#highlight.tags.labelName)
/// * [`inserted`](#highlight.tags.inserted)
/// * [`deleted`](#highlight.tags.deleted)
/// * [`literal`](#highlight.tags.literal)
/// * [`string`](#highlight.tags.string)
/// * [`number`](#highlight.tags.number)
/// * [`variableName`](#highlight.tags.variableName)
/// * [`typeName`](#highlight.tags.typeName)
/// * [`namespace`](#highlight.tags.namespace)
/// * [`macroName`](#highlight.tags.macroName)
/// * [`propertyName`](#highlight.tags.propertyName)
/// * [`operator`](#highlight.tags.operator)
/// * [`comment`](#highlight.tags.comment)
/// * [`meta`](#highlight.tags.meta)
/// * [`punctuation`](#highlight.tags.puncutation)
/// * [`invalid`](#highlight.tags.invalid)
///
/// In addition, these mappings are provided:
///
/// * [`regexp`](#highlight.tags.regexp),
///   [`escape`](#highlight.tags.escape), and
///   [`special`](#highlight.tags.special)[`(string)`](#highlight.tags.string)
///   are mapped to `"cmt-string2"`
/// * [`special`](#highlight.tags.special)[`(variableName)`](#highlight.tags.variableName)
///   to `"cmt-variableName2"`
/// * [`local`](#highlight.tags.local)[`(variableName)`](#highlight.tags.variableName)
///   to `"cmt-variableName cmt-local"`
/// * [`definition`](#highlight.tags.definition)[`(variableName)`](#highlight.tags.variableName)
///   to `"cmt-variableName cmt-definition"`
HighlightStyle.define([
    { tag: tags.link, class: "cmt-link" },
    { tag: tags.heading, class: "cmt-heading" },
    { tag: tags.emphasis, class: "cmt-emphasis" },
    { tag: tags.strong, class: "cmt-strong" },
    { tag: tags.keyword, class: "cmt-keyword" },
    { tag: tags.atom, class: "cmt-atom" },
    { tag: tags.bool, class: "cmt-bool" },
    { tag: tags.url, class: "cmt-url" },
    { tag: tags.labelName, class: "cmt-labelName" },
    { tag: tags.inserted, class: "cmt-inserted" },
    { tag: tags.deleted, class: "cmt-deleted" },
    { tag: tags.literal, class: "cmt-literal" },
    { tag: tags.string, class: "cmt-string" },
    { tag: tags.number, class: "cmt-number" },
    { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "cmt-string2" },
    { tag: tags.variableName, class: "cmt-variableName" },
    { tag: tags.local(tags.variableName), class: "cmt-variableName cmt-local" },
    { tag: tags.definition(tags.variableName), class: "cmt-variableName cmt-definition" },
    { tag: tags.special(tags.variableName), class: "cmt-variableName2" },
    { tag: tags.typeName, class: "cmt-typeName" },
    { tag: tags.namespace, class: "cmt-namespace" },
    { tag: tags.macroName, class: "cmt-macroName" },
    { tag: tags.propertyName, class: "cmt-propertyName" },
    { tag: tags.operator, class: "cmt-operator" },
    { tag: tags.comment, class: "cmt-comment" },
    { tag: tags.meta, class: "cmt-meta" },
    { tag: tags.invalid, class: "cmt-invalid" },
    { tag: tags.punctuation, class: "cmt-punctuation" }
]);

export { autocompletion as a, styleTags as b, completionKeymap as c, defaultHighlightStyle as d, completeFromList as e, hoverTooltip as h, ifNotIn as i, snippetCompletion as s, tags as t };
