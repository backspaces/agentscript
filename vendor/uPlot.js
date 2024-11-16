const FEAT_TIME          = true;
const pre = "u-";
const UPLOT          =       "uplot";
const ORI_HZ         = pre + "hz";
const ORI_VT         = pre + "vt";
const TITLE          = pre + "title";
const WRAP           = pre + "wrap";
const UNDER          = pre + "under";
const OVER           = pre + "over";
const AXIS           = pre + "axis";
const OFF            = pre + "off";
const SELECT         = pre + "select";
const CURSOR_X       = pre + "cursor-x";
const CURSOR_Y       = pre + "cursor-y";
const CURSOR_PT      = pre + "cursor-pt";
const LEGEND         = pre + "legend";
const LEGEND_LIVE    = pre + "live";
const LEGEND_INLINE  = pre + "inline";
const LEGEND_SERIES  = pre + "series";
const LEGEND_MARKER  = pre + "marker";
const LEGEND_LABEL   = pre + "label";
const LEGEND_VALUE   = pre + "value";
const WIDTH       = "width";
const HEIGHT      = "height";
const TOP         = "top";
const BOTTOM      = "bottom";
const LEFT        = "left";
const RIGHT       = "right";
const hexBlack    = "#000";
const transparent = hexBlack + "0";
const mousemove   = "mousemove";
const mousedown   = "mousedown";
const mouseup     = "mouseup";
const mouseenter  = "mouseenter";
const mouseleave  = "mouseleave";
const dblclick    = "dblclick";
const resize      = "resize";
const scroll      = "scroll";
const change      = "change";
const dppxchange  = "dppxchange";
const LEGEND_DISP = "--";
const domEnv = typeof window != 'undefined';
const doc = domEnv ? document  : null;
const win = domEnv ? window    : null;
const nav = domEnv ? navigator : null;
let pxRatio;
let query;
function setPxRatio() {
	let _pxRatio = devicePixelRatio;
	if (pxRatio != _pxRatio) {
		pxRatio = _pxRatio;
		query && off(change, query, setPxRatio);
		query = matchMedia(`(min-resolution: ${pxRatio - 0.001}dppx) and (max-resolution: ${pxRatio + 0.001}dppx)`);
		on(change, query, setPxRatio);
		win.dispatchEvent(new CustomEvent(dppxchange));
	}
}
function addClass(el, c) {
	if (c != null) {
		let cl = el.classList;
		!cl.contains(c) && cl.add(c);
	}
}
function remClass(el, c) {
	let cl = el.classList;
	cl.contains(c) && cl.remove(c);
}
function setStylePx(el, name, value) {
	el.style[name] = value + "px";
}
function placeTag(tag, cls, targ, refEl) {
	let el = doc.createElement(tag);
	if (cls != null)
		addClass(el, cls);
	if (targ != null)
		targ.insertBefore(el, refEl);
	return el;
}
function placeDiv(cls, targ) {
	return placeTag("div", cls, targ);
}
const xformCache = new WeakMap();
function elTrans(el, xPos, yPos, xMax, yMax) {
	let xform = "translate(" + xPos + "px," + yPos + "px)";
	let xformOld = xformCache.get(el);
	if (xform != xformOld) {
		el.style.transform = xform;
		xformCache.set(el, xform);
		if (xPos < 0 || yPos < 0 || xPos > xMax || yPos > yMax)
			addClass(el, OFF);
		else
			remClass(el, OFF);
	}
}
const colorCache = new WeakMap();
function elColor(el, background, borderColor) {
	let newColor = background + borderColor;
	let oldColor = colorCache.get(el);
	if (newColor != oldColor) {
		colorCache.set(el, newColor);
		el.style.background = background;
		el.style.borderColor = borderColor;
	}
}
const sizeCache = new WeakMap();
function elSize(el, newWid, newHgt, centered) {
	let newSize = newWid + "" + newHgt;
	let oldSize = sizeCache.get(el);
	if (newSize != oldSize) {
		sizeCache.set(el, newSize);
		el.style.height = newHgt + "px";
		el.style.width = newWid + "px";
		el.style.marginLeft = centered ? -newWid/2 + "px" : 0;
		el.style.marginTop = centered ? -newHgt/2 + "px" : 0;
	}
}
const evOpts = {passive: true};
const evOpts2 = {...evOpts, capture: true};
function on(ev, el, cb, capt) {
	el.addEventListener(ev, cb, capt ? evOpts2 : evOpts);
}
function off(ev, el, cb, capt) {
	el.removeEventListener(ev, cb, evOpts);
}
domEnv && setPxRatio();
function closestIdx(num, arr, lo, hi) {
	let mid;
	lo = lo || 0;
	hi = hi || arr.length - 1;
	let bitwise = hi <= 2147483647;
	while (hi - lo > 1) {
		mid = bitwise ? (lo + hi) >> 1 : floor((lo + hi) / 2);
		if (arr[mid] < num)
			lo = mid;
		else
			hi = mid;
	}
	if (num - arr[lo] <= arr[hi] - num)
		return lo;
	return hi;
}
function nonNullIdx(data, _i0, _i1, dir) {
	for (let i = dir == 1 ? _i0 : _i1; i >= _i0 && i <= _i1; i += dir) {
		if (data[i] != null)
			return i;
	}
	return -1;
}
function getMinMax(data, _i0, _i1, sorted) {
	let _min = inf;
	let _max = -inf;
	if (sorted == 1) {
		_min = data[_i0];
		_max = data[_i1];
	}
	else if (sorted == -1) {
		_min = data[_i1];
		_max = data[_i0];
	}
	else {
		for (let i = _i0; i <= _i1; i++) {
			let v = data[i];
			if (v != null) {
				if (v < _min)
					_min = v;
				if (v > _max)
					_max = v;
			}
		}
	}
	return [_min, _max];
}
function getMinMaxLog(data, _i0, _i1) {
	let _min = inf;
	let _max = -inf;
	for (let i = _i0; i <= _i1; i++) {
		let v = data[i];
		if (v != null && v > 0) {
			if (v < _min)
				_min = v;
			if (v > _max)
				_max = v;
		}
	}
	return [_min, _max];
}
function rangeLog(min, max, base, fullMags) {
	let minSign = sign(min);
	let maxSign = sign(max);
	if (min == max) {
		if (minSign == -1) {
			min *= base;
			max /= base;
		}
		else {
			min /= base;
			max *= base;
		}
	}
	let logFn = base == 10 ? log10 : log2;
	let growMinAbs = minSign == 1 ? floor : ceil;
	let growMaxAbs = maxSign == 1 ? ceil : floor;
	let minExp = growMinAbs(logFn(abs(min)));
	let maxExp = growMaxAbs(logFn(abs(max)));
	let minIncr = pow(base, minExp);
	let maxIncr = pow(base, maxExp);
	if (base == 10) {
		if (minExp < 0)
			minIncr = roundDec(minIncr, -minExp);
		if (maxExp < 0)
			maxIncr = roundDec(maxIncr, -maxExp);
	}
	if (fullMags || base == 2) {
		min = minIncr * minSign;
		max = maxIncr * maxSign;
	}
	else {
		min = incrRoundDn(min, minIncr);
		max = incrRoundUp(max, maxIncr);
	}
	return [min, max];
}
function rangeAsinh(min, max, base, fullMags) {
	let minMax = rangeLog(min, max, base, fullMags);
	if (min == 0)
		minMax[0] = 0;
	if (max == 0)
		minMax[1] = 0;
	return minMax;
}
const rangePad = 0.1;
const autoRangePart = {
	mode: 3,
	pad: rangePad,
};
const _eqRangePart = {
	pad:  0,
	soft: null,
	mode: 0,
};
const _eqRange = {
	min: _eqRangePart,
	max: _eqRangePart,
};
function rangeNum(_min, _max, mult, extra) {
	if (isObj(mult))
		return _rangeNum(_min, _max, mult);
	_eqRangePart.pad  = mult;
	_eqRangePart.soft = extra ? 0 : null;
	_eqRangePart.mode = extra ? 3 : 0;
	return _rangeNum(_min, _max, _eqRange);
}
function ifNull(lh, rh) {
	return lh == null ? rh : lh;
}
function hasData(data, idx0, idx1) {
	idx0 = ifNull(idx0, 0);
	idx1 = ifNull(idx1, data.length - 1);
	while (idx0 <= idx1) {
		if (data[idx0] != null)
			return true;
		idx0++;
	}
	return false;
}
function _rangeNum(_min, _max, cfg) {
	let cmin = cfg.min;
	let cmax = cfg.max;
	let padMin = ifNull(cmin.pad, 0);
	let padMax = ifNull(cmax.pad, 0);
	let hardMin = ifNull(cmin.hard, -inf);
	let hardMax = ifNull(cmax.hard,  inf);
	let softMin = ifNull(cmin.soft,  inf);
	let softMax = ifNull(cmax.soft, -inf);
	let softMinMode = ifNull(cmin.mode, 0);
	let softMaxMode = ifNull(cmax.mode, 0);
	let delta = _max - _min;
	let deltaMag = log10(delta);
	let scalarMax = max(abs(_min), abs(_max));
	let scalarMag = log10(scalarMax);
	let scalarMagDelta = abs(scalarMag - deltaMag);
	if (delta < 1e-24 || scalarMagDelta > 10) {
		delta = 0;
		if (_min == 0 || _max == 0) {
			delta = 1e-24;
			if (softMinMode == 2 && softMin != inf)
				padMin = 0;
			if (softMaxMode == 2 && softMax != -inf)
				padMax = 0;
		}
	}
	let nonZeroDelta = delta || scalarMax || 1e3;
	let mag          = log10(nonZeroDelta);
	let base         = pow(10, floor(mag));
	let _padMin  = nonZeroDelta * (delta == 0 ? (_min == 0 ? .1 : 1) : padMin);
	let _newMin  = roundDec(incrRoundDn(_min - _padMin, base/10), 24);
	let _softMin = _min >= softMin && (softMinMode == 1 || softMinMode == 3 && _newMin <= softMin || softMinMode == 2 && _newMin >= softMin) ? softMin : inf;
	let minLim   = max(hardMin, _newMin < _softMin && _min >= _softMin ? _softMin : min(_softMin, _newMin));
	let _padMax  = nonZeroDelta * (delta == 0 ? (_max == 0 ? .1 : 1) : padMax);
	let _newMax  = roundDec(incrRoundUp(_max + _padMax, base/10), 24);
	let _softMax = _max <= softMax && (softMaxMode == 1 || softMaxMode == 3 && _newMax >= softMax || softMaxMode == 2 && _newMax <= softMax) ? softMax : -inf;
	let maxLim   = min(hardMax, _newMax > _softMax && _max <= _softMax ? _softMax : max(_softMax, _newMax));
	if (minLim == maxLim && minLim == 0)
		maxLim = 100;
	return [minLim, maxLim];
}
const numFormatter = new Intl.NumberFormat(domEnv ? nav.language : 'en-US');
const fmtNum = val => numFormatter.format(val);
const M = Math;
const PI = M.PI;
const abs = M.abs;
const floor = M.floor;
const round = M.round;
const ceil = M.ceil;
const min = M.min;
const max = M.max;
const pow = M.pow;
const sign = M.sign;
const log10 = M.log10;
const log2 = M.log2;
const sinh =  (v, linthresh = 1) => M.sinh(v) * linthresh;
const asinh = (v, linthresh = 1) => M.asinh(v / linthresh);
const inf = Infinity;
function numIntDigits(x) {
	return (log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
}
function clamp(num, _min, _max) {
	return min(max(num, _min), _max);
}
function fnOrSelf(v) {
	return typeof v == "function" ? v : () => v;
}
const noop = () => {};
const retArg0 = _0 => _0;
const retArg1 = (_0, _1) => _1;
const retNull = _ => null;
const retTrue = _ => true;
const retEq = (a, b) => a == b;
const regex6 = /\.\d*?(?=9{6,}|0{6,})/gm;
const fixFloat = val => {
	if (isInt(val) || fixedDec.has(val))
		return val;
	const str = `${val}`;
	const match = str.match(regex6);
	if (match == null)
		return val;
	let len = match[0].length - 1;
	if (str.indexOf('e-') != -1) {
		let [num, exp] = str.split('e');
		return +`${fixFloat(num)}e${exp}`;
	}
	return roundDec(val, len);
};
function incrRound(num, incr) {
	return fixFloat(roundDec(fixFloat(num/incr))*incr);
}
function incrRoundUp(num, incr) {
	return fixFloat(ceil(fixFloat(num/incr))*incr);
}
function incrRoundDn(num, incr) {
	return fixFloat(floor(fixFloat(num/incr))*incr);
}
function roundDec(val, dec = 0) {
	if (isInt(val))
		return val;
	let p = 10 ** dec;
	let n = (val * p) * (1 + Number.EPSILON);
	return round(n) / p;
}
const fixedDec = new Map();
function guessDec(num) {
	return ((""+num).split(".")[1] || "").length;
}
function genIncrs(base, minExp, maxExp, mults) {
	let incrs = [];
	let multDec = mults.map(guessDec);
	for (let exp = minExp; exp < maxExp; exp++) {
		let expa = abs(exp);
		let mag = roundDec(pow(base, exp), expa);
		for (let i = 0; i < mults.length; i++) {
			let _incr = base == 10 ? +`${mults[i]}e${exp}` : mults[i] * mag;
			let dec = (exp >= 0 ? 0 : expa) + (exp >= multDec[i] ? 0 : multDec[i]);
			let incr = base == 10 ? _incr : roundDec(_incr, dec);
			incrs.push(incr);
			fixedDec.set(incr, dec);
		}
	}
	return incrs;
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const nullNullTuple = [null, null];
const isArr = Array.isArray;
const isInt = Number.isInteger;
const isUndef = v => v === void 0;
function isStr(v) {
	return typeof v == 'string';
}
function isObj(v) {
	let is = false;
	if (v != null) {
		let c = v.constructor;
		is = c == null || c == Object;
	}
	return is;
}
function fastIsObj(v) {
	return v != null && typeof v == 'object';
}
const TypedArray = Object.getPrototypeOf(Uint8Array);
const __proto__ = "__proto__";
function copy(o, _isObj = isObj) {
	let out;
	if (isArr(o)) {
		let val = o.find(v => v != null);
		if (isArr(val) || _isObj(val)) {
			out = Array(o.length);
			for (let i = 0; i < o.length; i++)
				out[i] = copy(o[i], _isObj);
		}
		else
			out = o.slice();
	}
	else if (o instanceof TypedArray)
		out = o.slice();
	else if (_isObj(o)) {
		out = {};
		for (let k in o) {
			if (k != __proto__)
				out[k] = copy(o[k], _isObj);
		}
	}
	else
		out = o;
	return out;
}
function assign(targ) {
	let args = arguments;
	for (let i = 1; i < args.length; i++) {
		let src = args[i];
		for (let key in src) {
			if (key != __proto__) {
				if (isObj(targ[key]))
					assign(targ[key], copy(src[key]));
				else
					targ[key] = copy(src[key]);
			}
		}
	}
	return targ;
}
const NULL_REMOVE = 0;
const NULL_RETAIN = 1;
const NULL_EXPAND = 2;
function nullExpand(yVals, nullIdxs, alignedLen) {
	for (let i = 0, xi, lastNullIdx = -1; i < nullIdxs.length; i++) {
		let nullIdx = nullIdxs[i];
		if (nullIdx > lastNullIdx) {
			xi = nullIdx - 1;
			while (xi >= 0 && yVals[xi] == null)
				yVals[xi--] = null;
			xi = nullIdx + 1;
			while (xi < alignedLen && yVals[xi] == null)
				yVals[lastNullIdx = xi++] = null;
		}
	}
}
function join(tables, nullModes) {
	if (allHeadersSame(tables)) {
		let table = tables[0].slice();
		for (let i = 1; i < tables.length; i++)
			table.push(...tables[i].slice(1));
		if (!isAsc(table[0]))
			table = sortCols(table);
		return table;
	}
	let xVals = new Set();
	for (let ti = 0; ti < tables.length; ti++) {
		let t = tables[ti];
		let xs = t[0];
		let len = xs.length;
		for (let i = 0; i < len; i++)
			xVals.add(xs[i]);
	}
	let data = [Array.from(xVals).sort((a, b) => a - b)];
	let alignedLen = data[0].length;
	let xIdxs = new Map();
	for (let i = 0; i < alignedLen; i++)
		xIdxs.set(data[0][i], i);
	for (let ti = 0; ti < tables.length; ti++) {
		let t = tables[ti];
		let xs = t[0];
		for (let si = 1; si < t.length; si++) {
			let ys = t[si];
			let yVals = Array(alignedLen).fill(undefined);
			let nullMode = nullModes ? nullModes[ti][si] : NULL_RETAIN;
			let nullIdxs = [];
			for (let i = 0; i < ys.length; i++) {
				let yVal = ys[i];
				let alignedIdx = xIdxs.get(xs[i]);
				if (yVal === null) {
					if (nullMode != NULL_REMOVE) {
						yVals[alignedIdx] = yVal;
						if (nullMode == NULL_EXPAND)
							nullIdxs.push(alignedIdx);
					}
				}
				else
					yVals[alignedIdx] = yVal;
			}
			nullExpand(yVals, nullIdxs, alignedLen);
			data.push(yVals);
		}
	}
	return data;
}
const microTask = typeof queueMicrotask == "undefined" ? fn => Promise.resolve().then(fn) : queueMicrotask;
function sortCols(table) {
	let head = table[0];
	let rlen = head.length;
	let idxs = Array(rlen);
	for (let i = 0; i < idxs.length; i++)
		idxs[i] = i;
	idxs.sort((i0, i1) => head[i0] - head[i1]);
	let table2 = [];
	for (let i = 0; i < table.length; i++) {
		let row = table[i];
		let row2 = Array(rlen);
		for (let j = 0; j < rlen; j++)
			row2[j] = row[idxs[j]];
		table2.push(row2);
	}
	return table2;
}
function allHeadersSame(tables) {
	let vals0 = tables[0][0];
	let len0 = vals0.length;
	for (let i = 1; i < tables.length; i++) {
		let vals1 = tables[i][0];
		if (vals1.length != len0)
			return false;
		if (vals1 != vals0) {
			for (let j = 0; j < len0; j++) {
				if (vals1[j] != vals0[j])
					return false;
			}
		}
	}
	return true;
}
function isAsc(vals, samples = 100) {
	const len = vals.length;
	if (len <= 1)
		return true;
	let firstIdx = 0;
	let lastIdx = len - 1;
	while (firstIdx <= lastIdx && vals[firstIdx] == null)
		firstIdx++;
	while (lastIdx >= firstIdx && vals[lastIdx] == null)
		lastIdx--;
	if (lastIdx <= firstIdx)
		return true;
	const stride = max(1, floor((lastIdx - firstIdx + 1) / samples));
	for (let prevVal = vals[firstIdx], i = firstIdx + stride; i <= lastIdx; i += stride) {
		const v = vals[i];
		if (v != null) {
			if (v <= prevVal)
				return false;
			prevVal = v;
		}
	}
	return true;
}
const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
const days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
function slice3(str) {
	return str.slice(0, 3);
}
const days3 = days.map(slice3);
const months3 = months.map(slice3);
const engNames = {
	MMMM: months,
	MMM:  months3,
	WWWW: days,
	WWW:  days3,
};
function zeroPad2(int) {
	return (int < 10 ? '0' : '') + int;
}
function zeroPad3(int) {
	return (int < 10 ? '00' : int < 100 ? '0' : '') + int;
}
const subs = {
	YYYY:	d => d.getFullYear(),
	YY:		d => (d.getFullYear()+'').slice(2),
	MMMM:	(d, names) => names.MMMM[d.getMonth()],
	MMM:	(d, names) => names.MMM[d.getMonth()],
	MM:		d => zeroPad2(d.getMonth()+1),
	M:		d => d.getMonth()+1,
	DD:		d => zeroPad2(d.getDate()),
	D:		d => d.getDate(),
	WWWW:	(d, names) => names.WWWW[d.getDay()],
	WWW:	(d, names) => names.WWW[d.getDay()],
	HH:		d => zeroPad2(d.getHours()),
	H:		d => d.getHours(),
	h:		d => {let h = d.getHours(); return h == 0 ? 12 : h > 12 ? h - 12 : h;},
	AA:		d => d.getHours() >= 12 ? 'PM' : 'AM',
	aa:		d => d.getHours() >= 12 ? 'pm' : 'am',
	a:		d => d.getHours() >= 12 ? 'p' : 'a',
	mm:		d => zeroPad2(d.getMinutes()),
	m:		d => d.getMinutes(),
	ss:		d => zeroPad2(d.getSeconds()),
	s:		d => d.getSeconds(),
	fff:	d => zeroPad3(d.getMilliseconds()),
};
function fmtDate(tpl, names) {
	names = names || engNames;
	let parts = [];
	let R = /\{([a-z]+)\}|[^{]+/gi, m;
	while (m = R.exec(tpl))
		parts.push(m[0][0] == '{' ? subs[m[1]] : m[0]);
	return d => {
		let out = '';
		for (let i = 0; i < parts.length; i++)
			out += typeof parts[i] == "string" ? parts[i] : parts[i](d, names);
		return out;
	}
}
const localTz = new Intl.DateTimeFormat().resolvedOptions().timeZone;
function tzDate(date, tz) {
	let date2;
	if (tz == 'UTC' || tz == 'Etc/UTC')
		date2 = new Date(+date + date.getTimezoneOffset() * 6e4);
	else if (tz == localTz)
		date2 = date;
	else {
		date2 = new Date(date.toLocaleString('en-US', {timeZone: tz}));
		date2.setMilliseconds(date.getMilliseconds());
	}
	return date2;
}
const onlyWhole = v => v % 1 == 0;
const allMults = [1,2,2.5,5];
const decIncrs = genIncrs(10, -32, 0, allMults);
const oneIncrs = genIncrs(10, 0, 32, allMults);
const wholeIncrs = oneIncrs.filter(onlyWhole);
const numIncrs = decIncrs.concat(oneIncrs);
const NL = "\n";
const yyyy    = "{YYYY}";
const NLyyyy  = NL + yyyy;
const md      = "{M}/{D}";
const NLmd    = NL + md;
const NLmdyy  = NLmd + "/{YY}";
const aa      = "{aa}";
const hmm     = "{h}:{mm}";
const hmmaa   = hmm + aa;
const NLhmmaa = NL + hmmaa;
const ss      = ":{ss}";
const _ = null;
function genTimeStuffs(ms) {
	let	s  = ms * 1e3,
		m  = s  * 60,
		h  = m  * 60,
		d  = h  * 24,
		mo = d  * 30,
		y  = d  * 365;
	let subSecIncrs = ms == 1 ? genIncrs(10, 0, 3, allMults).filter(onlyWhole) : genIncrs(10, -3, 0, allMults);
	let timeIncrs = subSecIncrs.concat([
		s,
		s * 5,
		s * 10,
		s * 15,
		s * 30,
		m,
		m * 5,
		m * 10,
		m * 15,
		m * 30,
		h,
		h * 2,
		h * 3,
		h * 4,
		h * 6,
		h * 8,
		h * 12,
		d,
		d * 2,
		d * 3,
		d * 4,
		d * 5,
		d * 6,
		d * 7,
		d * 8,
		d * 9,
		d * 10,
		d * 15,
		mo,
		mo * 2,
		mo * 3,
		mo * 4,
		mo * 6,
		y,
		y * 2,
		y * 5,
		y * 10,
		y * 25,
		y * 50,
		y * 100,
	]);
	const _timeAxisStamps = [
		[y,           yyyy,            _,                      _,      _,                    _,      _,        _,       1],
		[d * 28,      "{MMM}",         NLyyyy,                 _,      _,                    _,      _,        _,       1],
		[d,           md,              NLyyyy,                 _,      _,                    _,      _,        _,       1],
		[h,           "{h}" + aa,      NLmdyy,                 _,      NLmd,                 _,      _,        _,       1],
		[m,           hmmaa,           NLmdyy,                 _,      NLmd,                 _,      _,        _,       1],
		[s,           ss,              NLmdyy + " " + hmmaa,   _,      NLmd + " " + hmmaa,   _,      NLhmmaa,  _,       1],
		[ms,          ss + ".{fff}",   NLmdyy + " " + hmmaa,   _,      NLmd + " " + hmmaa,   _,      NLhmmaa,  _,       1],
	];
	function timeAxisSplits(tzDate) {
		return (self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace) => {
			let splits = [];
			let isYr = foundIncr >= y;
			let isMo = foundIncr >= mo && foundIncr < y;
			let minDate = tzDate(scaleMin);
			let minDateTs = roundDec(minDate * ms, 3);
			let minMin = mkDate(minDate.getFullYear(), isYr ? 0 : minDate.getMonth(), isMo || isYr ? 1 : minDate.getDate());
			let minMinTs = roundDec(minMin * ms, 3);
			if (isMo || isYr) {
				let moIncr = isMo ? foundIncr / mo : 0;
				let yrIncr = isYr ? foundIncr / y  : 0;
				let split = minDateTs == minMinTs ? minDateTs : roundDec(mkDate(minMin.getFullYear() + yrIncr, minMin.getMonth() + moIncr, 1) * ms, 3);
				let splitDate = new Date(round(split / ms));
				let baseYear = splitDate.getFullYear();
				let baseMonth = splitDate.getMonth();
				for (let i = 0; split <= scaleMax; i++) {
					let next = mkDate(baseYear + yrIncr * i, baseMonth + moIncr * i, 1);
					let offs = next - tzDate(roundDec(next * ms, 3));
					split = roundDec((+next + offs) * ms, 3);
					if (split <= scaleMax)
						splits.push(split);
				}
			}
			else {
				let incr0 = foundIncr >= d ? d : foundIncr;
				let tzOffset = floor(scaleMin) - floor(minDateTs);
				let split = minMinTs + tzOffset + incrRoundUp(minDateTs - minMinTs, incr0);
				splits.push(split);
				let date0 = tzDate(split);
				let prevHour = date0.getHours() + (date0.getMinutes() / m) + (date0.getSeconds() / h);
				let incrHours = foundIncr / h;
				let minSpace = self.axes[axisIdx]._space;
				let pctSpace = foundSpace / minSpace;
				while (1) {
					split = roundDec(split + foundIncr, ms == 1 ? 0 : 3);
					if (split > scaleMax)
						break;
					if (incrHours > 1) {
						let expectedHour = floor(roundDec(prevHour + incrHours, 6)) % 24;
						let splitDate = tzDate(split);
						let actualHour = splitDate.getHours();
						let dstShift = actualHour - expectedHour;
						if (dstShift > 1)
							dstShift = -1;
						split -= dstShift * h;
						prevHour = (prevHour + incrHours) % 24;
						let prevSplit = splits[splits.length - 1];
						let pctIncr = roundDec((split - prevSplit) / foundIncr, 3);
						if (pctIncr * pctSpace >= .7)
							splits.push(split);
					}
					else
						splits.push(split);
				}
			}
			return splits;
		}
	}
	return [
		timeIncrs,
		_timeAxisStamps,
		timeAxisSplits,
	];
}
const [ timeIncrsMs, _timeAxisStampsMs, timeAxisSplitsMs ] = genTimeStuffs(1);
const [ timeIncrsS,  _timeAxisStampsS,  timeAxisSplitsS  ] = genTimeStuffs(1e-3);
genIncrs(2, -53, 53, [1]);
function timeAxisStamps(stampCfg, fmtDate) {
	return stampCfg.map(s => s.map((v, i) =>
		i == 0 || i == 8 || v == null ? v : fmtDate(i == 1 || s[8] == 0 ? v : s[1] + v)
	));
}
function timeAxisVals(tzDate, stamps) {
	return (self, splits, axisIdx, foundSpace, foundIncr) => {
		let s = stamps.find(s => foundIncr >= s[0]) || stamps[stamps.length - 1];
		let prevYear;
		let prevMnth;
		let prevDate;
		let prevHour;
		let prevMins;
		let prevSecs;
		return splits.map(split => {
			let date = tzDate(split);
			let newYear = date.getFullYear();
			let newMnth = date.getMonth();
			let newDate = date.getDate();
			let newHour = date.getHours();
			let newMins = date.getMinutes();
			let newSecs = date.getSeconds();
			let stamp = (
				newYear != prevYear && s[2] ||
				newMnth != prevMnth && s[3] ||
				newDate != prevDate && s[4] ||
				newHour != prevHour && s[5] ||
				newMins != prevMins && s[6] ||
				newSecs != prevSecs && s[7] ||
				                       s[1]
			);
			prevYear = newYear;
			prevMnth = newMnth;
			prevDate = newDate;
			prevHour = newHour;
			prevMins = newMins;
			prevSecs = newSecs;
			return stamp(date);
		});
	}
}
function timeAxisVal(tzDate, dateTpl) {
	let stamp = fmtDate(dateTpl);
	return (self, splits, axisIdx, foundSpace, foundIncr) => splits.map(split => stamp(tzDate(split)));
}
function mkDate(y, m, d) {
	return new Date(y, m, d);
}
function timeSeriesStamp(stampCfg, fmtDate) {
	return fmtDate(stampCfg);
}
const _timeSeriesStamp = '{YYYY}-{MM}-{DD} {h}:{mm}{aa}';
function timeSeriesVal(tzDate, stamp) {
	return (self, val, seriesIdx, dataIdx) => dataIdx == null ? LEGEND_DISP : stamp(tzDate(val));
}
function legendStroke(self, seriesIdx) {
	let s = self.series[seriesIdx];
	return s.width ? s.stroke(self, seriesIdx) : s.points.width ? s.points.stroke(self, seriesIdx) : null;
}
function legendFill(self, seriesIdx) {
	return self.series[seriesIdx].fill(self, seriesIdx);
}
const legendOpts = {
	show: true,
	live: true,
	isolate: false,
	mount: noop,
	markers: {
		show: true,
		width: 2,
		stroke: legendStroke,
		fill: legendFill,
		dash: "solid",
	},
	idx: null,
	idxs: null,
	values: [],
};
function cursorPointShow(self, si) {
	let o = self.cursor.points;
	let pt = placeDiv();
	let size = o.size(self, si);
	setStylePx(pt, WIDTH, size);
	setStylePx(pt, HEIGHT, size);
	let mar = size / -2;
	setStylePx(pt, "marginLeft", mar);
	setStylePx(pt, "marginTop", mar);
	let width = o.width(self, si, size);
	width && setStylePx(pt, "borderWidth", width);
	return pt;
}
function cursorPointFill(self, si) {
	let sp = self.series[si].points;
	return sp._fill || sp._stroke;
}
function cursorPointStroke(self, si) {
	let sp = self.series[si].points;
	return sp._stroke || sp._fill;
}
function cursorPointSize(self, si) {
	let sp = self.series[si].points;
	return sp.size;
}
const moveTuple = [0,0];
function cursorMove(self, mouseLeft1, mouseTop1) {
	moveTuple[0] = mouseLeft1;
	moveTuple[1] = mouseTop1;
	return moveTuple;
}
function filtBtn0(self, targ, handle, onlyTarg = true) {
	return e => {
		e.button == 0 && (!onlyTarg || e.target == targ) && handle(e);
	};
}
function filtTarg(self, targ, handle, onlyTarg = true) {
	return e => {
		(!onlyTarg || e.target == targ) && handle(e);
	};
}
const cursorOpts = {
	show: true,
	x: true,
	y: true,
	lock: false,
	move: cursorMove,
	points: {
		one:    false,
		show:   cursorPointShow,
		size:   cursorPointSize,
		width:  0,
		stroke: cursorPointStroke,
		fill:   cursorPointFill,
	},
	bind: {
		mousedown:   filtBtn0,
		mouseup:     filtBtn0,
		click:       filtBtn0,
		dblclick:    filtBtn0,
		mousemove:   filtTarg,
		mouseleave:  filtTarg,
		mouseenter:  filtTarg,
	},
	drag: {
		setScale: true,
		x: true,
		y: false,
		dist: 0,
		uni: null,
		click: (self, e) => {
			e.stopPropagation();
			e.stopImmediatePropagation();
		},
		_x: false,
		_y: false,
	},
	focus: {
		dist: (self, seriesIdx, dataIdx, valPos, curPos) => valPos - curPos,
		prox: -1,
		bias: 0,
	},
	hover: {
		skip: [void 0],
		prox: null,
		bias: 0,
	},
	left: -10,
	top: -10,
	idx: null,
	dataIdx: null,
	idxs: null,
	event: null,
};
const axisLines = {
	show: true,
	stroke: "rgba(0,0,0,0.07)",
	width: 2,
};
const grid = assign({}, axisLines, {
	filter: retArg1,
});
const ticks = assign({}, grid, {
	size: 10,
});
const border = assign({}, axisLines, {
	show: false,
});
const font      = '12px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const labelFont = "bold " + font;
const lineGap = 1.5;
const xAxisOpts = {
	show: true,
	scale: "x",
	stroke: hexBlack,
	space: 50,
	gap: 5,
	size: 50,
	labelGap: 0,
	labelSize: 30,
	labelFont,
	side: 2,
	grid,
	ticks,
	border,
	font,
	lineGap,
	rotate: 0,
};
const numSeriesLabel = "Value";
const timeSeriesLabel = "Time";
const xSeriesOpts = {
	show: true,
	scale: "x",
	auto: false,
	sorted: 1,
	min: inf,
	max: -inf,
	idxs: [],
};
function numAxisVals(self, splits, axisIdx, foundSpace, foundIncr) {
	return splits.map(v => v == null ? "" : fmtNum(v));
}
function numAxisSplits(self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace, forceMin) {
	let splits = [];
	let numDec = fixedDec.get(foundIncr) || 0;
	scaleMin = forceMin ? scaleMin : roundDec(incrRoundUp(scaleMin, foundIncr), numDec);
	for (let val = scaleMin; val <= scaleMax; val = roundDec(val + foundIncr, numDec))
		splits.push(Object.is(val, -0) ? 0 : val);
	return splits;
}
function logAxisSplits(self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace, forceMin) {
	const splits = [];
	const logBase = self.scales[self.axes[axisIdx].scale].log;
	const logFn = logBase == 10 ? log10 : log2;
	const exp = floor(logFn(scaleMin));
	foundIncr = pow(logBase, exp);
	if (logBase == 10)
		foundIncr = numIncrs[closestIdx(foundIncr, numIncrs)];
	let split = scaleMin;
	let nextMagIncr = foundIncr * logBase;
	if (logBase == 10)
		nextMagIncr = numIncrs[closestIdx(nextMagIncr, numIncrs)];
	do {
		splits.push(split);
		split = split + foundIncr;
		if (logBase == 10 && !fixedDec.has(split))
			split = roundDec(split, fixedDec.get(foundIncr));
		if (split >= nextMagIncr) {
			foundIncr = split;
			nextMagIncr = foundIncr * logBase;
			if (logBase == 10)
				nextMagIncr = numIncrs[closestIdx(nextMagIncr, numIncrs)];
		}
	} while (split <= scaleMax);
	return splits;
}
function asinhAxisSplits(self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace, forceMin) {
	let sc = self.scales[self.axes[axisIdx].scale];
	let linthresh = sc.asinh;
	let posSplits = scaleMax > linthresh ? logAxisSplits(self, axisIdx, max(linthresh, scaleMin), scaleMax, foundIncr) : [linthresh];
	let zero = scaleMax >= 0 && scaleMin <= 0 ? [0] : [];
	let negSplits = scaleMin < -linthresh ? logAxisSplits(self, axisIdx, max(linthresh, -scaleMax), -scaleMin, foundIncr): [linthresh];
	return negSplits.reverse().map(v => -v).concat(zero, posSplits);
}
const RE_ALL   = /./;
const RE_12357 = /[12357]/;
const RE_125   = /[125]/;
const RE_1     = /1/;
const _filt = (splits, distr, re, keepMod) => splits.map((v, i) => ((distr == 4 && v == 0) || i % keepMod == 0 && re.test(v.toExponential()[v < 0 ? 1 : 0])) ? v : null);
function log10AxisValsFilt(self, splits, axisIdx, foundSpace, foundIncr) {
	let axis = self.axes[axisIdx];
	let scaleKey = axis.scale;
	let sc = self.scales[scaleKey];
	let valToPos = self.valToPos;
	let minSpace = axis._space;
	let _10 = valToPos(10, scaleKey);
	let re = (
		valToPos(9, scaleKey) - _10 >= minSpace ? RE_ALL :
		valToPos(7, scaleKey) - _10 >= minSpace ? RE_12357 :
		valToPos(5, scaleKey) - _10 >= minSpace ? RE_125 :
		RE_1
	);
	if (re == RE_1) {
		let magSpace = abs(valToPos(1, scaleKey) - _10);
		if (magSpace < minSpace)
			return _filt(splits.slice().reverse(), sc.distr, re, ceil(minSpace / magSpace)).reverse();
	}
	return _filt(splits, sc.distr, re, 1);
}
function log2AxisValsFilt(self, splits, axisIdx, foundSpace, foundIncr) {
	let axis = self.axes[axisIdx];
	let scaleKey = axis.scale;
	let minSpace = axis._space;
	let valToPos = self.valToPos;
	let magSpace = abs(valToPos(1, scaleKey) - valToPos(2, scaleKey));
	if (magSpace < minSpace)
		return _filt(splits.slice().reverse(), 3, RE_ALL, ceil(minSpace / magSpace)).reverse();
	return splits;
}
function numSeriesVal(self, val, seriesIdx, dataIdx) {
	return dataIdx == null ? LEGEND_DISP : val == null ? "" : fmtNum(val);
}
const yAxisOpts = {
	show: true,
	scale: "y",
	stroke: hexBlack,
	space: 30,
	gap: 5,
	size: 50,
	labelGap: 0,
	labelSize: 30,
	labelFont,
	side: 3,
	grid,
	ticks,
	border,
	font,
	lineGap,
	rotate: 0,
};
function ptDia(width, mult) {
	let dia = 3 + (width || 1) * 2;
	return roundDec(dia * mult, 3);
}
function seriesPointsShow(self, si) {
	let { scale, idxs } = self.series[0];
	let xData = self._data[0];
	let p0 = self.valToPos(xData[idxs[0]], scale, true);
	let p1 = self.valToPos(xData[idxs[1]], scale, true);
	let dim = abs(p1 - p0);
	let s = self.series[si];
	let maxPts = dim / (s.points.space * pxRatio);
	return idxs[1] - idxs[0] <= maxPts;
}
const facet = {
	scale: null,
	auto: true,
	sorted: 0,
	min: inf,
	max: -inf,
};
const gaps = (self, seriesIdx, idx0, idx1, nullGaps) => nullGaps;
const xySeriesOpts = {
	show: true,
	auto: true,
	sorted: 0,
	gaps,
	alpha: 1,
	facets: [
		assign({}, facet, {scale: 'x'}),
		assign({}, facet, {scale: 'y'}),
	],
};
const ySeriesOpts = {
	scale: "y",
	auto: true,
	sorted: 0,
	show: true,
	spanGaps: false,
	gaps,
	alpha: 1,
	points: {
		show: seriesPointsShow,
		filter: null,
	},
	values: null,
	min: inf,
	max: -inf,
	idxs: [],
	path: null,
	clip: null,
};
function clampScale(self, val, scaleMin, scaleMax, scaleKey) {
	return scaleMin / 10;
}
const xScaleOpts = {
	time: FEAT_TIME,
	auto: true,
	distr: 1,
	log: 10,
	asinh: 1,
	min: null,
	max: null,
	dir: 1,
	ori: 0,
};
const yScaleOpts = assign({}, xScaleOpts, {
	time: false,
	ori: 1,
});
const syncs = {};
function _sync(key, opts) {
	let s = syncs[key];
	if (!s) {
		s = {
			key,
			plots: [],
			sub(plot) {
				s.plots.push(plot);
			},
			unsub(plot) {
				s.plots = s.plots.filter(c => c != plot);
			},
			pub(type, self, x, y, w, h, i) {
				for (let j = 0; j < s.plots.length; j++)
					s.plots[j] != self && s.plots[j].pub(type, self, x, y, w, h, i);
			},
		};
		if (key != null)
			syncs[key] = s;
	}
	return s;
}
const BAND_CLIP_FILL   = 1 << 0;
const BAND_CLIP_STROKE = 1 << 1;
function orient(u, seriesIdx, cb) {
	const mode = u.mode;
	const series = u.series[seriesIdx];
	const data = mode == 2 ? u._data[seriesIdx] : u._data;
	const scales = u.scales;
	const bbox   = u.bbox;
	let dx = data[0],
		dy = mode == 2 ? data[1] : data[seriesIdx],
		sx = mode == 2 ? scales[series.facets[0].scale] : scales[u.series[0].scale],
		sy = mode == 2 ? scales[series.facets[1].scale] : scales[series.scale],
		l = bbox.left,
		t = bbox.top,
		w = bbox.width,
		h = bbox.height,
		H = u.valToPosH,
		V = u.valToPosV;
	return (sx.ori == 0
		? cb(
			series,
			dx,
			dy,
			sx,
			sy,
			H,
			V,
			l,
			t,
			w,
			h,
			moveToH,
			lineToH,
			rectH,
			arcH,
			bezierCurveToH,
		)
		: cb(
			series,
			dx,
			dy,
			sx,
			sy,
			V,
			H,
			t,
			l,
			h,
			w,
			moveToV,
			lineToV,
			rectV,
			arcV,
			bezierCurveToV,
		)
	);
}
function bandFillClipDirs(self, seriesIdx) {
	let fillDir = 0;
	let clipDirs = 0;
	let bands = ifNull(self.bands, EMPTY_ARR);
	for (let i = 0; i < bands.length; i++) {
		let b = bands[i];
		if (b.series[0] == seriesIdx)
			fillDir = b.dir;
		else if (b.series[1] == seriesIdx) {
			if (b.dir == 1)
				clipDirs |= 1;
			else
				clipDirs |= 2;
		}
	}
	return [
		fillDir,
		(
			clipDirs == 1 ? -1 :
			clipDirs == 2 ?  1 :
			clipDirs == 3 ?  2 :
			                 0
		)
	];
}
function seriesFillTo(self, seriesIdx, dataMin, dataMax, bandFillDir) {
	let mode = self.mode;
	let series = self.series[seriesIdx];
	let scaleKey = mode == 2 ? series.facets[1].scale : series.scale;
	let scale = self.scales[scaleKey];
	return (
		bandFillDir == -1 ? scale.min :
		bandFillDir ==  1 ? scale.max :
		scale.distr ==  3 ? (
			scale.dir == 1 ? scale.min :
			scale.max
		) : 0
	);
}
function clipBandLine(self, seriesIdx, idx0, idx1, strokePath, clipDir) {
	return orient(self, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
		let pxRound = series.pxRound;
		const dir = scaleX.dir * (scaleX.ori == 0 ? 1 : -1);
		const lineTo = scaleX.ori == 0 ? lineToH : lineToV;
		let frIdx, toIdx;
		if (dir == 1) {
			frIdx = idx0;
			toIdx = idx1;
		}
		else {
			frIdx = idx1;
			toIdx = idx0;
		}
		let x0 = pxRound(valToPosX(dataX[frIdx], scaleX, xDim, xOff));
		let y0 = pxRound(valToPosY(dataY[frIdx], scaleY, yDim, yOff));
		let x1 = pxRound(valToPosX(dataX[toIdx], scaleX, xDim, xOff));
		let yLimit = pxRound(valToPosY(clipDir == 1 ? scaleY.max : scaleY.min, scaleY, yDim, yOff));
		let clip = new Path2D(strokePath);
		lineTo(clip, x1, yLimit);
		lineTo(clip, x0, yLimit);
		lineTo(clip, x0, y0);
		return clip;
	});
}
function clipGaps(gaps, ori, plotLft, plotTop, plotWid, plotHgt) {
	let clip = null;
	if (gaps.length > 0) {
		clip = new Path2D();
		const rect = ori == 0 ? rectH : rectV;
		let prevGapEnd = plotLft;
		for (let i = 0; i < gaps.length; i++) {
			let g = gaps[i];
			if (g[1] > g[0]) {
				let w = g[0] - prevGapEnd;
				w > 0 && rect(clip, prevGapEnd, plotTop, w, plotTop + plotHgt);
				prevGapEnd = g[1];
			}
		}
		let w = plotLft + plotWid - prevGapEnd;
		let maxStrokeWidth = 10;
		w > 0 && rect(clip, prevGapEnd, plotTop - maxStrokeWidth / 2, w, plotTop + plotHgt + maxStrokeWidth);
	}
	return clip;
}
function addGap(gaps, fromX, toX) {
	let prevGap = gaps[gaps.length - 1];
	if (prevGap && prevGap[0] == fromX)
		prevGap[1] = toX;
	else
		gaps.push([fromX, toX]);
}
function findGaps(xs, ys, idx0, idx1, dir, pixelForX, align) {
	let gaps = [];
	let len = xs.length;
	for (let i = dir == 1 ? idx0 : idx1; i >= idx0 && i <= idx1; i += dir) {
		let yVal = ys[i];
		if (yVal === null) {
			let fr = i, to = i;
			if (dir == 1) {
				while (++i <= idx1 && ys[i] === null)
					to = i;
			}
			else {
				while (--i >= idx0 && ys[i] === null)
					to = i;
			}
			let frPx = pixelForX(xs[fr]);
			let toPx = to == fr ? frPx : pixelForX(xs[to]);
			let fri2 = fr - dir;
			let frPx2 = align <= 0 && fri2 >= 0 && fri2 < len ? pixelForX(xs[fri2]) : frPx;
				frPx = frPx2;
			let toi2 = to + dir;
			let toPx2 = align >= 0 && toi2 >= 0 && toi2 < len ? pixelForX(xs[toi2]) : toPx;
				toPx = toPx2;
			if (toPx >= frPx)
				gaps.push([frPx, toPx]);
		}
	}
	return gaps;
}
function pxRoundGen(pxAlign) {
	return pxAlign == 0 ? retArg0 : pxAlign == 1 ? round : v => incrRound(v, pxAlign);
}
function rect(ori) {
	let moveTo = ori == 0 ?
		moveToH :
		moveToV;
	let arcTo = ori == 0 ?
		(p, x1, y1, x2, y2, r) => { p.arcTo(x1, y1, x2, y2, r); } :
		(p, y1, x1, y2, x2, r) => { p.arcTo(x1, y1, x2, y2, r); };
	let rect = ori == 0 ?
		(p, x, y, w, h) => { p.rect(x, y, w, h); } :
		(p, y, x, h, w) => { p.rect(x, y, w, h); };
	return (p, x, y, w, h, endRad = 0, baseRad = 0) => {
		if (endRad == 0 && baseRad == 0)
			rect(p, x, y, w, h);
		else {
			endRad  = min(endRad,  w / 2, h / 2);
			baseRad = min(baseRad, w / 2, h / 2);
			moveTo(p, x + endRad, y);
			arcTo(p, x + w, y, x + w, y + h, endRad);
			arcTo(p, x + w, y + h, x, y + h, baseRad);
			arcTo(p, x, y + h, x, y, baseRad);
			arcTo(p, x, y, x + w, y, endRad);
			p.closePath();
		}
	};
}
const moveToH = (p, x, y) => { p.moveTo(x, y); };
const moveToV = (p, y, x) => { p.moveTo(x, y); };
const lineToH = (p, x, y) => { p.lineTo(x, y); };
const lineToV = (p, y, x) => { p.lineTo(x, y); };
const rectH = rect(0);
const rectV = rect(1);
const arcH = (p, x, y, r, startAngle, endAngle) => { p.arc(x, y, r, startAngle, endAngle); };
const arcV = (p, y, x, r, startAngle, endAngle) => { p.arc(x, y, r, startAngle, endAngle); };
const bezierCurveToH = (p, bp1x, bp1y, bp2x, bp2y, p2x, p2y) => { p.bezierCurveTo(bp1x, bp1y, bp2x, bp2y, p2x, p2y); };
const bezierCurveToV = (p, bp1y, bp1x, bp2y, bp2x, p2y, p2x) => { p.bezierCurveTo(bp1x, bp1y, bp2x, bp2y, p2x, p2y); };
function points(opts) {
	return (u, seriesIdx, idx0, idx1, filtIdxs) => {
		return orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
			let { pxRound, points } = series;
			let moveTo, arc;
			if (scaleX.ori == 0) {
				moveTo = moveToH;
				arc = arcH;
			}
			else {
				moveTo = moveToV;
				arc = arcV;
			}
			const width = roundDec(points.width * pxRatio, 3);
			let rad = (points.size - points.width) / 2 * pxRatio;
			let dia = roundDec(rad * 2, 3);
			let fill = new Path2D();
			let clip = new Path2D();
			let { left: lft, top: top, width: wid, height: hgt } = u.bbox;
			rectH(clip,
				lft - dia,
				top - dia,
				wid + dia * 2,
				hgt + dia * 2,
			);
			const drawPoint = pi => {
				if (dataY[pi] != null) {
					let x = pxRound(valToPosX(dataX[pi], scaleX, xDim, xOff));
					let y = pxRound(valToPosY(dataY[pi], scaleY, yDim, yOff));
					moveTo(fill, x + rad, y);
					arc(fill, x, y, rad, 0, PI * 2);
				}
			};
			if (filtIdxs)
				filtIdxs.forEach(drawPoint);
			else {
				for (let pi = idx0; pi <= idx1; pi++)
					drawPoint(pi);
			}
			return {
				stroke: width > 0 ? fill : null,
				fill,
				clip,
				flags: BAND_CLIP_FILL | BAND_CLIP_STROKE,
			};
		});
	};
}
function _drawAcc(lineTo) {
	return (stroke, accX, minY, maxY, inY, outY) => {
		if (minY != maxY) {
			if (inY != minY && outY != minY)
				lineTo(stroke, accX, minY);
			if (inY != maxY && outY != maxY)
				lineTo(stroke, accX, maxY);
			lineTo(stroke, accX, outY);
		}
	};
}
const drawAccH = _drawAcc(lineToH);
const drawAccV = _drawAcc(lineToV);
function linear(opts) {
	const alignGaps = ifNull(opts?.alignGaps, 0);
	return (u, seriesIdx, idx0, idx1) => {
		return orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
			let pxRound = series.pxRound;
			let pixelForX = val => pxRound(valToPosX(val, scaleX, xDim, xOff));
			let pixelForY = val => pxRound(valToPosY(val, scaleY, yDim, yOff));
			let lineTo, drawAcc;
			if (scaleX.ori == 0) {
				lineTo = lineToH;
				drawAcc = drawAccH;
			}
			else {
				lineTo = lineToV;
				drawAcc = drawAccV;
			}
			const dir = scaleX.dir * (scaleX.ori == 0 ? 1 : -1);
			const _paths = {stroke: new Path2D(), fill: null, clip: null, band: null, gaps: null, flags: BAND_CLIP_FILL};
			const stroke = _paths.stroke;
			let minY = inf,
				maxY = -inf,
				inY, outY, drawnAtX;
			let accX = pixelForX(dataX[dir == 1 ? idx0 : idx1]);
			let lftIdx = nonNullIdx(dataY, idx0, idx1,  1 * dir);
			let rgtIdx = nonNullIdx(dataY, idx0, idx1, -1 * dir);
			let lftX   =  pixelForX(dataX[lftIdx]);
			let rgtX   =  pixelForX(dataX[rgtIdx]);
			let hasGap = false;
			for (let i = dir == 1 ? idx0 : idx1; i >= idx0 && i <= idx1; i += dir) {
				let x = pixelForX(dataX[i]);
				let yVal = dataY[i];
				if (x == accX) {
					if (yVal != null) {
						outY = pixelForY(yVal);
						if (minY == inf) {
							lineTo(stroke, x, outY);
							inY = outY;
						}
						minY = min(outY, minY);
						maxY = max(outY, maxY);
					}
					else {
						if (yVal === null)
							hasGap = true;
					}
				}
				else {
					if (minY != inf) {
						drawAcc(stroke, accX, minY, maxY, inY, outY);
						drawnAtX = accX;
					}
					if (yVal != null) {
						outY = pixelForY(yVal);
						lineTo(stroke, x, outY);
						minY = maxY = inY = outY;
					}
					else {
						minY = inf;
						maxY = -inf;
						if (yVal === null)
							hasGap = true;
					}
					accX = x;
				}
			}
			if (minY != inf && minY != maxY && drawnAtX != accX)
				drawAcc(stroke, accX, minY, maxY, inY, outY);
			let [ bandFillDir, bandClipDir ] = bandFillClipDirs(u, seriesIdx);
			if (series.fill != null || bandFillDir != 0) {
				let fill = _paths.fill = new Path2D(stroke);
				let fillToVal = series.fillTo(u, seriesIdx, series.min, series.max, bandFillDir);
				let fillToY = pixelForY(fillToVal);
				lineTo(fill, rgtX, fillToY);
				lineTo(fill, lftX, fillToY);
			}
			if (!series.spanGaps) {
				let gaps = [];
				hasGap && gaps.push(...findGaps(dataX, dataY, idx0, idx1, dir, pixelForX, alignGaps));
				_paths.gaps = gaps = series.gaps(u, seriesIdx, idx0, idx1, gaps);
				_paths.clip = clipGaps(gaps, scaleX.ori, xOff, yOff, xDim, yDim);
			}
			if (bandClipDir != 0) {
				_paths.band = bandClipDir == 2 ? [
					clipBandLine(u, seriesIdx, idx0, idx1, stroke, -1),
					clipBandLine(u, seriesIdx, idx0, idx1, stroke,  1),
				] : clipBandLine(u, seriesIdx, idx0, idx1, stroke, bandClipDir);
			}
			return _paths;
		});
	};
}
function stepped(opts) {
	const align = ifNull(opts.align, 1);
	const ascDesc = ifNull(opts.ascDesc, false);
	const alignGaps = ifNull(opts.alignGaps, 0);
	const extend = ifNull(opts.extend, false);
	return (u, seriesIdx, idx0, idx1) => {
		return orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
			let pxRound = series.pxRound;
			let { left, width } = u.bbox;
			let pixelForX = val => pxRound(valToPosX(val, scaleX, xDim, xOff));
			let pixelForY = val => pxRound(valToPosY(val, scaleY, yDim, yOff));
			let lineTo = scaleX.ori == 0 ? lineToH : lineToV;
			const _paths = {stroke: new Path2D(), fill: null, clip: null, band: null, gaps: null, flags: BAND_CLIP_FILL};
			const stroke = _paths.stroke;
			const dir = scaleX.dir * (scaleX.ori == 0 ? 1 : -1);
			idx0 = nonNullIdx(dataY, idx0, idx1,  1);
			idx1 = nonNullIdx(dataY, idx0, idx1, -1);
			let prevYPos  = pixelForY(dataY[dir == 1 ? idx0 : idx1]);
			let firstXPos = pixelForX(dataX[dir == 1 ? idx0 : idx1]);
			let prevXPos = firstXPos;
			let firstXPosExt = firstXPos;
			if (extend && align == -1) {
				firstXPosExt = left;
				lineTo(stroke, firstXPosExt, prevYPos);
			}
			lineTo(stroke, firstXPos, prevYPos);
			for (let i = dir == 1 ? idx0 : idx1; i >= idx0 && i <= idx1; i += dir) {
				let yVal1 = dataY[i];
				if (yVal1 == null)
					continue;
				let x1 = pixelForX(dataX[i]);
				let y1 = pixelForY(yVal1);
				if (align == 1)
					lineTo(stroke, x1, prevYPos);
				else
					lineTo(stroke, prevXPos, y1);
				lineTo(stroke, x1, y1);
				prevYPos = y1;
				prevXPos = x1;
			}
			let prevXPosExt = prevXPos;
			if (extend && align == 1) {
				prevXPosExt = left + width;
				lineTo(stroke, prevXPosExt, prevYPos);
			}
			let [ bandFillDir, bandClipDir ] = bandFillClipDirs(u, seriesIdx);
			if (series.fill != null || bandFillDir != 0) {
				let fill = _paths.fill = new Path2D(stroke);
				let fillTo = series.fillTo(u, seriesIdx, series.min, series.max, bandFillDir);
				let fillToY = pixelForY(fillTo);
				lineTo(fill, prevXPosExt, fillToY);
				lineTo(fill, firstXPosExt, fillToY);
			}
			if (!series.spanGaps) {
				let gaps = [];
				gaps.push(...findGaps(dataX, dataY, idx0, idx1, dir, pixelForX, alignGaps));
				let halfStroke = (series.width * pxRatio) / 2;
				let startsOffset = (ascDesc || align ==  1) ?  halfStroke : -halfStroke;
				let endsOffset   = (ascDesc || align == -1) ? -halfStroke :  halfStroke;
				gaps.forEach(g => {
					g[0] += startsOffset;
					g[1] += endsOffset;
				});
				_paths.gaps = gaps = series.gaps(u, seriesIdx, idx0, idx1, gaps);
				_paths.clip = clipGaps(gaps, scaleX.ori, xOff, yOff, xDim, yDim);
			}
			if (bandClipDir != 0) {
				_paths.band = bandClipDir == 2 ? [
					clipBandLine(u, seriesIdx, idx0, idx1, stroke, -1),
					clipBandLine(u, seriesIdx, idx0, idx1, stroke,  1),
				] : clipBandLine(u, seriesIdx, idx0, idx1, stroke, bandClipDir);
			}
			return _paths;
		});
	};
}
function findColWidth(dataX, dataY, valToPosX, scaleX, xDim, xOff, colWid = inf) {
	if (dataX.length > 1) {
		let prevIdx = null;
		for (let i = 0, minDelta = Infinity; i < dataX.length; i++) {
			if (dataY[i] !== undefined) {
				if (prevIdx != null) {
					let delta = abs(dataX[i] - dataX[prevIdx]);
					if (delta < minDelta) {
						minDelta = delta;
						colWid = abs(valToPosX(dataX[i], scaleX, xDim, xOff) - valToPosX(dataX[prevIdx], scaleX, xDim, xOff));
					}
				}
				prevIdx = i;
			}
		}
	}
	return colWid;
}
function bars(opts) {
	opts = opts || EMPTY_OBJ;
	const size = ifNull(opts.size, [0.6, inf, 1]);
	const align = opts.align || 0;
	const _extraGap = (opts.gap || 0);
	let ro = opts.radius;
	ro =
		ro == null ? [0, 0] :
		typeof ro == 'number' ? [ro, 0] : ro;
	const radiusFn = fnOrSelf(ro);
	const gapFactor = 1 - size[0];
	const _maxWidth  = ifNull(size[1], inf);
	const _minWidth  = ifNull(size[2], 1);
	const disp = ifNull(opts.disp, EMPTY_OBJ);
	const _each = ifNull(opts.each, _ => {});
	const { fill: dispFills, stroke: dispStrokes } = disp;
	return (u, seriesIdx, idx0, idx1) => {
		return orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
			let pxRound = series.pxRound;
			let _align = align;
			let extraGap = _extraGap * pxRatio;
			let maxWidth = _maxWidth * pxRatio;
			let minWidth = _minWidth * pxRatio;
			let valRadius, baseRadius;
			if (scaleX.ori == 0)
				[valRadius, baseRadius] = radiusFn(u, seriesIdx);
			else
				[baseRadius, valRadius] = radiusFn(u, seriesIdx);
			const _dirX = scaleX.dir * (scaleX.ori == 0 ? 1 : -1);
			let rect = scaleX.ori == 0 ? rectH : rectV;
			let each = scaleX.ori == 0 ? _each : (u, seriesIdx, i, top, lft, hgt, wid) => {
				_each(u, seriesIdx, i, lft, top, wid, hgt);
			};
			let band = ifNull(u.bands, EMPTY_ARR).find(b => b.series[0] == seriesIdx);
			let fillDir = band != null ? band.dir : 0;
			let fillTo = series.fillTo(u, seriesIdx, series.min, series.max, fillDir);
			let fillToY = pxRound(valToPosY(fillTo, scaleY, yDim, yOff));
			let xShift, barWid, fullGap, colWid = xDim;
			let strokeWidth = pxRound(series.width * pxRatio);
			let multiPath = false;
			let fillColors = null;
			let fillPaths = null;
			let strokeColors = null;
			let strokePaths = null;
			if (dispFills != null && (strokeWidth == 0 || dispStrokes != null)) {
				multiPath = true;
				fillColors = dispFills.values(u, seriesIdx, idx0, idx1);
				fillPaths = new Map();
				(new Set(fillColors)).forEach(color => {
					if (color != null)
						fillPaths.set(color, new Path2D());
				});
				if (strokeWidth > 0) {
					strokeColors = dispStrokes.values(u, seriesIdx, idx0, idx1);
					strokePaths = new Map();
					(new Set(strokeColors)).forEach(color => {
						if (color != null)
							strokePaths.set(color, new Path2D());
					});
				}
			}
			let { x0, size } = disp;
			if (x0 != null && size != null) {
				_align = 1;
				dataX = x0.values(u, seriesIdx, idx0, idx1);
				if (x0.unit == 2)
					dataX = dataX.map(pct => u.posToVal(xOff + pct * xDim, scaleX.key, true));
				let sizes = size.values(u, seriesIdx, idx0, idx1);
				if (size.unit == 2)
					barWid = sizes[0] * xDim;
				else
					barWid = valToPosX(sizes[0], scaleX, xDim, xOff) - valToPosX(0, scaleX, xDim, xOff);
				colWid = findColWidth(dataX, dataY, valToPosX, scaleX, xDim, xOff, colWid);
				let gapWid = colWid - barWid;
				fullGap = gapWid + extraGap;
			}
			else {
				colWid = findColWidth(dataX, dataY, valToPosX, scaleX, xDim, xOff, colWid);
				let gapWid = colWid * gapFactor;
				fullGap = gapWid + extraGap;
				barWid = colWid - fullGap;
			}
			if (fullGap < 1)
				fullGap = 0;
			if (strokeWidth >= barWid / 2)
				strokeWidth = 0;
			if (fullGap < 5)
				pxRound = retArg0;
			let insetStroke = fullGap > 0;
			let rawBarWid = colWid - fullGap - (insetStroke ? strokeWidth : 0);
			barWid = pxRound(clamp(rawBarWid, minWidth, maxWidth));
			xShift = (_align == 0 ? barWid / 2 : _align == _dirX ? 0 : barWid) - _align * _dirX * ((_align == 0 ? extraGap / 2 : 0) + (insetStroke ? strokeWidth / 2 : 0));
			const _paths = {stroke: null, fill: null, clip: null, band: null, gaps: null, flags: 0};
			const stroke = multiPath ? null : new Path2D();
			let dataY0 = null;
			if (band != null)
				dataY0 = u.data[band.series[1]];
			else {
				let { y0, y1 } = disp;
				if (y0 != null && y1 != null) {
					dataY = y1.values(u, seriesIdx, idx0, idx1);
					dataY0 = y0.values(u, seriesIdx, idx0, idx1);
				}
			}
			let radVal = valRadius * barWid;
			let radBase = baseRadius * barWid;
			for (let i = _dirX == 1 ? idx0 : idx1; i >= idx0 && i <= idx1; i += _dirX) {
				let yVal = dataY[i];
				if (yVal == null)
					continue;
				if (dataY0 != null) {
					let yVal0 = dataY0[i] ?? 0;
					if (yVal - yVal0 == 0)
						continue;
					fillToY = valToPosY(yVal0, scaleY, yDim, yOff);
				}
				let xVal = scaleX.distr != 2 || disp != null ? dataX[i] : i;
				let xPos = valToPosX(xVal, scaleX, xDim, xOff);
				let yPos = valToPosY(ifNull(yVal, fillTo), scaleY, yDim, yOff);
				let lft = pxRound(xPos - xShift);
				let btm = pxRound(max(yPos, fillToY));
				let top = pxRound(min(yPos, fillToY));
				let barHgt = btm - top;
				if (yVal != null) {
					let rv = yVal < 0 ? radBase : radVal;
					let rb = yVal < 0 ? radVal : radBase;
					if (multiPath) {
						if (strokeWidth > 0 && strokeColors[i] != null)
							rect(strokePaths.get(strokeColors[i]), lft, top + floor(strokeWidth / 2), barWid, max(0, barHgt - strokeWidth), rv, rb);
						if (fillColors[i] != null)
							rect(fillPaths.get(fillColors[i]), lft, top + floor(strokeWidth / 2), barWid, max(0, barHgt - strokeWidth), rv, rb);
					}
					else
						rect(stroke, lft, top + floor(strokeWidth / 2), barWid, max(0, barHgt - strokeWidth), rv, rb);
					each(u, seriesIdx, i,
						lft    - strokeWidth / 2,
						top,
						barWid + strokeWidth,
						barHgt,
					);
				}
			}
			if (strokeWidth > 0)
				_paths.stroke = multiPath ? strokePaths : stroke;
			else if (!multiPath) {
				_paths._fill = series.width == 0 ? series._fill : series._stroke ?? series._fill;
				_paths.width = 0;
			}
			_paths.fill = multiPath ? fillPaths : stroke;
			return _paths;
		});
	};
}
function splineInterp(interp, opts) {
	const alignGaps = ifNull(opts?.alignGaps, 0);
	return (u, seriesIdx, idx0, idx1) => {
		return orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim) => {
			let pxRound = series.pxRound;
			let pixelForX = val => pxRound(valToPosX(val, scaleX, xDim, xOff));
			let pixelForY = val => pxRound(valToPosY(val, scaleY, yDim, yOff));
			let moveTo, bezierCurveTo, lineTo;
			if (scaleX.ori == 0) {
				moveTo = moveToH;
				lineTo = lineToH;
				bezierCurveTo = bezierCurveToH;
			}
			else {
				moveTo = moveToV;
				lineTo = lineToV;
				bezierCurveTo = bezierCurveToV;
			}
			const dir = scaleX.dir * (scaleX.ori == 0 ? 1 : -1);
			idx0 = nonNullIdx(dataY, idx0, idx1,  1);
			idx1 = nonNullIdx(dataY, idx0, idx1, -1);
			let firstXPos = pixelForX(dataX[dir == 1 ? idx0 : idx1]);
			let prevXPos = firstXPos;
			let xCoords = [];
			let yCoords = [];
			for (let i = dir == 1 ? idx0 : idx1; i >= idx0 && i <= idx1; i += dir) {
				let yVal = dataY[i];
				if (yVal != null) {
					let xVal = dataX[i];
					let xPos = pixelForX(xVal);
					xCoords.push(prevXPos = xPos);
					yCoords.push(pixelForY(dataY[i]));
				}
			}
			const _paths = {stroke: interp(xCoords, yCoords, moveTo, lineTo, bezierCurveTo, pxRound), fill: null, clip: null, band: null, gaps: null, flags: BAND_CLIP_FILL};
			const stroke = _paths.stroke;
			let [ bandFillDir, bandClipDir ] = bandFillClipDirs(u, seriesIdx);
			if (series.fill != null || bandFillDir != 0) {
				let fill = _paths.fill = new Path2D(stroke);
				let fillTo = series.fillTo(u, seriesIdx, series.min, series.max, bandFillDir);
				let fillToY = pixelForY(fillTo);
				lineTo(fill, prevXPos, fillToY);
				lineTo(fill, firstXPos, fillToY);
			}
			if (!series.spanGaps) {
				let gaps = [];
				gaps.push(...findGaps(dataX, dataY, idx0, idx1, dir, pixelForX, alignGaps));
				_paths.gaps = gaps = series.gaps(u, seriesIdx, idx0, idx1, gaps);
				_paths.clip = clipGaps(gaps, scaleX.ori, xOff, yOff, xDim, yDim);
			}
			if (bandClipDir != 0) {
				_paths.band = bandClipDir == 2 ? [
					clipBandLine(u, seriesIdx, idx0, idx1, stroke, -1),
					clipBandLine(u, seriesIdx, idx0, idx1, stroke,  1),
				] : clipBandLine(u, seriesIdx, idx0, idx1, stroke, bandClipDir);
			}
			return _paths;
		});
	};
}
function monotoneCubic(opts) {
	return splineInterp(_monotoneCubic, opts);
}
function _monotoneCubic(xs, ys, moveTo, lineTo, bezierCurveTo, pxRound) {
	const n = xs.length;
	if (n < 2)
		return null;
	const path = new Path2D();
	moveTo(path, xs[0], ys[0]);
	if (n == 2)
		lineTo(path, xs[1], ys[1]);
	else {
		let ms  = Array(n),
			ds  = Array(n - 1),
			dys = Array(n - 1),
			dxs = Array(n - 1);
		for (let i = 0; i < n - 1; i++) {
			dys[i] = ys[i + 1] - ys[i];
			dxs[i] = xs[i + 1] - xs[i];
			ds[i]  = dys[i] / dxs[i];
		}
		ms[0] = ds[0];
		for (let i = 1; i < n - 1; i++) {
			if (ds[i] === 0 || ds[i - 1] === 0 || (ds[i - 1] > 0) !== (ds[i] > 0))
				ms[i] = 0;
			else {
				ms[i] = 3 * (dxs[i - 1] + dxs[i]) / (
					(2 * dxs[i] + dxs[i - 1]) / ds[i - 1] +
					(dxs[i] + 2 * dxs[i - 1]) / ds[i]
				);
				if (!isFinite(ms[i]))
					ms[i] = 0;
			}
		}
		ms[n - 1] = ds[n - 2];
		for (let i = 0; i < n - 1; i++) {
			bezierCurveTo(
				path,
				xs[i] + dxs[i] / 3,
				ys[i] + ms[i] * dxs[i] / 3,
				xs[i + 1] - dxs[i] / 3,
				ys[i + 1] - ms[i + 1] * dxs[i] / 3,
				xs[i + 1],
				ys[i + 1],
			);
		}
	}
	return path;
}
const cursorPlots = new Set();
function invalidateRects() {
	for (let u of cursorPlots)
		u.syncRect(true);
}
if (domEnv) {
	on(resize, win, invalidateRects);
	on(scroll, win, invalidateRects, true);
	on(dppxchange, win, () => { uPlot.pxRatio = pxRatio; });
}
const linearPath = linear() ;
const pointsPath = points() ;
function setDefaults(d, xo, yo, initY) {
	let d2 = initY ? [d[0], d[1]].concat(d.slice(2)) : [d[0]].concat(d.slice(1));
	return d2.map((o, i) => setDefault(o, i, xo, yo));
}
function setDefaults2(d, xyo) {
	return d.map((o, i) => i == 0 ? {} : assign({}, xyo, o));
}
function setDefault(o, i, xo, yo) {
	return assign({}, (i == 0 ? xo : yo), o);
}
function snapNumX(self, dataMin, dataMax) {
	return dataMin == null ? nullNullTuple : [dataMin, dataMax];
}
const snapTimeX = snapNumX;
function snapNumY(self, dataMin, dataMax) {
	return dataMin == null ? nullNullTuple : rangeNum(dataMin, dataMax, rangePad, true);
}
function snapLogY(self, dataMin, dataMax, scale) {
	return dataMin == null ? nullNullTuple : rangeLog(dataMin, dataMax, self.scales[scale].log, false);
}
const snapLogX = snapLogY;
function snapAsinhY(self, dataMin, dataMax, scale) {
	return dataMin == null ? nullNullTuple : rangeAsinh(dataMin, dataMax, self.scales[scale].log, false);
}
const snapAsinhX = snapAsinhY;
function findIncr(minVal, maxVal, incrs, dim, minSpace) {
	let intDigits = max(numIntDigits(minVal), numIntDigits(maxVal));
	let delta = maxVal - minVal;
	let incrIdx = closestIdx((minSpace / dim) * delta, incrs);
	do {
		let foundIncr = incrs[incrIdx];
		let foundSpace = dim * foundIncr / delta;
		if (foundSpace >= minSpace && intDigits + (foundIncr < 5 ? fixedDec.get(foundIncr) : 0) <= 17)
			return [foundIncr, foundSpace];
	} while (++incrIdx < incrs.length);
	return [0, 0];
}
function pxRatioFont(font) {
	let fontSize, fontSizeCss;
	font = font.replace(/(\d+)px/, (m, p1) => (fontSize = round((fontSizeCss = +p1) * pxRatio)) + 'px');
	return [font, fontSize, fontSizeCss];
}
function syncFontSize(axis) {
	if (axis.show) {
		[axis.font, axis.labelFont].forEach(f => {
			let size = roundDec(f[2] * pxRatio, 1);
			f[0] = f[0].replace(/[0-9.]+px/, size + 'px');
			f[1] = size;
		});
	}
}
function uPlot(opts, data, then) {
	const self = {
		mode: ifNull(opts.mode, 1),
	};
	const mode = self.mode;
	function getValPct(val, scale) {
		let _val = (
			scale.distr == 3 ? log10(val > 0 ? val : scale.clamp(self, val, scale.min, scale.max, scale.key)) :
			scale.distr == 4 ? asinh(val, scale.asinh) :
			scale.distr == 100 ? scale.fwd(val) :
			val
		);
		return (_val - scale._min) / (scale._max - scale._min);
	}
	function getHPos(val, scale, dim, off) {
		let pct = getValPct(val, scale);
		return off + dim * (scale.dir == -1 ? (1 - pct) : pct);
	}
	function getVPos(val, scale, dim, off) {
		let pct = getValPct(val, scale);
		return off + dim * (scale.dir == -1 ? pct : (1 - pct));
	}
	function getPos(val, scale, dim, off) {
		return scale.ori == 0 ? getHPos(val, scale, dim, off) : getVPos(val, scale, dim, off);
	}
	self.valToPosH = getHPos;
	self.valToPosV = getVPos;
	let ready = false;
	self.status = 0;
	const root = self.root = placeDiv(UPLOT);
	if (opts.id != null)
		root.id = opts.id;
	addClass(root, opts.class);
	if (opts.title) {
		let title = placeDiv(TITLE, root);
		title.textContent = opts.title;
	}
	const can = placeTag("canvas");
	const ctx = self.ctx = can.getContext("2d");
	const wrap = placeDiv(WRAP, root);
	on("click", wrap, e => {
		if (e.target === over) {
			let didDrag = mouseLeft1 != mouseLeft0 || mouseTop1 != mouseTop0;
			didDrag && drag.click(self, e);
		}
	}, true);
	const under = self.under = placeDiv(UNDER, wrap);
	wrap.appendChild(can);
	const over = self.over = placeDiv(OVER, wrap);
	opts = copy(opts);
	const pxAlign = +ifNull(opts.pxAlign, 1);
	const pxRound = pxRoundGen(pxAlign);
	(opts.plugins || []).forEach(p => {
		if (p.opts)
			opts = p.opts(self, opts) || opts;
	});
	const ms = opts.ms || 1e-3;
	const series  = self.series = mode == 1 ?
		setDefaults(opts.series || [], xSeriesOpts, ySeriesOpts, false) :
		setDefaults2(opts.series || [null], xySeriesOpts);
	const axes    = self.axes   = setDefaults(opts.axes   || [], xAxisOpts,   yAxisOpts,    true);
	const scales  = self.scales = {};
	const bands   = self.bands  = opts.bands || [];
	bands.forEach(b => {
		b.fill = fnOrSelf(b.fill || null);
		b.dir = ifNull(b.dir, -1);
	});
	const xScaleKey = mode == 2 ? series[1].facets[0].scale : series[0].scale;
	const drawOrderMap = {
		axes: drawAxesGrid,
		series: drawSeries,
	};
	const drawOrder = (opts.drawOrder || ["axes", "series"]).map(key => drawOrderMap[key]);
	function initScale(scaleKey) {
		let sc = scales[scaleKey];
		if (sc == null) {
			let scaleOpts = (opts.scales || EMPTY_OBJ)[scaleKey] || EMPTY_OBJ;
			if (scaleOpts.from != null) {
				initScale(scaleOpts.from);
				scales[scaleKey] = assign({}, scales[scaleOpts.from], scaleOpts, {key: scaleKey});
			}
			else {
				sc = scales[scaleKey] = assign({}, (scaleKey == xScaleKey ? xScaleOpts : yScaleOpts), scaleOpts);
				sc.key = scaleKey;
				let isTime = sc.time;
				let rn = sc.range;
				let rangeIsArr = isArr(rn);
				if (scaleKey != xScaleKey || (mode == 2 && !isTime)) {
					if (rangeIsArr && (rn[0] == null || rn[1] == null)) {
						rn = {
							min: rn[0] == null ? autoRangePart : {
								mode: 1,
								hard: rn[0],
								soft: rn[0],
							},
							max: rn[1] == null ? autoRangePart : {
								mode: 1,
								hard: rn[1],
								soft: rn[1],
							},
						};
						rangeIsArr = false;
					}
					if (!rangeIsArr && isObj(rn)) {
						let cfg = rn;
						rn = (self, dataMin, dataMax) => dataMin == null ? nullNullTuple : rangeNum(dataMin, dataMax, cfg);
					}
				}
				sc.range = fnOrSelf(rn || (isTime ? snapTimeX : scaleKey == xScaleKey ?
					(sc.distr == 3 ? snapLogX : sc.distr == 4 ? snapAsinhX : snapNumX) :
					(sc.distr == 3 ? snapLogY : sc.distr == 4 ? snapAsinhY : snapNumY)
				));
				sc.auto = fnOrSelf(rangeIsArr ? false : sc.auto);
				sc.clamp = fnOrSelf(sc.clamp || clampScale);
				sc._min = sc._max = null;
			}
		}
	}
	initScale("x");
	initScale("y");
	if (mode == 1) {
		series.forEach(s => {
			initScale(s.scale);
		});
	}
	axes.forEach(a => {
		initScale(a.scale);
	});
	for (let k in opts.scales)
		initScale(k);
	const scaleX = scales[xScaleKey];
	const xScaleDistr = scaleX.distr;
	let valToPosX, valToPosY;
	if (scaleX.ori == 0) {
		addClass(root, ORI_HZ);
		valToPosX = getHPos;
		valToPosY = getVPos;
	}
	else {
		addClass(root, ORI_VT);
		valToPosX = getVPos;
		valToPosY = getHPos;
	}
	const pendScales = {};
	for (let k in scales) {
		let sc = scales[k];
		if (sc.min != null || sc.max != null) {
			pendScales[k] = {min: sc.min, max: sc.max};
			sc.min = sc.max = null;
		}
	}
	const _tzDate  = (opts.tzDate || (ts => new Date(round(ts / ms))));
	const _fmtDate = (opts.fmtDate || fmtDate);
	const _timeAxisSplits = (ms == 1 ? timeAxisSplitsMs(_tzDate) : timeAxisSplitsS(_tzDate));
	const _timeAxisVals   = timeAxisVals(_tzDate, timeAxisStamps((ms == 1 ? _timeAxisStampsMs : _timeAxisStampsS), _fmtDate));
	const _timeSeriesVal  = timeSeriesVal(_tzDate, timeSeriesStamp(_timeSeriesStamp, _fmtDate));
	const activeIdxs = [];
	const legend     = (self.legend = assign({}, legendOpts, opts.legend));
	const showLegend = legend.show;
	const markers    = legend.markers;
	{
		legend.idxs = activeIdxs;
		markers.width  = fnOrSelf(markers.width);
		markers.dash   = fnOrSelf(markers.dash);
		markers.stroke = fnOrSelf(markers.stroke);
		markers.fill   = fnOrSelf(markers.fill);
	}
	let legendTable;
	let legendHead;
	let legendBody;
	let legendRows = [];
	let legendCells = [];
	let legendCols;
	let multiValLegend = false;
	let NULL_LEGEND_VALUES = {};
	if (legend.live) {
		const getMultiVals = series[1] ? series[1].values : null;
		multiValLegend = getMultiVals != null;
		legendCols = multiValLegend ? getMultiVals(self, 1, 0) : {_: 0};
		for (let k in legendCols)
			NULL_LEGEND_VALUES[k] = LEGEND_DISP;
	}
	if (showLegend) {
		legendTable = placeTag("table", LEGEND, root);
		legendBody = placeTag("tbody", null, legendTable);
		legend.mount(self, legendTable);
		if (multiValLegend) {
			legendHead = placeTag("thead", null, legendTable, legendBody);
			let head = placeTag("tr", null, legendHead);
			placeTag("th", null, head);
			for (var key in legendCols)
				placeTag("th", LEGEND_LABEL, head).textContent = key;
		}
		else {
			addClass(legendTable, LEGEND_INLINE);
			legend.live && addClass(legendTable, LEGEND_LIVE);
		}
	}
	const son  = {show: true};
	const soff = {show: false};
	function initLegendRow(s, i) {
		if (i == 0 && (multiValLegend || !legend.live || mode == 2))
			return nullNullTuple;
		let cells = [];
		let row = placeTag("tr", LEGEND_SERIES, legendBody, legendBody.childNodes[i]);
		addClass(row, s.class);
		if (!s.show)
			addClass(row, OFF);
		let label = placeTag("th", null, row);
		if (markers.show) {
			let indic = placeDiv(LEGEND_MARKER, label);
			if (i > 0) {
				let width  = markers.width(self, i);
				if (width)
					indic.style.border = width + "px " + markers.dash(self, i) + " " + markers.stroke(self, i);
				indic.style.background = markers.fill(self, i);
			}
		}
		let text = placeDiv(LEGEND_LABEL, label);
		text.textContent = s.label;
		if (i > 0) {
			if (!markers.show)
				text.style.color = s.width > 0 ? markers.stroke(self, i) : markers.fill(self, i);
			onMouse("click", label, e => {
				if (cursor._lock)
					return;
				setCursorEvent(e);
				let seriesIdx = series.indexOf(s);
				if ((e.ctrlKey || e.metaKey) != legend.isolate) {
					let isolate = series.some((s, i) => i > 0 && i != seriesIdx && s.show);
					series.forEach((s, i) => {
						i > 0 && setSeries(i, isolate ? (i == seriesIdx ? son : soff) : son, true, syncOpts.setSeries);
					});
				}
				else
					setSeries(seriesIdx, {show: !s.show}, true, syncOpts.setSeries);
			}, false);
			if (cursorFocus) {
				onMouse(mouseenter, label, e => {
					if (cursor._lock)
						return;
					setCursorEvent(e);
					setSeries(series.indexOf(s), FOCUS_TRUE, true, syncOpts.setSeries);
				}, false);
			}
		}
		for (var key in legendCols) {
			let v = placeTag("td", LEGEND_VALUE, row);
			v.textContent = "--";
			cells.push(v);
		}
		return [row, cells];
	}
	const mouseListeners = new Map();
	function onMouse(ev, targ, fn, onlyTarg = true) {
		const targListeners = mouseListeners.get(targ) || {};
		const listener = cursor.bind[ev](self, targ, fn, onlyTarg);
		if (listener) {
			on(ev, targ, targListeners[ev] = listener);
			mouseListeners.set(targ, targListeners);
		}
	}
	function offMouse(ev, targ, fn) {
		const targListeners = mouseListeners.get(targ) || {};
		for (let k in targListeners) {
			if (ev == null || k == ev) {
				off(k, targ, targListeners[k]);
				delete targListeners[k];
			}
		}
		if (ev == null)
			mouseListeners.delete(targ);
	}
	let fullWidCss = 0;
	let fullHgtCss = 0;
	let plotWidCss = 0;
	let plotHgtCss = 0;
	let plotLftCss = 0;
	let plotTopCss = 0;
	let _plotLftCss = plotLftCss;
	let _plotTopCss = plotTopCss;
	let _plotWidCss = plotWidCss;
	let _plotHgtCss = plotHgtCss;
	let plotLft = 0;
	let plotTop = 0;
	let plotWid = 0;
	let plotHgt = 0;
	self.bbox = {};
	let shouldSetScales = false;
	let shouldSetSize = false;
	let shouldConvergeSize = false;
	let shouldSetCursor = false;
	let shouldSetSelect = false;
	let shouldSetLegend = false;
	function _setSize(width, height, force) {
		if (force || (width != self.width || height != self.height))
			calcSize(width, height);
		resetYSeries(false);
		shouldConvergeSize = true;
		shouldSetSize = true;
		commit();
	}
	function calcSize(width, height) {
		self.width  = fullWidCss = plotWidCss = width;
		self.height = fullHgtCss = plotHgtCss = height;
		plotLftCss  = plotTopCss = 0;
		calcPlotRect();
		calcAxesRects();
		let bb = self.bbox;
		plotLft = bb.left   = incrRound(plotLftCss * pxRatio, 0.5);
		plotTop = bb.top    = incrRound(plotTopCss * pxRatio, 0.5);
		plotWid = bb.width  = incrRound(plotWidCss * pxRatio, 0.5);
		plotHgt = bb.height = incrRound(plotHgtCss * pxRatio, 0.5);
	}
	const CYCLE_LIMIT = 3;
	function convergeSize() {
		let converged = false;
		let cycleNum = 0;
		while (!converged) {
			cycleNum++;
			let axesConverged = axesCalc(cycleNum);
			let paddingConverged = paddingCalc(cycleNum);
			converged = cycleNum == CYCLE_LIMIT || (axesConverged && paddingConverged);
			if (!converged) {
				calcSize(self.width, self.height);
				shouldSetSize = true;
			}
		}
	}
	function setSize({width, height}) {
		_setSize(width, height);
	}
	self.setSize = setSize;
	function calcPlotRect() {
		let hasTopAxis = false;
		let hasBtmAxis = false;
		let hasRgtAxis = false;
		let hasLftAxis = false;
		axes.forEach((axis, i) => {
			if (axis.show && axis._show) {
				let {side, _size} = axis;
				let isVt = side % 2;
				let labelSize = axis.label != null ? axis.labelSize : 0;
				let fullSize = _size + labelSize;
				if (fullSize > 0) {
					if (isVt) {
						plotWidCss -= fullSize;
						if (side == 3) {
							plotLftCss += fullSize;
							hasLftAxis = true;
						}
						else
							hasRgtAxis = true;
					}
					else {
						plotHgtCss -= fullSize;
						if (side == 0) {
							plotTopCss += fullSize;
							hasTopAxis = true;
						}
						else
							hasBtmAxis = true;
					}
				}
			}
		});
		sidesWithAxes[0] = hasTopAxis;
		sidesWithAxes[1] = hasRgtAxis;
		sidesWithAxes[2] = hasBtmAxis;
		sidesWithAxes[3] = hasLftAxis;
		plotWidCss -= _padding[1] + _padding[3];
		plotLftCss += _padding[3];
		plotHgtCss -= _padding[2] + _padding[0];
		plotTopCss += _padding[0];
	}
	function calcAxesRects() {
		let off1 = plotLftCss + plotWidCss;
		let off2 = plotTopCss + plotHgtCss;
		let off3 = plotLftCss;
		let off0 = plotTopCss;
		function incrOffset(side, size) {
			switch (side) {
				case 1: off1 += size; return off1 - size;
				case 2: off2 += size; return off2 - size;
				case 3: off3 -= size; return off3 + size;
				case 0: off0 -= size; return off0 + size;
			}
		}
		axes.forEach((axis, i) => {
			if (axis.show && axis._show) {
				let side = axis.side;
				axis._pos = incrOffset(side, axis._size);
				if (axis.label != null)
					axis._lpos = incrOffset(side, axis.labelSize);
			}
		});
	}
	const cursor = self.cursor = assign({}, cursorOpts, {drag: {y: mode == 2}}, opts.cursor);
	if (cursor.dataIdx == null) {
		let hov = cursor.hover;
		let skip = hov.skip = new Set(hov.skip ?? []);
		skip.add(void 0);
		let prox = hov.prox = fnOrSelf(hov.prox);
		let bias = hov.bias ??= 0;
		cursor.dataIdx = (self, seriesIdx, cursorIdx, valAtPosX) => {
			if (seriesIdx == 0)
				return cursorIdx;
			let idx2 = cursorIdx;
			let _prox = prox(self, seriesIdx, cursorIdx, valAtPosX) ?? inf;
			let withProx = _prox >= 0 && _prox < inf;
			let xDim = scaleX.ori == 0 ? plotWidCss : plotHgtCss;
			let cursorLft = cursor.left;
			let xValues = data[0];
			let yValues = data[seriesIdx];
			if (skip.has(yValues[cursorIdx])) {
				idx2 = null;
				let nonNullLft = null,
					nonNullRgt = null,
					j;
				if (bias == 0 || bias == -1) {
					j = cursorIdx;
					while (nonNullLft == null && j-- > 0) {
						if (!skip.has(yValues[j]))
							nonNullLft = j;
					}
				}
				if (bias == 0 || bias == 1) {
					j = cursorIdx;
					while (nonNullRgt == null && j++ < yValues.length) {
						if (!skip.has(yValues[j]))
							nonNullRgt = j;
					}
				}
				if (nonNullLft != null || nonNullRgt != null) {
					if (withProx) {
						let lftPos = nonNullLft == null ? -Infinity : valToPosX(xValues[nonNullLft], scaleX, xDim, 0);
						let rgtPos = nonNullRgt == null ?  Infinity : valToPosX(xValues[nonNullRgt], scaleX, xDim, 0);
						let lftDelta = cursorLft - lftPos;
						let rgtDelta = rgtPos - cursorLft;
						if (lftDelta <= rgtDelta) {
							if (lftDelta <= _prox)
								idx2 = nonNullLft;
						} else {
							if (rgtDelta <= _prox)
								idx2 = nonNullRgt;
						}
					}
					else {
						idx2 =
							nonNullRgt == null ? nonNullLft :
							nonNullLft == null ? nonNullRgt :
							cursorIdx - nonNullLft <= nonNullRgt - cursorIdx ? nonNullLft : nonNullRgt;
					}
				}
			}
			else if (withProx) {
				let dist = abs(cursorLft - valToPosX(xValues[cursorIdx], scaleX, xDim, 0));
				if (dist > _prox)
					idx2 = null;
			}
			return idx2;
		};
	}
	const setCursorEvent = e => { cursor.event = e; };
	cursor.idxs = activeIdxs;
	cursor._lock = false;
	let points = cursor.points;
	points.show   = fnOrSelf(points.show);
	points.size   = fnOrSelf(points.size);
	points.stroke = fnOrSelf(points.stroke);
	points.width  = fnOrSelf(points.width);
	points.fill   = fnOrSelf(points.fill);
	const focus = self.focus = assign({}, opts.focus || {alpha: 0.3}, cursor.focus);
	const cursorFocus = focus.prox >= 0;
	const cursorOnePt = cursorFocus && points.one;
	let cursorPts = [];
	let cursorPtsLft = [];
	let cursorPtsTop = [];
	function initCursorPt(s, si) {
		let pt = points.show(self, si);
		if (pt) {
			addClass(pt, CURSOR_PT);
			addClass(pt, s.class);
			elTrans(pt, -10, -10, plotWidCss, plotHgtCss);
			over.insertBefore(pt, cursorPts[si]);
			return pt;
		}
	}
	function initSeries(s, i) {
		if (mode == 1 || i > 0) {
			let isTime = mode == 1 && scales[s.scale].time;
			let sv = s.value;
			s.value = isTime ? (isStr(sv) ? timeSeriesVal(_tzDate, timeSeriesStamp(sv, _fmtDate)) : sv || _timeSeriesVal) : sv || numSeriesVal;
			s.label = s.label || (isTime ? timeSeriesLabel : numSeriesLabel);
		}
		if (cursorOnePt || i > 0) {
			s.width  = s.width == null ? 1 : s.width;
			s.paths  = s.paths || linearPath || retNull;
			s.fillTo = fnOrSelf(s.fillTo || seriesFillTo);
			s.pxAlign = +ifNull(s.pxAlign, pxAlign);
			s.pxRound = pxRoundGen(s.pxAlign);
			s.stroke = fnOrSelf(s.stroke || null);
			s.fill   = fnOrSelf(s.fill || null);
			s._stroke = s._fill = s._paths = s._focus = null;
			let _ptDia = ptDia(max(1, s.width), 1);
			let points = s.points = assign({}, {
				size: _ptDia,
				width: max(1, _ptDia * .2),
				stroke: s.stroke,
				space: _ptDia * 2,
				paths: pointsPath,
				_stroke: null,
				_fill: null,
			}, s.points);
			points.show   = fnOrSelf(points.show);
			points.filter = fnOrSelf(points.filter);
			points.fill   = fnOrSelf(points.fill);
			points.stroke = fnOrSelf(points.stroke);
			points.paths  = fnOrSelf(points.paths);
			points.pxAlign = s.pxAlign;
		}
		if (showLegend) {
			let rowCells = initLegendRow(s, i);
			legendRows.splice(i, 0, rowCells[0]);
			legendCells.splice(i, 0, rowCells[1]);
			legend.values.push(null);
		}
		if (cursor.show) {
			activeIdxs.splice(i, 0, null);
			let pt = null;
			if (cursorOnePt) {
				if (i == 0)
					pt = initCursorPt(s, i);
			}
			else if (i > 0)
				pt = initCursorPt(s, i);
			cursorPts.splice(i, 0, pt);
			cursorPtsLft.splice(i, 0, 0);
			cursorPtsTop.splice(i, 0, 0);
		}
		fire("addSeries", i);
	}
	function addSeries(opts, si) {
		si = si == null ? series.length : si;
		opts = mode == 1 ? setDefault(opts, si, xSeriesOpts, ySeriesOpts) : setDefault(opts, si, {}, xySeriesOpts);
		series.splice(si, 0, opts);
		initSeries(series[si], si);
	}
	self.addSeries = addSeries;
	function delSeries(i) {
		series.splice(i, 1);
		if (showLegend) {
			legend.values.splice(i, 1);
			legendCells.splice(i, 1);
			let tr = legendRows.splice(i, 1)[0];
			offMouse(null, tr.firstChild);
			tr.remove();
		}
		if (cursor.show) {
			activeIdxs.splice(i, 1);
			cursorPts.splice(i, 1)[0].remove();
			cursorPtsLft.splice(i, 1);
			cursorPtsTop.splice(i, 1);
		}
		fire("delSeries", i);
	}
	self.delSeries = delSeries;
	const sidesWithAxes = [false, false, false, false];
	function initAxis(axis, i) {
		axis._show = axis.show;
		if (axis.show) {
			let isVt = axis.side % 2;
			let sc = scales[axis.scale];
			if (sc == null) {
				axis.scale = isVt ? series[1].scale : xScaleKey;
				sc = scales[axis.scale];
			}
			let isTime = sc.time;
			axis.size   = fnOrSelf(axis.size);
			axis.space  = fnOrSelf(axis.space);
			axis.rotate = fnOrSelf(axis.rotate);
			if (isArr(axis.incrs)) {
				axis.incrs.forEach(incr => {
					!fixedDec.has(incr) && fixedDec.set(incr, guessDec(incr));
				});
			}
			axis.incrs  = fnOrSelf(axis.incrs  || (          sc.distr == 2 ? wholeIncrs : (isTime ? (ms == 1 ? timeIncrsMs : timeIncrsS) : numIncrs)));
			axis.splits = fnOrSelf(axis.splits || (isTime && sc.distr == 1 ? _timeAxisSplits : sc.distr == 3 ? logAxisSplits : sc.distr == 4 ? asinhAxisSplits : numAxisSplits));
			axis.stroke        = fnOrSelf(axis.stroke);
			axis.grid.stroke   = fnOrSelf(axis.grid.stroke);
			axis.ticks.stroke  = fnOrSelf(axis.ticks.stroke);
			axis.border.stroke = fnOrSelf(axis.border.stroke);
			let av = axis.values;
			axis.values = (
				isArr(av) && !isArr(av[0]) ? fnOrSelf(av) :
				isTime ? (
					isArr(av) ?
						timeAxisVals(_tzDate, timeAxisStamps(av, _fmtDate)) :
					isStr(av) ?
						timeAxisVal(_tzDate, av) :
					av || _timeAxisVals
				) : av || numAxisVals
			);
			axis.filter = fnOrSelf(axis.filter || (          sc.distr >= 3 && sc.log == 10 ? log10AxisValsFilt : sc.distr == 3 && sc.log == 2 ? log2AxisValsFilt : retArg1));
			axis.font      = pxRatioFont(axis.font);
			axis.labelFont = pxRatioFont(axis.labelFont);
			axis._size   = axis.size(self, null, i, 0);
			axis._space  =
			axis._rotate =
			axis._incrs  =
			axis._found  =
			axis._splits =
			axis._values = null;
			if (axis._size > 0) {
				sidesWithAxes[i] = true;
				axis._el = placeDiv(AXIS, wrap);
			}
		}
	}
	function autoPadSide(self, side, sidesWithAxes, cycleNum) {
		let [hasTopAxis, hasRgtAxis, hasBtmAxis, hasLftAxis] = sidesWithAxes;
		let ori = side % 2;
		let size = 0;
		if (ori == 0 && (hasLftAxis || hasRgtAxis))
			size = (side == 0 && !hasTopAxis || side == 2 && !hasBtmAxis ? round(xAxisOpts.size / 3) : 0);
		if (ori == 1 && (hasTopAxis || hasBtmAxis))
			size = (side == 1 && !hasRgtAxis || side == 3 && !hasLftAxis ? round(yAxisOpts.size / 2) : 0);
		return size;
	}
	const padding = self.padding = (opts.padding || [autoPadSide,autoPadSide,autoPadSide,autoPadSide]).map(p => fnOrSelf(ifNull(p, autoPadSide)));
	const _padding = self._padding = padding.map((p, i) => p(self, i, sidesWithAxes, 0));
	let dataLen;
	let i0 = null;
	let i1 = null;
	const idxs = mode == 1 ? series[0].idxs : null;
	let data0 = null;
	let viaAutoScaleX = false;
	function setData(_data, _resetScales) {
		data = _data == null ? [] : _data;
		self.data = self._data = data;
		if (mode == 2) {
			dataLen = 0;
			for (let i = 1; i < series.length; i++)
				dataLen += data[i][0].length;
		}
		else {
			if (data.length == 0)
				self.data = self._data = data = [[]];
			data0 = data[0];
			dataLen = data0.length;
			let scaleData = data;
			if (xScaleDistr == 2) {
				scaleData = data.slice();
				let _data0 = scaleData[0] = Array(dataLen);
				for (let i = 0; i < dataLen; i++)
					_data0[i] = i;
			}
			self._data = data = scaleData;
		}
		resetYSeries(true);
		fire("setData");
		if (xScaleDistr == 2) {
			shouldConvergeSize = true;
		}
		if (_resetScales !== false) {
			let xsc = scaleX;
			if (xsc.auto(self, viaAutoScaleX))
				autoScaleX();
			else
				_setScale(xScaleKey, xsc.min, xsc.max);
			shouldSetCursor = shouldSetCursor || cursor.left >= 0;
			shouldSetLegend = true;
			commit();
		}
	}
	self.setData = setData;
	function autoScaleX() {
		viaAutoScaleX = true;
		let _min, _max;
		if (mode == 1) {
			if (dataLen > 0) {
				i0 = idxs[0] = 0;
				i1 = idxs[1] = dataLen - 1;
				_min = data[0][i0];
				_max = data[0][i1];
				if (xScaleDistr == 2) {
					_min = i0;
					_max = i1;
				}
				else if (_min == _max) {
					if (xScaleDistr == 3)
						[_min, _max] = rangeLog(_min, _min, scaleX.log, false);
					else if (xScaleDistr == 4)
						[_min, _max] = rangeAsinh(_min, _min, scaleX.log, false);
					else if (scaleX.time)
						_max = _min + round(86400 / ms);
					else
						[_min, _max] = rangeNum(_min, _max, rangePad, true);
				}
			}
			else {
				i0 = idxs[0] = _min = null;
				i1 = idxs[1] = _max = null;
			}
		}
		_setScale(xScaleKey, _min, _max);
	}
	let ctxStroke, ctxFill, ctxWidth, ctxDash, ctxJoin, ctxCap, ctxFont, ctxAlign, ctxBaseline;
	let ctxAlpha;
	function setCtxStyle(stroke, width, dash, cap, fill, join) {
		stroke ??= transparent;
		dash   ??= EMPTY_ARR;
		cap    ??= "butt";
		fill   ??= transparent;
		join   ??= "round";
		if (stroke != ctxStroke)
			ctx.strokeStyle = ctxStroke = stroke;
		if (fill != ctxFill)
			ctx.fillStyle = ctxFill = fill;
		if (width != ctxWidth)
			ctx.lineWidth = ctxWidth = width;
		if (join != ctxJoin)
			ctx.lineJoin = ctxJoin = join;
		if (cap != ctxCap)
			ctx.lineCap = ctxCap = cap;
		if (dash != ctxDash)
			ctx.setLineDash(ctxDash = dash);
	}
	function setFontStyle(font, fill, align, baseline) {
		if (fill != ctxFill)
			ctx.fillStyle = ctxFill = fill;
		if (font != ctxFont)
			ctx.font = ctxFont = font;
		if (align != ctxAlign)
			ctx.textAlign = ctxAlign = align;
		if (baseline != ctxBaseline)
			ctx.textBaseline = ctxBaseline = baseline;
	}
	function accScale(wsc, psc, facet, data, sorted = 0) {
		if (data.length > 0 && wsc.auto(self, viaAutoScaleX) && (psc == null || psc.min == null)) {
			let _i0 = ifNull(i0, 0);
			let _i1 = ifNull(i1, data.length - 1);
			let minMax = facet.min == null ? (wsc.distr == 3 ? getMinMaxLog(data, _i0, _i1) : getMinMax(data, _i0, _i1, sorted)) : [facet.min, facet.max];
			wsc.min = min(wsc.min, facet.min = minMax[0]);
			wsc.max = max(wsc.max, facet.max = minMax[1]);
		}
	}
	const AUTOSCALE = {min: null, max: null};
	function setScales() {
		for (let k in scales) {
			let sc = scales[k];
			if (pendScales[k] == null &&
				(
					sc.min == null ||
					pendScales[xScaleKey] != null && sc.auto(self, viaAutoScaleX)
				)
			) {
				pendScales[k] = AUTOSCALE;
			}
		}
		for (let k in scales) {
			let sc = scales[k];
			if (pendScales[k] == null && sc.from != null && pendScales[sc.from] != null)
				pendScales[k] = AUTOSCALE;
		}
		if (pendScales[xScaleKey] != null)
			resetYSeries(true);
		let wipScales = {};
		for (let k in pendScales) {
			let psc = pendScales[k];
			if (psc != null) {
				let wsc = wipScales[k] = copy(scales[k], fastIsObj);
				if (psc.min != null)
					assign(wsc, psc);
				else if (k != xScaleKey || mode == 2) {
					if (dataLen == 0 && wsc.from == null) {
						let minMax = wsc.range(self, null, null, k);
						wsc.min = minMax[0];
						wsc.max = minMax[1];
					}
					else {
						wsc.min = inf;
						wsc.max = -inf;
					}
				}
			}
		}
		if (dataLen > 0) {
			series.forEach((s, i) => {
				if (mode == 1) {
					let k = s.scale;
					let psc = pendScales[k];
					if (psc == null)
						return;
					let wsc = wipScales[k];
					if (i == 0) {
						let minMax = wsc.range(self, wsc.min, wsc.max, k);
						wsc.min = minMax[0];
						wsc.max = minMax[1];
						i0 = closestIdx(wsc.min, data[0]);
						i1 = closestIdx(wsc.max, data[0]);
						if (i1 - i0 > 1) {
							if (data[0][i0] < wsc.min)
								i0++;
							if (data[0][i1] > wsc.max)
								i1--;
						}
						s.min = data0[i0];
						s.max = data0[i1];
					}
					else if (s.show && s.auto)
						accScale(wsc, psc, s, data[i], s.sorted);
					s.idxs[0] = i0;
					s.idxs[1] = i1;
				}
				else {
					if (i > 0) {
						if (s.show && s.auto) {
							let [ xFacet, yFacet ] = s.facets;
							let xScaleKey = xFacet.scale;
							let yScaleKey = yFacet.scale;
							let [ xData, yData ] = data[i];
							let wscx = wipScales[xScaleKey];
							let wscy = wipScales[yScaleKey];
							wscx != null && accScale(wscx, pendScales[xScaleKey], xFacet, xData, xFacet.sorted);
							wscy != null && accScale(wscy, pendScales[yScaleKey], yFacet, yData, yFacet.sorted);
							s.min = yFacet.min;
							s.max = yFacet.max;
						}
					}
				}
			});
			for (let k in wipScales) {
				let wsc = wipScales[k];
				let psc = pendScales[k];
				if (wsc.from == null && (psc == null || psc.min == null)) {
					let minMax = wsc.range(
						self,
						wsc.min ==  inf ? null : wsc.min,
						wsc.max == -inf ? null : wsc.max,
						k
					);
					wsc.min = minMax[0];
					wsc.max = minMax[1];
				}
			}
		}
		for (let k in wipScales) {
			let wsc = wipScales[k];
			if (wsc.from != null) {
				let base = wipScales[wsc.from];
				if (base.min == null)
					wsc.min = wsc.max = null;
				else {
					let minMax = wsc.range(self, base.min, base.max, k);
					wsc.min = minMax[0];
					wsc.max = minMax[1];
				}
			}
		}
		let changed = {};
		let anyChanged = false;
		for (let k in wipScales) {
			let wsc = wipScales[k];
			let sc = scales[k];
			if (sc.min != wsc.min || sc.max != wsc.max) {
				sc.min = wsc.min;
				sc.max = wsc.max;
				let distr = sc.distr;
				sc._min = distr == 3 ? log10(sc.min) : distr == 4 ? asinh(sc.min, sc.asinh) : distr == 100 ? sc.fwd(sc.min) : sc.min;
				sc._max = distr == 3 ? log10(sc.max) : distr == 4 ? asinh(sc.max, sc.asinh) : distr == 100 ? sc.fwd(sc.max) : sc.max;
				changed[k] = anyChanged = true;
			}
		}
		if (anyChanged) {
			series.forEach((s, i) => {
				if (mode == 2) {
					if (i > 0 && changed.y)
						s._paths = null;
				}
				else {
					if (changed[s.scale])
						s._paths = null;
				}
			});
			for (let k in changed) {
				shouldConvergeSize = true;
				fire("setScale", k);
			}
			if (cursor.show && cursor.left >= 0)
				shouldSetCursor = shouldSetLegend = true;
		}
		for (let k in pendScales)
			pendScales[k] = null;
	}
	function getOuterIdxs(ydata) {
		let _i0 = clamp(i0 - 1, 0, dataLen - 1);
		let _i1 = clamp(i1 + 1, 0, dataLen - 1);
		while (ydata[_i0] == null && _i0 > 0)
			_i0--;
		while (ydata[_i1] == null && _i1 < dataLen - 1)
			_i1++;
		return [_i0, _i1];
	}
	function drawSeries() {
		if (dataLen > 0) {
			series.forEach((s, i) => {
				if (i > 0 && s.show) {
					cacheStrokeFill(i, false);
					cacheStrokeFill(i, true);
					if (s._paths == null) {
						if (ctxAlpha != s.alpha)
							ctx.globalAlpha = ctxAlpha = s.alpha;
						let _idxs = mode == 2 ? [0, data[i][0].length - 1] : getOuterIdxs(data[i]);
						s._paths = s.paths(self, i, _idxs[0], _idxs[1]);
						if (ctxAlpha != 1)
							ctx.globalAlpha = ctxAlpha = 1;
					}
				}
			});
			series.forEach((s, i) => {
				if (i > 0 && s.show) {
					if (ctxAlpha != s.alpha)
						ctx.globalAlpha = ctxAlpha = s.alpha;
					s._paths != null && drawPath(i, false);
					{
						let _gaps = s._paths != null ? s._paths.gaps : null;
						let show = s.points.show(self, i, i0, i1, _gaps);
						let idxs = s.points.filter(self, i, show, _gaps);
						if (show || idxs) {
							s.points._paths = s.points.paths(self, i, i0, i1, idxs);
							drawPath(i, true);
						}
					}
					if (ctxAlpha != 1)
						ctx.globalAlpha = ctxAlpha = 1;
					fire("drawSeries", i);
				}
			});
		}
	}
	function cacheStrokeFill(si, _points) {
		let s = _points ? series[si].points : series[si];
		s._stroke = s.stroke(self, si);
		s._fill   = s.fill(self, si);
	}
	function drawPath(si, _points) {
		let s = _points ? series[si].points : series[si];
		let {
			stroke,
			fill,
			clip: gapsClip,
			flags,
			_stroke: strokeStyle = s._stroke,
			_fill:   fillStyle   = s._fill,
			_width:  width       = s.width,
		} = s._paths;
		width = roundDec(width * pxRatio, 3);
		let boundsClip = null;
		let offset = (width % 2) / 2;
		if (_points && fillStyle == null)
			fillStyle = width > 0 ? "#fff" : strokeStyle;
		let _pxAlign = s.pxAlign == 1 && offset > 0;
		_pxAlign && ctx.translate(offset, offset);
		if (!_points) {
			let lft = plotLft - width / 2,
				top = plotTop - width / 2,
				wid = plotWid + width,
				hgt = plotHgt + width;
			boundsClip = new Path2D();
			boundsClip.rect(lft, top, wid, hgt);
		}
		if (_points)
			strokeFill(strokeStyle, width, s.dash, s.cap, fillStyle, stroke, fill, flags, gapsClip);
		else
			fillStroke(si, strokeStyle, width, s.dash, s.cap, fillStyle, stroke, fill, flags, boundsClip, gapsClip);
		_pxAlign && ctx.translate(-offset, -offset);
	}
	function fillStroke(si, strokeStyle, lineWidth, lineDash, lineCap, fillStyle, strokePath, fillPath, flags, boundsClip, gapsClip) {
		let didStrokeFill = false;
		flags != 0 && bands.forEach((b, bi) => {
			if (b.series[0] == si) {
				let lowerEdge = series[b.series[1]];
				let lowerData = data[b.series[1]];
				let bandClip = (lowerEdge._paths || EMPTY_OBJ).band;
				if (isArr(bandClip))
					bandClip = b.dir == 1 ? bandClip[0] : bandClip[1];
				let gapsClip2;
				let _fillStyle = null;
				if (lowerEdge.show && bandClip && hasData(lowerData, i0, i1)) {
					_fillStyle = b.fill(self, bi) || fillStyle;
					gapsClip2 = lowerEdge._paths.clip;
				}
				else
					bandClip = null;
				strokeFill(strokeStyle, lineWidth, lineDash, lineCap, _fillStyle, strokePath, fillPath, flags, boundsClip, gapsClip, gapsClip2, bandClip);
				didStrokeFill = true;
			}
		});
		if (!didStrokeFill)
			strokeFill(strokeStyle, lineWidth, lineDash, lineCap, fillStyle, strokePath, fillPath, flags, boundsClip, gapsClip);
	}
	const CLIP_FILL_STROKE = BAND_CLIP_FILL | BAND_CLIP_STROKE;
	function strokeFill(strokeStyle, lineWidth, lineDash, lineCap, fillStyle, strokePath, fillPath, flags, boundsClip, gapsClip, gapsClip2, bandClip) {
		setCtxStyle(strokeStyle, lineWidth, lineDash, lineCap, fillStyle);
		if (boundsClip || gapsClip || bandClip) {
			ctx.save();
			boundsClip && ctx.clip(boundsClip);
			gapsClip && ctx.clip(gapsClip);
		}
		if (bandClip) {
			if ((flags & CLIP_FILL_STROKE) == CLIP_FILL_STROKE) {
				ctx.clip(bandClip);
				gapsClip2 && ctx.clip(gapsClip2);
				doFill(fillStyle, fillPath);
				doStroke(strokeStyle, strokePath, lineWidth);
			}
			else if (flags & BAND_CLIP_STROKE) {
				doFill(fillStyle, fillPath);
				ctx.clip(bandClip);
				doStroke(strokeStyle, strokePath, lineWidth);
			}
			else if (flags & BAND_CLIP_FILL) {
				ctx.save();
				ctx.clip(bandClip);
				gapsClip2 && ctx.clip(gapsClip2);
				doFill(fillStyle, fillPath);
				ctx.restore();
				doStroke(strokeStyle, strokePath, lineWidth);
			}
		}
		else {
			doFill(fillStyle, fillPath);
			doStroke(strokeStyle, strokePath, lineWidth);
		}
		if (boundsClip || gapsClip || bandClip)
			ctx.restore();
	}
	function doStroke(strokeStyle, strokePath, lineWidth) {
		if (lineWidth > 0) {
			if (strokePath instanceof Map) {
				strokePath.forEach((strokePath, strokeStyle) => {
					ctx.strokeStyle = ctxStroke = strokeStyle;
					ctx.stroke(strokePath);
				});
			}
			else
				strokePath != null && strokeStyle && ctx.stroke(strokePath);
		}
	}
	function doFill(fillStyle, fillPath) {
		if (fillPath instanceof Map) {
			fillPath.forEach((fillPath, fillStyle) => {
				ctx.fillStyle = ctxFill = fillStyle;
				ctx.fill(fillPath);
			});
		}
		else
			fillPath != null && fillStyle && ctx.fill(fillPath);
	}
	function getIncrSpace(axisIdx, min, max, fullDim) {
		let axis = axes[axisIdx];
		let incrSpace;
		if (fullDim <= 0)
			incrSpace = [0, 0];
		else {
			let minSpace = axis._space = axis.space(self, axisIdx, min, max, fullDim);
			let incrs    = axis._incrs = axis.incrs(self, axisIdx, min, max, fullDim, minSpace);
			incrSpace    = findIncr(min, max, incrs, fullDim, minSpace);
		}
		return (axis._found = incrSpace);
	}
	function drawOrthoLines(offs, filts, ori, side, pos0, len, width, stroke, dash, cap) {
		let offset = (width % 2) / 2;
		pxAlign == 1 && ctx.translate(offset, offset);
		setCtxStyle(stroke, width, dash, cap, stroke);
		ctx.beginPath();
		let x0, y0, x1, y1, pos1 = pos0 + (side == 0 || side == 3 ? -len : len);
		if (ori == 0) {
			y0 = pos0;
			y1 = pos1;
		}
		else {
			x0 = pos0;
			x1 = pos1;
		}
		for (let i = 0; i < offs.length; i++) {
			if (filts[i] != null) {
				if (ori == 0)
					x0 = x1 = offs[i];
				else
					y0 = y1 = offs[i];
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
			}
		}
		ctx.stroke();
		pxAlign == 1 && ctx.translate(-offset, -offset);
	}
	function axesCalc(cycleNum) {
		let converged = true;
		axes.forEach((axis, i) => {
			if (!axis.show)
				return;
			let scale = scales[axis.scale];
			if (scale.min == null) {
				if (axis._show) {
					converged = false;
					axis._show = false;
					resetYSeries(false);
				}
				return;
			}
			else {
				if (!axis._show) {
					converged = false;
					axis._show = true;
					resetYSeries(false);
				}
			}
			let side = axis.side;
			let ori = side % 2;
			let {min, max} = scale;
			let [_incr, _space] = getIncrSpace(i, min, max, ori == 0 ? plotWidCss : plotHgtCss);
			if (_space == 0)
				return;
			let forceMin = scale.distr == 2;
			let _splits = axis._splits = axis.splits(self, i, min, max, _incr, _space, forceMin);
			let splits = scale.distr == 2 ? _splits.map(i => data0[i]) : _splits;
			let incr   = scale.distr == 2 ? data0[_splits[1]] - data0[_splits[0]] : _incr;
			let values = axis._values = axis.values(self, axis.filter(self, splits, i, _space, incr), i, _space, incr);
			axis._rotate = side == 2 ? axis.rotate(self, values, i, _space) : 0;
			let oldSize = axis._size;
			axis._size = ceil(axis.size(self, values, i, cycleNum));
			if (oldSize != null && axis._size != oldSize)
				converged = false;
		});
		return converged;
	}
	function paddingCalc(cycleNum) {
		let converged = true;
		padding.forEach((p, i) => {
			let _p = p(self, i, sidesWithAxes, cycleNum);
			if (_p != _padding[i])
				converged = false;
			_padding[i] = _p;
		});
		return converged;
	}
	function drawAxesGrid() {
		for (let i = 0; i < axes.length; i++) {
			let axis = axes[i];
			if (!axis.show || !axis._show)
				continue;
			let side = axis.side;
			let ori = side % 2;
			let x, y;
			let fillStyle = axis.stroke(self, i);
			let shiftDir = side == 0 || side == 3 ? -1 : 1;
			if (axis.label) {
				let shiftAmt = axis.labelGap * shiftDir;
				let baseLpos = round((axis._lpos + shiftAmt) * pxRatio);
				setFontStyle(axis.labelFont[0], fillStyle, "center", side == 2 ? TOP : BOTTOM);
				ctx.save();
				if (ori == 1) {
					x = y = 0;
					ctx.translate(
						baseLpos,
						round(plotTop + plotHgt / 2),
					);
					ctx.rotate((side == 3 ? -PI : PI) / 2);
				}
				else {
					x = round(plotLft + plotWid / 2);
					y = baseLpos;
				}
				ctx.fillText(axis.label, x, y);
				ctx.restore();
			}
			let [_incr, _space] = axis._found;
			if (_space == 0)
				continue;
			let scale = scales[axis.scale];
			let plotDim = ori == 0 ? plotWid : plotHgt;
			let plotOff = ori == 0 ? plotLft : plotTop;
			let axisGap = round(axis.gap * pxRatio);
			let _splits = axis._splits;
			let splits = scale.distr == 2 ? _splits.map(i => data0[i]) : _splits;
			let incr   = scale.distr == 2 ? data0[_splits[1]] - data0[_splits[0]] : _incr;
			let ticks = axis.ticks;
			let border = axis.border;
			let tickSize = ticks.show ? round(ticks.size * pxRatio) : 0;
			let angle = axis._rotate * -PI/180;
			let basePos  = pxRound(axis._pos * pxRatio);
			let shiftAmt = (tickSize + axisGap) * shiftDir;
			let finalPos = basePos + shiftAmt;
			    y        = ori == 0 ? finalPos : 0;
			    x        = ori == 1 ? finalPos : 0;
			let font         = axis.font[0];
			let textAlign    = axis.align == 1 ? LEFT :
			                   axis.align == 2 ? RIGHT :
			                   angle > 0 ? LEFT :
			                   angle < 0 ? RIGHT :
			                   ori == 0 ? "center" : side == 3 ? RIGHT : LEFT;
			let textBaseline = angle ||
			                   ori == 1 ? "middle" : side == 2 ? TOP   : BOTTOM;
			setFontStyle(font, fillStyle, textAlign, textBaseline);
			let lineHeight = axis.font[1] * axis.lineGap;
			let canOffs = _splits.map(val => pxRound(getPos(val, scale, plotDim, plotOff)));
			let _values = axis._values;
			for (let i = 0; i < _values.length; i++) {
				let val = _values[i];
				if (val != null) {
					if (ori == 0)
						x = canOffs[i];
					else
						y = canOffs[i];
					val = "" + val;
					let _parts = val.indexOf("\n") == -1 ? [val] : val.split(/\n/gm);
					for (let j = 0; j < _parts.length; j++) {
						let text = _parts[j];
						if (angle) {
							ctx.save();
							ctx.translate(x, y + j * lineHeight);
							ctx.rotate(angle);
							ctx.fillText(text, 0, 0);
							ctx.restore();
						}
						else
							ctx.fillText(text, x, y + j * lineHeight);
					}
				}
			}
			if (ticks.show) {
				drawOrthoLines(
					canOffs,
					ticks.filter(self, splits, i, _space, incr),
					ori,
					side,
					basePos,
					tickSize,
					roundDec(ticks.width * pxRatio, 3),
					ticks.stroke(self, i),
					ticks.dash,
					ticks.cap,
				);
			}
			let grid = axis.grid;
			if (grid.show) {
				drawOrthoLines(
					canOffs,
					grid.filter(self, splits, i, _space, incr),
					ori,
					ori == 0 ? 2 : 1,
					ori == 0 ? plotTop : plotLft,
					ori == 0 ? plotHgt : plotWid,
					roundDec(grid.width * pxRatio, 3),
					grid.stroke(self, i),
					grid.dash,
					grid.cap,
				);
			}
			if (border.show) {
				drawOrthoLines(
					[basePos],
					[1],
					ori == 0 ? 1 : 0,
					ori == 0 ? 1 : 2,
					ori == 1 ? plotTop : plotLft,
					ori == 1 ? plotHgt : plotWid,
					roundDec(border.width * pxRatio, 3),
					border.stroke(self, i),
					border.dash,
					border.cap,
				);
			}
		}
		fire("drawAxes");
	}
	function resetYSeries(minMax) {
		series.forEach((s, i) => {
			if (i > 0) {
				s._paths = null;
				if (minMax) {
					if (mode == 1) {
						s.min = null;
						s.max = null;
					}
					else {
						s.facets.forEach(f => {
							f.min = null;
							f.max = null;
						});
					}
				}
			}
		});
	}
	let queuedCommit = false;
	let deferHooks = false;
	let hooksQueue = [];
	function flushHooks() {
		deferHooks = false;
		for (let i = 0; i < hooksQueue.length; i++)
			fire(...hooksQueue[i]);
		hooksQueue.length = 0;
	}
	function commit() {
		if (!queuedCommit) {
			microTask(_commit);
			queuedCommit = true;
		}
	}
	function batch(fn, _deferHooks = false) {
		queuedCommit = true;
		deferHooks = _deferHooks;
		fn(self);
		_commit();
		if (_deferHooks && hooksQueue.length > 0)
			queueMicrotask(flushHooks);
	}
	self.batch = batch;
	function _commit() {
		if (shouldSetScales) {
			setScales();
			shouldSetScales = false;
		}
		if (shouldConvergeSize) {
			convergeSize();
			shouldConvergeSize = false;
		}
		if (shouldSetSize) {
			setStylePx(under, LEFT,   plotLftCss);
			setStylePx(under, TOP,    plotTopCss);
			setStylePx(under, WIDTH,  plotWidCss);
			setStylePx(under, HEIGHT, plotHgtCss);
			setStylePx(over, LEFT,    plotLftCss);
			setStylePx(over, TOP,     plotTopCss);
			setStylePx(over, WIDTH,   plotWidCss);
			setStylePx(over, HEIGHT,  plotHgtCss);
			setStylePx(wrap, WIDTH,   fullWidCss);
			setStylePx(wrap, HEIGHT,  fullHgtCss);
			can.width  = round(fullWidCss * pxRatio);
			can.height = round(fullHgtCss * pxRatio);
			axes.forEach(({ _el, _show, _size, _pos, side }) => {
				if (_el != null) {
					if (_show) {
						let posOffset = (side === 3 || side === 0 ? _size : 0);
						let isVt = side % 2 == 1;
						setStylePx(_el, isVt ? "left"   : "top",    _pos - posOffset);
						setStylePx(_el, isVt ? "width"  : "height", _size);
						setStylePx(_el, isVt ? "top"    : "left",   isVt ? plotTopCss : plotLftCss);
						setStylePx(_el, isVt ? "height" : "width",  isVt ? plotHgtCss : plotWidCss);
						remClass(_el, OFF);
					}
					else
						addClass(_el, OFF);
				}
			});
			ctxStroke = ctxFill = ctxWidth = ctxJoin = ctxCap = ctxFont = ctxAlign = ctxBaseline = ctxDash = null;
			ctxAlpha = 1;
			syncRect(true);
			if (
				plotLftCss != _plotLftCss ||
				plotTopCss != _plotTopCss ||
				plotWidCss != _plotWidCss ||
				plotHgtCss != _plotHgtCss
			) {
				resetYSeries(false);
				let pctWid = plotWidCss / _plotWidCss;
				let pctHgt = plotHgtCss / _plotHgtCss;
				if (cursor.show && !shouldSetCursor && cursor.left >= 0) {
					cursor.left *= pctWid;
					cursor.top  *= pctHgt;
					vCursor && elTrans(vCursor, round(cursor.left), 0, plotWidCss, plotHgtCss);
					hCursor && elTrans(hCursor, 0, round(cursor.top), plotWidCss, plotHgtCss);
					for (let i = 0; i < cursorPts.length; i++) {
						let pt = cursorPts[i];
						if (pt != null) {
							cursorPtsLft[i] *= pctWid;
							cursorPtsTop[i] *= pctHgt;
							elTrans(pt, ceil(cursorPtsLft[i]), ceil(cursorPtsTop[i]), plotWidCss, plotHgtCss);
						}
					}
				}
				if (select.show && !shouldSetSelect && select.left >= 0 && select.width > 0) {
					select.left   *= pctWid;
					select.width  *= pctWid;
					select.top    *= pctHgt;
					select.height *= pctHgt;
					for (let prop in _hideProps)
						setStylePx(selectDiv, prop, select[prop]);
				}
				_plotLftCss = plotLftCss;
				_plotTopCss = plotTopCss;
				_plotWidCss = plotWidCss;
				_plotHgtCss = plotHgtCss;
			}
			fire("setSize");
			shouldSetSize = false;
		}
		if (fullWidCss > 0 && fullHgtCss > 0) {
			ctx.clearRect(0, 0, can.width, can.height);
			fire("drawClear");
			drawOrder.forEach(fn => fn());
			fire("draw");
		}
		if (select.show && shouldSetSelect) {
			setSelect(select);
			shouldSetSelect = false;
		}
		if (cursor.show && shouldSetCursor) {
			updateCursor(null, true, false);
			shouldSetCursor = false;
		}
		if (legend.show && legend.live && shouldSetLegend) {
			setLegend();
			shouldSetLegend = false;
		}
		if (!ready) {
			ready = true;
			self.status = 1;
			fire("ready");
		}
		viaAutoScaleX = false;
		queuedCommit = false;
	}
	self.redraw = (rebuildPaths, recalcAxes) => {
		shouldConvergeSize = recalcAxes || false;
		if (rebuildPaths !== false)
			_setScale(xScaleKey, scaleX.min, scaleX.max);
		else
			commit();
	};
	function setScale(key, opts) {
		let sc = scales[key];
		if (sc.from == null) {
			if (dataLen == 0) {
				let minMax = sc.range(self, opts.min, opts.max, key);
				opts.min = minMax[0];
				opts.max = minMax[1];
			}
			if (opts.min > opts.max) {
				let _min = opts.min;
				opts.min = opts.max;
				opts.max = _min;
			}
			if (dataLen > 1 && opts.min != null && opts.max != null && opts.max - opts.min < 1e-16)
				return;
			if (key == xScaleKey) {
				if (sc.distr == 2 && dataLen > 0) {
					opts.min = closestIdx(opts.min, data[0]);
					opts.max = closestIdx(opts.max, data[0]);
					if (opts.min == opts.max)
						opts.max++;
				}
			}
			pendScales[key] = opts;
			shouldSetScales = true;
			commit();
		}
	}
	self.setScale = setScale;
	let xCursor;
	let yCursor;
	let vCursor;
	let hCursor;
	let rawMouseLeft0;
	let rawMouseTop0;
	let mouseLeft0;
	let mouseTop0;
	let rawMouseLeft1;
	let rawMouseTop1;
	let mouseLeft1;
	let mouseTop1;
	let dragging = false;
	const drag = cursor.drag;
	let dragX = drag.x;
	let dragY = drag.y;
	if (cursor.show) {
		if (cursor.x)
			xCursor = placeDiv(CURSOR_X, over);
		if (cursor.y)
			yCursor = placeDiv(CURSOR_Y, over);
		if (scaleX.ori == 0) {
			vCursor = xCursor;
			hCursor = yCursor;
		}
		else {
			vCursor = yCursor;
			hCursor = xCursor;
		}
		mouseLeft1 = cursor.left;
		mouseTop1 = cursor.top;
	}
	const select = self.select = assign({
		show:   true,
		over:   true,
		left:   0,
		width:  0,
		top:    0,
		height: 0,
	}, opts.select);
	const selectDiv = select.show ? placeDiv(SELECT, select.over ? over : under) : null;
	function setSelect(opts, _fire) {
		if (select.show) {
			for (let prop in opts) {
				select[prop] = opts[prop];
				if (prop in _hideProps)
					setStylePx(selectDiv, prop, opts[prop]);
			}
			_fire !== false && fire("setSelect");
		}
	}
	self.setSelect = setSelect;
	function toggleDOM(i, onOff) {
		let s = series[i];
		let label = showLegend ? legendRows[i] : null;
		if (s.show)
			label && remClass(label, OFF);
		else {
			label && addClass(label, OFF);
			let pt = cursorOnePt ? cursorPts[0] : cursorPts[i];
			elTrans(pt, -10, -10, plotWidCss, plotHgtCss);
		}
	}
	function _setScale(key, min, max) {
		setScale(key, {min, max});
	}
	function setSeries(i, opts, _fire, _pub) {
		if (opts.focus != null)
			setFocus(i);
		if (opts.show != null) {
			series.forEach((s, si) => {
				if (si > 0 && (i == si || i == null)) {
					s.show = opts.show;
					toggleDOM(si, opts.show);
					if (mode == 2) {
						_setScale(s.facets[0].scale, null, null);
						_setScale(s.facets[1].scale, null, null);
					}
					else
						_setScale(s.scale, null, null);
					commit();
				}
			});
		}
		_fire !== false && fire("setSeries", i, opts);
		_pub && pubSync("setSeries", self, i, opts);
	}
	self.setSeries = setSeries;
	function setBand(bi, opts) {
		assign(bands[bi], opts);
	}
	function addBand(opts, bi) {
		opts.fill = fnOrSelf(opts.fill || null);
		opts.dir = ifNull(opts.dir, -1);
		bi = bi == null ? bands.length : bi;
		bands.splice(bi, 0, opts);
	}
	function delBand(bi) {
		if (bi == null)
			bands.length = 0;
		else
			bands.splice(bi, 1);
	}
	self.addBand = addBand;
	self.setBand = setBand;
	self.delBand = delBand;
	function setAlpha(i, value) {
		series[i].alpha = value;
		if (cursor.show && cursorPts[i])
			cursorPts[i].style.opacity = value;
		if (showLegend && legendRows[i])
			legendRows[i].style.opacity = value;
	}
	let closestDist;
	let closestSeries;
	let focusedSeries;
	const FOCUS_TRUE  = {focus: true};
	function setFocus(i) {
		if (i != focusedSeries) {
			let allFocused = i == null;
			let _setAlpha = focus.alpha != 1;
			series.forEach((s, i2) => {
				if (mode == 1 || i2 > 0) {
					let isFocused = allFocused || i2 == 0 || i2 == i;
					s._focus = allFocused ? null : isFocused;
					_setAlpha && setAlpha(i2, isFocused ? 1 : focus.alpha);
				}
			});
			focusedSeries = i;
			_setAlpha && commit();
		}
	}
	if (showLegend && cursorFocus) {
		onMouse(mouseleave, legendTable, e => {
			if (cursor._lock)
				return;
			setCursorEvent(e);
			if (focusedSeries != null)
				setSeries(null, FOCUS_TRUE, true, syncOpts.setSeries);
		});
	}
	function posToVal(pos, scale, can) {
		let sc = scales[scale];
		if (can)
			pos = pos / pxRatio - (sc.ori == 1 ? plotTopCss : plotLftCss);
		let dim = plotWidCss;
		if (sc.ori == 1) {
			dim = plotHgtCss;
			pos = dim - pos;
		}
		if (sc.dir == -1)
			pos = dim - pos;
		let _min = sc._min,
			_max = sc._max,
			pct = pos / dim;
		let sv = _min + (_max - _min) * pct;
		let distr = sc.distr;
		return (
			distr == 3 ? pow(10, sv) :
			distr == 4 ? sinh(sv, sc.asinh) :
			distr == 100 ? sc.bwd(sv) :
			sv
		);
	}
	function closestIdxFromXpos(pos, can) {
		let v = posToVal(pos, xScaleKey, can);
		return closestIdx(v, data[0], i0, i1);
	}
	self.valToIdx = val => closestIdx(val, data[0]);
	self.posToIdx = closestIdxFromXpos;
	self.posToVal = posToVal;
	self.valToPos = (val, scale, can) => (
		scales[scale].ori == 0 ?
		getHPos(val, scales[scale],
			can ? plotWid : plotWidCss,
			can ? plotLft : 0,
		) :
		getVPos(val, scales[scale],
			can ? plotHgt : plotHgtCss,
			can ? plotTop : 0,
		)
	);
	self.setCursor = (opts, _fire, _pub) => {
		mouseLeft1 = opts.left;
		mouseTop1 = opts.top;
		updateCursor(null, _fire, _pub);
	};
	function setSelH(off, dim) {
		setStylePx(selectDiv, LEFT,  select.left = off);
		setStylePx(selectDiv, WIDTH, select.width = dim);
	}
	function setSelV(off, dim) {
		setStylePx(selectDiv, TOP,    select.top = off);
		setStylePx(selectDiv, HEIGHT, select.height = dim);
	}
	let setSelX = scaleX.ori == 0 ? setSelH : setSelV;
	let setSelY = scaleX.ori == 1 ? setSelH : setSelV;
	function syncLegend() {
		if (showLegend && legend.live) {
			for (let i = mode == 2 ? 1 : 0; i < series.length; i++) {
				if (i == 0 && multiValLegend)
					continue;
				let vals = legend.values[i];
				let j = 0;
				for (let k in vals)
					legendCells[i][j++].firstChild.nodeValue = vals[k];
			}
		}
	}
	function setLegend(opts, _fire) {
		if (opts != null) {
			if (opts.idxs) {
				opts.idxs.forEach((didx, sidx) => {
					activeIdxs[sidx] = didx;
				});
			}
			else if (!isUndef(opts.idx))
				activeIdxs.fill(opts.idx);
			legend.idx = activeIdxs[0];
		}
		if (showLegend && legend.live) {
			for (let sidx = 0; sidx < series.length; sidx++) {
				if (sidx > 0 || mode == 1 && !multiValLegend)
					setLegendValues(sidx, activeIdxs[sidx]);
			}
			syncLegend();
		}
		shouldSetLegend = false;
		_fire !== false && fire("setLegend");
	}
	self.setLegend = setLegend;
	function setLegendValues(sidx, idx) {
		let s = series[sidx];
		let src = sidx == 0 && xScaleDistr == 2 ? data0 : data[sidx];
		let val;
		if (multiValLegend)
			val = s.values(self, sidx, idx) ?? NULL_LEGEND_VALUES;
		else {
			val = s.value(self, idx == null ? null : src[idx], sidx, idx);
			val = val == null ? NULL_LEGEND_VALUES : {_: val};
		}
		legend.values[sidx] = val;
	}
	function updateCursor(src, _fire, _pub) {
		rawMouseLeft1 = mouseLeft1;
		rawMouseTop1 = mouseTop1;
		[mouseLeft1, mouseTop1] = cursor.move(self, mouseLeft1, mouseTop1);
		cursor.left = mouseLeft1;
		cursor.top = mouseTop1;
		if (cursor.show) {
			vCursor && elTrans(vCursor, round(mouseLeft1), 0, plotWidCss, plotHgtCss);
			hCursor && elTrans(hCursor, 0, round(mouseTop1), plotWidCss, plotHgtCss);
		}
		let idx;
		let noDataInRange = i0 > i1;
		closestDist = inf;
		closestSeries = null;
		let xDim = scaleX.ori == 0 ? plotWidCss : plotHgtCss;
		let yDim = scaleX.ori == 1 ? plotWidCss : plotHgtCss;
		if (mouseLeft1 < 0 || dataLen == 0 || noDataInRange) {
			idx = cursor.idx = null;
			for (let i = 0; i < series.length; i++) {
				let pt = cursorPts[i];
				pt != null && elTrans(pt, -10, -10, plotWidCss, plotHgtCss);
			}
			if (cursorFocus)
				setSeries(null, FOCUS_TRUE, true, src == null && syncOpts.setSeries);
			if (legend.live) {
				activeIdxs.fill(idx);
				shouldSetLegend = true;
			}
		}
		else {
			let mouseXPos, valAtPosX, xPos;
			if (mode == 1) {
				mouseXPos = scaleX.ori == 0 ? mouseLeft1 : mouseTop1;
				valAtPosX = posToVal(mouseXPos, xScaleKey);
				idx = cursor.idx = closestIdx(valAtPosX, data[0], i0, i1);
				xPos = valToPosX(data[0][idx], scaleX, xDim, 0);
			}
			let _ptLft = -10;
			let _ptTop = -10;
			let _ptWid = 0;
			let _ptHgt = 0;
			let _centered = true;
			let _ptFill = '';
			let _ptStroke = '';
			for (let i = mode == 2 ? 1 : 0; i < series.length; i++) {
				let s = series[i];
				let idx1  = activeIdxs[i];
				let yVal1 = idx1 == null ? null : (mode == 1 ? data[i][idx1] : data[i][1][idx1]);
				let idx2  = cursor.dataIdx(self, i, idx, valAtPosX);
				let yVal2 = idx2 == null ? null : (mode == 1 ? data[i][idx2] : data[i][1][idx2]);
				shouldSetLegend = shouldSetLegend || yVal2 != yVal1 || idx2 != idx1;
				activeIdxs[i] = idx2;
				let xPos2 = idx2 == idx ? xPos : valToPosX(mode == 1 ? data[0][idx2] : data[i][0][idx2], scaleX, xDim, 0);
				if (i > 0 && s.show) {
					let yPos = yVal2 == null ? -10 : valToPosY(yVal2, mode == 1 ? scales[s.scale] : scales[s.facets[1].scale], yDim, 0);
					if (cursorFocus && yVal2 != null) {
						let mouseYPos = scaleX.ori == 1 ? mouseLeft1 : mouseTop1;
						let dist = abs(focus.dist(self, i, idx2, yPos, mouseYPos));
						if (dist < closestDist) {
							let bias = focus.bias;
							if (bias != 0) {
								let mouseYVal = posToVal(mouseYPos, s.scale);
								let seriesYValSign = yVal2     >= 0 ? 1 : -1;
								let mouseYValSign  = mouseYVal >= 0 ? 1 : -1;
								if (mouseYValSign == seriesYValSign && (
									mouseYValSign == 1 ?
										(bias == 1 ? yVal2 >= mouseYVal : yVal2 <= mouseYVal) :
										(bias == 1 ? yVal2 <= mouseYVal : yVal2 >= mouseYVal)
								)) {
									closestDist = dist;
									closestSeries = i;
								}
							}
							else {
								closestDist = dist;
								closestSeries = i;
							}
						}
					}
					if (shouldSetLegend || cursorOnePt) {
						let hPos, vPos;
						if (scaleX.ori == 0) {
							hPos = xPos2;
							vPos = yPos;
						}
						else {
							hPos = yPos;
							vPos = xPos2;
						}
						let ptWid, ptHgt, ptLft, ptTop,
							ptStroke, ptFill,
							centered = true,
							getBBox = points.bbox;
						if (getBBox != null) {
							centered = false;
							let bbox = getBBox(self, i);
							ptLft = bbox.left;
							ptTop = bbox.top;
							ptWid = bbox.width;
							ptHgt = bbox.height;
						}
						else {
							ptLft = hPos;
							ptTop = vPos;
							ptWid = ptHgt = points.size(self, i);
						}
						ptFill = points.fill(self, i);
						ptStroke = points.stroke(self, i);
						if (cursorOnePt) {
							if (i == closestSeries && closestDist <= focus.prox) {
								_ptLft = ptLft;
								_ptTop = ptTop;
								_ptWid = ptWid;
								_ptHgt = ptHgt;
								_centered = centered;
								_ptFill = ptFill;
								_ptStroke = ptStroke;
							}
						}
						else {
							let pt = cursorPts[i];
							if (pt != null) {
								cursorPtsLft[i] = ptLft;
								cursorPtsTop[i] = ptTop;
								elSize(pt, ptWid, ptHgt, centered);
								elColor(pt, ptFill, ptStroke);
								elTrans(pt, ceil(ptLft), ceil(ptTop), plotWidCss, plotHgtCss);
							}
						}
					}
				}
			}
			if (cursorOnePt) {
				let p = focus.prox;
				let focusChanged = focusedSeries == null ? closestDist <= p : (closestDist > p || closestSeries != focusedSeries);
				if (shouldSetLegend || focusChanged) {
					let pt = cursorPts[0];
					cursorPtsLft[0] = _ptLft;
					cursorPtsTop[0] = _ptTop;
					elSize(pt, _ptWid, _ptHgt, _centered);
					elColor(pt, _ptFill, _ptStroke);
					elTrans(pt, ceil(_ptLft), ceil(_ptTop), plotWidCss, plotHgtCss);
				}
			}
		}
		if (select.show && dragging) {
			if (src != null) {
				let [xKey, yKey] = syncOpts.scales;
				let [matchXKeys, matchYKeys] = syncOpts.match;
				let [xKeySrc, yKeySrc] = src.cursor.sync.scales;
				let sdrag = src.cursor.drag;
				dragX = sdrag._x;
				dragY = sdrag._y;
				if (dragX || dragY) {
					let { left, top, width, height } = src.select;
					let sori = src.scales[xKeySrc].ori;
					let sPosToVal = src.posToVal;
					let sOff, sDim, sc, a, b;
					let matchingX = xKey != null && matchXKeys(xKey, xKeySrc);
					let matchingY = yKey != null && matchYKeys(yKey, yKeySrc);
					if (matchingX && dragX) {
						if (sori == 0) {
							sOff = left;
							sDim = width;
						}
						else {
							sOff = top;
							sDim = height;
						}
						sc = scales[xKey];
						a = valToPosX(sPosToVal(sOff, xKeySrc),        sc, xDim, 0);
						b = valToPosX(sPosToVal(sOff + sDim, xKeySrc), sc, xDim, 0);
						setSelX(min(a,b), abs(b-a));
					}
					else
						setSelX(0, xDim);
					if (matchingY && dragY) {
						if (sori == 1) {
							sOff = left;
							sDim = width;
						}
						else {
							sOff = top;
							sDim = height;
						}
						sc = scales[yKey];
						a = valToPosY(sPosToVal(sOff, yKeySrc),        sc, yDim, 0);
						b = valToPosY(sPosToVal(sOff + sDim, yKeySrc), sc, yDim, 0);
						setSelY(min(a,b), abs(b-a));
					}
					else
						setSelY(0, yDim);
				}
				else
					hideSelect();
			}
			else {
				let rawDX = abs(rawMouseLeft1 - rawMouseLeft0);
				let rawDY = abs(rawMouseTop1 - rawMouseTop0);
				if (scaleX.ori == 1) {
					let _rawDX = rawDX;
					rawDX = rawDY;
					rawDY = _rawDX;
				}
				dragX = drag.x && rawDX >= drag.dist;
				dragY = drag.y && rawDY >= drag.dist;
				let uni = drag.uni;
				if (uni != null) {
					if (dragX && dragY) {
						dragX = rawDX >= uni;
						dragY = rawDY >= uni;
						if (!dragX && !dragY) {
							if (rawDY > rawDX)
								dragY = true;
							else
								dragX = true;
						}
					}
				}
				else if (drag.x && drag.y && (dragX || dragY))
					dragX = dragY = true;
				let p0, p1;
				if (dragX) {
					if (scaleX.ori == 0) {
						p0 = mouseLeft0;
						p1 = mouseLeft1;
					}
					else {
						p0 = mouseTop0;
						p1 = mouseTop1;
					}
					setSelX(min(p0, p1), abs(p1 - p0));
					if (!dragY)
						setSelY(0, yDim);
				}
				if (dragY) {
					if (scaleX.ori == 1) {
						p0 = mouseLeft0;
						p1 = mouseLeft1;
					}
					else {
						p0 = mouseTop0;
						p1 = mouseTop1;
					}
					setSelY(min(p0, p1), abs(p1 - p0));
					if (!dragX)
						setSelX(0, xDim);
				}
				if (!dragX && !dragY) {
					setSelX(0, 0);
					setSelY(0, 0);
				}
			}
		}
		drag._x = dragX;
		drag._y = dragY;
		if (src == null) {
			if (_pub) {
				if (syncKey != null) {
					let [xSyncKey, ySyncKey] = syncOpts.scales;
					syncOpts.values[0] = xSyncKey != null ? posToVal(scaleX.ori == 0 ? mouseLeft1 : mouseTop1, xSyncKey) : null;
					syncOpts.values[1] = ySyncKey != null ? posToVal(scaleX.ori == 1 ? mouseLeft1 : mouseTop1, ySyncKey) : null;
				}
				pubSync(mousemove, self, mouseLeft1, mouseTop1, plotWidCss, plotHgtCss, idx);
			}
			if (cursorFocus) {
				let shouldPub = _pub && syncOpts.setSeries;
				let p = focus.prox;
				if (focusedSeries == null) {
					if (closestDist <= p)
						setSeries(closestSeries, FOCUS_TRUE, true, shouldPub);
				}
				else {
					if (closestDist > p)
						setSeries(null, FOCUS_TRUE, true, shouldPub);
					else if (closestSeries != focusedSeries)
						setSeries(closestSeries, FOCUS_TRUE, true, shouldPub);
				}
			}
		}
		if (shouldSetLegend) {
			legend.idx = idx;
			setLegend();
		}
		_fire !== false && fire("setCursor");
	}
	let rect = null;
	Object.defineProperty(self, 'rect', {
		get() {
			if (rect == null)
				syncRect(false);
			return rect;
		},
	});
	function syncRect(defer = false) {
		if (defer)
			rect = null;
		else {
			rect = over.getBoundingClientRect();
			fire("syncRect", rect);
		}
	}
	function mouseMove(e, src, _l, _t, _w, _h, _i) {
		if (cursor._lock)
			return;
		if (dragging && e != null && e.movementX == 0 && e.movementY == 0)
			return;
		cacheMouse(e, src, _l, _t, _w, _h, _i, false, e != null);
		if (e != null)
			updateCursor(null, true, true);
		else
			updateCursor(src, true, false);
	}
	function cacheMouse(e, src, _l, _t, _w, _h, _i, initial, snap) {
		if (rect == null)
			syncRect(false);
		setCursorEvent(e);
		if (e != null) {
			_l = e.clientX - rect.left;
			_t = e.clientY - rect.top;
		}
		else {
			if (_l < 0 || _t < 0) {
				mouseLeft1 = -10;
				mouseTop1 = -10;
				return;
			}
			let [xKey, yKey] = syncOpts.scales;
			let syncOptsSrc = src.cursor.sync;
			let [xValSrc, yValSrc] = syncOptsSrc.values;
			let [xKeySrc, yKeySrc] = syncOptsSrc.scales;
			let [matchXKeys, matchYKeys] = syncOpts.match;
			let rotSrc = src.axes[0].side % 2 == 1;
			let xDim = scaleX.ori == 0 ? plotWidCss : plotHgtCss,
				yDim = scaleX.ori == 1 ? plotWidCss : plotHgtCss,
				_xDim = rotSrc ? _h : _w,
				_yDim = rotSrc ? _w : _h,
				_xPos = rotSrc ? _t : _l,
				_yPos = rotSrc ? _l : _t;
			if (xKeySrc != null)
				_l = matchXKeys(xKey, xKeySrc) ? getPos(xValSrc, scales[xKey], xDim, 0) : -10;
			else
				_l = xDim * (_xPos/_xDim);
			if (yKeySrc != null)
				_t = matchYKeys(yKey, yKeySrc) ? getPos(yValSrc, scales[yKey], yDim, 0) : -10;
			else
				_t = yDim * (_yPos/_yDim);
			if (scaleX.ori == 1) {
				let __l = _l;
				_l = _t;
				_t = __l;
			}
		}
		if (snap) {
			if (_l <= 1 || _l >= plotWidCss - 1)
				_l = incrRound(_l, plotWidCss);
			if (_t <= 1 || _t >= plotHgtCss - 1)
				_t = incrRound(_t, plotHgtCss);
		}
		if (initial) {
			rawMouseLeft0 = _l;
			rawMouseTop0 = _t;
			[mouseLeft0, mouseTop0] = cursor.move(self, _l, _t);
		}
		else {
			mouseLeft1 = _l;
			mouseTop1 = _t;
		}
	}
	const _hideProps = {
		width: 0,
		height: 0,
		left: 0,
		top: 0,
	};
	function hideSelect() {
		setSelect(_hideProps, false);
	}
	let downSelectLeft;
	let downSelectTop;
	let downSelectWidth;
	let downSelectHeight;
	function mouseDown(e, src, _l, _t, _w, _h, _i) {
		dragging = true;
		dragX = dragY = drag._x = drag._y = false;
		cacheMouse(e, src, _l, _t, _w, _h, _i, true, false);
		if (e != null) {
			onMouse(mouseup, doc, mouseUp, false);
			pubSync(mousedown, self, mouseLeft0, mouseTop0, plotWidCss, plotHgtCss, null);
		}
		let { left, top, width, height } = select;
		downSelectLeft   = left;
		downSelectTop    = top;
		downSelectWidth  = width;
		downSelectHeight = height;
		hideSelect();
	}
	function mouseUp(e, src, _l, _t, _w, _h, _i) {
		dragging = drag._x = drag._y = false;
		cacheMouse(e, src, _l, _t, _w, _h, _i, false, true);
		let { left, top, width, height } = select;
		let hasSelect = width > 0 || height > 0;
		let chgSelect = (
			downSelectLeft   != left   ||
			downSelectTop    != top    ||
			downSelectWidth  != width  ||
			downSelectHeight != height
		);
		hasSelect && chgSelect && setSelect(select);
		if (drag.setScale && hasSelect && chgSelect) {
			let xOff = left,
				xDim = width,
				yOff = top,
				yDim = height;
			if (scaleX.ori == 1) {
				xOff = top,
				xDim = height,
				yOff = left,
				yDim = width;
			}
			if (dragX) {
				_setScale(xScaleKey,
					posToVal(xOff, xScaleKey),
					posToVal(xOff + xDim, xScaleKey)
				);
			}
			if (dragY) {
				for (let k in scales) {
					let sc = scales[k];
					if (k != xScaleKey && sc.from == null && sc.min != inf) {
						_setScale(k,
							posToVal(yOff + yDim, k),
							posToVal(yOff, k)
						);
					}
				}
			}
			hideSelect();
		}
		else if (cursor.lock) {
			cursor._lock = !cursor._lock;
			updateCursor(null, true, false);
		}
		if (e != null) {
			offMouse(mouseup, doc);
			pubSync(mouseup, self, mouseLeft1, mouseTop1, plotWidCss, plotHgtCss, null);
		}
	}
	function mouseLeave(e, src, _l, _t, _w, _h, _i) {
		if (cursor._lock)
			return;
		setCursorEvent(e);
		let _dragging = dragging;
		if (dragging) {
			let snapH = true;
			let snapV = true;
			let snapProx = 10;
			let dragH, dragV;
			if (scaleX.ori == 0) {
				dragH = dragX;
				dragV = dragY;
			}
			else {
				dragH = dragY;
				dragV = dragX;
			}
			if (dragH && dragV) {
				snapH = mouseLeft1 <= snapProx || mouseLeft1 >= plotWidCss - snapProx;
				snapV = mouseTop1  <= snapProx || mouseTop1  >= plotHgtCss - snapProx;
			}
			if (dragH && snapH)
				mouseLeft1 = mouseLeft1 < mouseLeft0 ? 0 : plotWidCss;
			if (dragV && snapV)
				mouseTop1 = mouseTop1 < mouseTop0 ? 0 : plotHgtCss;
			updateCursor(null, true, true);
			dragging = false;
		}
		mouseLeft1 = -10;
		mouseTop1 = -10;
		updateCursor(null, true, true);
		if (_dragging)
			dragging = _dragging;
	}
	function dblClick(e, src, _l, _t, _w, _h, _i) {
		if (cursor._lock)
			return;
		setCursorEvent(e);
		autoScaleX();
		hideSelect();
		if (e != null)
			pubSync(dblclick, self, mouseLeft1, mouseTop1, plotWidCss, plotHgtCss, null);
	}
	function syncPxRatio() {
		axes.forEach(syncFontSize);
		_setSize(self.width, self.height, true);
	}
	on(dppxchange, win, syncPxRatio);
	const events = {};
	events.mousedown = mouseDown;
	events.mousemove = mouseMove;
	events.mouseup = mouseUp;
	events.dblclick = dblClick;
	events["setSeries"] = (e, src, idx, opts) => {
		let seriesIdxMatcher = syncOpts.match[2];
		idx = seriesIdxMatcher(self, src, idx);
		idx != -1 && setSeries(idx, opts, true, false);
	};
	if (cursor.show) {
		onMouse(mousedown,  over, mouseDown);
		onMouse(mousemove,  over, mouseMove);
		onMouse(mouseenter, over, e => {
			setCursorEvent(e);
			syncRect(false);
		});
		onMouse(mouseleave, over, mouseLeave);
		onMouse(dblclick, over, dblClick);
		cursorPlots.add(self);
		self.syncRect = syncRect;
	}
	const hooks = self.hooks = opts.hooks || {};
	function fire(evName, a1, a2) {
		if (deferHooks)
			hooksQueue.push([evName, a1, a2]);
		else {
			if (evName in hooks) {
				hooks[evName].forEach(fn => {
					fn.call(null, self, a1, a2);
				});
			}
		}
	}
	(opts.plugins || []).forEach(p => {
		for (let evName in p.hooks)
			hooks[evName] = (hooks[evName] || []).concat(p.hooks[evName]);
	});
	const seriesIdxMatcher = (self, src, srcSeriesIdx) => srcSeriesIdx;
	const syncOpts = assign({
		key: null,
		setSeries: false,
		filters: {
			pub: retTrue,
			sub: retTrue,
		},
		scales: [xScaleKey, series[1] ? series[1].scale : null],
		match: [retEq, retEq, seriesIdxMatcher],
		values: [null, null],
	}, cursor.sync);
	if (syncOpts.match.length == 2)
		syncOpts.match.push(seriesIdxMatcher);
	cursor.sync = syncOpts;
	const syncKey = syncOpts.key;
	const sync = _sync(syncKey);
	function pubSync(type, src, x, y, w, h, i) {
		if (syncOpts.filters.pub(type, src, x, y, w, h, i))
			sync.pub(type, src, x, y, w, h, i);
	}
	sync.sub(self);
	function pub(type, src, x, y, w, h, i) {
		if (syncOpts.filters.sub(type, src, x, y, w, h, i))
			events[type](null, src, x, y, w, h, i);
	}
	self.pub = pub;
	function destroy() {
		sync.unsub(self);
		cursorPlots.delete(self);
		mouseListeners.clear();
		off(dppxchange, win, syncPxRatio);
		root.remove();
		legendTable?.remove();
		fire("destroy");
	}
	self.destroy = destroy;
	function _init() {
		fire("init", opts, data);
		setData(data || opts.data, false);
		if (pendScales[xScaleKey])
			setScale(xScaleKey, pendScales[xScaleKey]);
		else
			autoScaleX();
		shouldSetSelect = select.show && (select.width > 0 || select.height > 0);
		shouldSetCursor = shouldSetLegend = true;
		_setSize(opts.width, opts.height);
	}
	series.forEach(initSeries);
	axes.forEach(initAxis);
	if (then) {
		if (then instanceof HTMLElement) {
			then.appendChild(root);
			_init();
		}
		else
			then(self, _init);
	}
	else
		_init();
	return self;
}
uPlot.assign = assign;
uPlot.fmtNum = fmtNum;
uPlot.rangeNum = rangeNum;
uPlot.rangeLog = rangeLog;
uPlot.rangeAsinh = rangeAsinh;
uPlot.orient   = orient;
uPlot.pxRatio = pxRatio;
{
	uPlot.join = join;
}
{
	uPlot.fmtDate = fmtDate;
	uPlot.tzDate  = tzDate;
}
uPlot.sync = _sync;
{
	uPlot.addGap = addGap;
	uPlot.clipGaps = clipGaps;
	let paths = uPlot.paths = {
		points,
	};
	(paths.linear  = linear);
	(paths.stepped = stepped);
	(paths.bars    = bars);
	(paths.spline  = monotoneCubic);
}

export { uPlot as default };
