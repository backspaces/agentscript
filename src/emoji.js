import * as util from './utils.js'

// emojis:
//   javascript: a string escape: "\u{1-6 Ns}" where N is a hex digit
//     or String.fromCodePoint(codePoint)
//   html: an entity: &....; where ... is text, decimal or hex number
//      ©: &copy;  &#169;  &#xA9; "&#..." decimal, "&#x..."
//      ↣: &rightarrowtail;  &#8611;  &#x21A3;
//      Lion: <no text>  &#129409;  &#x1F981;
//   Good emoji list: https://www.w3schools.com/charsets/ref_emoji.asp
//
// examples:
//   In html:  <p>&copy; &#129409; &#x1F981; </p>
//   In javascript:  console.log("\u{1F981}", String.fromCodePoint(0x1F981))

const defaultSize = 100
export function emoji2ctx(codePoint, size = defaultSize) {
    // If codePoint is already an emoji, use it, else use fromCodePoint
    const emoji = util.isNumber(codePoint)
        ? String.fromCodePoint(codePoint)
        : codePoint
    const font = `${size}px arial`

    const metrics = util.stringMetrics(emoji, font)
    const width = metrics.width
    const height = metrics.height

    const ctx = util.createCtx(width, height)
    util.setTextProperties(ctx, font)
    ctx.fillText(emoji, width / 2, metrics.actualBoundingBoxAscent)
    return ctx
}

export function emoji2can(codePoint, size = defaultSize) {
    const ctx = emoji2ctx(codePoint, size)
    return ctx.canvas
}

export function downloadEmoji(
    codePoint,
    size = defaultSize,
    name = `emoji-${size}px-${codePoint.toString(16)}`
) {
    const can = emoji2can(codePoint, size)
    util.downloadCanvas(can, name)
}

// ============ emojis, codePoints & codeUnits ============
// Here we convert between numbers (codePoints) and emojis.
// Emojis are simply utf16 strings. CodePoints are numbers up to 32 bits
// We often use the hex form of codePoints due to emoji docs using hex
// Ex: for U+1F469 we would use 0x1F469 for the codePoint
// For codePoints > 16 bits, emojis create two 16 bit  "surrogate pairs" codeUnits
// High-surrogate codeUnits takes values from range 0xD800 to 0xDBFF
// Low-surrogate codeUnits takes values from range 0xDC00 to 0xDFFF
// You seldom need to use the codeUnits, just recognise them

export const emoji2codePoint = emoji => emoji.codePointAt(0)
export const codePoint2emoji = codePoint => String.fromCodePoint(codePoint)

// Note "\u{1F469}" will also create an emoji using a unicode \ escape string
// HTML uses a different syntax, "entities", for emojis. See initial notes.
export const text2entity = text => `&${text};`
export const int2entity = int => `&#${int};`
export const hex2entity = hex => `&#x${hex.toString(16).toUpperCase()};`

// It is possible to have several emojies combine to create a single emoji
// Paste this into the browser's console: 2 folks and a heart!
// "\u{1F469}\u{200D}\u{2764}\u{FE0F}\u{200D}\u{1F48B}\u{200D}\u{1F468}"
// In html:
//     <p>&#9757;&#127999; Dark</p>
// creates a hand with a skin tone
// See: https://unicode.org/emoji/charts/emoji-zwj-sequences.html

// Both arrays can be used by JS or HTML via codePoints2emoji or codePoints2entity
// [0x261D, 0x1F3FC]
// [0x1F469, 0x200D, 0x2764, 0xFE0F, 0x200D, 0x1F48B, 0x200D, 0x1F468]
export function codePoints2emoji(array) {
    return array.map(point => codePoint2emoji(point)).join('')
}
export function codePoints2entity(array) {
    return array.map(point => hex2entity(point)).join('')
}
// let foo = codePoints2emoji([0x261d, 0x1f3ff])
// foo => '☝🏿'
// and foo.length = 3! The first emoji needs only 16 bits while the 2nd 32, or 2 codeUnits
// This: [0x1F469, 0x200D, 0x2764, 0xFE0F, 0x200D, 0x1F48B, 0x200D, 0x1F468]
// produces '👩‍❤️‍💋‍👨' with a length of 11, 8 codePoints with 3 large (32 bit) ones
