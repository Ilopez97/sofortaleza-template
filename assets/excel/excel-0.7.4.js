/* xls.js (C) 2013-2015 SheetJS -- http://sheetjs.com */
var XLS = {};
(function make_xls(XLS) {
    XLS.version = "0.7.4-a";
    var current_codepage = 1200,
        current_cptable;
    if (typeof module !== "undefined" && typeof require !== "undefined") {
        if (typeof cptable === "undefined") cptable = require("./dist/cpexcel");
        current_cptable = cptable[current_codepage]
    }

    function reset_cp() { set_cp(1200) }

    function set_cp(cp) { current_codepage = cp; if (typeof cptable !== "undefined") current_cptable = cptable[cp] }
    var _getchar = function _gc1(x) { return String.fromCharCode(x) };
    if (typeof cptable !== "undefined") _getchar = function _gc2(x) { if (current_codepage === 1200) return String.fromCharCode(x); return cptable.utils.decode(current_codepage, [x & 255, x >> 8])[0] };
    var has_buf = typeof Buffer !== "undefined";

    function new_buf(len) { return new(has_buf ? Buffer : Array)(len) }
    var Base64 = function make_b64() {
        var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        return {
            decode: function b64_decode(input, utf8) {
                var o = "";
                var c1, c2, c3;
                var e1, e2, e3, e4;
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                for (var i = 0; i < input.length;) {
                    e1 = map.indexOf(input.charAt(i++));
                    e2 = map.indexOf(input.charAt(i++));
                    e3 = map.indexOf(input.charAt(i++));
                    e4 = map.indexOf(input.charAt(i++));
                    c1 = e1 << 2 | e2 >> 4;
                    c2 = (e2 & 15) << 4 | e3 >> 2;
                    c3 = (e3 & 3) << 6 | e4;
                    o += String.fromCharCode(c1);
                    if (e3 != 64) { o += String.fromCharCode(c2) }
                    if (e4 != 64) { o += String.fromCharCode(c3) }
                }
                return o
            }
        }
    }();

    function s2a(s) { if (has_buf) return new Buffer(s, "binary"); var w = s.split("").map(function(x) { return x.charCodeAt(0) & 255 }); return w }

    function readIEEE754(buf, idx, isLE, nl, ml) {
        if (isLE === undefined) isLE = true;
        if (!nl) nl = 8;
        if (!ml && nl === 8) ml = 52;
        var e, m, el = nl * 8 - ml - 1,
            eMax = (1 << el) - 1,
            eBias = eMax >> 1;
        var bits = -7,
            d = isLE ? -1 : 1,
            i = isLE ? nl - 1 : 0,
            s = buf[idx + i];
        i += d;
        e = s & (1 << -bits) - 1;
        s >>>= -bits;
        bits += el;
        for (; bits > 0; e = e * 256 + buf[idx + i], i += d, bits -= 8);
        m = e & (1 << -bits) - 1;
        e >>>= -bits;
        bits += ml;
        for (; bits > 0; m = m * 256 + buf[idx + i], i += d, bits -= 8);
        if (e === eMax) return m ? NaN : (s ? -1 : 1) * Infinity;
        else if (e === 0) e = 1 - eBias;
        else {
            m = m + Math.pow(2, ml);
            e = e - eBias
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - ml)
    }
    var chr0 = /\u0000/g,
        chr1 = /[\u0001-\u0006]/;
    var __toBuffer, ___toBuffer;
    __toBuffer = ___toBuffer = function toBuffer_(bufs) { var x = []; for (var i = 0; i < bufs[0].length; ++i) { x.push.apply(x, bufs[0][i]) } return x };
    var __utf16le, ___utf16le;
    __utf16le = ___utf16le = function utf16le_(b, s, e) { var ss = []; for (var i = s; i < e; i += 2) ss.push(String.fromCharCode(__readUInt16LE(b, i))); return ss.join("") };
    var __hexlify, ___hexlify;
    __hexlify = ___hexlify = function hexlify_(b, s, l) { return b.slice(s, s + l).map(function(x) { return (x < 16 ? "0" : "") + x.toString(16) }).join("") };
    var __utf8, ___utf8;
    __utf8 = ___utf8 = function(b, s, e) { var ss = []; for (var i = s; i < e; i++) ss.push(String.fromCharCode(__readUInt8(b, i))); return ss.join("") };
    var __lpstr, ___lpstr;
    __lpstr = ___lpstr = function lpstr_(b, i) { var len = __readUInt32LE(b, i); return len > 0 ? __utf8(b, i + 4, i + 4 + len - 1) : "" };
    var __lpwstr, ___lpwstr;
    __lpwstr = ___lpwstr = function lpwstr_(b, i) { var len = 2 * __readUInt32LE(b, i); return len > 0 ? __utf8(b, i + 4, i + 4 + len - 1) : "" };
    var __double, ___double;
    __double = ___double = function(b, idx) { return readIEEE754(b, idx) };
    var bconcat = function(bufs) { return [].concat.apply([], bufs) };
    if (typeof Buffer !== "undefined") {
        __utf16le = function utf16le_b(b, s, e) { if (!Buffer.isBuffer(b)) return ___utf16le(b, s, e); return b.toString("utf16le", s, e) };
        __hexlify = function(b, s, l) { return Buffer.isBuffer(b) ? b.toString("hex", s, s + l) : ___hexlify(b, s, l) };
        __lpstr = function lpstr_b(b, i) { if (!Buffer.isBuffer(b)) return ___lpstr(b, i); var len = b.readUInt32LE(i); return len > 0 ? b.toString("utf8", i + 4, i + 4 + len - 1) : "" };
        __lpwstr = function lpwstr_b(b, i) { if (!Buffer.isBuffer(b)) return ___lpwstr(b, i); var len = 2 * b.readUInt32LE(i); return b.toString("utf16le", i + 4, i + 4 + len - 1) };
        __utf8 = function utf8_b(s, e) { return this.toString("utf8", s, e) };
        __toBuffer = function(bufs) { return bufs[0].length > 0 && Buffer.isBuffer(bufs[0][0]) ? Buffer.concat(bufs[0]) : ___toBuffer(bufs) };
        bconcat = function(bufs) { return Buffer.isBuffer(bufs[0]) ? Buffer.concat(bufs) : [].concat.apply([], bufs) };
        __double = function double_(b, i) { if (Buffer.isBuffer(b)) return b.readDoubleLE(i); return ___double(b, i) }
    }
    var __readUInt8 = function(b, idx) { return b[idx] };
    var __readUInt16LE = function(b, idx) { return b[idx + 1] * (1 << 8) + b[idx] };
    var __readInt16LE = function(b, idx) { var u = b[idx + 1] * (1 << 8) + b[idx]; return u < 32768 ? u : (65535 - u + 1) * -1 };
    var __readUInt32LE = function(b, idx) { return b[idx + 3] * (1 << 24) + (b[idx + 2] << 16) + (b[idx + 1] << 8) + b[idx] };
    var __readInt32LE = function(b, idx) { return b[idx + 3] << 24 | b[idx + 2] << 16 | b[idx + 1] << 8 | b[idx] };
    var ___unhexlify = function(s) { return s.match(/../g).map(function(x) { return parseInt(x, 16) }) };
    var __unhexlify = typeof Buffer !== "undefined" ? function(s) { return Buffer.isBuffer(s) ? new Buffer(s, "hex") : ___unhexlify(s) } : ___unhexlify;
    if (typeof cptable !== "undefined") {
        __utf16le = function(b, s, e) { return cptable.utils.decode(1200, b.slice(s, e)) };
        __utf8 = function(b, s, e) { return cptable.utils.decode(65001, b.slice(s, e)) };
        __lpstr = function(b, i) { var len = __readUInt32LE(b, i); return len > 0 ? cptable.utils.decode(current_codepage, b.slice(i + 4, i + 4 + len - 1)) : "" };
        __lpwstr = function(b, i) { var len = 2 * __readUInt32LE(b, i); return len > 0 ? cptable.utils.decode(1200, b.slice(i + 4, i + 4 + len - 1)) : "" }
    }

    function ReadShift(size, t) {
        var o, oI, oR, oo = [],
            w, vv, i, loc;
        switch (t) {
            case "lpstr":
                o = __lpstr(this, this.l);
                size = 5 + o.length;
                break;
            case "lpwstr":
                o = __lpwstr(this, this.l);
                size = 5 + o.length;
                if (o[o.length - 1] == "\x00") size += 2;
                break;
            case "cstr":
                size = 0;
                o = "";
                while ((w = __readUInt8(this, this.l + size++)) !== 0) oo.push(_getchar(w));
                o = oo.join("");
                break;
            case "wstr":
                size = 0;
                o = "";
                while ((w = __readUInt16LE(this, this.l + size)) !== 0) {
                    oo.push(_getchar(w));
                    size += 2
                }
                size += 2;
                o = oo.join("");
                break;
            case "dbcs":
                o = "";
                loc = this.l;
                for (i = 0; i != size; ++i) {
                    if (this.lens && this.lens.indexOf(loc) !== -1) {
                        w = __readUInt8(this, loc);
                        this.l = loc + 1;
                        vv = ReadShift.call(this, size - i, w ? "dbcs" : "sbcs");
                        return oo.join("") + vv
                    }
                    oo.push(_getchar(__readUInt16LE(this, loc)));
                    loc += 2
                }
                o = oo.join("");
                size *= 2;
                break;
            case "sbcs":
                o = "";
                loc = this.l;
                for (i = 0; i != size; ++i) {
                    if (this.lens && this.lens.indexOf(loc) !== -1) {
                        w = __readUInt8(this, loc);
                        this.l = loc + 1;
                        vv = ReadShift.call(this, size - i, w ? "dbcs" : "sbcs");
                        return oo.join("") + vv
                    }
                    oo.push(_getchar(__readUInt8(this, loc)));
                    loc += 1
                }
                o = oo.join("");
                break;
            case "utf8":
                o = __utf8(this, this.l, this.l + size);
                break;
            case "utf16le":
                size *= 2;
                o = __utf16le(this, this.l, this.l + size);
                break;
            default:
                switch (size) {
                    case 1:
                        oI = __readUInt8(this, this.l);
                        this.l++;
                        return oI;
                    case 2:
                        oI = t !== "i" ? __readUInt16LE(this, this.l) : __readInt16LE(this, this.l);
                        this.l += 2;
                        return oI;
                    case 4:
                        if (t === "i" || (this[this.l + 3] & 128) === 0) {
                            oI = __readInt32LE(this, this.l);
                            this.l += 4;
                            return oI
                        } else {
                            oR = __readUInt32LE(this, this.l);
                            this.l += 4;
                            return oR
                        }
                        break;
                    case 8:
                        if (t === "f") {
                            oR = __double(this, this.l);
                            this.l += 8;
                            return oR
                        }
                    case 16:
                        o = __hexlify(this, this.l, size);
                        break
                }
        }
        this.l += size;
        return o
    }

    function CheckField(hexstr, fld) {
        var m = __hexlify(this, this.l, hexstr.length >> 1);
        if (m !== hexstr) throw fld + "Expected " + hexstr + " saw " + m;
        this.l += hexstr.length >> 1
    }

    function prep_blob(blob, pos) {
        blob.l = pos;
        blob.read_shift = ReadShift;
        blob.chk = CheckField
    }
    var SSF = {};
    var make_ssf = function make_ssf(SSF) {
        SSF.version = "0.8.1";

        function _strrev(x) {
            var o = "",
                i = x.length - 1;
            while (i >= 0) o += x.charAt(i--);
            return o
        }

        function fill(c, l) { var o = ""; while (o.length < l) o += c; return o }

        function pad0(v, d) { var t = "" + v; return t.length >= d ? t : fill("0", d - t.length) + t }

        function pad_(v, d) { var t = "" + v; return t.length >= d ? t : fill(" ", d - t.length) + t }

        function rpad_(v, d) { var t = "" + v; return t.length >= d ? t : t + fill(" ", d - t.length) }

        function pad0r1(v, d) { var t = "" + Math.round(v); return t.length >= d ? t : fill("0", d - t.length) + t }

        function pad0r2(v, d) { var t = "" + v; return t.length >= d ? t : fill("0", d - t.length) + t }
        var p2_32 = Math.pow(2, 32);

        function pad0r(v, d) { if (v > p2_32 || v < -p2_32) return pad0r1(v, d); var i = Math.round(v); return pad0r2(i, d) }

        function isgeneral(s, i) { return s.length >= 7 + i && (s.charCodeAt(i) | 32) === 103 && (s.charCodeAt(i + 1) | 32) === 101 && (s.charCodeAt(i + 2) | 32) === 110 && (s.charCodeAt(i + 3) | 32) === 101 && (s.charCodeAt(i + 4) | 32) === 114 && (s.charCodeAt(i + 5) | 32) === 97 && (s.charCodeAt(i + 6) | 32) === 108 }
        var opts_fmt = [
            ["date1904", 0],
            ["output", ""],
            ["WTF", false]
        ];

        function fixopts(o) {
            for (var y = 0; y != opts_fmt.length; ++y)
                if (o[opts_fmt[y][0]] === undefined) o[opts_fmt[y][0]] = opts_fmt[y][1]
        }
        SSF.opts = opts_fmt;
        var table_fmt = { 0: "General", 1: "0", 2: "0.00", 3: "#,##0", 4: "#,##0.00", 9: "0%", 10: "0.00%", 11: "0.00E+00", 12: "# ?/?", 13: "# ??/??", 14: "m/d/yy", 15: "d-mmm-yy", 16: "d-mmm", 17: "mmm-yy", 18: "h:mm AM/PM", 19: "h:mm:ss AM/PM", 20: "h:mm", 21: "h:mm:ss", 22: "m/d/yy h:mm", 37: "#,##0 ;(#,##0)", 38: "#,##0 ;[Red](#,##0)", 39: "#,##0.00;(#,##0.00)", 40: "#,##0.00;[Red](#,##0.00)", 45: "mm:ss", 46: "[h]:mm:ss", 47: "mmss.0", 48: "##0.0E+0", 49: "@", 56: '"上午/下午 "hh"時"mm"分"ss"秒 "', 65535: "General" };
        var days = [
            ["Sun", "Sunday"],
            ["Mon", "Monday"],
            ["Tue", "Tuesday"],
            ["Wed", "Wednesday"],
            ["Thu", "Thursday"],
            ["Fri", "Friday"],
            ["Sat", "Saturday"]
        ];
        var months = [
            ["J", "Jan", "January"],
            ["F", "Feb", "February"],
            ["M", "Mar", "March"],
            ["A", "Apr", "April"],
            ["M", "May", "May"],
            ["J", "Jun", "June"],
            ["J", "Jul", "July"],
            ["A", "Aug", "August"],
            ["S", "Sep", "September"],
            ["O", "Oct", "October"],
            ["N", "Nov", "November"],
            ["D", "Dec", "December"]
        ];

        function frac(x, D, mixed) {
            var sgn = x < 0 ? -1 : 1;
            var B = x * sgn;
            var P_2 = 0,
                P_1 = 1,
                P = 0;
            var Q_2 = 1,
                Q_1 = 0,
                Q = 0;
            var A = Math.floor(B);
            while (Q_1 < D) {
                A = Math.floor(B);
                P = A * P_1 + P_2;
                Q = A * Q_1 + Q_2;
                if (B - A < 5e-10) break;
                B = 1 / (B - A);
                P_2 = P_1;
                P_1 = P;
                Q_2 = Q_1;
                Q_1 = Q
            }
            if (Q > D) {
                Q = Q_1;
                P = P_1
            }
            if (Q > D) {
                Q = Q_2;
                P = P_2
            }
            if (!mixed) return [0, sgn * P, Q];
            if (Q === 0) throw "Unexpected state: " + P + " " + P_1 + " " + P_2 + " " + Q + " " + Q_1 + " " + Q_2;
            var q = Math.floor(sgn * P / Q);
            return [q, sgn * P - q * Q, Q]
        }

        function general_fmt_int(v, opts) { return "" + v }
        SSF._general_int = general_fmt_int;
        var general_fmt_num = function make_general_fmt_num() {
            var gnr1 = /\.(\d*[1-9])0+$/,
                gnr2 = /\.0*$/,
                gnr4 = /\.(\d*[1-9])0+/,
                gnr5 = /\.0*[Ee]/,
                gnr6 = /(E[+-])(\d)$/;

            function gfn2(v) {
                var w = v < 0 ? 12 : 11;
                var o = gfn5(v.toFixed(12));
                if (o.length <= w) return o;
                o = v.toPrecision(10);
                if (o.length <= w) return o;
                return v.toExponential(5)
            }

            function gfn3(v) { var o = v.toFixed(11).replace(gnr1, ".$1"); if (o.length > (v < 0 ? 12 : 11)) o = v.toPrecision(6); return o }

            function gfn4(o) {
                for (var i = 0; i != o.length; ++i)
                    if ((o.charCodeAt(i) | 32) === 101) return o.replace(gnr4, ".$1").replace(gnr5, "E").replace("e", "E").replace(gnr6, "$10$2");
                return o
            }

            function gfn5(o) { return o.indexOf(".") > -1 ? o.replace(gnr2, "").replace(gnr1, ".$1") : o }
            return function general_fmt_num(v, opts) {
                var V = Math.floor(Math.log(Math.abs(v)) * Math.LOG10E),
                    o;
                if (V >= -4 && V <= -1) o = v.toPrecision(10 + V);
                else if (Math.abs(V) <= 9) o = gfn2(v);
                else if (V === 10) o = v.toFixed(10).substr(0, 12);
                else o = gfn3(v);
                return gfn5(gfn4(o))
            }
        }();
        SSF._general_num = general_fmt_num;

        function general_fmt(v, opts) {
            switch (typeof v) {
                case "string":
                    return v;
                case "boolean":
                    return v ? "TRUE" : "FALSE";
                case "number":
                    return (v | 0) === v ? general_fmt_int(v, opts) : general_fmt_num(v, opts)
            }
            throw new Error("unsupported value in General format: " + v)
        }
        SSF._general = general_fmt;

        function fix_hijri(date, o) { return 0 }

        function parse_date_code(v, opts, b2) {
            if (v > 2958465 || v < 0) return null;
            var date = v | 0,
                time = Math.floor(86400 * (v - date)),
                dow = 0;
            var dout = [];
            var out = { D: date, T: time, u: 86400 * (v - date) - time, y: 0, m: 0, d: 0, H: 0, M: 0, S: 0, q: 0 };
            if (Math.abs(out.u) < 1e-6) out.u = 0;
            fixopts(opts != null ? opts : opts = []);
            if (opts.date1904) date += 1462;
            if (out.u > .999) { out.u = 0; if (++time == 86400) { time = 0;++date } }
            if (date === 60) {
                dout = b2 ? [1317, 10, 29] : [1900, 2, 29];
                dow = 3
            } else if (date === 0) {
                dout = b2 ? [1317, 8, 29] : [1900, 1, 0];
                dow = 6
            } else {
                if (date > 60) --date;
                var d = new Date(1900, 0, 1);
                d.setDate(d.getDate() + date - 1);
                dout = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
                dow = d.getDay();
                if (date < 60) dow = (dow + 6) % 7;
                if (b2) dow = fix_hijri(d, dout)
            }
            out.y = dout[0];
            out.m = dout[1];
            out.d = dout[2];
            out.S = time % 60;
            time = Math.floor(time / 60);
            out.M = time % 60;
            time = Math.floor(time / 60);
            out.H = time;
            out.q = dow;
            return out
        }
        SSF.parse_date_code = parse_date_code;

        function write_date(type, fmt, val, ss0) {
            var o = "",
                ss = 0,
                tt = 0,
                y = val.y,
                out, outl = 0;
            switch (type) {
                case 98:
                    y = val.y + 543;
                case 121:
                    switch (fmt.length) {
                        case 1:
                        case 2:
                            out = y % 100;
                            outl = 2;
                            break;
                        default:
                            out = y % 1e4;
                            outl = 4;
                            break
                    }
                    break;
                case 109:
                    switch (fmt.length) {
                        case 1:
                        case 2:
                            out = val.m;
                            outl = fmt.length;
                            break;
                        case 3:
                            return months[val.m - 1][1];
                        case 5:
                            return months[val.m - 1][0];
                        default:
                            return months[val.m - 1][2]
                    }
                    break;
                case 100:
                    switch (fmt.length) {
                        case 1:
                        case 2:
                            out = val.d;
                            outl = fmt.length;
                            break;
                        case 3:
                            return days[val.q][0];
                        default:
                            return days[val.q][1]
                    }
                    break;
                case 104:
                    switch (fmt.length) {
                        case 1:
                        case 2:
                            out = 1 + (val.H + 11) % 12;
                            outl = fmt.length;
                            break;
                        default:
                            throw "bad hour format: " + fmt
                    }
                    break;
                case 72:
                    switch (fmt.length) {
                        case 1:
                        case 2:
                            out = val.H;
                            outl = fmt.length;
                            break;
                        default:
                            throw "bad hour format: " + fmt
                    }
                    break;
                case 77:
                    switch (fmt.length) {
                        case 1:
                        case 2:
                            out = val.M;
                            outl = fmt.length;
                            break;
                        default:
                            throw "bad minute format: " + fmt
                    }
                    break;
                case 115:
                    if (val.u === 0) switch (fmt) {
                        case "s":
                        case "ss":
                            return pad0(val.S, fmt.length);
                        case ".0":
                        case ".00":
                        case ".000":
                    }
                    switch (fmt) {
                        case "s":
                        case "ss":
                        case ".0":
                        case ".00":
                        case ".000":
                            if (ss0 >= 2) tt = ss0 === 3 ? 1e3 : 100;
                            else tt = ss0 === 1 ? 10 : 1;
                            ss = Math.round(tt * (val.S + val.u));
                            if (ss >= 60 * tt) ss = 0;
                            if (fmt === "s") return ss === 0 ? "0" : "" + ss / tt;
                            o = pad0(ss, 2 + ss0);
                            if (fmt === "ss") return o.substr(0, 2);
                            return "." + o.substr(2, fmt.length - 1);
                        default:
                            throw "bad second format: " + fmt
                    }
                case 90:
                    switch (fmt) {
                        case "[h]":
                        case "[hh]":
                            out = val.D * 24 + val.H;
                            break;
                        case "[m]":
                        case "[mm]":
                            out = (val.D * 24 + val.H) * 60 + val.M;
                            break;
                        case "[s]":
                        case "[ss]":
                            out = ((val.D * 24 + val.H) * 60 + val.M) * 60 + Math.round(val.S + val.u);
                            break;
                        default:
                            throw "bad abstime format: " + fmt
                    }
                    outl = fmt.length === 3 ? 1 : 2;
                    break;
                case 101:
                    out = y;
                    outl = 1
            }
            if (outl > 0) return pad0(out, outl);
            else return ""
        }

        function commaify(s) {
            if (s.length <= 3) return s;
            var j = s.length % 3,
                o = s.substr(0, j);
            for (; j != s.length; j += 3) o += (o.length > 0 ? "," : "") + s.substr(j, 3);
            return o
        }
        var write_num = function make_write_num() {
            var pct1 = /%/g;

            function write_num_pct(type, fmt, val) {
                var sfmt = fmt.replace(pct1, ""),
                    mul = fmt.length - sfmt.length;
                return write_num(type, sfmt, val * Math.pow(10, 2 * mul)) + fill("%", mul)
            }

            function write_num_cm(type, fmt, val) { var idx = fmt.length - 1; while (fmt.charCodeAt(idx - 1) === 44) --idx; return write_num(type, fmt.substr(0, idx), val / Math.pow(10, 3 * (fmt.length - idx))) }

            function write_num_exp(fmt, val) {
                var o;
                var idx = fmt.indexOf("E") - fmt.indexOf(".") - 1;
                if (fmt.match(/^#+0.0E\+0$/)) {
                    var period = fmt.indexOf(".");
                    if (period === -1) period = fmt.indexOf("E");
                    var ee = Math.floor(Math.log(Math.abs(val)) * Math.LOG10E) % period;
                    if (ee < 0) ee += period;
                    o = (val / Math.pow(10, ee)).toPrecision(idx + 1 + (period + ee) % period);
                    if (o.indexOf("e") === -1) {
                        var fakee = Math.floor(Math.log(Math.abs(val)) * Math.LOG10E);
                        if (o.indexOf(".") === -1) o = o[0] + "." + o.substr(1) + "E+" + (fakee - o.length + ee);
                        else o += "E+" + (fakee - ee);
                        while (o.substr(0, 2) === "0.") {
                            o = o[0] + o.substr(2, period) + "." + o.substr(2 + period);
                            o = o.replace(/^0+([1-9])/, "$1").replace(/^0+\./, "0.")
                        }
                        o = o.replace(/\+-/, "-")
                    }
                    o = o.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, function($$, $1, $2, $3) { return $1 + $2 + $3.substr(0, (period + ee) % period) + "." + $3.substr(ee) + "E" })
                } else o = val.toExponential(idx);
                if (fmt.match(/E\+00$/) && o.match(/e[+-]\d$/)) o = o.substr(0, o.length - 1) + "0" + o[o.length - 1];
                if (fmt.match(/E\-/) && o.match(/e\+/)) o = o.replace(/e\+/, "e");
                return o.replace("e", "E")
            }
            var frac1 = /# (\?+)( ?)\/( ?)(\d+)/;

            function write_num_f1(r, aval, sign) {
                var den = parseInt(r[4]),
                    rr = Math.round(aval * den),
                    base = Math.floor(rr / den);
                var myn = rr - base * den,
                    myd = den;
                return sign + (base === 0 ? "" : "" + base) + " " + (myn === 0 ? fill(" ", r[1].length + 1 + r[4].length) : pad_(myn, r[1].length) + r[2] + "/" + r[3] + pad0(myd, r[4].length))
            }

            function write_num_f2(r, aval, sign) { return sign + (aval === 0 ? "" : "" + aval) + fill(" ", r[1].length + 2 + r[4].length) }
            var dec1 = /^#*0*\.(0+)/;
            var closeparen = /\).*[0#]/;
            var phone = /\(###\) ###\\?-####/;

            function hashq(str) {
                var o = "",
                    cc;
                for (var i = 0; i != str.length; ++i) switch (cc = str.charCodeAt(i)) {
                    case 35:
                        break;
                    case 63:
                        o += " ";
                        break;
                    case 48:
                        o += "0";
                        break;
                    default:
                        o += String.fromCharCode(cc)
                }
                return o
            }

            function rnd(val, d) { var dd = Math.pow(10, d); return "" + Math.round(val * dd) / dd }

            function dec(val, d) { return Math.round((val - Math.floor(val)) * Math.pow(10, d)) }

            function flr(val) { if (val < 2147483647 && val > -2147483648) return "" + (val >= 0 ? val | 0 : val - 1 | 0); return "" + Math.floor(val) }

            function write_num_flt(type, fmt, val) {
                if (type.charCodeAt(0) === 40 && !fmt.match(closeparen)) { var ffmt = fmt.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, ""); if (val >= 0) return write_num_flt("n", ffmt, val); return "(" + write_num_flt("n", ffmt, -val) + ")" }
                if (fmt.charCodeAt(fmt.length - 1) === 44) return write_num_cm(type, fmt, val);
                if (fmt.indexOf("%") !== -1) return write_num_pct(type, fmt, val);
                if (fmt.indexOf("E") !== -1) return write_num_exp(fmt, val);
                if (fmt.charCodeAt(0) === 36) return "$" + write_num_flt(type, fmt.substr(fmt[1] == " " ? 2 : 1), val);
                var o, oo;
                var r, ri, ff, aval = Math.abs(val),
                    sign = val < 0 ? "-" : "";
                if (fmt.match(/^00+$/)) return sign + pad0r(aval, fmt.length);
                if (fmt.match(/^[#?]+$/)) { o = pad0r(val, 0); if (o === "0") o = ""; return o.length > fmt.length ? o : hashq(fmt.substr(0, fmt.length - o.length)) + o }
                if ((r = fmt.match(frac1)) !== null) return write_num_f1(r, aval, sign);
                if (fmt.match(/^#+0+$/) !== null) return sign + pad0r(aval, fmt.length - fmt.indexOf("0"));
                if ((r = fmt.match(dec1)) !== null) { o = rnd(val, r[1].length).replace(/^([^\.]+)$/, "$1." + r[1]).replace(/\.$/, "." + r[1]).replace(/\.(\d*)$/, function($$, $1) { return "." + $1 + fill("0", r[1].length - $1.length) }); return fmt.indexOf("0.") !== -1 ? o : o.replace(/^0\./, ".") }
                fmt = fmt.replace(/^#+([0.])/, "$1");
                if ((r = fmt.match(/^(0*)\.(#*)$/)) !== null) { return sign + rnd(aval, r[2].length).replace(/\.(\d*[1-9])0*$/, ".$1").replace(/^(-?\d*)$/, "$1.").replace(/^0\./, r[1].length ? "0." : ".") }
                if ((r = fmt.match(/^#,##0(\.?)$/)) !== null) return sign + commaify(pad0r(aval, 0));
                if ((r = fmt.match(/^#,##0\.([#0]*0)$/)) !== null) { return val < 0 ? "-" + write_num_flt(type, fmt, -val) : commaify("" + Math.floor(val)) + "." + pad0(dec(val, r[1].length), r[1].length) }
                if ((r = fmt.match(/^#,#*,#0/)) !== null) return write_num_flt(type, fmt.replace(/^#,#*,/, ""), val);
                if ((r = fmt.match(/^([0#]+)(\\?-([0#]+))+$/)) !== null) {
                    o = _strrev(write_num_flt(type, fmt.replace(/[\\-]/g, ""), val));
                    ri = 0;
                    return _strrev(_strrev(fmt.replace(/\\/g, "")).replace(/[0#]/g, function(x) { return ri < o.length ? o[ri++] : x === "0" ? "0" : "" }))
                }
                if (fmt.match(phone) !== null) { o = write_num_flt(type, "##########", val); return "(" + o.substr(0, 3) + ") " + o.substr(3, 3) + "-" + o.substr(6) }
                var oa = "";
                if ((r = fmt.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/)) !== null) {
                    ri = Math.min(r[4].length, 7);
                    ff = frac(aval, Math.pow(10, ri) - 1, false);
                    o = "" + sign;
                    oa = write_num("n", r[1], ff[1]);
                    if (oa[oa.length - 1] == " ") oa = oa.substr(0, oa.length - 1) + "0";
                    o += oa + r[2] + "/" + r[3];
                    oa = rpad_(ff[2], ri);
                    if (oa.length < r[4].length) oa = hashq(r[4].substr(r[4].length - oa.length)) + oa;
                    o += oa;
                    return o
                }
                if ((r = fmt.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/)) !== null) {
                    ri = Math.min(Math.max(r[1].length, r[4].length), 7);
                    ff = frac(aval, Math.pow(10, ri) - 1, true);
                    return sign + (ff[0] || (ff[1] ? "" : "0")) + " " + (ff[1] ? pad_(ff[1], ri) + r[2] + "/" + r[3] + rpad_(ff[2], ri) : fill(" ", 2 * ri + 1 + r[2].length + r[3].length))
                }
                if ((r = fmt.match(/^[#0?]+$/)) !== null) { o = pad0r(val, 0); if (fmt.length <= o.length) return o; return hashq(fmt.substr(0, fmt.length - o.length)) + o }
                if ((r = fmt.match(/^([#0?]+)\.([#0]+)$/)) !== null) {
                    o = "" + val.toFixed(Math.min(r[2].length, 10)).replace(/([^0])0+$/, "$1");
                    ri = o.indexOf(".");
                    var lres = fmt.indexOf(".") - ri,
                        rres = fmt.length - o.length - lres;
                    return hashq(fmt.substr(0, lres) + o + fmt.substr(fmt.length - rres))
                }
                if ((r = fmt.match(/^00,000\.([#0]*0)$/)) !== null) { ri = dec(val, r[1].length); return val < 0 ? "-" + write_num_flt(type, fmt, -val) : commaify(flr(val)).replace(/^\d,\d{3}$/, "0$&").replace(/^\d*$/, function($$) { return "00," + ($$.length < 3 ? pad0(0, 3 - $$.length) : "") + $$ }) + "." + pad0(ri, r[1].length) }
                switch (fmt) {
                    case "#,###":
                        var x = commaify(pad0r(aval, 0));
                        return x !== "0" ? sign + x : "";
                    default:
                }
                throw new Error("unsupported format |" + fmt + "|")
            }

            function write_num_cm2(type, fmt, val) { var idx = fmt.length - 1; while (fmt.charCodeAt(idx - 1) === 44) --idx; return write_num(type, fmt.substr(0, idx), val / Math.pow(10, 3 * (fmt.length - idx))) }

            function write_num_pct2(type, fmt, val) {
                var sfmt = fmt.replace(pct1, ""),
                    mul = fmt.length - sfmt.length;
                return write_num(type, sfmt, val * Math.pow(10, 2 * mul)) + fill("%", mul)
            }

            function write_num_exp2(fmt, val) {
                var o;
                var idx = fmt.indexOf("E") - fmt.indexOf(".") - 1;
                if (fmt.match(/^#+0.0E\+0$/)) {
                    var period = fmt.indexOf(".");
                    if (period === -1) period = fmt.indexOf("E");
                    var ee = Math.floor(Math.log(Math.abs(val)) * Math.LOG10E) % period;
                    if (ee < 0) ee += period;
                    o = (val / Math.pow(10, ee)).toPrecision(idx + 1 + (period + ee) % period);
                    if (!o.match(/[Ee]/)) {
                        var fakee = Math.floor(Math.log(Math.abs(val)) * Math.LOG10E);
                        if (o.indexOf(".") === -1) o = o[0] + "." + o.substr(1) + "E+" + (fakee - o.length + ee);
                        else o += "E+" + (fakee - ee);
                        o = o.replace(/\+-/, "-")
                    }
                    o = o.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, function($$, $1, $2, $3) { return $1 + $2 + $3.substr(0, (period + ee) % period) + "." + $3.substr(ee) + "E" })
                } else o = val.toExponential(idx);
                if (fmt.match(/E\+00$/) && o.match(/e[+-]\d$/)) o = o.substr(0, o.length - 1) + "0" + o[o.length - 1];
                if (fmt.match(/E\-/) && o.match(/e\+/)) o = o.replace(/e\+/, "e");
                return o.replace("e", "E")
            }

            function write_num_int(type, fmt, val) {
                if (type.charCodeAt(0) === 40 && !fmt.match(closeparen)) { var ffmt = fmt.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, ""); if (val >= 0) return write_num_int("n", ffmt, val); return "(" + write_num_int("n", ffmt, -val) + ")" }
                if (fmt.charCodeAt(fmt.length - 1) === 44) return write_num_cm2(type, fmt, val);
                if (fmt.indexOf("%") !== -1) return write_num_pct2(type, fmt, val);
                if (fmt.indexOf("E") !== -1) return write_num_exp2(fmt, val);
                if (fmt.charCodeAt(0) === 36) return "$" + write_num_int(type, fmt.substr(fmt[1] == " " ? 2 : 1), val);
                var o;
                var r, ri, ff, aval = Math.abs(val),
                    sign = val < 0 ? "-" : "";
                if (fmt.match(/^00+$/)) return sign + pad0(aval, fmt.length);
                if (fmt.match(/^[#?]+$/)) { o = "" + val; if (val === 0) o = ""; return o.length > fmt.length ? o : hashq(fmt.substr(0, fmt.length - o.length)) + o }
                if ((r = fmt.match(frac1)) !== null) return write_num_f2(r, aval, sign);
                if (fmt.match(/^#+0+$/) !== null) return sign + pad0(aval, fmt.length - fmt.indexOf("0"));
                if ((r = fmt.match(dec1)) !== null) { o = ("" + val).replace(/^([^\.]+)$/, "$1." + r[1]).replace(/\.$/, "." + r[1]).replace(/\.(\d*)$/, function($$, $1) { return "." + $1 + fill("0", r[1].length - $1.length) }); return fmt.indexOf("0.") !== -1 ? o : o.replace(/^0\./, ".") }
                fmt = fmt.replace(/^#+([0.])/, "$1");
                if ((r = fmt.match(/^(0*)\.(#*)$/)) !== null) { return sign + ("" + aval).replace(/\.(\d*[1-9])0*$/, ".$1").replace(/^(-?\d*)$/, "$1.").replace(/^0\./, r[1].length ? "0." : ".") }
                if ((r = fmt.match(/^#,##0(\.?)$/)) !== null) return sign + commaify("" + aval);
                if ((r = fmt.match(/^#,##0\.([#0]*0)$/)) !== null) { return val < 0 ? "-" + write_num_int(type, fmt, -val) : commaify("" + val) + "." + fill("0", r[1].length) }
                if ((r = fmt.match(/^#,#*,#0/)) !== null) return write_num_int(type, fmt.replace(/^#,#*,/, ""), val);
                if ((r = fmt.match(/^([0#]+)(\\?-([0#]+))+$/)) !== null) {
                    o = _strrev(write_num_int(type, fmt.replace(/[\\-]/g, ""), val));
                    ri = 0;
                    return _strrev(_strrev(fmt.replace(/\\/g, "")).replace(/[0#]/g, function(x) { return ri < o.length ? o[ri++] : x === "0" ? "0" : "" }))
                }
                if (fmt.match(phone) !== null) { o = write_num_int(type, "##########", val); return "(" + o.substr(0, 3) + ") " + o.substr(3, 3) + "-" + o.substr(6) }
                var oa = "";
                if ((r = fmt.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/)) !== null) {
                    ri = Math.min(r[4].length, 7);
                    ff = frac(aval, Math.pow(10, ri) - 1, false);
                    o = "" + sign;
                    oa = write_num("n", r[1], ff[1]);
                    if (oa[oa.length - 1] == " ") oa = oa.substr(0, oa.length - 1) + "0";
                    o += oa + r[2] + "/" + r[3];
                    oa = rpad_(ff[2], ri);
                    if (oa.length < r[4].length) oa = hashq(r[4].substr(r[4].length - oa.length)) + oa;
                    o += oa;
                    return o
                }
                if ((r = fmt.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/)) !== null) {
                    ri = Math.min(Math.max(r[1].length, r[4].length), 7);
                    ff = frac(aval, Math.pow(10, ri) - 1, true);
                    return sign + (ff[0] || (ff[1] ? "" : "0")) + " " + (ff[1] ? pad_(ff[1], ri) + r[2] + "/" + r[3] + rpad_(ff[2], ri) : fill(" ", 2 * ri + 1 + r[2].length + r[3].length))
                }
                if ((r = fmt.match(/^[#0?]+$/)) !== null) { o = "" + val; if (fmt.length <= o.length) return o; return hashq(fmt.substr(0, fmt.length - o.length)) + o }
                if ((r = fmt.match(/^([#0]+)\.([#0]+)$/)) !== null) {
                    o = "" + val.toFixed(Math.min(r[2].length, 10)).replace(/([^0])0+$/, "$1");
                    ri = o.indexOf(".");
                    var lres = fmt.indexOf(".") - ri,
                        rres = fmt.length - o.length - lres;
                    return hashq(fmt.substr(0, lres) + o + fmt.substr(fmt.length - rres))
                }
                if ((r = fmt.match(/^00,000\.([#0]*0)$/)) !== null) { return val < 0 ? "-" + write_num_int(type, fmt, -val) : commaify("" + val).replace(/^\d,\d{3}$/, "0$&").replace(/^\d*$/, function($$) { return "00," + ($$.length < 3 ? pad0(0, 3 - $$.length) : "") + $$ }) + "." + pad0(0, r[1].length) }
                switch (fmt) {
                    case "#,###":
                        var x = commaify("" + aval);
                        return x !== "0" ? sign + x : "";
                    default:
                }
                throw new Error("unsupported format |" + fmt + "|")
            }
            return function write_num(type, fmt, val) { return (val | 0) === val ? write_num_int(type, fmt, val) : write_num_flt(type, fmt, val) }
        }();

        function split_fmt(fmt) {
            var out = [];
            var in_str = false,
                cc;
            for (var i = 0, j = 0; i < fmt.length; ++i) switch (cc = fmt.charCodeAt(i)) {
                case 34:
                    in_str = !in_str;
                    break;
                case 95:
                case 42:
                case 92:
                    ++i;
                    break;
                case 59:
                    out[out.length] = fmt.substr(j, i - j);
                    j = i + 1
            }
            out[out.length] = fmt.substr(j);
            if (in_str === true) throw new Error("Format |" + fmt + "| unterminated string ");
            return out
        }
        SSF._split = split_fmt;
        var abstime = /\[[HhMmSs]*\]/;

        function eval_fmt(fmt, v, opts, flen) {
            var out = [],
                o = "",
                i = 0,
                c = "",
                lst = "t",
                q, dt, j, cc;
            var hr = "H";
            while (i < fmt.length) {
                switch (c = fmt[i]) {
                    case "G":
                        if (!isgeneral(fmt, i)) throw new Error("unrecognized character " + c + " in " + fmt);
                        out[out.length] = { t: "G", v: "General" };
                        i += 7;
                        break;
                    case '"':
                        for (o = "";
                            (cc = fmt.charCodeAt(++i)) !== 34 && i < fmt.length;) o += String.fromCharCode(cc);
                        out[out.length] = { t: "t", v: o };
                        ++i;
                        break;
                    case "\\":
                        var w = fmt[++i],
                            t = w === "(" || w === ")" ? w : "t";
                        out[out.length] = { t: t, v: w };
                        ++i;
                        break;
                    case "_":
                        out[out.length] = { t: "t", v: " " };
                        i += 2;
                        break;
                    case "@":
                        out[out.length] = { t: "T", v: v };
                        ++i;
                        break;
                    case "B":
                    case "b":
                        if (fmt[i + 1] === "1" || fmt[i + 1] === "2") {
                            if (dt == null) { dt = parse_date_code(v, opts, fmt[i + 1] === "2"); if (dt == null) return "" }
                            out[out.length] = { t: "X", v: fmt.substr(i, 2) };
                            lst = c;
                            i += 2;
                            break
                        }
                    case "M":
                    case "D":
                    case "Y":
                    case "H":
                    case "S":
                    case "E":
                        c = c.toLowerCase();
                    case "m":
                    case "d":
                    case "y":
                    case "h":
                    case "s":
                    case "e":
                    case "g":
                        if (v < 0) return "";
                        if (dt == null) { dt = parse_date_code(v, opts); if (dt == null) return "" }
                        o = c;
                        while (++i < fmt.length && fmt[i].toLowerCase() === c) o += c;
                        if (c === "m" && lst.toLowerCase() === "h") c = "M";
                        if (c === "h") c = hr;
                        out[out.length] = { t: c, v: o };
                        lst = c;
                        break;
                    case "A":
                        q = { t: c, v: "A" };
                        if (dt == null) dt = parse_date_code(v, opts);
                        if (fmt.substr(i, 3) === "A/P") {
                            if (dt != null) q.v = dt.H >= 12 ? "P" : "A";
                            q.t = "T";
                            hr = "h";
                            i += 3
                        } else if (fmt.substr(i, 5) === "AM/PM") {
                            if (dt != null) q.v = dt.H >= 12 ? "PM" : "AM";
                            q.t = "T";
                            i += 5;
                            hr = "h"
                        } else { q.t = "t";++i }
                        if (dt == null && q.t === "T") return "";
                        out[out.length] = q;
                        lst = c;
                        break;
                    case "[":
                        o = c;
                        while (fmt[i++] !== "]" && i < fmt.length) o += fmt[i];
                        if (o.substr(-1) !== "]") throw 'unterminated "[" block: |' + o + "|";
                        if (o.match(abstime)) {
                            if (dt == null) { dt = parse_date_code(v, opts); if (dt == null) return "" }
                            out[out.length] = { t: "Z", v: o.toLowerCase() }
                        } else { o = "" }
                        break;
                    case ".":
                        if (dt != null) {
                            o = c;
                            while ((c = fmt[++i]) === "0") o += c;
                            out[out.length] = { t: "s", v: o };
                            break
                        }
                    case "0":
                    case "#":
                        o = c;
                        while ("0#?.,E+-%".indexOf(c = fmt[++i]) > -1 || c == "\\" && fmt[i + 1] == "-" && "0#".indexOf(fmt[i + 2]) > -1) o += c;
                        out[out.length] = { t: "n", v: o };
                        break;
                    case "?":
                        o = c;
                        while (fmt[++i] === c) o += c;
                        q = { t: c, v: o };
                        out[out.length] = q;
                        lst = c;
                        break;
                    case "*":
                        ++i;
                        if (fmt[i] == " " || fmt[i] == "*") ++i;
                        break;
                    case "(":
                    case ")":
                        out[out.length] = { t: flen === 1 ? "t" : c, v: c };
                        ++i;
                        break;
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                    case "6":
                    case "7":
                    case "8":
                    case "9":
                        o = c;
                        while ("0123456789".indexOf(fmt[++i]) > -1) o += fmt[i];
                        out[out.length] = { t: "D", v: o };
                        break;
                    case " ":
                        out[out.length] = { t: c, v: c };
                        ++i;
                        break;
                    default:
                        if (",$-+/():!^&'~{}<>=€acfijklopqrtuvwxz".indexOf(c) === -1) throw new Error("unrecognized character " + c + " in " + fmt);
                        out[out.length] = { t: "t", v: c };
                        ++i;
                        break
                }
            }
            var bt = 0,
                ss0 = 0,
                ssm;
            for (i = out.length - 1, lst = "t"; i >= 0; --i) {
                switch (out[i].t) {
                    case "h":
                    case "H":
                        out[i].t = hr;
                        lst = "h";
                        if (bt < 1) bt = 1;
                        break;
                    case "s":
                        if (ssm = out[i].v.match(/\.0+$/)) ss0 = Math.max(ss0, ssm[0].length - 1);
                        if (bt < 3) bt = 3;
                    case "d":
                    case "y":
                    case "M":
                    case "e":
                        lst = out[i].t;
                        break;
                    case "m":
                        if (lst === "s") { out[i].t = "M"; if (bt < 2) bt = 2 }
                        break;
                    case "X":
                        if (out[i].v === "B2");
                        break;
                    case "Z":
                        if (bt < 1 && out[i].v.match(/[Hh]/)) bt = 1;
                        if (bt < 2 && out[i].v.match(/[Mm]/)) bt = 2;
                        if (bt < 3 && out[i].v.match(/[Ss]/)) bt = 3
                }
            }
            switch (bt) {
                case 0:
                    break;
                case 1:
                    if (dt.u >= .5) { dt.u = 0;++dt.S }
                    if (dt.S >= 60) { dt.S = 0;++dt.M }
                    if (dt.M >= 60) { dt.M = 0;++dt.H }
                    break;
                case 2:
                    if (dt.u >= .5) { dt.u = 0;++dt.S }
                    if (dt.S >= 60) { dt.S = 0;++dt.M }
                    break
            }
            var nstr = "",
                jj;
            for (i = 0; i < out.length; ++i) {
                switch (out[i].t) {
                    case "t":
                    case "T":
                    case " ":
                    case "D":
                        break;
                    case "X":
                        out[i] = undefined;
                        break;
                    case "d":
                    case "m":
                    case "y":
                    case "h":
                    case "H":
                    case "M":
                    case "s":
                    case "e":
                    case "b":
                    case "Z":
                        out[i].v = write_date(out[i].t.charCodeAt(0), out[i].v, dt, ss0);
                        out[i].t = "t";
                        break;
                    case "n":
                    case "(":
                    case "?":
                        jj = i + 1;
                        while (out[jj] != null && ((c = out[jj].t) === "?" || c === "D" || (c === " " || c === "t") && out[jj + 1] != null && (out[jj + 1].t === "?" || out[jj + 1].t === "t" && out[jj + 1].v === "/") || out[i].t === "(" && (c === " " || c === "n" || c === ")") || c === "t" && (out[jj].v === "/" || "$€".indexOf(out[jj].v) > -1 || out[jj].v === " " && out[jj + 1] != null && out[jj + 1].t == "?"))) {
                            out[i].v += out[jj].v;
                            out[jj] = undefined;
                            ++jj
                        }
                        nstr += out[i].v;
                        i = jj - 1;
                        break;
                    case "G":
                        out[i].t = "t";
                        out[i].v = general_fmt(v, opts);
                        break
                }
            }
            var vv = "",
                myv, ostr;
            if (nstr.length > 0) {
                myv = v < 0 && nstr.charCodeAt(0) === 45 ? -v : v;
                ostr = write_num(nstr.charCodeAt(0) === 40 ? "(" : "n", nstr, myv);
                jj = ostr.length - 1;
                var decpt = out.length;
                for (i = 0; i < out.length; ++i)
                    if (out[i] != null && out[i].v.indexOf(".") > -1) { decpt = i; break }
                var lasti = out.length;
                if (decpt === out.length && ostr.indexOf("E") === -1) {
                    for (i = out.length - 1; i >= 0; --i) {
                        if (out[i] == null || "n?(".indexOf(out[i].t) === -1) continue;
                        if (jj >= out[i].v.length - 1) {
                            jj -= out[i].v.length;
                            out[i].v = ostr.substr(jj + 1, out[i].v.length)
                        } else if (jj < 0) out[i].v = "";
                        else {
                            out[i].v = ostr.substr(0, jj + 1);
                            jj = -1
                        }
                        out[i].t = "t";
                        lasti = i
                    }
                    if (jj >= 0 && lasti < out.length) out[lasti].v = ostr.substr(0, jj + 1) + out[lasti].v
                } else if (decpt !== out.length && ostr.indexOf("E") === -1) {
                    jj = ostr.indexOf(".") - 1;
                    for (i = decpt; i >= 0; --i) {
                        if (out[i] == null || "n?(".indexOf(out[i].t) === -1) continue;
                        j = out[i].v.indexOf(".") > -1 && i === decpt ? out[i].v.indexOf(".") - 1 : out[i].v.length - 1;
                        vv = out[i].v.substr(j + 1);
                        for (; j >= 0; --j) { if (jj >= 0 && (out[i].v[j] === "0" || out[i].v[j] === "#")) vv = ostr[jj--] + vv }
                        out[i].v = vv;
                        out[i].t = "t";
                        lasti = i
                    }
                    if (jj >= 0 && lasti < out.length) out[lasti].v = ostr.substr(0, jj + 1) + out[lasti].v;
                    jj = ostr.indexOf(".") + 1;
                    for (i = decpt; i < out.length; ++i) {
                        if (out[i] == null || "n?(".indexOf(out[i].t) === -1 && i !== decpt) continue;
                        j = out[i].v.indexOf(".") > -1 && i === decpt ? out[i].v.indexOf(".") + 1 : 0;
                        vv = out[i].v.substr(0, j);
                        for (; j < out[i].v.length; ++j) { if (jj < ostr.length) vv += ostr[jj++] }
                        out[i].v = vv;
                        out[i].t = "t";
                        lasti = i
                    }
                }
            }
            for (i = 0; i < out.length; ++i)
                if (out[i] != null && "n(?".indexOf(out[i].t) > -1) {
                    myv = flen > 1 && v < 0 && i > 0 && out[i - 1].v === "-" ? -v : v;
                    out[i].v = write_num(out[i].t, out[i].v, myv);
                    out[i].t = "t"
                }
            var retval = "";
            for (i = 0; i !== out.length; ++i)
                if (out[i] != null) retval += out[i].v;
            return retval
        }
        SSF._eval = eval_fmt;
        var cfregex = /\[[=<>]/;
        var cfregex2 = /\[([=<>]*)(-?\d+\.?\d*)\]/;

        function chkcond(v, rr) {
            if (rr == null) return false;
            var thresh = parseFloat(rr[2]);
            switch (rr[1]) {
                case "=":
                    if (v == thresh) return true;
                    break;
                case ">":
                    if (v > thresh) return true;
                    break;
                case "<":
                    if (v < thresh) return true;
                    break;
                case "<>":
                    if (v != thresh) return true;
                    break;
                case ">=":
                    if (v >= thresh) return true;
                    break;
                case "<=":
                    if (v <= thresh) return true;
                    break
            }
            return false
        }

        function choose_fmt(f, v) {
            var fmt = split_fmt(f);
            var l = fmt.length,
                lat = fmt[l - 1].indexOf("@");
            if (l < 4 && lat > -1) --l;
            if (fmt.length > 4) throw "cannot find right format for |" + fmt + "|";
            if (typeof v !== "number") return [4, fmt.length === 4 || lat > -1 ? fmt[fmt.length - 1] : "@"];
            switch (fmt.length) {
                case 1:
                    fmt = lat > -1 ? ["General", "General", "General", fmt[0]] : [fmt[0], fmt[0], fmt[0], "@"];
                    break;
                case 2:
                    fmt = lat > -1 ? [fmt[0], fmt[0], fmt[0], fmt[1]] : [fmt[0], fmt[1], fmt[0], "@"];
                    break;
                case 3:
                    fmt = lat > -1 ? [fmt[0], fmt[1], fmt[0], fmt[2]] : [fmt[0], fmt[1], fmt[2], "@"];
                    break;
                case 4:
                    break
            }
            var ff = v > 0 ? fmt[0] : v < 0 ? fmt[1] : fmt[2];
            if (fmt[0].indexOf("[") === -1 && fmt[1].indexOf("[") === -1) return [l, ff];
            if (fmt[0].match(cfregex) != null || fmt[1].match(cfregex) != null) { var m1 = fmt[0].match(cfregex2); var m2 = fmt[1].match(cfregex2); return chkcond(v, m1) ? [l, fmt[0]] : chkcond(v, m2) ? [l, fmt[1]] : [l, fmt[m1 != null && m2 != null ? 2 : 1]] }
            return [l, ff]
        }

        function format(fmt, v, o) {
            fixopts(o != null ? o : o = []);
            var sfmt = "";
            switch (typeof fmt) {
                case "string":
                    sfmt = fmt;
                    break;
                case "number":
                    sfmt = (o.table != null ? o.table : table_fmt)[fmt];
                    break
            }
            if (isgeneral(sfmt, 0)) return general_fmt(v, o);
            var f = choose_fmt(sfmt, v);
            if (isgeneral(f[1])) return general_fmt(v, o);
            if (v === true) v = "TRUE";
            else if (v === false) v = "FALSE";
            else if (v === "" || v == null) return "";
            return eval_fmt(f[1], v, o, f[0])
        }
        SSF._table = table_fmt;
        SSF.load = function load_entry(fmt, idx) { table_fmt[idx] = fmt };
        SSF.format = format;
        SSF.get_table = function get_table() { return table_fmt };
        SSF.load_table = function load_table(tbl) {
            for (var i = 0; i != 392; ++i)
                if (tbl[i] !== undefined) SSF.load(tbl[i], i)
        }
    };
    make_ssf(SSF); {
        var VT_EMPTY = 0;
        var VT_NULL = 1;
        var VT_I2 = 2;
        var VT_I4 = 3;
        var VT_R4 = 4;
        var VT_R8 = 5;
        var VT_CY = 6;
        var VT_DATE = 7;
        var VT_BSTR = 8;
        var VT_ERROR = 10;
        var VT_BOOL = 11;
        var VT_VARIANT = 12;
        var VT_DECIMAL = 14;
        var VT_I1 = 16;
        var VT_UI1 = 17;
        var VT_UI2 = 18;
        var VT_UI4 = 19;
        var VT_I8 = 20;
        var VT_UI8 = 21;
        var VT_INT = 22;
        var VT_UINT = 23;
        var VT_LPSTR = 30;
        var VT_LPWSTR = 31;
        var VT_FILETIME = 64;
        var VT_BLOB = 65;
        var VT_STREAM = 66;
        var VT_STORAGE = 67;
        var VT_STREAMED_Object = 68;
        var VT_STORED_Object = 69;
        var VT_BLOB_Object = 70;
        var VT_CF = 71;
        var VT_CLSID = 72;
        var VT_VERSIONED_STREAM = 73;
        var VT_VECTOR = 4096;
        var VT_ARRAY = 8192;
        var VT_STRING = 80;
        var VT_USTR = 81;
        var VT_CUSTOM = [VT_STRING, VT_USTR]
    }
    var DocSummaryPIDDSI = { 1: { n: "CodePage", t: VT_I2 }, 2: { n: "Category", t: VT_STRING }, 3: { n: "PresentationFormat", t: VT_STRING }, 4: { n: "ByteCount", t: VT_I4 }, 5: { n: "LineCount", t: VT_I4 }, 6: { n: "ParagraphCount", t: VT_I4 }, 7: { n: "SlideCount", t: VT_I4 }, 8: { n: "NoteCount", t: VT_I4 }, 9: { n: "HiddenCount", t: VT_I4 }, 10: { n: "MultimediaClipCount", t: VT_I4 }, 11: { n: "Scale", t: VT_BOOL }, 12: { n: "HeadingPair", t: VT_VECTOR | VT_VARIANT }, 13: { n: "DocParts", t: VT_VECTOR | VT_LPSTR }, 14: { n: "Manager", t: VT_STRING }, 15: { n: "Company", t: VT_STRING }, 16: { n: "LinksDirty", t: VT_BOOL }, 17: { n: "CharacterCount", t: VT_I4 }, 19: { n: "SharedDoc", t: VT_BOOL }, 22: { n: "HLinksChanged", t: VT_BOOL }, 23: { n: "AppVersion", t: VT_I4, p: "version" }, 26: { n: "ContentType", t: VT_STRING }, 27: { n: "ContentStatus", t: VT_STRING }, 28: { n: "Language", t: VT_STRING }, 29: { n: "Version", t: VT_STRING }, 255: {} };
    var SummaryPIDSI = { 1: { n: "CodePage", t: VT_I2 }, 2: { n: "Title", t: VT_STRING }, 3: { n: "Subject", t: VT_STRING }, 4: { n: "Author", t: VT_STRING }, 5: { n: "Keywords", t: VT_STRING }, 6: { n: "Comments", t: VT_STRING }, 7: { n: "Template", t: VT_STRING }, 8: { n: "LastAuthor", t: VT_STRING }, 9: { n: "RevNumber", t: VT_STRING }, 10: { n: "EditTime", t: VT_FILETIME }, 11: { n: "LastPrinted", t: VT_FILETIME }, 12: { n: "CreatedDate", t: VT_FILETIME }, 13: { n: "ModifiedDate", t: VT_FILETIME }, 14: { n: "PageCount", t: VT_I4 }, 15: { n: "WordCount", t: VT_I4 }, 16: { n: "CharCount", t: VT_I4 }, 17: { n: "Thumbnail", t: VT_CF }, 18: { n: "ApplicationName", t: VT_LPSTR }, 19: { n: "DocumentSecurity", t: VT_I4 }, 255: {} };
    var SpecialProperties = { 2147483648: { n: "Locale", t: VT_UI4 }, 2147483651: { n: "Behavior", t: VT_UI4 }, 1768515945: {} };
    (function() {
        for (var y in SpecialProperties)
            if (SpecialProperties.hasOwnProperty(y)) DocSummaryPIDDSI[y] = SummaryPIDSI[y] = SpecialProperties[y]
    })();

    function parse_FILETIME(blob) {
        var dwLowDateTime = blob.read_shift(4),
            dwHighDateTime = blob.read_shift(4);
        return new Date((dwHighDateTime / 1e7 * Math.pow(2, 32) + dwLowDateTime / 1e7 - 11644473600) * 1e3).toISOString().replace(/\.000/, "")
    }

    function parse_lpstr(blob, type, pad) { var str = blob.read_shift(0, "lpstr"); if (pad) blob.l += 4 - (str.length + 1 & 3) & 3; return str }

    function parse_lpwstr(blob, type, pad) { var str = blob.read_shift(0, "lpwstr"); if (pad) blob.l += 4 - (str.length + 1 & 3) & 3; return str }

    function parse_VtStringBase(blob, stringType, pad) { if (stringType === 31) return parse_lpwstr(blob); return parse_lpstr(blob, stringType, pad) }

    function parse_VtString(blob, t, pad) { return parse_VtStringBase(blob, t, pad === false ? 0 : 4) }

    function parse_VtUnalignedString(blob, t) { if (!t) throw new Error("dafuq?"); return parse_VtStringBase(blob, t, 0) }

    function parse_VtVecUnalignedLpstrValue(blob) { var length = blob.read_shift(4); var ret = []; for (var i = 0; i != length; ++i) ret[i] = blob.read_shift(0, "lpstr"); return ret }

    function parse_VtVecUnalignedLpstr(blob) { return parse_VtVecUnalignedLpstrValue(blob) }

    function parse_VtHeadingPair(blob) { var headingString = parse_TypedPropertyValue(blob, VT_USTR); var headerParts = parse_TypedPropertyValue(blob, VT_I4); return [headingString, headerParts] }

    function parse_VtVecHeadingPairValue(blob) { var cElements = blob.read_shift(4); var out = []; for (var i = 0; i != cElements / 2; ++i) out.push(parse_VtHeadingPair(blob)); return out }

    function parse_VtVecHeadingPair(blob) { return parse_VtVecHeadingPairValue(blob) }

    function parse_dictionary(blob, CodePage) {
        var cnt = blob.read_shift(4);
        var dict = {};
        for (var j = 0; j != cnt; ++j) {
            var pid = blob.read_shift(4);
            var len = blob.read_shift(4);
            dict[pid] = blob.read_shift(len, CodePage === 1200 ? "utf16le" : "utf8").replace(chr0, "").replace(chr1, "!")
        }
        if (blob.l & 3) blob.l = blob.l >> 2 + 1 << 2;
        return dict
    }

    function parse_BLOB(blob) { var size = blob.read_shift(4); var bytes = blob.slice(blob.l, blob.l + size); if (size & 3 > 0) blob.l += 4 - (size & 3) & 3; return bytes }

    function parse_ClipboardData(blob) {
        var o = {};
        o.Size = blob.read_shift(4);
        blob.l += o.Size;
        return o
    }

    function parse_VtVector(blob, cb) {}

    function parse_TypedPropertyValue(blob, type, _opts) {
        var t = blob.read_shift(2),
            ret, opts = _opts || {};
        blob.l += 2;
        if (type !== VT_VARIANT)
            if (t !== type && VT_CUSTOM.indexOf(type) === -1) throw new Error("Expected type " + type + " saw " + t);
        switch (type === VT_VARIANT ? t : type) {
            case 2:
                ret = blob.read_shift(2, "i");
                if (!opts.raw) blob.l += 2;
                return ret;
            case 3:
                ret = blob.read_shift(4, "i");
                return ret;
            case 11:
                return blob.read_shift(4) !== 0;
            case 19:
                ret = blob.read_shift(4);
                return ret;
            case 30:
                return parse_lpstr(blob, t, 4).replace(chr0, "");
            case 31:
                return parse_lpwstr(blob);
            case 64:
                return parse_FILETIME(blob);
            case 65:
                return parse_BLOB(blob);
            case 71:
                return parse_ClipboardData(blob);
            case 80:
                return parse_VtString(blob, t, !opts.raw && 4).replace(chr0, "");
            case 81:
                return parse_VtUnalignedString(blob, t, 4).replace(chr0, "");
            case 4108:
                return parse_VtVecHeadingPair(blob);
            case 4126:
                return parse_VtVecUnalignedLpstr(blob);
            default:
                throw new Error("TypedPropertyValue unrecognized type " + type + " " + t)
        }
    }

    function parse_PropertySet(blob, PIDSI) {
        var start_addr = blob.l;
        var size = blob.read_shift(4);
        var NumProps = blob.read_shift(4);
        var Props = [],
            i = 0;
        var CodePage = 0;
        var Dictionary = -1,
            DictObj;
        for (i = 0; i != NumProps; ++i) {
            var PropID = blob.read_shift(4);
            var Offset = blob.read_shift(4);
            Props[i] = [PropID, Offset + start_addr]
        }
        var PropH = {};
        for (i = 0; i != NumProps; ++i) {
            if (blob.l !== Props[i][1]) {
                var fail = true;
                if (i > 0 && PIDSI) switch (PIDSI[Props[i - 1][0]].t) {
                    case 2:
                        if (blob.l + 2 === Props[i][1]) {
                            blob.l += 2;
                            fail = false
                        }
                        break;
                    case 80:
                        if (blob.l <= Props[i][1]) {
                            blob.l = Props[i][1];
                            fail = false
                        }
                        break;
                    case 4108:
                        if (blob.l <= Props[i][1]) {
                            blob.l = Props[i][1];
                            fail = false
                        }
                        break
                }
                if (!PIDSI && blob.l <= Props[i][1]) {
                    fail = false;
                    blob.l = Props[i][1]
                }
                if (fail) throw new Error("Read Error: Expected address " + Props[i][1] + " at " + blob.l + " :" + i)
            }
            if (PIDSI) {
                var piddsi = PIDSI[Props[i][0]];
                PropH[piddsi.n] = parse_TypedPropertyValue(blob, piddsi.t, { raw: true });
                if (piddsi.p === "version") PropH[piddsi.n] = String(PropH[piddsi.n] >> 16) + "." + String(PropH[piddsi.n] & 65535);
                if (piddsi.n == "CodePage") switch (PropH[piddsi.n]) {
                    case 0:
                        PropH[piddsi.n] = 1252;
                    case 1e4:
                    case 1252:
                    case 874:
                    case 1250:
                    case 1251:
                    case 1253:
                    case 1254:
                    case 1255:
                    case 1256:
                    case 1257:
                    case 1258:
                    case 932:
                    case 936:
                    case 949:
                    case 950:
                    case 1200:
                    case 1201:
                    case 65e3:
                    case -536:
                    case 65001:
                    case -535:
                        set_cp(CodePage = PropH[piddsi.n]);
                        break;
                    default:
                        throw new Error("Unsupported CodePage: " + PropH[piddsi.n])
                }
            } else {
                if (Props[i][0] === 1) {
                    CodePage = PropH.CodePage = parse_TypedPropertyValue(blob, VT_I2);
                    set_cp(CodePage);
                    if (Dictionary !== -1) {
                        var oldpos = blob.l;
                        blob.l = Props[Dictionary][1];
                        DictObj = parse_dictionary(blob, CodePage);
                        blob.l = oldpos
                    }
                } else if (Props[i][0] === 0) {
                    if (CodePage === 0) {
                        Dictionary = i;
                        blob.l = Props[i + 1][1];
                        continue
                    }
                    DictObj = parse_dictionary(blob, CodePage)
                } else {
                    var name = DictObj[Props[i][0]];
                    var val;
                    switch (blob[blob.l]) {
                        case 65:
                            blob.l += 4;
                            val = parse_BLOB(blob);
                            break;
                        case 30:
                            blob.l += 4;
                            val = parse_VtString(blob, blob[blob.l - 4]);
                            break;
                        case 31:
                            blob.l += 4;
                            val = parse_VtString(blob, blob[blob.l - 4]);
                            break;
                        case 3:
                            blob.l += 4;
                            val = blob.read_shift(4, "i");
                            break;
                        case 19:
                            blob.l += 4;
                            val = blob.read_shift(4);
                            break;
                        case 5:
                            blob.l += 4;
                            val = blob.read_shift(8, "f");
                            break;
                        case 11:
                            blob.l += 4;
                            val = parsebool(blob, 4);
                            break;
                        case 64:
                            blob.l += 4;
                            val = new Date(parse_FILETIME(blob));
                            break;
                        default:
                            throw new Error("unparsed value: " + blob[blob.l])
                    }
                    PropH[name] = val
                }
            }
        }
        blob.l = start_addr + size;
        return PropH
    }

    function parse_PropertySetStream(file, PIDSI) {
        var blob = file.content;
        prep_blob(blob, 0);
        var NumSets, FMTID0, FMTID1, Offset0, Offset1;
        blob.chk("feff", "Byte Order: ");
        var vers = blob.read_shift(2);
        var SystemIdentifier = blob.read_shift(4);
        blob.chk(CFB.utils.consts.HEADER_CLSID, "CLSID: ");
        NumSets = blob.read_shift(4);
        if (NumSets !== 1 && NumSets !== 2) throw "Unrecognized #Sets: " + NumSets;
        FMTID0 = blob.read_shift(16);
        Offset0 = blob.read_shift(4);
        if (NumSets === 1 && Offset0 !== blob.l) throw "Length mismatch";
        else if (NumSets === 2) {
            FMTID1 = blob.read_shift(16);
            Offset1 = blob.read_shift(4)
        }
        var PSet0 = parse_PropertySet(blob, PIDSI);
        var rval = { SystemIdentifier: SystemIdentifier };
        for (var y in PSet0) rval[y] = PSet0[y];
        rval.FMTID = FMTID0;
        if (NumSets === 1) return rval;
        if (blob.l !== Offset1) throw "Length mismatch 2: " + blob.l + " !== " + Offset1;
        var PSet1;
        try { PSet1 = parse_PropertySet(blob, null) } catch (e) {}
        for (y in PSet1) rval[y] = PSet1[y];
        rval.FMTID = [FMTID0, FMTID1];
        return rval
    }
    var DO_NOT_EXPORT_CFB = true;
    var CFB = function _CFB() {
        var exports = {};
        exports.version = "0.10.2";

        function parse(file) {
            var mver = 3;
            var ssz = 512;
            var nmfs = 0;
            var ndfs = 0;
            var dir_start = 0;
            var minifat_start = 0;
            var difat_start = 0;
            var fat_addrs = [];
            var blob = file.slice(0, 512);
            prep_blob(blob, 0);
            var mv = check_get_mver(blob);
            mver = mv[0];
            switch (mver) {
                case 3:
                    ssz = 512;
                    break;
                case 4:
                    ssz = 4096;
                    break;
                default:
                    throw "Major Version: Expected 3 or 4 saw " + mver
            }
            if (ssz !== 512) {
                blob = file.slice(0, ssz);
                prep_blob(blob, 28)
            }
            var header = file.slice(0, ssz);
            check_shifts(blob, mver);
            var nds = blob.read_shift(4, "i");
            if (mver === 3 && nds !== 0) throw "# Directory Sectors: Expected 0 saw " + nds;
            blob.l += 4;
            dir_start = blob.read_shift(4, "i");
            blob.l += 4;
            blob.chk("00100000", "Mini Stream Cutoff Size: ");
            minifat_start = blob.read_shift(4, "i");
            nmfs = blob.read_shift(4, "i");
            difat_start = blob.read_shift(4, "i");
            ndfs = blob.read_shift(4, "i");
            for (var q, j = 0; j < 109; ++j) {
                q = blob.read_shift(4, "i");
                if (q < 0) break;
                fat_addrs[j] = q
            }
            var sectors = sectorify(file, ssz);
            sleuth_fat(difat_start, ndfs, sectors, ssz, fat_addrs);
            var sector_list = make_sector_list(sectors, dir_start, fat_addrs, ssz);
            sector_list[dir_start].name = "!Directory";
            if (nmfs > 0 && minifat_start !== ENDOFCHAIN) sector_list[minifat_start].name = "!MiniFAT";
            sector_list[fat_addrs[0]].name = "!FAT";
            sector_list.fat_addrs = fat_addrs;
            sector_list.ssz = ssz;
            var files = {},
                Paths = [],
                FileIndex = [],
                FullPaths = [],
                FullPathDir = {};
            read_directory(dir_start, sector_list, sectors, Paths, nmfs, files, FileIndex);
            build_full_paths(FileIndex, FullPathDir, FullPaths, Paths);
            var root_name = Paths.shift();
            Paths.root = root_name;
            var find_path = make_find_path(FullPaths, Paths, FileIndex, files, root_name);
            return { raw: { header: header, sectors: sectors }, FileIndex: FileIndex, FullPaths: FullPaths, FullPathDir: FullPathDir, find: find_path }
        }

        function check_get_mver(blob) {
            blob.chk(HEADER_SIGNATURE, "Header Signature: ");
            blob.chk(HEADER_CLSID, "CLSID: ");
            var mver = blob.read_shift(2, "u");
            return [blob.read_shift(2, "u"), mver]
        }

        function check_shifts(blob, mver) {
            var shift = 9;
            blob.chk("feff", "Byte Order: ");
            switch (shift = blob.read_shift(2)) {
                case 9:
                    if (mver !== 3) throw "MajorVersion/SectorShift Mismatch";
                    break;
                case 12:
                    if (mver !== 4) throw "MajorVersion/SectorShift Mismatch";
                    break;
                default:
                    throw "Sector Shift: Expected 9 or 12 saw " + shift
            }
            blob.chk("0600", "Mini Sector Shift: ");
            blob.chk("000000000000", "Reserved: ")
        }

        function sectorify(file, ssz) {
            var nsectors = Math.ceil(file.length / ssz) - 1;
            var sectors = new Array(nsectors);
            for (var i = 1; i < nsectors; ++i) sectors[i - 1] = file.slice(i * ssz, (i + 1) * ssz);
            sectors[nsectors - 1] = file.slice(nsectors * ssz);
            return sectors
        }

        function build_full_paths(FI, FPD, FP, Paths) {
            var i = 0,
                L = 0,
                R = 0,
                C = 0,
                j = 0,
                pl = Paths.length;
            var dad = new Array(pl),
                q = new Array(pl);
            for (; i < pl; ++i) {
                dad[i] = q[i] = i;
                FP[i] = Paths[i]
            }
            for (; j < q.length; ++j) {
                i = q[j];
                L = FI[i].L;
                R = FI[i].R;
                C = FI[i].C;
                if (dad[i] === i) { if (L !== -1 && dad[L] !== L) dad[i] = dad[L]; if (R !== -1 && dad[R] !== R) dad[i] = dad[R] }
                if (C !== -1) dad[C] = i;
                if (L !== -1) {
                    dad[L] = dad[i];
                    q.push(L)
                }
                if (R !== -1) {
                    dad[R] = dad[i];
                    q.push(R)
                }
            }
            for (i = 1; i !== pl; ++i)
                if (dad[i] === i) {
                    if (R !== -1 && dad[R] !== R) dad[i] = dad[R];
                    else if (L !== -1 && dad[L] !== L) dad[i] = dad[L]
                }
            for (i = 1; i < pl; ++i) {
                if (FI[i].type === 0) continue;
                j = dad[i];
                if (j === 0) FP[i] = FP[0] + "/" + FP[i];
                else
                    while (j !== 0) {
                        FP[i] = FP[j] + "/" + FP[i];
                        j = dad[j]
                    }
                dad[i] = 0
            }
            FP[0] += "/";
            for (i = 1; i < pl; ++i) {
                if (FI[i].type !== 2) FP[i] += "/";
                FPD[FP[i]] = FI[i]
            }
        }

        function make_find_path(FullPaths, Paths, FileIndex, files, root_name) {
            var UCFullPaths = new Array(FullPaths.length);
            var UCPaths = new Array(Paths.length),
                i;
            for (i = 0; i < FullPaths.length; ++i) UCFullPaths[i] = FullPaths[i].toUpperCase().replace(chr0, "").replace(chr1, "!");
            for (i = 0; i < Paths.length; ++i) UCPaths[i] = Paths[i].toUpperCase().replace(chr0, "").replace(chr1, "!");
            return function find_path(path) {
                var k;
                if (path.charCodeAt(0) === 47) {
                    k = true;
                    path = root_name + path
                } else k = path.indexOf("/") !== -1;
                var UCPath = path.toUpperCase().replace(chr0, "").replace(chr1, "!");
                var w = k === true ? UCFullPaths.indexOf(UCPath) : UCPaths.indexOf(UCPath);
                if (w === -1) return null;
                return k === true ? FileIndex[w] : files[Paths[w]]
            }
        }

        function sleuth_fat(idx, cnt, sectors, ssz, fat_addrs) {
            var q;
            if (idx === ENDOFCHAIN) { if (cnt !== 0) throw "DIFAT chain shorter than expected" } else if (idx !== -1) {
                var sector = sectors[idx],
                    m = (ssz >>> 2) - 1;
                for (var i = 0; i < m; ++i) {
                    if ((q = __readInt32LE(sector, i * 4)) === ENDOFCHAIN) break;
                    fat_addrs.push(q)
                }
                sleuth_fat(__readInt32LE(sector, ssz - 4), cnt - 1, sectors, ssz, fat_addrs)
            }
        }

        function get_sector_list(sectors, start, fat_addrs, ssz, chkd) {
            var sl = sectors.length;
            var buf, buf_chain;
            if (!chkd) chkd = new Array(sl);
            var modulus = ssz - 1,
                j, jj;
            buf = [];
            buf_chain = [];
            for (j = start; j >= 0;) {
                chkd[j] = true;
                buf[buf.length] = j;
                buf_chain.push(sectors[j]);
                var addr = fat_addrs[Math.floor(j * 4 / ssz)];
                jj = j * 4 & modulus;
                if (ssz < 4 + jj) throw "FAT boundary crossed: " + j + " 4 " + ssz;
                j = __readInt32LE(sectors[addr], jj)
            }
            return { nodes: buf, data: __toBuffer([buf_chain]) }
        }

        function make_sector_list(sectors, dir_start, fat_addrs, ssz) {
            var sl = sectors.length,
                sector_list = new Array(sl);
            var chkd = new Array(sl),
                buf, buf_chain;
            var modulus = ssz - 1,
                i, j, k, jj;
            for (i = 0; i < sl; ++i) {
                buf = [];
                k = i + dir_start;
                if (k >= sl) k -= sl;
                if (chkd[k] === true) continue;
                buf_chain = [];
                for (j = k; j >= 0;) {
                    chkd[j] = true;
                    buf[buf.length] = j;
                    buf_chain.push(sectors[j]);
                    var addr = fat_addrs[Math.floor(j * 4 / ssz)];
                    jj = j * 4 & modulus;
                    if (ssz < 4 + jj) throw "FAT boundary crossed: " + j + " 4 " + ssz;
                    j = __readInt32LE(sectors[addr], jj)
                }
                sector_list[k] = { nodes: buf, data: __toBuffer([buf_chain]) }
            }
            return sector_list
        }

        function read_directory(dir_start, sector_list, sectors, Paths, nmfs, files, FileIndex) {
            var blob;
            var minifat_store = 0,
                pl = Paths.length ? 2 : 0;
            var sector = sector_list[dir_start].data;
            var i = 0,
                namelen = 0,
                name, o, ctime, mtime;
            for (; i < sector.length; i += 128) {
                blob = sector.slice(i, i + 128);
                prep_blob(blob, 64);
                namelen = blob.read_shift(2);
                if (namelen === 0) continue;
                name = __utf16le(blob, 0, namelen - pl);
                Paths.push(name);
                o = { name: name, type: blob.read_shift(1), color: blob.read_shift(1), L: blob.read_shift(4, "i"), R: blob.read_shift(4, "i"), C: blob.read_shift(4, "i"), clsid: blob.read_shift(16), state: blob.read_shift(4, "i") };
                ctime = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
                if (ctime !== 0) {
                    o.ctime = ctime;
                    o.ct = read_date(blob, blob.l - 8)
                }
                mtime = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
                if (mtime !== 0) {
                    o.mtime = mtime;
                    o.mt = read_date(blob, blob.l - 8)
                }
                o.start = blob.read_shift(4, "i");
                o.size = blob.read_shift(4, "i");
                if (o.type === 5) { minifat_store = o.start; if (nmfs > 0 && minifat_store !== ENDOFCHAIN) sector_list[minifat_store].name = "!StreamData" } else if (o.size >= 4096) {
                    o.storage = "fat";
                    if (sector_list[o.start] === undefined) sector_list[o.start] = get_sector_list(sectors, o.start, sector_list.fat_addrs, sector_list.ssz);
                    sector_list[o.start].name = o.name;
                    o.content = sector_list[o.start].data.slice(0, o.size);
                    prep_blob(o.content, 0)
                } else {
                    o.storage = "minifat";
                    if (minifat_store !== ENDOFCHAIN && o.start !== ENDOFCHAIN) {
                        o.content = sector_list[minifat_store].data.slice(o.start * MSSZ, o.start * MSSZ + o.size);
                        prep_blob(o.content, 0)
                    }
                }
                files[name] = o;
                FileIndex.push(o)
            }
        }

        function read_date(blob, offset) { return new Date((__readUInt32LE(blob, offset + 4) / 1e7 * Math.pow(2, 32) + __readUInt32LE(blob, offset) / 1e7 - 11644473600) * 1e3) }
        var fs;

        function readFileSync(filename, options) { if (fs === undefined) fs = require("fs"); return parse(fs.readFileSync(filename), options) }

        function readSync(blob, options) {
            switch (options !== undefined && options.type !== undefined ? options.type : "base64") {
                case "file":
                    return readFileSync(blob, options);
                case "base64":
                    return parse(s2a(Base64.decode(blob)), options);
                case "binary":
                    return parse(s2a(blob), options)
            }
            return parse(blob)
        }
        var MSSZ = 64;
        var ENDOFCHAIN = -2;
        var HEADER_SIGNATURE = "d0cf11e0a1b11ae1";
        var HEADER_CLSID = "00000000000000000000000000000000";
        var consts = { MAXREGSECT: -6, DIFSECT: -4, FATSECT: -3, ENDOFCHAIN: ENDOFCHAIN, FREESECT: -1, HEADER_SIGNATURE: HEADER_SIGNATURE, HEADER_MINOR_VERSION: "3e00", MAXREGSID: -6, NOSTREAM: -1, HEADER_CLSID: HEADER_CLSID, EntryTypes: ["unknown", "storage", "stream", "lockbytes", "property", "root"] };
        exports.read = readSync;
        exports.parse = parse;
        exports.utils = { ReadShift: ReadShift, CheckField: CheckField, prep_blob: prep_blob, bconcat: bconcat, consts: consts };
        return exports
    }();
    if (typeof require !== "undefined" && typeof module !== "undefined" && typeof DO_NOT_EXPORT_CFB === "undefined") { module.exports = CFB }

    function parsenoop(blob, length) { blob.read_shift(length); return }

    function parsenoop2(blob, length) { blob.read_shift(length); return null }

    function parslurp(blob, length, cb) {
        var arr = [],
            target = blob.l + length;
        while (blob.l < target) arr.push(cb(blob, target - blob.l));
        if (target !== blob.l) throw new Error("Slurp error");
        return arr
    }

    function parslurp2(blob, length, cb) {
        var arr = [],
            target = blob.l + length,
            len = blob.read_shift(2);
        while (len-- !== 0) arr.push(cb(blob, target - blob.l));
        if (target !== blob.l) throw new Error("Slurp error");
        return arr
    }

    function parsebool(blob, length) { return blob.read_shift(length) === 1 }

    function parseuint16(blob) { return blob.read_shift(2, "u") }

    function parseuint16a(blob, length) { return parslurp(blob, length, parseuint16) }
    var parse_Boolean = parsebool;

    function parse_Bes(blob) {
        var v = blob.read_shift(1),
            t = blob.read_shift(1);
        return t === 1 ? v : v === 1
    }

    function parse_ShortXLUnicodeString(blob, length, opts) {
        var cch = blob.read_shift(1);
        var width = 1,
            encoding = "sbcs";
        if (opts === undefined || opts.biff !== 5) {
            var fHighByte = blob.read_shift(1);
            if (fHighByte) {
                width = 2;
                encoding = "dbcs"
            }
        }
        return cch ? blob.read_shift(cch, encoding) : ""
    }

    function parse_XLUnicodeRichExtendedString(blob) {
        var cp = current_codepage;
        current_codepage = 1200;
        var cch = blob.read_shift(2),
            flags = blob.read_shift(1);
        var fHighByte = flags & 1,
            fExtSt = flags & 4,
            fRichSt = flags & 8;
        var width = 1 + (flags & 1);
        var cRun, cbExtRst;
        var z = {};
        if (fRichSt) cRun = blob.read_shift(2);
        if (fExtSt) cbExtRst = blob.read_shift(4);
        var encoding = flags & 1 ? "dbcs" : "sbcs";
        var msg = cch === 0 ? "" : blob.read_shift(cch, encoding);
        if (fRichSt) blob.l += 4 * cRun;
        if (fExtSt) blob.l += cbExtRst;
        z.t = msg;
        if (!fRichSt) {
            z.raw = "<t>" + z.t + "</t>";
            z.r = z.t
        }
        current_codepage = cp;
        return z
    }

    function parse_XLUnicodeStringNoCch(blob, cch, opts) { var retval; var fHighByte = blob.read_shift(1); if (fHighByte === 0) { retval = blob.read_shift(cch, "sbcs") } else { retval = blob.read_shift(cch, "dbcs") } return retval }

    function parse_XLUnicodeString(blob, length, opts) { var cch = blob.read_shift(opts !== undefined && opts.biff > 0 && opts.biff < 8 ? 1 : 2); if (cch === 0) { blob.l++; return "" } return parse_XLUnicodeStringNoCch(blob, cch, opts) }

    function parse_XLUnicodeString2(blob, length, opts) { if (opts.biff !== 5 && opts.biff !== 2) return parse_XLUnicodeString(blob, length, opts); var cch = blob.read_shift(1); if (cch === 0) { blob.l++; return "" } return blob.read_shift(cch, "sbcs") }

    function parse_Xnum(blob) { return blob.read_shift(8, "f") }
    var parse_ControlInfo = parsenoop;
    var parse_URLMoniker = function(blob, length) {
        var len = blob.read_shift(4),
            start = blob.l;
        var extra = false;
        if (len > 24) {
            blob.l += len - 24;
            if (blob.read_shift(16) === "795881f43b1d7f48af2c825dc4852763") extra = true;
            blob.l = start
        }
        var url = blob.read_shift((extra ? len - 24 : len) >> 1, "utf16le").replace(chr0, "");
        if (extra) blob.l += 24;
        return url
    };
    var parse_FileMoniker = function(blob, length) { var cAnti = blob.read_shift(2); var ansiLength = blob.read_shift(4); var ansiPath = blob.read_shift(ansiLength, "cstr"); var endServer = blob.read_shift(2); var versionNumber = blob.read_shift(2); var cbUnicodePathSize = blob.read_shift(4); if (cbUnicodePathSize === 0) return ansiPath.replace(/\\/g, "/"); var cbUnicodePathBytes = blob.read_shift(4); var usKeyValue = blob.read_shift(2); var unicodePath = blob.read_shift(cbUnicodePathBytes >> 1, "utf16le").replace(chr0, ""); return unicodePath };
    var parse_HyperlinkMoniker = function(blob, length) {
        var clsid = blob.read_shift(16);
        length -= 16;
        switch (clsid) {
            case "e0c9ea79f9bace118c8200aa004ba90b":
                return parse_URLMoniker(blob, length);
            case "0303000000000000c000000000000046":
                return parse_FileMoniker(blob, length);
            default:
                throw "unsupported moniker " + clsid
        }
    };
    var parse_HyperlinkString = function(blob, length) { var len = blob.read_shift(4); var o = blob.read_shift(len, "utf16le").replace(chr0, ""); return o };
    var parse_Hyperlink = function(blob, length) {
        var end = blob.l + length;
        var sVer = blob.read_shift(4);
        if (sVer !== 2) throw new Error("Unrecognized streamVersion: " + sVer);
        var flags = blob.read_shift(2);
        blob.l += 2;
        var displayName, targetFrameName, moniker, oleMoniker, location, guid, fileTime;
        if (flags & 16) displayName = parse_HyperlinkString(blob, end - blob.l);
        if (flags & 128) targetFrameName = parse_HyperlinkString(blob, end - blob.l);
        if ((flags & 257) === 257) moniker = parse_HyperlinkString(blob, end - blob.l);
        if ((flags & 257) === 1) oleMoniker = parse_HyperlinkMoniker(blob, end - blob.l);
        if (flags & 8) location = parse_HyperlinkString(blob, end - blob.l);
        if (flags & 32) guid = blob.read_shift(16);
        if (flags & 64) fileTime = parse_FILETIME(blob, 8);
        blob.l = end;
        var target = targetFrameName || moniker || oleMoniker;
        if (location) target += "#" + location;
        return { Target: target }
    };

    function parse_LongRGBA(blob, length) {
        var r = blob.read_shift(1),
            g = blob.read_shift(1),
            b = blob.read_shift(1),
            a = blob.read_shift(1);
        return [r, g, b, a]
    }

    function parse_LongRGB(blob, length) {
        var x = parse_LongRGBA(blob, length);
        x[3] = 0;
        return x
    }
    var FillPattern = [null, "solid", "mediumGray", "darkGray", "lightGray", "darkHorizontal", "darkVertical", "darkDown", "darkUp", "darkGrid", "darkTrellis", "lightHorizontal", "lightVertical", "lightDown", "lightUp", "lightGrid", "lightTrellis", "gray125", "gray0625"];

    function rgbify(arr) { return arr.map(function(x) { return [x >> 16 & 255, x >> 8 & 255, x & 255] }) }
    var Icv = rgbify([0, 16777215, 16711680, 65280, 255, 16776960, 16711935, 65535, 0, 16777215, 16711680, 65280, 255, 16776960, 16711935, 65535, 8388608, 32768, 128, 8421376, 8388736, 32896, 12632256, 8421504, 10066431, 10040166, 16777164, 13434879, 6684774, 16744576, 26316, 13421823, 128, 16711935, 16776960, 65535, 8388736, 8388608, 32896, 255, 52479, 13434879, 13434828, 16777113, 10079487, 16751052, 13408767, 16764057, 3368703, 3394764, 10079232, 16763904, 16750848, 16737792, 6710937, 9868950, 13158, 3381606, 13056, 3355392, 10040064, 10040166, 3355545, 3355443, 16777215, 0]);

    function isval(x) { return x !== undefined && x !== null }

    function keys(o) { return Object.keys(o) }

    function evert(obj, arr) {
        var o = {};
        var K = keys(obj);
        for (var i = 0; i < K.length; ++i) {
            var k = K[i];
            if (!arr) o[obj[k]] = k;
            else(o[obj[k]] = o[obj[k]] || []).push(k)
        }
        return o
    }

    function rgb2Hex(rgb) { for (var i = 0, o = 1; i != 3; ++i) o = o * 256 + (rgb[i] > 255 ? 255 : rgb[i] < 0 ? 0 : rgb[i]); return o.toString(16).toUpperCase().substr(1) }

    function parse_Cell(blob, length) { var rw = blob.read_shift(2); var col = blob.read_shift(2); var ixfe = blob.read_shift(2); return { r: rw, c: col, ixfe: ixfe } }

    function parse_frtHeader(blob) {
        var rt = blob.read_shift(2);
        var flags = blob.read_shift(2);
        blob.l += 8;
        return { type: rt, flags: flags }
    }

    function parse_OptXLUnicodeString(blob, length, opts) { return length === 0 ? "" : parse_XLUnicodeString2(blob, length, opts) }
    var HIDEOBJENUM = ["SHOWALL", "SHOWPLACEHOLDER", "HIDEALL"];
    var parse_HideObjEnum = parseuint16;

    function parse_XTI(blob, length) {
        var iSupBook = blob.read_shift(2),
            itabFirst = blob.read_shift(2, "i"),
            itabLast = blob.read_shift(2, "i");
        return [iSupBook, itabFirst, itabLast]
    }

    function parse_RkNumber(blob) {
        var b = blob.slice(blob.l, blob.l + 4);
        var fX100 = b[0] & 1,
            fInt = b[0] & 2;
        blob.l += 4;
        b[0] &= ~3;
        var RK = fInt === 0 ? __double([0, 0, 0, 0, b[0], b[1], b[2], b[3]], 0) : __readInt32LE(b, 0) >> 2;
        return fX100 ? RK / 100 : RK
    }

    function parse_RkRec(blob, length) { var ixfe = blob.read_shift(2); var RK = parse_RkNumber(blob); return [ixfe, RK] }

    function parse_AddinUdf(blob, length) {
        blob.l += 4;
        length -= 4;
        var l = blob.l + length;
        var udfName = parse_ShortXLUnicodeString(blob, length);
        var cb = blob.read_shift(2);
        l -= blob.l;
        if (cb !== l) throw "Malformed AddinUdf: padding = " + l + " != " + cb;
        blob.l += cb;
        return udfName
    }

    function parse_Ref8U(blob, length) { var rwFirst = blob.read_shift(2); var rwLast = blob.read_shift(2); var colFirst = blob.read_shift(2); var colLast = blob.read_shift(2); return { s: { c: colFirst, r: rwFirst }, e: { c: colLast, r: rwLast } } }

    function parse_RefU(blob, length) { var rwFirst = blob.read_shift(2); var rwLast = blob.read_shift(2); var colFirst = blob.read_shift(1); var colLast = blob.read_shift(1); return { s: { c: colFirst, r: rwFirst }, e: { c: colLast, r: rwLast } } }
    var parse_Ref = parse_RefU;

    function parse_FtCmo(blob, length) {
        blob.l += 4;
        var ot = blob.read_shift(2);
        var id = blob.read_shift(2);
        var flags = blob.read_shift(2);
        blob.l += 12;
        return [id, ot, flags]
    }

    function parse_FtNts(blob, length) {
        var out = {};
        blob.l += 4;
        blob.l += 16;
        out.fSharedNote = blob.read_shift(2);
        blob.l += 4;
        return out
    }

    function parse_FtCf(blob, length) {
        var out = {};
        blob.l += 4;
        blob.cf = blob.read_shift(2);
        return out
    }
    var FtTab = { 21: parse_FtCmo, 19: parsenoop, 18: function(blob, length) { blob.l += 12 }, 17: function(blob, length) { blob.l += 8 }, 16: parsenoop, 15: parsenoop, 13: parse_FtNts, 12: function(blob, length) { blob.l += 24 }, 11: function(blob, length) { blob.l += 10 }, 10: function(blob, length) { blob.l += 16 }, 9: parsenoop, 8: function(blob, length) { blob.l += 6 }, 7: parse_FtCf, 6: function(blob, length) { blob.l += 6 }, 4: parsenoop, 0: function(blob, length) { blob.l += 4 } };

    function parse_FtArray(blob, length, ot) {
        var s = blob.l;
        var fts = [];
        while (blob.l < s + length) {
            var ft = blob.read_shift(2);
            blob.l -= 2;
            try { fts.push(FtTab[ft](blob, s + length - blob.l)) } catch (e) { blob.l = s + length; return fts }
        }
        if (blob.l != s + length) blob.l = s + length;
        return fts
    }
    var parse_FontIndex = parseuint16;

    function parse_BOF(blob, length) {
        var o = {};
        o.BIFFVer = blob.read_shift(2);
        length -= 2;
        switch (o.BIFFVer) {
            case 1536:
            case 1280:
            case 2:
            case 7:
                break;
            default:
                throw "Unexpected BIFF Ver " + o.BIFFVer
        }
        blob.read_shift(length);
        return o
    }

    function parse_InterfaceHdr(blob, length) { if (length === 0) return 1200; var q; if ((q = blob.read_shift(2)) !== 1200) throw "InterfaceHdr codePage " + q; return 1200 }

    function parse_WriteAccess(blob, length, opts) {
        if (opts.enc) { blob.l += length; return "" }
        var l = blob.l;
        var UserName = parse_XLUnicodeString(blob, 0, opts);
        blob.read_shift(length + l - blob.l);
        return UserName
    }

    function parse_BoundSheet8(blob, length, opts) {
        var pos = blob.read_shift(4);
        var hidden = blob.read_shift(1) >> 6;
        var dt = blob.read_shift(1);
        switch (dt) {
            case 0:
                dt = "Worksheet";
                break;
            case 1:
                dt = "Macrosheet";
                break;
            case 2:
                dt = "Chartsheet";
                break;
            case 6:
                dt = "VBAModule";
                break
        }
        var name = parse_ShortXLUnicodeString(blob, 0, opts);
        if (name.length === 0) name = "Sheet1";
        return { pos: pos, hs: hidden, dt: dt, name: name }
    }

    function parse_SST(blob, length) {
        var cnt = blob.read_shift(4);
        var ucnt = blob.read_shift(4);
        var strs = [];
        for (var i = 0; i != ucnt; ++i) { strs.push(parse_XLUnicodeRichExtendedString(blob)) }
        strs.Count = cnt;
        strs.Unique = ucnt;
        return strs
    }

    function parse_ExtSST(blob, length) {
        var extsst = {};
        extsst.dsst = blob.read_shift(2);
        blob.l += length - 2;
        return extsst
    }

    function parse_Row(blob, length) {
        var rw = blob.read_shift(2),
            col = blob.read_shift(2),
            Col = blob.read_shift(2),
            rht = blob.read_shift(2);
        blob.read_shift(4);
        var flags = blob.read_shift(1);
        blob.read_shift(1);
        blob.read_shift(2);
        return { r: rw, c: col, cnt: Col - col }
    }

    function parse_ForceFullCalculation(blob, length) { var header = parse_frtHeader(blob); if (header.type != 2211) throw "Invalid Future Record " + header.type; var fullcalc = blob.read_shift(4); return fullcalc !== 0 }
    var parse_CompressPictures = parsenoop2;

    function parse_RecalcId(blob, length) { blob.read_shift(2); return blob.read_shift(4) }

    function parse_DefaultRowHeight(blob, length) {
        var f = blob.read_shift(2),
            miyRw;
        miyRw = blob.read_shift(2);
        var fl = { Unsynced: f & 1, DyZero: (f & 2) >> 1, ExAsc: (f & 4) >> 2, ExDsc: (f & 8) >> 3 };
        return [fl, miyRw]
    }

    function parse_Window1(blob, length) {
        var xWn = blob.read_shift(2),
            yWn = blob.read_shift(2),
            dxWn = blob.read_shift(2),
            dyWn = blob.read_shift(2);
        var flags = blob.read_shift(2),
            iTabCur = blob.read_shift(2),
            iTabFirst = blob.read_shift(2);
        var ctabSel = blob.read_shift(2),
            wTabRatio = blob.read_shift(2);
        return { Pos: [xWn, yWn], Dim: [dxWn, dyWn], Flags: flags, CurTab: iTabCur, FirstTab: iTabFirst, Selected: ctabSel, TabRatio: wTabRatio }
    }

    function parse_Font(blob, length, opts) { blob.l += 14; var name = parse_ShortXLUnicodeString(blob, 0, opts); return name }

    function parse_LabelSst(blob, length) {
        var cell = parse_Cell(blob);
        cell.isst = blob.read_shift(4);
        return cell
    }

    function parse_Label(blob, length, opts) {
        var cell = parse_Cell(blob, 6);
        var str = parse_XLUnicodeString(blob, length - 6, opts);
        cell.val = str;
        return cell
    }

    function parse_Format(blob, length, opts) { var ifmt = blob.read_shift(2); var fmtstr = parse_XLUnicodeString2(blob, 0, opts); return [ifmt, fmtstr] }

    function parse_Dimensions(blob, length) {
        var w = length === 10 ? 2 : 4;
        var r = blob.read_shift(w),
            R = blob.read_shift(w),
            c = blob.read_shift(2),
            C = blob.read_shift(2);
        blob.l += 2;
        return { s: { r: r, c: c }, e: { r: R, c: C } }
    }

    function parse_RK(blob, length) {
        var rw = blob.read_shift(2),
            col = blob.read_shift(2);
        var rkrec = parse_RkRec(blob);
        return { r: rw, c: col, ixfe: rkrec[0], rknum: rkrec[1] }
    }

    function parse_MulRk(blob, length) {
        var target = blob.l + length - 2;
        var rw = blob.read_shift(2),
            col = blob.read_shift(2);
        var rkrecs = [];
        while (blob.l < target) rkrecs.push(parse_RkRec(blob));
        if (blob.l !== target) throw "MulRK read error";
        var lastcol = blob.read_shift(2);
        if (rkrecs.length != lastcol - col + 1) throw "MulRK length mismatch";
        return { r: rw, c: col, C: lastcol, rkrec: rkrecs }
    }

    function parse_CellStyleXF(blob, length, style) {
        var o = {};
        var a = blob.read_shift(4),
            b = blob.read_shift(4);
        var c = blob.read_shift(4),
            d = blob.read_shift(2);
        o.patternType = FillPattern[c >> 26];
        o.icvFore = d & 127;
        o.icvBack = d >> 7 & 127;
        return o
    }

    function parse_CellXF(blob, length) { return parse_CellStyleXF(blob, length, 0) }

    function parse_StyleXF(blob, length) { return parse_CellStyleXF(blob, length, 1) }

    function parse_XF(blob, length) {
        var o = {};
        o.ifnt = blob.read_shift(2);
        o.ifmt = blob.read_shift(2);
        o.flags = blob.read_shift(2);
        o.fStyle = o.flags >> 2 & 1;
        length -= 6;
        o.data = parse_CellStyleXF(blob, length, o.fStyle);
        return o
    }

    function parse_Guts(blob, length) { blob.l += 4; var out = [blob.read_shift(2), blob.read_shift(2)]; if (out[0] !== 0) out[0]--; if (out[1] !== 0) out[1]--; if (out[0] > 7 || out[1] > 7) throw "Bad Gutters: " + out; return out }

    function parse_BoolErr(blob, length) {
        var cell = parse_Cell(blob, 6);
        var val = parse_Bes(blob, 2);
        cell.val = val;
        cell.t = val === true || val === false ? "b" : "e";
        return cell
    }

    function parse_Number(blob, length) {
        var cell = parse_Cell(blob, 6);
        var xnum = parse_Xnum(blob, 8);
        cell.val = xnum;
        return cell
    }
    var parse_XLHeaderFooter = parse_OptXLUnicodeString;

    function parse_SupBook(blob, length, opts) {
        var end = blob.l + length;
        var ctab = blob.read_shift(2);
        var cch = blob.read_shift(2);
        var virtPath;
        if (cch >= 1 && cch <= 255) virtPath = parse_XLUnicodeStringNoCch(blob, cch);
        var rgst = blob.read_shift(end - blob.l);
        opts.sbcch = cch;
        return [cch, ctab, virtPath, rgst]
    }

    function parse_ExternName(blob, length, opts) {
        var flags = blob.read_shift(2);
        var body;
        var o = { fBuiltIn: flags & 1, fWantAdvise: flags >>> 1 & 1, fWantPict: flags >>> 2 & 1, fOle: flags >>> 3 & 1, fOleLink: flags >>> 4 & 1, cf: flags >>> 5 & 1023, fIcon: flags >>> 15 & 1 };
        if (opts.sbcch === 14849) body = parse_AddinUdf(blob, length - 2);
        o.body = body || blob.read_shift(length - 2);
        return o
    }

    function parse_Lbl(blob, length, opts) {
        if (opts.biff < 8) return parse_Label(blob, length, opts);
        var target = blob.l + length;
        var flags = blob.read_shift(2);
        var chKey = blob.read_shift(1);
        var cch = blob.read_shift(1);
        var cce = blob.read_shift(2);
        blob.l += 2;
        var itab = blob.read_shift(2);
        blob.l += 4;
        var name = parse_XLUnicodeStringNoCch(blob, cch, opts);
        var rgce = parse_NameParsedFormula(blob, target - blob.l, opts, cce);
        return { chKey: chKey, Name: name, rgce: rgce }
    }

    function parse_ExternSheet(blob, length, opts) { if (opts.biff < 8) return parse_ShortXLUnicodeString(blob, length, opts); var o = parslurp2(blob, length, parse_XTI); var oo = []; if (opts.sbcch === 1025) { for (var i = 0; i != o.length; ++i) oo.push(opts.snames[o[i][1]]); return oo } else return o }

    function parse_ShrFmla(blob, length, opts) {
        var ref = parse_RefU(blob, 6);
        blob.l++;
        var cUse = blob.read_shift(1);
        length -= 8;
        return [parse_SharedParsedFormula(blob, length, opts), cUse]
    }

    function parse_Array(blob, length, opts) {
        var ref = parse_Ref(blob, 6);
        blob.l += 6;
        length -= 12;
        return [ref, parse_ArrayParsedFormula(blob, length, opts, ref)]
    }

    function parse_MTRSettings(blob, length) { var fMTREnabled = blob.read_shift(4) !== 0; var fUserSetThreadCount = blob.read_shift(4) !== 0; var cUserThreadCount = blob.read_shift(4); return [fMTREnabled, fUserSetThreadCount, cUserThreadCount] }

    function parse_NoteSh(blob, length, opts) {
        if (opts.biff < 8) return;
        var row = blob.read_shift(2),
            col = blob.read_shift(2);
        var flags = blob.read_shift(2),
            idObj = blob.read_shift(2);
        var stAuthor = parse_XLUnicodeString2(blob, 0, opts);
        if (opts.biff < 8) blob.read_shift(1);
        return [{ r: row, c: col }, stAuthor, idObj, flags]
    }

    function parse_Note(blob, length, opts) { return parse_NoteSh(blob, length, opts) }

    function parse_MergeCells(blob, length) { var merges = []; var cmcs = blob.read_shift(2); while (cmcs--) merges.push(parse_Ref8U(blob, length)); return merges }

    function parse_Obj(blob, length) { var cmo = parse_FtCmo(blob, 22); var fts = parse_FtArray(blob, length - 22, cmo[1]); return { cmo: cmo, ft: fts } }

    function parse_TxO(blob, length, opts) {
        var s = blob.l;
        try {
            blob.l += 4;
            var ot = (opts.lastobj || { cmo: [0, 0] }).cmo[1];
            var controlInfo;
            if ([0, 5, 7, 11, 12, 14].indexOf(ot) == -1) blob.l += 6;
            else controlInfo = parse_ControlInfo(blob, 6, opts);
            var cchText = blob.read_shift(2);
            var cbRuns = blob.read_shift(2);
            var ifntEmpty = parse_FontIndex(blob, 2);
            var len = blob.read_shift(2);
            blob.l += len;
            var texts = "";
            for (var i = 1; i < blob.lens.length - 1; ++i) {
                if (blob.l - s != blob.lens[i]) throw "TxO: bad continue record";
                var hdr = blob[blob.l];
                var t = parse_XLUnicodeStringNoCch(blob, blob.lens[i + 1] - blob.lens[i] - 1);
                texts += t;
                if (texts.length >= (hdr ? cchText : 2 * cchText)) break
            }
            if (texts.length !== cchText && texts.length !== cchText * 2) { throw "cchText: " + cchText + " != " + texts.length }
            blob.l = s + length;
            return { t: texts }
        } catch (e) { blob.l = s + length; return { t: texts || "" } }
    }
    var parse_HLink = function(blob, length) {
        var ref = parse_Ref8U(blob, 8);
        blob.l += 16;
        var hlink = parse_Hyperlink(blob, length - 24);
        return [ref, hlink]
    };
    var parse_HLinkTooltip = function(blob, length) {
        var end = blob.l + length;
        blob.read_shift(2);
        var ref = parse_Ref8U(blob, 8);
        var wzTooltip = blob.read_shift((length - 10) / 2, "dbcs");
        wzTooltip = wzTooltip.replace(chr0, "");
        return [ref, wzTooltip]
    };

    function parse_Country(blob, length) {
        var o = [],
            d;
        d = blob.read_shift(2);
        o[0] = CountryEnum[d] || d;
        d = blob.read_shift(2);
        o[1] = CountryEnum[d] || d;
        return o
    }

    function parse_ClrtClient(blob, length) { var ccv = blob.read_shift(2); var o = []; while (ccv-- > 0) o.push(parse_LongRGB(blob, 8)); return o }

    function parse_Palette(blob, length) { var ccv = blob.read_shift(2); var o = []; while (ccv-- > 0) o.push(parse_LongRGB(blob, 8)); return o }

    function parse_XFCRC(blob, length) {
        blob.l += 2;
        var o = { cxfs: 0, crc: 0 };
        o.cxfs = blob.read_shift(2);
        o.crc = blob.read_shift(4);
        return o
    }
    var parse_Style = parsenoop;
    var parse_StyleExt = parsenoop;
    var parse_ColInfo = parsenoop;
    var parse_Window2 = parsenoop;
    var parse_Backup = parsebool;
    var parse_Blank = parse_Cell;
    var parse_BottomMargin = parse_Xnum;
    var parse_BuiltInFnGroupCount = parseuint16;
    var parse_CalcCount = parseuint16;
    var parse_CalcDelta = parse_Xnum;
    var parse_CalcIter = parsebool;
    var parse_CalcMode = parseuint16;
    var parse_CalcPrecision = parsebool;
    var parse_CalcRefMode = parsenoop2;
    var parse_CalcSaveRecalc = parsebool;
    var parse_CodePage = parseuint16;
    var parse_Compat12 = parsebool;
    var parse_Date1904 = parsebool;
    var parse_DefColWidth = parseuint16;
    var parse_DSF = parsenoop2;
    var parse_EntExU2 = parsenoop2;
    var parse_EOF = parsenoop2;
    var parse_Excel9File = parsenoop2;
    var parse_FeatHdr = parsenoop2;
    var parse_FontX = parseuint16;
    var parse_Footer = parse_XLHeaderFooter;
    var parse_GridSet = parseuint16;
    var parse_HCenter = parsebool;
    var parse_Header = parse_XLHeaderFooter;
    var parse_HideObj = parse_HideObjEnum;
    var parse_InterfaceEnd = parsenoop2;
    var parse_LeftMargin = parse_Xnum;
    var parse_Mms = parsenoop2;
    var parse_ObjProtect = parsebool;
    var parse_Password = parseuint16;
    var parse_PrintGrid = parsebool;
    var parse_PrintRowCol = parsebool;
    var parse_PrintSize = parseuint16;
    var parse_Prot4Rev = parsebool;
    var parse_Prot4RevPass = parseuint16;
    var parse_Protect = parsebool;
    var parse_RefreshAll = parsebool;
    var parse_RightMargin = parse_Xnum;
    var parse_RRTabId = parseuint16a;
    var parse_ScenarioProtect = parsebool;
    var parse_Scl = parseuint16a;
    var parse_String = parse_XLUnicodeString;
    var parse_SxBool = parsebool;
    var parse_TopMargin = parse_Xnum;
    var parse_UsesELFs = parsebool;
    var parse_VCenter = parsebool;
    var parse_WinProtect = parsebool;
    var parse_WriteProtect = parsenoop;
    var parse_VerticalPageBreaks = parsenoop;
    var parse_HorizontalPageBreaks = parsenoop;
    var parse_Selection = parsenoop;
    var parse_Continue = parsenoop;
    var parse_Pane = parsenoop;
    var parse_Pls = parsenoop;
    var parse_DCon = parsenoop;
    var parse_DConRef = parsenoop;
    var parse_DConName = parsenoop;
    var parse_XCT = parsenoop;
    var parse_CRN = parsenoop;
    var parse_FileSharing = parsenoop;
    var parse_Uncalced = parsenoop;
    var parse_Template = parsenoop;
    var parse_Intl = parsenoop;
    var parse_WsBool = parsenoop;
    var parse_Sort = parsenoop;
    var parse_Sync = parsenoop;
    var parse_LPr = parsenoop;
    var parse_DxGCol = parsenoop;
    var parse_FnGroupName = parsenoop;
    var parse_FilterMode = parsenoop;
    var parse_AutoFilterInfo = parsenoop;
    var parse_AutoFilter = parsenoop;
    var parse_Setup = parsenoop;
    var parse_ScenMan = parsenoop;
    var parse_SCENARIO = parsenoop;
    var parse_SxView = parsenoop;
    var parse_Sxvd = parsenoop;
    var parse_SXVI = parsenoop;
    var parse_SxIvd = parsenoop;
    var parse_SXLI = parsenoop;
    var parse_SXPI = parsenoop;
    var parse_DocRoute = parsenoop;
    var parse_RecipName = parsenoop;
    var parse_MulBlank = parsenoop;
    var parse_SXDI = parsenoop;
    var parse_SXDB = parsenoop;
    var parse_SXFDB = parsenoop;
    var parse_SXDBB = parsenoop;
    var parse_SXNum = parsenoop;
    var parse_SxErr = parsenoop;
    var parse_SXInt = parsenoop;
    var parse_SXString = parsenoop;
    var parse_SXDtr = parsenoop;
    var parse_SxNil = parsenoop;
    var parse_SXTbl = parsenoop;
    var parse_SXTBRGIITM = parsenoop;
    var parse_SxTbpg = parsenoop;
    var parse_ObProj = parsenoop;
    var parse_SXStreamID = parsenoop;
    var parse_DBCell = parsenoop;
    var parse_SXRng = parsenoop;
    var parse_SxIsxoper = parsenoop;
    var parse_BookBool = parsenoop;
    var parse_DbOrParamQry = parsenoop;
    var parse_OleObjectSize = parsenoop;
    var parse_SXVS = parsenoop;
    var parse_BkHim = parsenoop;
    var parse_MsoDrawingGroup = parsenoop;
    var parse_MsoDrawing = parsenoop;
    var parse_MsoDrawingSelection = parsenoop;
    var parse_PhoneticInfo = parsenoop;
    var parse_SxRule = parsenoop;
    var parse_SXEx = parsenoop;
    var parse_SxFilt = parsenoop;
    var parse_SxDXF = parsenoop;
    var parse_SxItm = parsenoop;
    var parse_SxName = parsenoop;
    var parse_SxSelect = parsenoop;
    var parse_SXPair = parsenoop;
    var parse_SxFmla = parsenoop;
    var parse_SxFormat = parsenoop;
    var parse_SXVDEx = parsenoop;
    var parse_SXFormula = parsenoop;
    var parse_SXDBEx = parsenoop;
    var parse_RRDInsDel = parsenoop;
    var parse_RRDHead = parsenoop;
    var parse_RRDChgCell = parsenoop;
    var parse_RRDRenSheet = parsenoop;
    var parse_RRSort = parsenoop;
    var parse_RRDMove = parsenoop;
    var parse_RRFormat = parsenoop;
    var parse_RRAutoFmt = parsenoop;
    var parse_RRInsertSh = parsenoop;
    var parse_RRDMoveBegin = parsenoop;
    var parse_RRDMoveEnd = parsenoop;
    var parse_RRDInsDelBegin = parsenoop;
    var parse_RRDInsDelEnd = parsenoop;
    var parse_RRDConflict = parsenoop;
    var parse_RRDDefName = parsenoop;
    var parse_RRDRstEtxp = parsenoop;
    var parse_LRng = parsenoop;
    var parse_CUsr = parsenoop;
    var parse_CbUsr = parsenoop;
    var parse_UsrInfo = parsenoop;
    var parse_UsrExcl = parsenoop;
    var parse_FileLock = parsenoop;
    var parse_RRDInfo = parsenoop;
    var parse_BCUsrs = parsenoop;
    var parse_UsrChk = parsenoop;
    var parse_UserBView = parsenoop;
    var parse_UserSViewBegin = parsenoop;
    var parse_UserSViewEnd = parsenoop;
    var parse_RRDUserView = parsenoop;
    var parse_Qsi = parsenoop;
    var parse_CondFmt = parsenoop;
    var parse_CF = parsenoop;
    var parse_DVal = parsenoop;
    var parse_DConBin = parsenoop;
    var parse_Lel = parsenoop;
    var parse_CodeName = parse_XLUnicodeString;
    var parse_SXFDBType = parsenoop;
    var parse_ObNoMacros = parsenoop;
    var parse_Dv = parsenoop;
    var parse_Index = parsenoop;
    var parse_Table = parsenoop;
    var parse_BigName = parsenoop;
    var parse_ContinueBigName = parsenoop;
    var parse_WebPub = parsenoop;
    var parse_QsiSXTag = parsenoop;
    var parse_DBQueryExt = parsenoop;
    var parse_ExtString = parsenoop;
    var parse_TxtQry = parsenoop;
    var parse_Qsir = parsenoop;
    var parse_Qsif = parsenoop;
    var parse_RRDTQSIF = parsenoop;
    var parse_OleDbConn = parsenoop;
    var parse_WOpt = parsenoop;
    var parse_SXViewEx = parsenoop;
    var parse_SXTH = parsenoop;
    var parse_SXPIEx = parsenoop;
    var parse_SXVDTEx = parsenoop;
    var parse_SXViewEx9 = parsenoop;
    var parse_ContinueFrt = parsenoop;
    var parse_RealTimeData = parsenoop;
    var parse_ChartFrtInfo = parsenoop;
    var parse_FrtWrapper = parsenoop;
    var parse_StartBlock = parsenoop;
    var parse_EndBlock = parsenoop;
    var parse_StartObject = parsenoop;
    var parse_EndObject = parsenoop;
    var parse_CatLab = parsenoop;
    var parse_YMult = parsenoop;
    var parse_SXViewLink = parsenoop;
    var parse_PivotChartBits = parsenoop;
    var parse_FrtFontList = parsenoop;
    var parse_SheetExt = parsenoop;
    var parse_BookExt = parsenoop;
    var parse_SXAddl = parsenoop;
    var parse_CrErr = parsenoop;
    var parse_HFPicture = parsenoop;
    var parse_Feat = parsenoop;
    var parse_DataLabExt = parsenoop;
    var parse_DataLabExtContents = parsenoop;
    var parse_CellWatch = parsenoop;
    var parse_FeatHdr11 = parsenoop;
    var parse_Feature11 = parsenoop;
    var parse_DropDownObjIds = parsenoop;
    var parse_ContinueFrt11 = parsenoop;
    var parse_DConn = parsenoop;
    var parse_List12 = parsenoop;
    var parse_Feature12 = parsenoop;
    var parse_CondFmt12 = parsenoop;
    var parse_CF12 = parsenoop;
    var parse_CFEx = parsenoop;
    var parse_AutoFilter12 = parsenoop;
    var parse_ContinueFrt12 = parsenoop;
    var parse_MDTInfo = parsenoop;
    var parse_MDXStr = parsenoop;
    var parse_MDXTuple = parsenoop;
    var parse_MDXSet = parsenoop;
    var parse_MDXProp = parsenoop;
    var parse_MDXKPI = parsenoop;
    var parse_MDB = parsenoop;
    var parse_PLV = parsenoop;
    var parse_DXF = parsenoop;
    var parse_TableStyles = parsenoop;
    var parse_TableStyle = parsenoop;
    var parse_TableStyleElement = parsenoop;
    var parse_NamePublish = parsenoop;
    var parse_NameCmt = parsenoop;
    var parse_SortData = parsenoop;
    var parse_GUIDTypeLib = parsenoop;
    var parse_FnGrp12 = parsenoop;
    var parse_NameFnGrp12 = parsenoop;
    var parse_HeaderFooter = parsenoop;
    var parse_CrtLayout12 = parsenoop;
    var parse_CrtMlFrt = parsenoop;
    var parse_CrtMlFrtContinue = parsenoop;
    var parse_ShapePropsStream = parsenoop;
    var parse_TextPropsStream = parsenoop;
    var parse_RichTextStream = parsenoop;
    var parse_CrtLayout12A = parsenoop;
    var parse_Units = parsenoop;
    var parse_Chart = parsenoop;
    var parse_Series = parsenoop;
    var parse_DataFormat = parsenoop;
    var parse_LineFormat = parsenoop;
    var parse_MarkerFormat = parsenoop;
    var parse_AreaFormat = parsenoop;
    var parse_PieFormat = parsenoop;
    var parse_AttachedLabel = parsenoop;
    var parse_SeriesText = parsenoop;
    var parse_ChartFormat = parsenoop;
    var parse_Legend = parsenoop;
    var parse_SeriesList = parsenoop;
    var parse_Bar = parsenoop;
    var parse_Line = parsenoop;
    var parse_Pie = parsenoop;
    var parse_Area = parsenoop;
    var parse_Scatter = parsenoop;
    var parse_CrtLine = parsenoop;
    var parse_Axis = parsenoop;
    var parse_Tick = parsenoop;
    var parse_ValueRange = parsenoop;
    var parse_CatSerRange = parsenoop;
    var parse_AxisLine = parsenoop;
    var parse_CrtLink = parsenoop;
    var parse_DefaultText = parsenoop;
    var parse_Text = parsenoop;
    var parse_ObjectLink = parsenoop;
    var parse_Frame = parsenoop;
    var parse_Begin = parsenoop;
    var parse_End = parsenoop;
    var parse_PlotArea = parsenoop;
    var parse_Chart3d = parsenoop;
    var parse_PicF = parsenoop;
    var parse_DropBar = parsenoop;
    var parse_Radar = parsenoop;
    var parse_Surf = parsenoop;
    var parse_RadarArea = parsenoop;
    var parse_AxisParent = parsenoop;
    var parse_LegendException = parsenoop;
    var parse_ShtProps = parsenoop;
    var parse_SerToCrt = parsenoop;
    var parse_AxesUsed = parsenoop;
    var parse_SBaseRef = parsenoop;
    var parse_SerParent = parsenoop;
    var parse_SerAuxTrend = parsenoop;
    var parse_IFmtRecord = parsenoop;
    var parse_Pos = parsenoop;
    var parse_AlRuns = parsenoop;
    var parse_BRAI = parsenoop;
    var parse_SerAuxErrBar = parsenoop;
    var parse_SerFmt = parsenoop;
    var parse_Chart3DBarShape = parsenoop;
    var parse_Fbi = parsenoop;
    var parse_BopPop = parsenoop;
    var parse_AxcExt = parsenoop;
    var parse_Dat = parsenoop;
    var parse_PlotGrowth = parsenoop;
    var parse_SIIndex = parsenoop;
    var parse_GelFrame = parsenoop;
    var parse_BopPopCustom = parsenoop;
    var parse_Fbi2 = parsenoop;

    function parse_BIFF5String(blob) { var len = blob.read_shift(1); return blob.read_shift(len, "sbcs") }

    function parse_BIFF2STR(blob, length, opts) {
        var cell = parse_Cell(blob, 6);
        ++blob.l;
        var str = parse_XLUnicodeString2(blob, length - 7, opts);
        cell.val = str;
        return cell
    }

    function parse_BIFF2NUM(blob, length, opts) {
        var cell = parse_Cell(blob, 6);
        ++blob.l;
        var num = parse_Xnum(blob, 8);
        cell.val = num;
        return cell
    }
    var _chr = function(c) { return String.fromCharCode(c) };
    var attregexg = /([\w:]+)=((?:")([^"]*)(?:")|(?:')([^']*)(?:'))/g;
    var attregex = /([\w:]+)=((?:")(?:[^"]*)(?:")|(?:')(?:[^']*)(?:'))/;

    function parsexmltag(tag, skip_root) {
        var words = tag.split(/\s+/);
        var z = [];
        if (!skip_root) z[0] = words[0];
        if (words.length === 1) return z;
        var m = tag.match(attregexg),
            y, j, w, i;
        if (m)
            for (i = 0; i != m.length; ++i) {
                y = m[i].match(attregex);
                if ((j = y[1].indexOf(":")) === -1) z[y[1]] = y[2].substr(1, y[2].length - 2);
                else {
                    if (y[1].substr(0, 6) === "xmlns:") w = "xmlns" + y[1].substr(6);
                    else w = y[1].substr(j + 1);
                    z[w] = y[2].substr(1, y[2].length - 2)
                }
            }
        return z
    }

    function parsexmltagobj(tag) {
        var words = tag.split(/\s+/);
        var z = {};
        if (words.length === 1) return z;
        var m = tag.match(attregexg),
            y, j, w, i;
        if (m)
            for (i = 0; i != m.length; ++i) {
                y = m[i].match(attregex);
                if ((j = y[1].indexOf(":")) === -1) z[y[1]] = y[2].substr(1, y[2].length - 2);
                else {
                    if (y[1].substr(0, 6) === "xmlns:") w = "xmlns" + y[1].substr(6);
                    else w = y[1].substr(j + 1);
                    z[w] = y[2].substr(1, y[2].length - 2)
                }
            }
        return z
    }
    var encodings = { "&quot;": '"', "&apos;": "'", "&gt;": ">", "&lt;": "<", "&amp;": "&" };
    var rencoding = evert(encodings);
    var rencstr = "&<>'\"".split("");
    var XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n';
    var OFFCRYPTO = {};
    var make_offcrypto = function(O, _crypto) {
        var crypto;
        if (typeof _crypto !== "undefined") crypto = _crypto;
        else if (typeof require !== "undefined") { try { crypto = require("cry" + "pto") } catch (e) { crypto = null } }
        O.rc4 = function(key, data) {
            var S = new Array(256);
            var c = 0,
                i = 0,
                j = 0,
                t = 0;
            for (i = 0; i != 256; ++i) S[i] = i;
            for (i = 0; i != 256; ++i) {
                j = j + S[i] + key[i % key.length].charCodeAt(0) & 255;
                t = S[i];
                S[i] = S[j];
                S[j] = t
            }
            i = j = 0;
            out = Buffer(data.length);
            for (c = 0; c != data.length; ++c) {
                i = i + 1 & 255;
                j = (j + S[i]) % 256;
                t = S[i];
                S[i] = S[j];
                S[j] = t;
                out[c] = data[c] ^ S[S[i] + S[j] & 255]
            }
            return out
        };
        if (crypto) { O.md5 = function(hex) { return crypto.createHash("md5").update(hex).digest("hex") } } else { O.md5 = function(hex) { throw "unimplemented" } }
    };
    make_offcrypto(OFFCRYPTO, typeof crypto !== "undefined" ? crypto : undefined);

    function _JS2ANSI(str) { if (typeof cptable !== "undefined") return cptable.utils.encode(1252, str); return str.split("").map(function(x) { return x.charCodeAt(0) }) }

    function parse_Version(blob, length) {
        var o = {};
        o.Major = blob.read_shift(2);
        o.Minor = blob.read_shift(2);
        return o
    }

    function parse_EncryptionHeader(blob, length) {
        var o = {};
        o.Flags = blob.read_shift(4);
        var tmp = blob.read_shift(4);
        if (tmp !== 0) throw "Unrecognized SizeExtra: " + tmp;
        o.AlgID = blob.read_shift(4);
        switch (o.AlgID) {
            case 0:
            case 26625:
            case 26126:
            case 26127:
            case 26128:
                break;
            default:
                throw "Unrecognized encryption algorithm: " + o.AlgID
        }
        parsenoop(blob, length - 12);
        return o
    }

    function parse_EncryptionVerifier(blob, length) { return parsenoop(blob, length) }

    function parse_RC4CryptoHeader(blob, length) {
        var o = {};
        var vers = o.EncryptionVersionInfo = parse_Version(blob, 4);
        length -= 4;
        if (vers.Minor != 2) throw "unrecognized minor version code: " + vers.Minor;
        if (vers.Major > 4 || vers.Major < 2) throw "unrecognized major version code: " + vers.Major;
        o.Flags = blob.read_shift(4);
        length -= 4;
        var sz = blob.read_shift(4);
        length -= 4;
        o.EncryptionHeader = parse_EncryptionHeader(blob, sz);
        length -= sz;
        o.EncryptionVerifier = parse_EncryptionVerifier(blob, length);
        return o
    }

    function parse_RC4Header(blob, length) {
        var o = {};
        var vers = o.EncryptionVersionInfo = parse_Version(blob, 4);
        length -= 4;
        if (vers.Major != 1 || vers.Minor != 1) throw "unrecognized version code " + vers.Major + " : " + vers.Minor;
        o.Salt = blob.read_shift(16);
        o.EncryptedVerifier = blob.read_shift(16);
        o.EncryptedVerifierHash = blob.read_shift(16);
        return o
    }

    function crypto_CreatePasswordVerifier_Method1(Password) {
        var Verifier = 0,
            PasswordArray;
        var PasswordDecoded = _JS2ANSI(Password);
        var len = PasswordDecoded.length + 1,
            i, PasswordByte;
        var Intermediate1, Intermediate2, Intermediate3;
        PasswordArray = new_buf(len);
        PasswordArray[0] = PasswordDecoded.length;
        for (i = 1; i != len; ++i) PasswordArray[i] = PasswordDecoded[i - 1];
        for (i = len - 1; i >= 0; --i) {
            PasswordByte = PasswordArray[i];
            Intermediate1 = (Verifier & 16384) === 0 ? 0 : 1;
            Intermediate2 = Verifier << 1 & 32767;
            Intermediate3 = Intermediate1 | Intermediate2;
            Verifier = Intermediate3 ^ PasswordByte
        }
        return Verifier ^ 52811
    }
    var crypto_CreateXorArray_Method1 = function() {
        var PadArray = [187, 255, 255, 186, 255, 255, 185, 128, 0, 190, 15, 0, 191, 15, 0];
        var InitialCode = [57840, 7439, 52380, 33984, 4364, 3600, 61902, 12606, 6258, 57657, 54287, 34041, 10252, 43370, 20163];
        var XorMatrix = [44796, 19929, 39858, 10053, 20106, 40212, 10761, 31585, 63170, 64933, 60267, 50935, 40399, 11199, 17763, 35526, 1453, 2906, 5812, 11624, 23248, 885, 1770, 3540, 7080, 14160, 28320, 56640, 55369, 41139, 20807, 41614, 21821, 43642, 17621, 28485, 56970, 44341, 19019, 38038, 14605, 29210, 60195, 50791, 40175, 10751, 21502, 43004, 24537, 18387, 36774, 3949, 7898, 15796, 31592, 63184, 47201, 24803, 49606, 37805, 14203, 28406, 56812, 17824, 35648, 1697, 3394, 6788, 13576, 27152, 43601, 17539, 35078, 557, 1114, 2228, 4456, 30388, 60776, 51953, 34243, 7079, 14158, 28316, 14128, 28256, 56512, 43425, 17251, 34502, 7597, 13105, 26210, 52420, 35241, 883, 1766, 3532, 4129, 8258, 16516, 33032, 4657, 9314, 18628];
        var Ror = function(Byte) { return (Byte / 2 | Byte * 128) & 255 };
        var XorRor = function(byte1, byte2) { return Ror(byte1 ^ byte2) };
        var CreateXorKey_Method1 = function(Password) {
            var XorKey = InitialCode[Password.length - 1];
            var CurrentElement = 104;
            for (var i = Password.length - 1; i >= 0; --i) {
                var Char = Password[i];
                for (var j = 0; j != 7; ++j) {
                    if (Char & 64) XorKey ^= XorMatrix[CurrentElement];
                    Char *= 2;
                    --CurrentElement
                }
            }
            return XorKey
        };
        return function(password) {
            var Password = _JS2ANSI(password);
            var XorKey = CreateXorKey_Method1(Password);
            var Index = Password.length;
            var ObfuscationArray = new_buf(16);
            for (var i = 0; i != 16; ++i) ObfuscationArray[i] = 0;
            var Temp, PasswordLastChar, PadIndex;
            if ((Index & 1) === 1) {
                Temp = XorKey >> 8;
                ObfuscationArray[Index] = XorRor(PadArray[0], Temp);
                --Index;
                Temp = XorKey & 255;
                PasswordLastChar = Password[Password.length - 1];
                ObfuscationArray[Index] = XorRor(PasswordLastChar, Temp)
            }
            while (Index > 0) {
                --Index;
                Temp = XorKey >> 8;
                ObfuscationArray[Index] = XorRor(Password[Index], Temp);
                --Index;
                Temp = XorKey & 255;
                ObfuscationArray[Index] = XorRor(Password[Index], Temp)
            }
            Index = 15;
            PadIndex = 15 - Password.length;
            while (PadIndex > 0) {
                Temp = XorKey >> 8;
                ObfuscationArray[Index] = XorRor(PadArray[PadIndex], Temp);
                --Index;
                --PadIndex;
                Temp = XorKey & 255;
                ObfuscationArray[Index] = XorRor(Password[Index], Temp);
                --Index;
                --PadIndex
            }
            return ObfuscationArray
        }
    }();
    var crypto_DecryptData_Method1 = function(password, Data, XorArrayIndex, XorArray, O) {
        if (!O) O = Data;
        if (!XorArray) XorArray = crypto_CreateXorArray_Method1(password);
        var Index, Value;
        for (Index = 0; Index != Data.length; ++Index) {
            Value = Data[Index];
            Value ^= XorArray[XorArrayIndex];
            Value = (Value >> 5 | Value << 3) & 255;
            O[Index] = Value;
            ++XorArrayIndex
        }
        return [O, XorArrayIndex, XorArray]
    };
    var crypto_MakeXorDecryptor = function(password) {
        var XorArrayIndex = 0,
            XorArray = crypto_CreateXorArray_Method1(password);
        return function(Data) {
            var O = crypto_DecryptData_Method1(null, Data, XorArrayIndex, XorArray);
            XorArrayIndex = O[1];
            return O[0]
        }
    };

    function parse_XORObfuscation(blob, length, opts, out) {
        var o = { key: parseuint16(blob), verificationBytes: parseuint16(blob) };
        if (opts.password) o.verifier = crypto_CreatePasswordVerifier_Method1(opts.password);
        out.valid = o.verificationBytes === o.verifier;
        if (out.valid) out.insitu_decrypt = crypto_MakeXorDecryptor(opts.password);
        return o
    }

    function parse_FilePassHeader(blob, length, oo) {
        var o = oo || {};
        o.Info = blob.read_shift(2);
        blob.l -= 2;
        if (o.Info === 1) o.Data = parse_RC4Header(blob, length);
        else o.Data = parse_RC4CryptoHeader(blob, length);
        return o
    }

    function parse_FilePass(blob, length, opts) {
        var o = { Type: blob.read_shift(2) };
        if (o.Type) parse_FilePassHeader(blob, length - 2, o);
        else parse_XORObfuscation(blob, length - 2, opts, o);
        return o
    }

    function parseread(l) { return function(blob, length) { blob.l += l; return } }

    function parseread1(blob, length) { blob.l += 1; return }

    function parse_ColRelU(blob, length) { var c = blob.read_shift(2); return [c & 16383, c >> 14 & 1, c >> 15 & 1] }

    function parse_RgceArea(blob, length) {
        var r = blob.read_shift(2),
            R = blob.read_shift(2);
        var c = parse_ColRelU(blob, 2);
        var C = parse_ColRelU(blob, 2);
        return { s: { r: r, c: c[0], cRel: c[1], rRel: c[2] }, e: { r: R, c: C[0], cRel: C[1], rRel: C[2] } }
    }

    function parse_RgceAreaRel(blob, length) {
        var r = blob.read_shift(2),
            R = blob.read_shift(2);
        var c = parse_ColRelU(blob, 2);
        var C = parse_ColRelU(blob, 2);
        return { s: { r: r, c: c[0], cRel: c[1], rRel: c[2] }, e: { r: R, c: C[0], cRel: C[1], rRel: C[2] } }
    }

    function parse_RgceLoc(blob, length) { var r = blob.read_shift(2); var c = parse_ColRelU(blob, 2); return { r: r, c: c[0], cRel: c[1], rRel: c[2] } }

    function parse_RgceLocRel(blob, length) {
        var r = blob.read_shift(2);
        var cl = blob.read_shift(2);
        var cRel = (cl & 32768) >> 15,
            rRel = (cl & 16384) >> 14;
        cl &= 16383;
        if (cRel !== 0)
            while (cl >= 256) cl -= 256;
        return { r: r, c: cl, cRel: cRel, rRel: rRel }
    }

    function parse_PtgArea(blob, length) { var type = (blob[blob.l++] & 96) >> 5; var area = parse_RgceArea(blob, 8); return [type, area] }

    function parse_PtgArea3d(blob, length) { var type = (blob[blob.l++] & 96) >> 5; var ixti = blob.read_shift(2); var area = parse_RgceArea(blob, 8); return [type, ixti, area] }

    function parse_PtgAreaErr(blob, length) {
        var type = (blob[blob.l++] & 96) >> 5;
        blob.l += 8;
        return [type]
    }

    function parse_PtgAreaErr3d(blob, length) {
        var type = (blob[blob.l++] & 96) >> 5;
        var ixti = blob.read_shift(2);
        blob.l += 8;
        return [type, ixti]
    }

    function parse_PtgAreaN(blob, length) { var type = (blob[blob.l++] & 96) >> 5; var area = parse_RgceAreaRel(blob, 8); return [type, area] }

    function parse_PtgArray(blob, length) {
        var type = (blob[blob.l++] & 96) >> 5;
        blob.l += 7;
        return [type]
    }

    function parse_PtgAttrBaxcel(blob, length) {
        var bitSemi = blob[blob.l + 1] & 1;
        var bitBaxcel = 1;
        blob.l += 4;
        return [bitSemi, bitBaxcel]
    }

    function parse_PtgAttrChoose(blob, length) { blob.l += 2; var offset = blob.read_shift(2); var o = []; for (var i = 0; i <= offset; ++i) o.push(blob.read_shift(2)); return o }

    function parse_PtgAttrGoto(blob, length) {
        var bitGoto = blob[blob.l + 1] & 255 ? 1 : 0;
        blob.l += 2;
        return [bitGoto, blob.read_shift(2)]
    }

    function parse_PtgAttrIf(blob, length) {
        var bitIf = blob[blob.l + 1] & 255 ? 1 : 0;
        blob.l += 2;
        return [bitIf, blob.read_shift(2)]
    }

    function parse_PtgAttrSemi(blob, length) {
        var bitSemi = blob[blob.l + 1] & 255 ? 1 : 0;
        blob.l += 4;
        return [bitSemi]
    }

    function parse_PtgAttrSpaceType(blob, length) {
        var type = blob.read_shift(1),
            cch = blob.read_shift(1);
        return [type, cch]
    }

    function parse_PtgAttrSpace(blob, length) { blob.read_shift(2); return parse_PtgAttrSpaceType(blob, 2) }

    function parse_PtgAttrSpaceSemi(blob, length) { blob.read_shift(2); return parse_PtgAttrSpaceType(blob, 2) }

    function parse_PtgRef(blob, length) {
        var ptg = blob[blob.l] & 31;
        var type = (blob[blob.l] & 96) >> 5;
        blob.l += 1;
        var loc = parse_RgceLoc(blob, 4);
        return [type, loc]
    }

    function parse_PtgRefN(blob, length) {
        var ptg = blob[blob.l] & 31;
        var type = (blob[blob.l] & 96) >> 5;
        blob.l += 1;
        var loc = parse_RgceLocRel(blob, 4);
        return [type, loc]
    }

    function parse_PtgRef3d(blob, length) {
        var ptg = blob[blob.l] & 31;
        var type = (blob[blob.l] & 96) >> 5;
        blob.l += 1;
        var ixti = blob.read_shift(2);
        var loc = parse_RgceLoc(blob, 4);
        return [type, ixti, loc]
    }

    function parse_PtgFunc(blob, length) {
        var ptg = blob[blob.l] & 31;
        var type = (blob[blob.l] & 96) >> 5;
        blob.l += 1;
        var iftab = blob.read_shift(2);
        return [FtabArgc[iftab], Ftab[iftab]]
    }

    function parse_PtgFuncVar(blob, length) {
        blob.l++;
        var cparams = blob.read_shift(1),
            tab = parsetab(blob);
        return [cparams, (tab[0] === 0 ? Ftab : Cetab)[tab[1]]]
    }

    function parsetab(blob, length) { return [blob[blob.l + 1] >> 7, blob.read_shift(2) & 32767] }
    var parse_PtgAttrSum = parseread(4);
    var parse_PtgConcat = parseread1;

    function parse_PtgExp(blob, length) { blob.l++; var row = blob.read_shift(2); var col = blob.read_shift(2); return [row, col] }

    function parse_PtgErr(blob, length) { blob.l++; return BErr[blob.read_shift(1)] }

    function parse_PtgInt(blob, length) { blob.l++; return blob.read_shift(2) }

    function parse_PtgBool(blob, length) { blob.l++; return blob.read_shift(1) !== 0 }

    function parse_PtgNum(blob, length) { blob.l++; return parse_Xnum(blob, 8) }

    function parse_PtgStr(blob, length) { blob.l++; return parse_ShortXLUnicodeString(blob) }

    function parse_SerAr(blob) {
        var val = [];
        switch (val[0] = blob.read_shift(1)) {
            case 4:
                val[1] = parsebool(blob, 1) ? "TRUE" : "FALSE";
                blob.l += 7;
                break;
            case 16:
                val[1] = BErr[blob[blob.l]];
                blob.l += 8;
                break;
            case 0:
                blob.l += 8;
                break;
            case 1:
                val[1] = parse_Xnum(blob, 8);
                break;
            case 2:
                val[1] = parse_XLUnicodeString(blob);
                break
        }
        return val
    }

    function parse_PtgExtraMem(blob, cce) { var count = blob.read_shift(2); var out = []; for (var i = 0; i != count; ++i) out.push(parse_Ref8U(blob, 8)); return out }

    function parse_PtgExtraArray(blob) {
        var cols = 1 + blob.read_shift(1);
        var rows = 1 + blob.read_shift(2);
        for (var i = 0, o = []; i != rows && (o[i] = []); ++i)
            for (var j = 0; j != cols; ++j) o[i][j] = parse_SerAr(blob);
        return o
    }

    function parse_PtgName(blob, length) { var type = blob.read_shift(1) >>> 5 & 3; var nameindex = blob.read_shift(4); return [type, 0, nameindex] }

    function parse_PtgNameX(blob, length) { var type = blob.read_shift(1) >>> 5 & 3; var ixti = blob.read_shift(2); var nameindex = blob.read_shift(4); return [type, ixti, nameindex] }

    function parse_PtgMemArea(blob, length) {
        var type = blob.read_shift(1) >>> 5 & 3;
        blob.l += 4;
        var cce = blob.read_shift(2);
        return [type, cce]
    }

    function parse_PtgMemFunc(blob, length) { var type = blob.read_shift(1) >>> 5 & 3; var cce = blob.read_shift(2); return [type, cce] }

    function parse_PtgRefErr(blob, length) {
        var type = blob.read_shift(1) >>> 5 & 3;
        blob.l += 4;
        return [type]
    }
    var parse_PtgAdd = parseread1;
    var parse_PtgDiv = parseread1;
    var parse_PtgEq = parseread1;
    var parse_PtgGe = parseread1;
    var parse_PtgGt = parseread1;
    var parse_PtgIsect = parseread1;
    var parse_PtgLe = parseread1;
    var parse_PtgLt = parseread1;
    var parse_PtgMissArg = parseread1;
    var parse_PtgMul = parseread1;
    var parse_PtgNe = parseread1;
    var parse_PtgParen = parseread1;
    var parse_PtgPercent = parseread1;
    var parse_PtgPower = parseread1;
    var parse_PtgRange = parseread1;
    var parse_PtgSub = parseread1;
    var parse_PtgUminus = parseread1;
    var parse_PtgUnion = parseread1;
    var parse_PtgUplus = parseread1;
    var parse_PtgMemErr = parsenoop;
    var parse_PtgMemNoMem = parsenoop;
    var parse_PtgRefErr3d = parsenoop;
    var parse_PtgTbl = parsenoop;
    var PtgTypes = { 1: { n: "PtgExp", f: parse_PtgExp }, 2: { n: "PtgTbl", f: parse_PtgTbl }, 3: { n: "PtgAdd", f: parse_PtgAdd }, 4: { n: "PtgSub", f: parse_PtgSub }, 5: { n: "PtgMul", f: parse_PtgMul }, 6: { n: "PtgDiv", f: parse_PtgDiv }, 7: { n: "PtgPower", f: parse_PtgPower }, 8: { n: "PtgConcat", f: parse_PtgConcat }, 9: { n: "PtgLt", f: parse_PtgLt }, 10: { n: "PtgLe", f: parse_PtgLe }, 11: { n: "PtgEq", f: parse_PtgEq }, 12: { n: "PtgGe", f: parse_PtgGe }, 13: { n: "PtgGt", f: parse_PtgGt }, 14: { n: "PtgNe", f: parse_PtgNe }, 15: { n: "PtgIsect", f: parse_PtgIsect }, 16: { n: "PtgUnion", f: parse_PtgUnion }, 17: { n: "PtgRange", f: parse_PtgRange }, 18: { n: "PtgUplus", f: parse_PtgUplus }, 19: { n: "PtgUminus", f: parse_PtgUminus }, 20: { n: "PtgPercent", f: parse_PtgPercent }, 21: { n: "PtgParen", f: parse_PtgParen }, 22: { n: "PtgMissArg", f: parse_PtgMissArg }, 23: { n: "PtgStr", f: parse_PtgStr }, 28: { n: "PtgErr", f: parse_PtgErr }, 29: { n: "PtgBool", f: parse_PtgBool }, 30: { n: "PtgInt", f: parse_PtgInt }, 31: { n: "PtgNum", f: parse_PtgNum }, 32: { n: "PtgArray", f: parse_PtgArray }, 33: { n: "PtgFunc", f: parse_PtgFunc }, 34: { n: "PtgFuncVar", f: parse_PtgFuncVar }, 35: { n: "PtgName", f: parse_PtgName }, 36: { n: "PtgRef", f: parse_PtgRef }, 37: { n: "PtgArea", f: parse_PtgArea }, 38: { n: "PtgMemArea", f: parse_PtgMemArea }, 39: { n: "PtgMemErr", f: parse_PtgMemErr }, 40: { n: "PtgMemNoMem", f: parse_PtgMemNoMem }, 41: { n: "PtgMemFunc", f: parse_PtgMemFunc }, 42: { n: "PtgRefErr", f: parse_PtgRefErr }, 43: { n: "PtgAreaErr", f: parse_PtgAreaErr }, 44: { n: "PtgRefN", f: parse_PtgRefN }, 45: { n: "PtgAreaN", f: parse_PtgAreaN }, 57: { n: "PtgNameX", f: parse_PtgNameX }, 58: { n: "PtgRef3d", f: parse_PtgRef3d }, 59: { n: "PtgArea3d", f: parse_PtgArea3d }, 60: { n: "PtgRefErr3d", f: parse_PtgRefErr3d }, 61: { n: "PtgAreaErr3d", f: parse_PtgAreaErr3d }, 255: {} };
    var PtgDupes = { 64: 32, 96: 32, 65: 33, 97: 33, 66: 34, 98: 34, 67: 35, 99: 35, 68: 36, 100: 36, 69: 37, 101: 37, 70: 38, 102: 38, 71: 39, 103: 39, 72: 40, 104: 40, 73: 41, 105: 41, 74: 42, 106: 42, 75: 43, 107: 43, 76: 44, 108: 44, 77: 45, 109: 45, 89: 57, 121: 57, 90: 58, 122: 58, 91: 59, 123: 59, 92: 60, 124: 60, 93: 61, 125: 61 };
    (function() { for (var y in PtgDupes) PtgTypes[y] = PtgTypes[PtgDupes[y]] })();
    var Ptg18 = {};
    var Ptg19 = { 1: { n: "PtgAttrSemi", f: parse_PtgAttrSemi }, 2: { n: "PtgAttrIf", f: parse_PtgAttrIf }, 4: { n: "PtgAttrChoose", f: parse_PtgAttrChoose }, 8: { n: "PtgAttrGoto", f: parse_PtgAttrGoto }, 16: { n: "PtgAttrSum", f: parse_PtgAttrSum }, 32: { n: "PtgAttrBaxcel", f: parse_PtgAttrBaxcel }, 64: { n: "PtgAttrSpace", f: parse_PtgAttrSpace }, 65: { n: "PtgAttrSpaceSemi", f: parse_PtgAttrSpaceSemi }, 255: {} };
    var rcregex = /(^|[^A-Za-z])R(\[?)(-?\d+|)\]?C(\[?)(-?\d+|)\]?/g;
    var rcbase;

    function rcfunc($$, $1, $2, $3, $4, $5) {
        var R = $3.length > 0 ? parseInt($3, 10) | 0 : 0,
            C = $5.length > 0 ? parseInt($5, 10) | 0 : 0;
        if (C < 0 && $4.length === 0) C = 0;
        if ($4.length > 0) C += rcbase.c;
        if ($2.length > 0) R += rcbase.r;
        return $1 + encode_col(C) + encode_row(R)
    }

    function rc_to_a1(fstr, base) { rcbase = base; return fstr.replace(rcregex, rcfunc) }

    function parse_Formula(blob, length, opts) {
        var cell = parse_Cell(blob, 6);
        var val = parse_FormulaValue(blob, 8);
        var flags = blob.read_shift(1);
        blob.read_shift(1);
        var chn = blob.read_shift(4);
        var cbf = "";
        if (opts.biff === 5) blob.l += length - 20;
        else cbf = parse_CellParsedFormula(blob, length - 20, opts);
        return { cell: cell, val: val[0], formula: cbf, shared: flags >> 3 & 1, tt: val[1] }
    }

    function parse_FormulaValue(blob) {
        var b;
        if (__readUInt16LE(blob, blob.l + 6) !== 65535) return [parse_Xnum(blob), "n"];
        switch (blob[blob.l]) {
            case 0:
                blob.l += 8;
                return ["String", "s"];
            case 1:
                b = blob[blob.l + 2] === 1;
                blob.l += 8;
                return [b, "b"];
            case 2:
                b = blob[blob.l + 2];
                blob.l += 8;
                return [b, "e"];
            case 3:
                blob.l += 8;
                return ["", "s"]
        }
    }

    function parse_RgbExtra(blob, length, rgce, opts) {
        if (opts.biff < 8) return parsenoop(blob, length);
        var target = blob.l + length;
        var o = [];
        for (var i = 0; i !== rgce.length; ++i) {
            switch (rgce[i][0]) {
                case "PtgArray":
                    rgce[i][1] = parse_PtgExtraArray(blob);
                    o.push(rgce[i][1]);
                    break;
                case "PtgMemArea":
                    rgce[i][2] = parse_PtgExtraMem(blob, rgce[i][1]);
                    o.push(rgce[i][2]);
                    break;
                default:
                    break
            }
        }
        length = target - blob.l;
        if (length !== 0) o.push(parsenoop(blob, length));
        return o
    }

    function parse_NameParsedFormula(blob, length, opts, cce) { var target = blob.l + length; var rgce = parse_Rgce(blob, cce); var rgcb; if (target !== blob.l) rgcb = parse_RgbExtra(blob, target - blob.l, rgce, opts); return [rgce, rgcb] }

    function parse_CellParsedFormula(blob, length, opts) {
        var target = blob.l + length;
        var rgcb, cce = blob.read_shift(2);
        if (cce == 65535) return [
            [], parsenoop(blob, length - 2)
        ];
        var rgce = parse_Rgce(blob, cce);
        if (length !== cce + 2) rgcb = parse_RgbExtra(blob, length - cce - 2, rgce, opts);
        return [rgce, rgcb]
    }

    function parse_SharedParsedFormula(blob, length, opts) {
        var target = blob.l + length;
        var rgcb, cce = blob.read_shift(2);
        var rgce = parse_Rgce(blob, cce);
        if (cce == 65535) return [
            [], parsenoop(blob, length - 2)
        ];
        if (length !== cce + 2) rgcb = parse_RgbExtra(blob, target - cce - 2, rgce, opts);
        return [rgce, rgcb]
    }

    function parse_ArrayParsedFormula(blob, length, opts, ref) {
        var target = blob.l + length;
        var rgcb, cce = blob.read_shift(2);
        if (cce == 65535) return [
            [], parsenoop(blob, length - 2)
        ];
        var rgce = parse_Rgce(blob, cce);
        if (length !== cce + 2) rgcb = parse_RgbExtra(blob, target - cce - 2, rgce, opts);
        return [rgce, rgcb]
    }

    function parse_Rgce(blob, length) {
        var target = blob.l + length;
        var R, id, ptgs = [];
        while (target != blob.l) {
            length = target - blob.l;
            id = blob[blob.l];
            R = PtgTypes[id];
            if (id === 24 || id === 25) {
                id = blob[blob.l + 1];
                R = (id === 24 ? Ptg18 : Ptg19)[id]
            }
            if (!R || !R.f) { ptgs.push(parsenoop(blob, length)) } else { ptgs.push([R.n, R.f(blob, length)]) }
        }
        return ptgs
    }

    function mapper(x) { return x.map(function f2(y) { return y[1] }).join(",") }

    function stringify_formula(formula, range, cell, supbooks, opts) {
        if (opts !== undefined && opts.biff === 5) return "BIFF5??";
        var _range = range !== undefined ? range : { s: { c: 0, r: 0 } };
        var stack = [],
            e1, e2, type, c, ixti, nameidx, r;
        if (!formula[0] || !formula[0][0]) return "";
        for (var ff = 0, fflen = formula[0].length; ff < fflen; ++ff) {
            var f = formula[0][ff];
            switch (f[0]) {
                case "PtgUminus":
                    stack.push("-" + stack.pop());
                    break;
                case "PtgUplus":
                    stack.push("+" + stack.pop());
                    break;
                case "PtgPercent":
                    stack.push(stack.pop() + "%");
                    break;
                case "PtgAdd":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "+" + e1);
                    break;
                case "PtgSub":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "-" + e1);
                    break;
                case "PtgMul":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "*" + e1);
                    break;
                case "PtgDiv":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "/" + e1);
                    break;
                case "PtgPower":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "^" + e1);
                    break;
                case "PtgConcat":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "&" + e1);
                    break;
                case "PtgLt":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "<" + e1);
                    break;
                case "PtgLe":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "<=" + e1);
                    break;
                case "PtgEq":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "=" + e1);
                    break;
                case "PtgGe":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + ">=" + e1);
                    break;
                case "PtgGt":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + ">" + e1);
                    break;
                case "PtgNe":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "<>" + e1);
                    break;
                case "PtgIsect":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + " " + e1);
                    break;
                case "PtgUnion":
                    e1 = stack.pop();
                    e2 = stack.pop();
                    stack.push(e2 + "," + e1);
                    break;
                case "PtgRange":
                    break;
                case "PtgAttrChoose":
                    break;
                case "PtgAttrGoto":
                    break;
                case "PtgAttrIf":
                    break;
                case "PtgRef":
                    type = f[1][0];
                    c = shift_cell(decode_cell(encode_cell(f[1][1])), _range);
                    stack.push(encode_cell(c));
                    break;
                case "PtgRefN":
                    type = f[1][0];
                    c = shift_cell(decode_cell(encode_cell(f[1][1])), cell);
                    stack.push(encode_cell(c));
                    break;
                case "PtgRef3d":
                    type = f[1][0];
                    ixti = f[1][1];
                    c = shift_cell(f[1][2], _range);
                    stack.push(supbooks[1][ixti + 1] + "!" + encode_cell(c));
                    break;
                case "PtgFunc":
                case "PtgFuncVar":
                    var argc = f[1][0],
                        func = f[1][1];
                    if (!argc) argc = 0;
                    var args = stack.slice(-argc);
                    stack.length -= argc;
                    if (func === "User") func = args.shift();
                    stack.push(func + "(" + args.join(",") + ")");
                    break;
                case "PtgBool":
                    stack.push(f[1] ? "TRUE" : "FALSE");
                    break;
                case "PtgInt":
                    stack.push(f[1]);
                    break;
                case "PtgNum":
                    stack.push(String(f[1]));
                    break;
                case "PtgStr":
                    stack.push('"' + f[1] + '"');
                    break;
                case "PtgErr":
                    stack.push(f[1]);
                    break;
                case "PtgArea":
                    type = f[1][0];
                    r = shift_range(f[1][1], _range);
                    stack.push(encode_range(r));
                    break;
                case "PtgArea3d":
                    type = f[1][0];
                    ixti = f[1][1];
                    r = f[1][2];
                    stack.push(supbooks[1][ixti + 1] + "!" + encode_range(r));
                    break;
                case "PtgAttrSum":
                    stack.push("SUM(" + stack.pop() + ")");
                    break;
                case "PtgAttrSemi":
                    break;
                case "PtgName":
                    nameidx = f[1][2];
                    var lbl = supbooks[0][nameidx];
                    var name = lbl.Name;
                    if (name in XLSXFutureFunctions) name = XLSXFutureFunctions[name];
                    stack.push(name);
                    break;
                case "PtgNameX":
                    var bookidx = f[1][1];
                    nameidx = f[1][2];
                    var externbook;
                    if (supbooks[bookidx + 1]) externbook = supbooks[bookidx + 1][nameidx];
                    else if (supbooks[bookidx - 1]) externbook = supbooks[bookidx - 1][nameidx];
                    if (!externbook) externbook = { body: "??NAMEX??" };
                    stack.push(externbook.body);
                    break;
                case "PtgParen":
                    stack.push("(" + stack.pop() + ")");
                    break;
                case "PtgRefErr":
                    stack.push("#REF!");
                    break;
                case "PtgExp":
                    c = { c: f[1][1], r: f[1][0] };
                    var q = { c: cell.c, r: cell.r };
                    if (supbooks.sharedf[encode_cell(c)]) {
                        var parsedf = supbooks.sharedf[encode_cell(c)];
                        stack.push(stringify_formula(parsedf, _range, q, supbooks, opts))
                    } else {
                        var fnd = false;
                        for (e1 = 0; e1 != supbooks.arrayf.length; ++e1) {
                            e2 = supbooks.arrayf[e1];
                            if (c.c < e2[0].s.c || c.c > e2[0].e.c) continue;
                            if (c.r < e2[0].s.r || c.r > e2[0].e.r) continue;
                            stack.push(stringify_formula(e2[1], _range, q, supbooks, opts))
                        }
                        if (!fnd) stack.push(f[1])
                    }
                    break;
                case "PtgArray":
                    stack.push("{" + f[1].map(mapper).join(";") + "}");
                    break;
                case "PtgMemArea":
                    break;
                case "PtgAttrSpace":
                    break;
                case "PtgTbl":
                    break;
                case "PtgMemErr":
                    break;
                case "PtgMissArg":
                    stack.push("");
                    break;
                case "PtgAreaErr":
                    break;
                case "PtgAreaN":
                    stack.push("");
                    break;
                case "PtgRefErr3d":
                    break;
                case "PtgMemFunc":
                    break;
                default:
                    throw "Unrecognized Formula Token: " + f
            }
        }
        return stack[0]
    }
    var PtgDataType = { 1: "REFERENCE", 2: "VALUE", 3: "ARRAY" };
    var BErr = { 0: "#NULL!", 7: "#DIV/0!", 15: "#VALUE!", 23: "#REF!", 29: "#NAME?", 36: "#NUM!", 42: "#N/A", 43: "#GETTING_DATA", 255: "#WTF?" };
    var RBErr = evert(BErr);
    var Cetab = { 0: "BEEP", 1: "OPEN", 2: "OPEN.LINKS", 3: "CLOSE.ALL", 4: "SAVE", 5: "SAVE.AS", 6: "FILE.DELETE", 7: "PAGE.SETUP", 8: "PRINT", 9: "PRINTER.SETUP", 10: "QUIT", 11: "NEW.WINDOW", 12: "ARRANGE.ALL", 13: "WINDOW.SIZE", 14: "WINDOW.MOVE", 15: "FULL", 16: "CLOSE", 17: "RUN", 22: "SET.PRINT.AREA", 23: "SET.PRINT.TITLES", 24: "SET.PAGE.BREAK", 25: "REMOVE.PAGE.BREAK", 26: "FONT", 27: "DISPLAY", 28: "PROTECT.DOCUMENT", 29: "PRECISION", 30: "A1.R1C1", 31: "CALCULATE.NOW", 32: "CALCULATION", 34: "DATA.FIND", 35: "EXTRACT", 36: "DATA.DELETE", 37: "SET.DATABASE", 38: "SET.CRITERIA", 39: "SORT", 40: "DATA.SERIES", 41: "TABLE", 42: "FORMAT.NUMBER", 43: "ALIGNMENT", 44: "STYLE", 45: "BORDER", 46: "CELL.PROTECTION", 47: "COLUMN.WIDTH", 48: "UNDO", 49: "CUT", 50: "COPY", 51: "PASTE", 52: "CLEAR", 53: "PASTE.SPECIAL", 54: "EDIT.DELETE", 55: "INSERT", 56: "FILL.RIGHT", 57: "FILL.DOWN", 61: "DEFINE.NAME", 62: "CREATE.NAMES", 63: "FORMULA.GOTO", 64: "FORMULA.FIND", 65: "SELECT.LAST.CELL", 66: "SHOW.ACTIVE.CELL", 67: "GALLERY.AREA", 68: "GALLERY.BAR", 69: "GALLERY.COLUMN", 70: "GALLERY.LINE", 71: "GALLERY.PIE", 72: "GALLERY.SCATTER", 73: "COMBINATION", 74: "PREFERRED", 75: "ADD.OVERLAY", 76: "GRIDLINES", 77: "SET.PREFERRED", 78: "AXES", 79: "LEGEND", 80: "ATTACH.TEXT", 81: "ADD.ARROW", 82: "SELECT.CHART", 83: "SELECT.PLOT.AREA", 84: "PATTERNS", 85: "MAIN.CHART", 86: "OVERLAY", 87: "SCALE", 88: "FORMAT.LEGEND", 89: "FORMAT.TEXT", 90: "EDIT.REPEAT", 91: "PARSE", 92: "JUSTIFY", 93: "HIDE", 94: "UNHIDE", 95: "WORKSPACE", 96: "FORMULA", 97: "FORMULA.FILL", 98: "FORMULA.ARRAY", 99: "DATA.FIND.NEXT", 100: "DATA.FIND.PREV", 101: "FORMULA.FIND.NEXT", 102: "FORMULA.FIND.PREV", 103: "ACTIVATE", 104: "ACTIVATE.NEXT", 105: "ACTIVATE.PREV", 106: "UNLOCKED.NEXT", 107: "UNLOCKED.PREV", 108: "COPY.PICTURE", 109: "SELECT", 110: "DELETE.NAME", 111: "DELETE.FORMAT", 112: "VLINE", 113: "HLINE", 114: "VPAGE", 115: "HPAGE", 116: "VSCROLL", 117: "HSCROLL", 118: "ALERT", 119: "NEW", 120: "CANCEL.COPY", 121: "SHOW.CLIPBOARD", 122: "MESSAGE", 124: "PASTE.LINK", 125: "APP.ACTIVATE", 126: "DELETE.ARROW", 127: "ROW.HEIGHT", 128: "FORMAT.MOVE", 129: "FORMAT.SIZE", 130: "FORMULA.REPLACE", 131: "SEND.KEYS", 132: "SELECT.SPECIAL", 133: "APPLY.NAMES", 134: "REPLACE.FONT", 135: "FREEZE.PANES", 136: "SHOW.INFO", 137: "SPLIT", 138: "ON.WINDOW", 139: "ON.DATA", 140: "DISABLE.INPUT", 142: "OUTLINE", 143: "LIST.NAMES", 144: "FILE.CLOSE", 145: "SAVE.WORKBOOK", 146: "DATA.FORM", 147: "COPY.CHART", 148: "ON.TIME", 149: "WAIT", 150: "FORMAT.FONT", 151: "FILL.UP", 152: "FILL.LEFT", 153: "DELETE.OVERLAY", 155: "SHORT.MENUS", 159: "SET.UPDATE.STATUS", 161: "COLOR.PALETTE", 162: "DELETE.STYLE", 163: "WINDOW.RESTORE", 164: "WINDOW.MAXIMIZE", 166: "CHANGE.LINK", 167: "CALCULATE.DOCUMENT", 168: "ON.KEY", 169: "APP.RESTORE", 170: "APP.MOVE", 171: "APP.SIZE", 172: "APP.MINIMIZE", 173: "APP.MAXIMIZE", 174: "BRING.TO.FRONT", 175: "SEND.TO.BACK", 185: "MAIN.CHART.TYPE", 186: "OVERLAY.CHART.TYPE", 187: "SELECT.END", 188: "OPEN.MAIL", 189: "SEND.MAIL", 190: "STANDARD.FONT", 191: "CONSOLIDATE", 192: "SORT.SPECIAL", 193: "GALLERY.3D.AREA", 194: "GALLERY.3D.COLUMN", 195: "GALLERY.3D.LINE", 196: "GALLERY.3D.PIE", 197: "VIEW.3D", 198: "GOAL.SEEK", 199: "WORKGROUP", 200: "FILL.GROUP", 201: "UPDATE.LINK", 202: "PROMOTE", 203: "DEMOTE", 204: "SHOW.DETAIL", 206: "UNGROUP", 207: "OBJECT.PROPERTIES", 208: "SAVE.NEW.OBJECT", 209: "SHARE", 210: "SHARE.NAME", 211: "DUPLICATE", 212: "APPLY.STYLE", 213: "ASSIGN.TO.OBJECT", 214: "OBJECT.PROTECTION", 215: "HIDE.OBJECT", 216: "SET.EXTRACT", 217: "CREATE.PUBLISHER", 218: "SUBSCRIBE.TO", 219: "ATTRIBUTES", 220: "SHOW.TOOLBAR", 222: "PRINT.PREVIEW", 223: "EDIT.COLOR", 224: "SHOW.LEVELS", 225: "FORMAT.MAIN", 226: "FORMAT.OVERLAY", 227: "ON.RECALC", 228: "EDIT.SERIES", 229: "DEFINE.STYLE", 240: "LINE.PRINT", 243: "ENTER.DATA", 249: "GALLERY.RADAR", 250: "MERGE.STYLES", 251: "EDITION.OPTIONS", 252: "PASTE.PICTURE", 253: "PASTE.PICTURE.LINK", 254: "SPELLING", 256: "ZOOM", 259: "INSERT.OBJECT", 260: "WINDOW.MINIMIZE", 265: "SOUND.NOTE", 266: "SOUND.PLAY", 267: "FORMAT.SHAPE", 268: "EXTEND.POLYGON", 269: "FORMAT.AUTO", 272: "GALLERY.3D.BAR", 273: "GALLERY.3D.SURFACE", 274: "FILL.AUTO", 276: "CUSTOMIZE.TOOLBAR", 277: "ADD.TOOL", 278: "EDIT.OBJECT", 279: "ON.DOUBLECLICK", 280: "ON.ENTRY", 281: "WORKBOOK.ADD", 282: "WORKBOOK.MOVE", 283: "WORKBOOK.COPY", 284: "WORKBOOK.OPTIONS", 285: "SAVE.WORKSPACE", 288: "CHART.WIZARD", 289: "DELETE.TOOL", 290: "MOVE.TOOL", 291: "WORKBOOK.SELECT", 292: "WORKBOOK.ACTIVATE", 293: "ASSIGN.TO.TOOL", 295: "COPY.TOOL", 296: "RESET.TOOL", 297: "CONSTRAIN.NUMERIC", 298: "PASTE.TOOL", 302: "WORKBOOK.NEW", 305: "SCENARIO.CELLS", 306: "SCENARIO.DELETE", 307: "SCENARIO.ADD", 308: "SCENARIO.EDIT", 309: "SCENARIO.SHOW", 310: "SCENARIO.SHOW.NEXT", 311: "SCENARIO.SUMMARY", 312: "PIVOT.TABLE.WIZARD", 313: "PIVOT.FIELD.PROPERTIES", 314: "PIVOT.FIELD", 315: "PIVOT.ITEM", 316: "PIVOT.ADD.FIELDS", 318: "OPTIONS.CALCULATION", 319: "OPTIONS.EDIT", 320: "OPTIONS.VIEW", 321: "ADDIN.MANAGER", 322: "MENU.EDITOR", 323: "ATTACH.TOOLBARS", 324: "VBAActivate", 325: "OPTIONS.CHART", 328: "VBA.INSERT.FILE", 330: "VBA.PROCEDURE.DEFINITION", 336: "ROUTING.SLIP", 338: "ROUTE.DOCUMENT", 339: "MAIL.LOGON", 342: "INSERT.PICTURE", 343: "EDIT.TOOL", 344: "GALLERY.DOUGHNUT", 350: "CHART.TREND", 352: "PIVOT.ITEM.PROPERTIES", 354: "WORKBOOK.INSERT", 355: "OPTIONS.TRANSITION", 356: "OPTIONS.GENERAL", 370: "FILTER.ADVANCED", 373: "MAIL.ADD.MAILER", 374: "MAIL.DELETE.MAILER", 375: "MAIL.REPLY", 376: "MAIL.REPLY.ALL", 377: "MAIL.FORWARD", 378: "MAIL.NEXT.LETTER", 379: "DATA.LABEL", 380: "INSERT.TITLE", 381: "FONT.PROPERTIES", 382: "MACRO.OPTIONS", 383: "WORKBOOK.HIDE", 384: "WORKBOOK.UNHIDE", 385: "WORKBOOK.DELETE", 386: "WORKBOOK.NAME", 388: "GALLERY.CUSTOM", 390: "ADD.CHART.AUTOFORMAT", 391: "DELETE.CHART.AUTOFORMAT", 392: "CHART.ADD.DATA", 393: "AUTO.OUTLINE", 394: "TAB.ORDER", 395: "SHOW.DIALOG", 396: "SELECT.ALL", 397: "UNGROUP.SHEETS", 398: "SUBTOTAL.CREATE", 399: "SUBTOTAL.REMOVE", 400: "RENAME.OBJECT", 412: "WORKBOOK.SCROLL", 413: "WORKBOOK.NEXT", 414: "WORKBOOK.PREV", 415: "WORKBOOK.TAB.SPLIT", 416: "FULL.SCREEN", 417: "WORKBOOK.PROTECT", 420: "SCROLLBAR.PROPERTIES", 421: "PIVOT.SHOW.PAGES", 422: "TEXT.TO.COLUMNS", 423: "FORMAT.CHARTTYPE", 424: "LINK.FORMAT", 425: "TRACER.DISPLAY", 430: "TRACER.NAVIGATE", 431: "TRACER.CLEAR", 432: "TRACER.ERROR", 433: "PIVOT.FIELD.GROUP", 434: "PIVOT.FIELD.UNGROUP", 435: "CHECKBOX.PROPERTIES", 436: "LABEL.PROPERTIES", 437: "LISTBOX.PROPERTIES", 438: "EDITBOX.PROPERTIES", 439: "PIVOT.REFRESH", 440: "LINK.COMBO", 441: "OPEN.TEXT", 442: "HIDE.DIALOG", 443: "SET.DIALOG.FOCUS", 444: "ENABLE.OBJECT", 445: "PUSHBUTTON.PROPERTIES", 446: "SET.DIALOG.DEFAULT", 447: "FILTER", 448: "FILTER.SHOW.ALL", 449: "CLEAR.OUTLINE", 450: "FUNCTION.WIZARD", 451: "ADD.LIST.ITEM", 452: "SET.LIST.ITEM", 453: "REMOVE.LIST.ITEM", 454: "SELECT.LIST.ITEM", 455: "SET.CONTROL.VALUE", 456: "SAVE.COPY.AS", 458: "OPTIONS.LISTS.ADD", 459: "OPTIONS.LISTS.DELETE", 460: "SERIES.AXES", 461: "SERIES.X", 462: "SERIES.Y", 463: "ERRORBAR.X", 464: "ERRORBAR.Y", 465: "FORMAT.CHART", 466: "SERIES.ORDER", 467: "MAIL.LOGOFF", 468: "CLEAR.ROUTING.SLIP", 469: "APP.ACTIVATE.MICROSOFT", 470: "MAIL.EDIT.MAILER", 471: "ON.SHEET", 472: "STANDARD.WIDTH", 473: "SCENARIO.MERGE", 474: "SUMMARY.INFO", 475: "FIND.FILE", 476: "ACTIVE.CELL.FONT", 477: "ENABLE.TIPWIZARD", 478: "VBA.MAKE.ADDIN", 480: "INSERTDATATABLE", 481: "WORKGROUP.OPTIONS", 482: "MAIL.SEND.MAILER", 485: "AUTOCORRECT", 489: "POST.DOCUMENT", 491: "PICKLIST", 493: "VIEW.SHOW", 494: "VIEW.DEFINE", 495: "VIEW.DELETE", 509: "SHEET.BACKGROUND", 510: "INSERT.MAP.OBJECT", 511: "OPTIONS.MENONO", 517: "MSOCHECKS", 518: "NORMAL", 519: "LAYOUT", 520: "RM.PRINT.AREA", 521: "CLEAR.PRINT.AREA", 522: "ADD.PRINT.AREA", 523: "MOVE.BRK", 545: "HIDECURR.NOTE", 546: "HIDEALL.NOTES", 547: "DELETE.NOTE", 548: "TRAVERSE.NOTES", 549: "ACTIVATE.NOTES", 620: "PROTECT.REVISIONS", 621: "UNPROTECT.REVISIONS", 647: "OPTIONS.ME", 653: "WEB.PUBLISH", 667: "NEWWEBQUERY", 673: "PIVOT.TABLE.CHART", 753: "OPTIONS.SAVE", 755: "OPTIONS.SPELL", 808: "HIDEALL.INKANNOTS" };
    var Ftab = { 0: "COUNT", 1: "IF", 2: "ISNA", 3: "ISERROR", 4: "SUM", 5: "AVERAGE", 6: "MIN", 7: "MAX", 8: "ROW", 9: "COLUMN", 10: "NA", 11: "NPV", 12: "STDEV", 13: "DOLLAR", 14: "FIXED", 15: "SIN", 16: "COS", 17: "TAN", 18: "ATAN", 19: "PI", 20: "SQRT", 21: "EXP", 22: "LN", 23: "LOG10", 24: "ABS", 25: "INT", 26: "SIGN", 27: "ROUND", 28: "LOOKUP", 29: "INDEX", 30: "REPT", 31: "MID", 32: "LEN", 33: "VALUE", 34: "TRUE", 35: "FALSE", 36: "AND", 37: "OR", 38: "NOT", 39: "MOD", 40: "DCOUNT", 41: "DSUM", 42: "DAVERAGE", 43: "DMIN", 44: "DMAX", 45: "DSTDEV", 46: "VAR", 47: "DVAR", 48: "TEXT", 49: "LINEST", 50: "TREND", 51: "LOGEST", 52: "GROWTH", 53: "GOTO", 54: "HALT", 55: "RETURN", 56: "PV", 57: "FV", 58: "NPER", 59: "PMT", 60: "RATE", 61: "MIRR", 62: "IRR", 63: "RAND", 64: "MATCH", 65: "DATE", 66: "TIME", 67: "DAY", 68: "MONTH", 69: "YEAR", 70: "WEEKDAY", 71: "HOUR", 72: "MINUTE", 73: "SECOND", 74: "NOW", 75: "AREAS", 76: "ROWS", 77: "COLUMNS", 78: "OFFSET", 79: "ABSREF", 80: "RELREF", 81: "ARGUMENT", 82: "SEARCH", 83: "TRANSPOSE", 84: "ERROR", 85: "STEP", 86: "TYPE", 87: "ECHO", 88: "SET.NAME", 89: "CALLER", 90: "DEREF", 91: "WINDOWS", 92: "SERIES", 93: "DOCUMENTS", 94: "ACTIVE.CELL", 95: "SELECTION", 96: "RESULT", 97: "ATAN2", 98: "ASIN", 99: "ACOS", 100: "CHOOSE", 101: "HLOOKUP", 102: "VLOOKUP", 103: "LINKS", 104: "INPUT", 105: "ISREF", 106: "GET.FORMULA", 107: "GET.NAME", 108: "SET.VALUE", 109: "LOG", 110: "EXEC", 111: "CHAR", 112: "LOWER", 113: "UPPER", 114: "PROPER", 115: "LEFT", 116: "RIGHT", 117: "EXACT", 118: "TRIM", 119: "REPLACE", 120: "SUBSTITUTE", 121: "CODE", 122: "NAMES", 123: "DIRECTORY", 124: "FIND", 125: "CELL", 126: "ISERR", 127: "ISTEXT", 128: "ISNUMBER", 129: "ISBLANK", 130: "T", 131: "N", 132: "FOPEN", 133: "FCLOSE", 134: "FSIZE", 135: "FREADLN", 136: "FREAD", 137: "FWRITELN", 138: "FWRITE", 139: "FPOS", 140: "DATEVALUE", 141: "TIMEVALUE", 142: "SLN", 143: "SYD", 144: "DDB", 145: "GET.DEF", 146: "REFTEXT", 147: "TEXTREF", 148: "INDIRECT", 149: "REGISTER", 150: "CALL", 151: "ADD.BAR", 152: "ADD.MENU", 153: "ADD.COMMAND", 154: "ENABLE.COMMAND", 155: "CHECK.COMMAND", 156: "RENAME.COMMAND", 157: "SHOW.BAR", 158: "DELETE.MENU", 159: "DELETE.COMMAND", 160: "GET.CHART.ITEM", 161: "DIALOG.BOX", 162: "CLEAN", 163: "MDETERM", 164: "MINVERSE", 165: "MMULT", 166: "FILES", 167: "IPMT", 168: "PPMT", 169: "COUNTA", 170: "CANCEL.KEY", 171: "FOR", 172: "WHILE", 173: "BREAK", 174: "NEXT", 175: "INITIATE", 176: "REQUEST", 177: "POKE", 178: "EXECUTE", 179: "TERMINATE", 180: "RESTART", 181: "HELP", 182: "GET.BAR", 183: "PRODUCT", 184: "FACT", 185: "GET.CELL", 186: "GET.WORKSPACE", 187: "GET.WINDOW", 188: "GET.DOCUMENT", 189: "DPRODUCT", 190: "ISNONTEXT", 191: "GET.NOTE", 192: "NOTE", 193: "STDEVP", 194: "VARP", 195: "DSTDEVP", 196: "DVARP", 197: "TRUNC", 198: "ISLOGICAL", 199: "DCOUNTA", 200: "DELETE.BAR", 201: "UNREGISTER", 204: "USDOLLAR", 205: "FINDB", 206: "SEARCHB", 207: "REPLACEB", 208: "LEFTB", 209: "RIGHTB", 210: "MIDB", 211: "LENB", 212: "ROUNDUP", 213: "ROUNDDOWN", 214: "ASC", 215: "DBCS", 216: "RANK", 219: "ADDRESS", 220: "DAYS360", 221: "TODAY", 222: "VDB", 223: "ELSE", 224: "ELSE.IF", 225: "END.IF", 226: "FOR.CELL", 227: "MEDIAN", 228: "SUMPRODUCT", 229: "SINH", 230: "COSH", 231: "TANH", 232: "ASINH", 233: "ACOSH", 234: "ATANH", 235: "DGET", 236: "CREATE.OBJECT", 237: "VOLATILE", 238: "LAST.ERROR", 239: "CUSTOM.UNDO", 240: "CUSTOM.REPEAT", 241: "FORMULA.CONVERT", 242: "GET.LINK.INFO", 243: "TEXT.BOX", 244: "INFO", 245: "GROUP", 246: "GET.OBJECT", 247: "DB", 248: "PAUSE", 251: "RESUME", 252: "FREQUENCY", 253: "ADD.TOOLBAR", 254: "DELETE.TOOLBAR", 255: "User", 256: "RESET.TOOLBAR", 257: "EVALUATE", 258: "GET.TOOLBAR", 259: "GET.TOOL", 260: "SPELLING.CHECK", 261: "ERROR.TYPE", 262: "APP.TITLE", 263: "WINDOW.TITLE", 264: "SAVE.TOOLBAR", 265: "ENABLE.TOOL", 266: "PRESS.TOOL", 267: "REGISTER.ID", 268: "GET.WORKBOOK", 269: "AVEDEV", 270: "BETADIST", 271: "GAMMALN", 272: "BETAINV", 273: "BINOMDIST", 274: "CHIDIST", 275: "CHIINV", 276: "COMBIN", 277: "CONFIDENCE", 278: "CRITBINOM", 279: "EVEN", 280: "EXPONDIST", 281: "FDIST", 282: "FINV", 283: "FISHER", 284: "FISHERINV", 285: "FLOOR", 286: "GAMMADIST", 287: "GAMMAINV", 288: "CEILING", 289: "HYPGEOMDIST", 290: "LOGNORMDIST", 291: "LOGINV", 292: "NEGBINOMDIST", 293: "NORMDIST", 294: "NORMSDIST", 295: "NORMINV", 296: "NORMSINV", 297: "STANDARDIZE", 298: "ODD", 299: "PERMUT", 300: "POISSON", 301: "TDIST", 302: "WEIBULL", 303: "SUMXMY2", 304: "SUMX2MY2", 305: "SUMX2PY2", 306: "CHITEST", 307: "CORREL", 308: "COVAR", 309: "FORECAST", 310: "FTEST", 311: "INTERCEPT", 312: "PEARSON", 313: "RSQ", 314: "STEYX", 315: "SLOPE", 316: "TTEST", 317: "PROB", 318: "DEVSQ", 319: "GEOMEAN", 320: "HARMEAN", 321: "SUMSQ", 322: "KURT", 323: "SKEW", 324: "ZTEST", 325: "LARGE", 326: "SMALL", 327: "QUARTILE", 328: "PERCENTILE", 329: "PERCENTRANK", 330: "MODE", 331: "TRIMMEAN", 332: "TINV", 334: "MOVIE.COMMAND", 335: "GET.MOVIE", 336: "CONCATENATE", 337: "POWER", 338: "PIVOT.ADD.DATA", 339: "GET.PIVOT.TABLE", 340: "GET.PIVOT.FIELD", 341: "GET.PIVOT.ITEM", 342: "RADIANS", 343: "DEGREES", 344: "SUBTOTAL", 345: "SUMIF", 346: "COUNTIF", 347: "COUNTBLANK", 348: "SCENARIO.GET", 349: "OPTIONS.LISTS.GET", 350: "ISPMT", 351: "DATEDIF", 352: "DATESTRING", 353: "NUMBERSTRING", 354: "ROMAN", 355: "OPEN.DIALOG", 356: "SAVE.DIALOG", 357: "VIEW.GET", 358: "GETPIVOTDATA", 359: "HYPERLINK", 360: "PHONETIC", 361: "AVERAGEA", 362: "MAXA", 363: "MINA", 364: "STDEVPA", 365: "VARPA", 366: "STDEVA", 367: "VARA", 368: "BAHTTEXT", 369: "THAIDAYOFWEEK", 370: "THAIDIGIT", 371: "THAIMONTHOFYEAR", 372: "THAINUMSOUND", 373: "THAINUMSTRING", 374: "THAISTRINGLENGTH", 375: "ISTHAIDIGIT", 376: "ROUNDBAHTDOWN", 377: "ROUNDBAHTUP", 378: "THAIYEAR", 379: "RTD" };
    var FtabArgc = { 2: 1, 3: 1, 15: 1, 16: 1, 17: 1, 18: 1, 20: 1, 21: 1, 22: 1, 23: 1, 24: 1, 25: 1, 26: 1, 27: 2, 30: 2, 31: 3, 32: 1, 33: 1, 38: 1, 39: 2, 40: 3, 41: 3, 42: 3, 43: 3, 44: 3, 45: 3, 47: 3, 48: 2, 53: 1, 61: 3, 65: 3, 66: 3, 67: 1, 68: 1, 69: 1, 71: 1, 72: 1, 73: 1, 75: 1, 76: 1, 77: 1, 79: 2, 80: 2, 83: 1, 86: 1, 90: 1, 97: 2, 98: 1, 99: 1, 105: 1, 111: 1, 112: 1, 113: 1, 114: 1, 117: 2, 118: 1, 119: 4, 121: 1, 126: 1, 127: 1, 128: 1, 129: 1, 130: 1, 131: 1, 133: 1, 134: 1, 135: 1, 136: 2, 137: 2, 138: 2, 140: 1, 141: 1, 142: 3, 143: 4, 162: 1, 163: 1, 164: 1, 165: 2, 172: 1, 175: 2, 176: 2, 177: 3, 178: 2, 179: 1, 184: 1, 189: 3, 190: 1, 195: 3, 196: 3, 198: 1, 199: 3, 201: 1, 207: 4, 210: 3, 211: 1, 212: 2, 213: 2, 214: 1, 215: 1, 229: 1, 230: 1, 231: 1, 232: 1, 233: 1, 234: 1, 235: 3, 244: 1, 252: 2, 257: 1, 261: 1, 271: 1, 273: 4, 274: 2, 275: 2, 276: 2, 277: 3, 278: 3, 279: 1, 280: 3, 281: 3, 282: 3, 283: 1, 284: 1, 285: 2, 286: 4, 287: 3, 288: 2, 289: 4, 290: 3, 291: 3, 292: 3, 293: 4, 294: 1, 295: 3, 296: 1, 297: 3, 298: 1, 299: 2, 300: 3, 301: 3, 302: 4, 303: 2, 304: 2, 305: 2, 306: 2, 307: 2, 308: 2, 309: 3, 310: 2, 311: 2, 312: 2, 313: 2, 314: 2, 315: 2, 316: 4, 325: 2, 326: 2, 327: 2, 328: 2, 331: 2, 332: 2, 337: 2, 342: 1, 343: 1, 346: 2, 347: 1, 350: 4, 351: 3, 352: 1, 353: 2, 360: 1, 368: 1, 369: 1, 370: 1, 371: 1, 372: 1, 373: 1, 374: 1, 375: 1, 376: 1, 377: 1, 378: 1, 65535: 0 };
    var XLSXFutureFunctions = { "_xlfn.ACOT": "ACOT", "_xlfn.ACOTH": "ACOTH", "_xlfn.AGGREGATE": "AGGREGATE", "_xlfn.ARABIC": "ARABIC", "_xlfn.AVERAGEIF": "AVERAGEIF", "_xlfn.AVERAGEIFS": "AVERAGEIFS", "_xlfn.BASE": "BASE", "_xlfn.BETA.DIST": "BETA.DIST", "_xlfn.BETA.INV": "BETA.INV", "_xlfn.BINOM.DIST": "BINOM.DIST", "_xlfn.BINOM.DIST.RANGE": "BINOM.DIST.RANGE", "_xlfn.BINOM.INV": "BINOM.INV", "_xlfn.BITAND": "BITAND", "_xlfn.BITLSHIFT": "BITLSHIFT", "_xlfn.BITOR": "BITOR", "_xlfn.BITRSHIFT": "BITRSHIFT", "_xlfn.BITXOR": "BITXOR", "_xlfn.CEILING.MATH": "CEILING.MATH", "_xlfn.CEILING.PRECISE": "CEILING.PRECISE", "_xlfn.CHISQ.DIST": "CHISQ.DIST", "_xlfn.CHISQ.DIST.RT": "CHISQ.DIST.RT", "_xlfn.CHISQ.INV": "CHISQ.INV", "_xlfn.CHISQ.INV.RT": "CHISQ.INV.RT", "_xlfn.CHISQ.TEST": "CHISQ.TEST", "_xlfn.COMBINA": "COMBINA", "_xlfn.CONFIDENCE.NORM": "CONFIDENCE.NORM", "_xlfn.CONFIDENCE.T": "CONFIDENCE.T", "_xlfn.COT": "COT", "_xlfn.COTH": "COTH", "_xlfn.COUNTIFS": "COUNTIFS", "_xlfn.COVARIANCE.P": "COVARIANCE.P", "_xlfn.COVARIANCE.S": "COVARIANCE.S", "_xlfn.CSC": "CSC", "_xlfn.CSCH": "CSCH", "_xlfn.DAYS": "DAYS", "_xlfn.DECIMAL": "DECIMAL", "_xlfn.ECMA.CEILING": "ECMA.CEILING", "_xlfn.ERF.PRECISE": "ERF.PRECISE", "_xlfn.ERFC.PRECISE": "ERFC.PRECISE", "_xlfn.EXPON.DIST": "EXPON.DIST", "_xlfn.F.DIST": "F.DIST", "_xlfn.F.DIST.RT": "F.DIST.RT", "_xlfn.F.INV": "F.INV", "_xlfn.F.INV.RT": "F.INV.RT", "_xlfn.F.TEST": "F.TEST", "_xlfn.FILTERXML": "FILTERXML", "_xlfn.FLOOR.MATH": "FLOOR.MATH", "_xlfn.FLOOR.PRECISE": "FLOOR.PRECISE", "_xlfn.FORMULATEXT": "FORMULATEXT", "_xlfn.GAMMA": "GAMMA", "_xlfn.GAMMA.DIST": "GAMMA.DIST", "_xlfn.GAMMA.INV": "GAMMA.INV", "_xlfn.GAMMALN.PRECISE": "GAMMALN.PRECISE", "_xlfn.GAUSS": "GAUSS", "_xlfn.HYPGEOM.DIST": "HYPGEOM.DIST", "_xlfn.IFNA": "IFNA", "_xlfn.IFERROR": "IFERROR", "_xlfn.IMCOSH": "IMCOSH", "_xlfn.IMCOT": "IMCOT", "_xlfn.IMCSC": "IMCSC", "_xlfn.IMCSCH": "IMCSCH", "_xlfn.IMSEC": "IMSEC", "_xlfn.IMSECH": "IMSECH", "_xlfn.IMSINH": "IMSINH", "_xlfn.IMTAN": "IMTAN", "_xlfn.ISFORMULA": "ISFORMULA", "_xlfn.ISO.CEILING": "ISO.CEILING", "_xlfn.ISOWEEKNUM": "ISOWEEKNUM", "_xlfn.LOGNORM.DIST": "LOGNORM.DIST", "_xlfn.LOGNORM.INV": "LOGNORM.INV", "_xlfn.MODE.MULT": "MODE.MULT", "_xlfn.MODE.SNGL": "MODE.SNGL", "_xlfn.MUNIT": "MUNIT", "_xlfn.NEGBINOM.DIST": "NEGBINOM.DIST", "_xlfn.NETWORKDAYS.INTL": "NETWORKDAYS.INTL", "_xlfn.NIGBINOM": "NIGBINOM", "_xlfn.NORM.DIST": "NORM.DIST", "_xlfn.NORM.INV": "NORM.INV", "_xlfn.NORM.S.DIST": "NORM.S.DIST", "_xlfn.NORM.S.INV": "NORM.S.INV", "_xlfn.NUMBERVALUE": "NUMBERVALUE", "_xlfn.PDURATION": "PDURATION", "_xlfn.PERCENTILE.EXC": "PERCENTILE.EXC", "_xlfn.PERCENTILE.INC": "PERCENTILE.INC", "_xlfn.PERCENTRANK.EXC": "PERCENTRANK.EXC", "_xlfn.PERCENTRANK.INC": "PERCENTRANK.INC", "_xlfn.PERMUTATIONA": "PERMUTATIONA", "_xlfn.PHI": "PHI", "_xlfn.POISSON.DIST": "POISSON.DIST", "_xlfn.QUARTILE.EXC": "QUARTILE.EXC", "_xlfn.QUARTILE.INC": "QUARTILE.INC", "_xlfn.QUERYSTRING": "QUERYSTRING", "_xlfn.RANK.AVG": "RANK.AVG", "_xlfn.RANK.EQ": "RANK.EQ", "_xlfn.RRI": "RRI", "_xlfn.SEC": "SEC", "_xlfn.SECH": "SECH", "_xlfn.SHEET": "SHEET", "_xlfn.SHEETS": "SHEETS", "_xlfn.SKEW.P": "SKEW.P", "_xlfn.STDEV.P": "STDEV.P", "_xlfn.STDEV.S": "STDEV.S", "_xlfn.SUMIFS": "SUMIFS", "_xlfn.T.DIST": "T.DIST", "_xlfn.T.DIST.2T": "T.DIST.2T", "_xlfn.T.DIST.RT": "T.DIST.RT", "_xlfn.T.INV": "T.INV", "_xlfn.T.INV.2T": "T.INV.2T", "_xlfn.T.TEST": "T.TEST", "_xlfn.UNICHAR": "UNICHAR", "_xlfn.UNICODE": "UNICODE", "_xlfn.VAR.P": "VAR.P", "_xlfn.VAR.S": "VAR.S", "_xlfn.WEBSERVICE": "WEBSERVICE", "_xlfn.WEIBULL.DIST": "WEIBULL.DIST", "_xlfn.WORKDAY.INTL": "WORKDAY.INTL", "_xlfn.XOR": "XOR", "_xlfn.Z.TEST": "Z.TEST" };

    function parse_Theme(blob, length) {
        var dwThemeVersion = blob.read_shift(4);
        if (dwThemeVersion === 124226) return;
        blob.l += length - 4
    }

    function parse_ColorTheme(blob, length) { return blob.read_shift(4) }

    function parse_FullColorExt(blob, length) {
        var o = {};
        o.xclrType = blob.read_shift(2);
        o.nTintShade = blob.read_shift(2);
        switch (o.xclrType) {
            case 0:
                blob.l += 4;
                break;
            case 1:
                o.xclrValue = parse_IcvXF(blob, 4);
                break;
            case 2:
                o.xclrValue = parse_LongRGBA(blob, 4);
                break;
            case 3:
                o.xclrValue = parse_ColorTheme(blob, 4);
                break;
            case 4:
                blob.l += 4;
                break
        }
        blob.l += 8;
        return o
    }

    function parse_IcvXF(blob, length) { return parsenoop(blob, length) }

    function parse_XFExtGradient(blob, length) { return parsenoop(blob, length) }

    function parse_ExtProp(blob, length) {
        var extType = blob.read_shift(2);
        var cb = blob.read_shift(2);
        var o = [extType];
        switch (extType) {
            case 4:
            case 5:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 13:
                o[1] = parse_FullColorExt(blob, cb);
                break;
            case 6:
                o[1] = parse_XFExtGradient(blob, cb);
                break;
            case 14:
            case 15:
                o[1] = blob.read_shift(cb === 5 ? 1 : 2);
                break;
            default:
                throw new Error("Unrecognized ExtProp type: " + extType + " " + cb)
        }
        return o
    }

    function parse_XFExt(blob, length) {
        var end = blob.l + length;
        blob.l += 2;
        var ixfe = blob.read_shift(2);
        blob.l += 2;
        var cexts = blob.read_shift(2);
        var ext = [];
        while (cexts-- > 0) ext.push(parse_ExtProp(blob, end - blob.l));
        return { ixfe: ixfe, ext: ext }
    }

    function update_xfext(xf, xfext) {
        xfext.forEach(function(xfe) {
            switch (xfe[0]) {
                case 4:
                    break;
                case 5:
                    break;
                case 7:
                case 8:
                case 9:
                case 10:
                    break;
                case 13:
                    break;
                case 14:
                    break;
                default:
                    throw "bafuq" + xfe[0].toString(16)
            }
        })
    }
    var RecordEnum = { 3: { n: "BIFF2NUM", f: parse_BIFF2NUM }, 4: { n: "BIFF2STR", f: parse_BIFF2STR }, 6: { n: "Formula", f: parse_Formula }, 9: { n: "BOF", f: parse_BOF }, 10: { n: "EOF", f: parse_EOF }, 12: { n: "CalcCount", f: parse_CalcCount }, 13: { n: "CalcMode", f: parse_CalcMode }, 14: { n: "CalcPrecision", f: parse_CalcPrecision }, 15: { n: "CalcRefMode", f: parse_CalcRefMode }, 16: { n: "CalcDelta", f: parse_CalcDelta }, 17: { n: "CalcIter", f: parse_CalcIter }, 18: { n: "Protect", f: parse_Protect }, 19: { n: "Password", f: parse_Password }, 20: { n: "Header", f: parse_Header }, 21: { n: "Footer", f: parse_Footer }, 23: { n: "ExternSheet", f: parse_ExternSheet }, 24: { n: "Lbl", f: parse_Lbl }, 25: { n: "WinProtect", f: parse_WinProtect }, 26: { n: "VerticalPageBreaks", f: parse_VerticalPageBreaks }, 27: { n: "HorizontalPageBreaks", f: parse_HorizontalPageBreaks }, 28: { n: "Note", f: parse_Note }, 29: { n: "Selection", f: parse_Selection }, 34: { n: "Date1904", f: parse_Date1904 }, 35: { n: "ExternName", f: parse_ExternName }, 38: { n: "LeftMargin", f: parse_LeftMargin }, 39: { n: "RightMargin", f: parse_RightMargin }, 40: { n: "TopMargin", f: parse_TopMargin }, 41: { n: "BottomMargin", f: parse_BottomMargin }, 42: { n: "PrintRowCol", f: parse_PrintRowCol }, 43: { n: "PrintGrid", f: parse_PrintGrid }, 47: { n: "FilePass", f: parse_FilePass }, 49: { n: "Font", f: parse_Font }, 51: { n: "PrintSize", f: parse_PrintSize }, 60: { n: "Continue", f: parse_Continue }, 61: { n: "Window1", f: parse_Window1 }, 64: { n: "Backup", f: parse_Backup }, 65: { n: "Pane", f: parse_Pane }, 66: { n: "CodePage", f: parse_CodePage }, 77: { n: "Pls", f: parse_Pls }, 80: { n: "DCon", f: parse_DCon }, 81: { n: "DConRef", f: parse_DConRef }, 82: { n: "DConName", f: parse_DConName }, 85: { n: "DefColWidth", f: parse_DefColWidth }, 89: { n: "XCT", f: parse_XCT }, 90: { n: "CRN", f: parse_CRN }, 91: { n: "FileSharing", f: parse_FileSharing }, 92: { n: "WriteAccess", f: parse_WriteAccess }, 93: { n: "Obj", f: parse_Obj }, 94: { n: "Uncalced", f: parse_Uncalced }, 95: { n: "CalcSaveRecalc", f: parse_CalcSaveRecalc }, 96: { n: "Template", f: parse_Template }, 97: { n: "Intl", f: parse_Intl }, 99: { n: "ObjProtect", f: parse_ObjProtect }, 125: { n: "ColInfo", f: parse_ColInfo }, 128: { n: "Guts", f: parse_Guts }, 129: { n: "WsBool", f: parse_WsBool }, 130: { n: "GridSet", f: parse_GridSet }, 131: { n: "HCenter", f: parse_HCenter }, 132: { n: "VCenter", f: parse_VCenter }, 133: { n: "BoundSheet8", f: parse_BoundSheet8 }, 134: { n: "WriteProtect", f: parse_WriteProtect }, 140: { n: "Country", f: parse_Country }, 141: { n: "HideObj", f: parse_HideObj }, 144: { n: "Sort", f: parse_Sort }, 146: { n: "Palette", f: parse_Palette }, 151: { n: "Sync", f: parse_Sync }, 152: { n: "LPr", f: parse_LPr }, 153: { n: "DxGCol", f: parse_DxGCol }, 154: { n: "FnGroupName", f: parse_FnGroupName }, 155: { n: "FilterMode", f: parse_FilterMode }, 156: { n: "BuiltInFnGroupCount", f: parse_BuiltInFnGroupCount }, 157: { n: "AutoFilterInfo", f: parse_AutoFilterInfo }, 158: { n: "AutoFilter", f: parse_AutoFilter }, 160: { n: "Scl", f: parse_Scl }, 161: { n: "Setup", f: parse_Setup }, 174: { n: "ScenMan", f: parse_ScenMan }, 175: { n: "SCENARIO", f: parse_SCENARIO }, 176: { n: "SxView", f: parse_SxView }, 177: { n: "Sxvd", f: parse_Sxvd }, 178: { n: "SXVI", f: parse_SXVI }, 180: { n: "SxIvd", f: parse_SxIvd }, 181: { n: "SXLI", f: parse_SXLI }, 182: { n: "SXPI", f: parse_SXPI }, 184: { n: "DocRoute", f: parse_DocRoute }, 185: { n: "RecipName", f: parse_RecipName }, 189: { n: "MulRk", f: parse_MulRk }, 190: { n: "MulBlank", f: parse_MulBlank }, 193: { n: "Mms", f: parse_Mms }, 197: { n: "SXDI", f: parse_SXDI }, 198: { n: "SXDB", f: parse_SXDB }, 199: { n: "SXFDB", f: parse_SXFDB }, 200: { n: "SXDBB", f: parse_SXDBB }, 201: { n: "SXNum", f: parse_SXNum }, 202: { n: "SxBool", f: parse_SxBool }, 203: { n: "SxErr", f: parse_SxErr }, 204: { n: "SXInt", f: parse_SXInt }, 205: { n: "SXString", f: parse_SXString }, 206: { n: "SXDtr", f: parse_SXDtr }, 207: { n: "SxNil", f: parse_SxNil }, 208: { n: "SXTbl", f: parse_SXTbl }, 209: { n: "SXTBRGIITM", f: parse_SXTBRGIITM }, 210: { n: "SxTbpg", f: parse_SxTbpg }, 211: { n: "ObProj", f: parse_ObProj }, 213: { n: "SXStreamID", f: parse_SXStreamID }, 215: { n: "DBCell", f: parse_DBCell }, 216: { n: "SXRng", f: parse_SXRng }, 217: { n: "SxIsxoper", f: parse_SxIsxoper }, 218: { n: "BookBool", f: parse_BookBool }, 220: { n: "DbOrParamQry", f: parse_DbOrParamQry }, 221: { n: "ScenarioProtect", f: parse_ScenarioProtect }, 222: { n: "OleObjectSize", f: parse_OleObjectSize }, 224: { n: "XF", f: parse_XF }, 225: { n: "InterfaceHdr", f: parse_InterfaceHdr }, 226: { n: "InterfaceEnd", f: parse_InterfaceEnd }, 227: { n: "SXVS", f: parse_SXVS }, 229: { n: "MergeCells", f: parse_MergeCells }, 233: { n: "BkHim", f: parse_BkHim }, 235: { n: "MsoDrawingGroup", f: parse_MsoDrawingGroup }, 236: { n: "MsoDrawing", f: parse_MsoDrawing }, 237: { n: "MsoDrawingSelection", f: parse_MsoDrawingSelection }, 239: { n: "PhoneticInfo", f: parse_PhoneticInfo }, 240: { n: "SxRule", f: parse_SxRule }, 241: { n: "SXEx", f: parse_SXEx }, 242: { n: "SxFilt", f: parse_SxFilt }, 244: { n: "SxDXF", f: parse_SxDXF }, 245: { n: "SxItm", f: parse_SxItm }, 246: { n: "SxName", f: parse_SxName }, 247: { n: "SxSelect", f: parse_SxSelect }, 248: { n: "SXPair", f: parse_SXPair }, 249: { n: "SxFmla", f: parse_SxFmla }, 251: { n: "SxFormat", f: parse_SxFormat }, 252: { n: "SST", f: parse_SST }, 253: { n: "LabelSst", f: parse_LabelSst }, 255: { n: "ExtSST", f: parse_ExtSST }, 256: { n: "SXVDEx", f: parse_SXVDEx }, 259: { n: "SXFormula", f: parse_SXFormula }, 290: { n: "SXDBEx", f: parse_SXDBEx }, 311: { n: "RRDInsDel", f: parse_RRDInsDel }, 312: { n: "RRDHead", f: parse_RRDHead }, 315: { n: "RRDChgCell", f: parse_RRDChgCell }, 317: { n: "RRTabId", f: parse_RRTabId }, 318: { n: "RRDRenSheet", f: parse_RRDRenSheet }, 319: { n: "RRSort", f: parse_RRSort }, 320: { n: "RRDMove", f: parse_RRDMove }, 330: { n: "RRFormat", f: parse_RRFormat }, 331: { n: "RRAutoFmt", f: parse_RRAutoFmt }, 333: { n: "RRInsertSh", f: parse_RRInsertSh }, 334: { n: "RRDMoveBegin", f: parse_RRDMoveBegin }, 335: { n: "RRDMoveEnd", f: parse_RRDMoveEnd }, 336: { n: "RRDInsDelBegin", f: parse_RRDInsDelBegin }, 337: { n: "RRDInsDelEnd", f: parse_RRDInsDelEnd }, 338: { n: "RRDConflict", f: parse_RRDConflict }, 339: { n: "RRDDefName", f: parse_RRDDefName }, 340: { n: "RRDRstEtxp", f: parse_RRDRstEtxp }, 351: { n: "LRng", f: parse_LRng }, 352: { n: "UsesELFs", f: parse_UsesELFs }, 353: { n: "DSF", f: parse_DSF }, 401: { n: "CUsr", f: parse_CUsr }, 402: { n: "CbUsr", f: parse_CbUsr }, 403: { n: "UsrInfo", f: parse_UsrInfo }, 404: { n: "UsrExcl", f: parse_UsrExcl }, 405: { n: "FileLock", f: parse_FileLock }, 406: { n: "RRDInfo", f: parse_RRDInfo }, 407: { n: "BCUsrs", f: parse_BCUsrs }, 408: { n: "UsrChk", f: parse_UsrChk }, 425: { n: "UserBView", f: parse_UserBView }, 426: { n: "UserSViewBegin", f: parse_UserSViewBegin }, 427: { n: "UserSViewEnd", f: parse_UserSViewEnd }, 428: { n: "RRDUserView", f: parse_RRDUserView }, 429: { n: "Qsi", f: parse_Qsi }, 430: { n: "SupBook", f: parse_SupBook }, 431: { n: "Prot4Rev", f: parse_Prot4Rev }, 432: { n: "CondFmt", f: parse_CondFmt }, 433: { n: "CF", f: parse_CF }, 434: { n: "DVal", f: parse_DVal }, 437: { n: "DConBin", f: parse_DConBin }, 438: { n: "TxO", f: parse_TxO }, 439: { n: "RefreshAll", f: parse_RefreshAll }, 440: { n: "HLink", f: parse_HLink }, 441: { n: "Lel", f: parse_Lel }, 442: { n: "CodeName", f: parse_CodeName }, 443: { n: "SXFDBType", f: parse_SXFDBType }, 444: { n: "Prot4RevPass", f: parse_Prot4RevPass }, 445: { n: "ObNoMacros", f: parse_ObNoMacros }, 446: { n: "Dv", f: parse_Dv }, 448: { n: "Excel9File", f: parse_Excel9File }, 449: { n: "RecalcId", f: parse_RecalcId, r: 2 }, 450: { n: "EntExU2", f: parse_EntExU2 }, 512: { n: "Dimensions", f: parse_Dimensions }, 513: { n: "Blank", f: parse_Blank }, 515: { n: "Number", f: parse_Number }, 516: { n: "Label", f: parse_Label }, 517: { n: "BoolErr", f: parse_BoolErr }, 519: { n: "String", f: parse_String }, 520: { n: "Row", f: parse_Row }, 523: { n: "Index", f: parse_Index }, 545: { n: "Array", f: parse_Array }, 549: { n: "DefaultRowHeight", f: parse_DefaultRowHeight }, 566: { n: "Table", f: parse_Table }, 574: { n: "Window2", f: parse_Window2 }, 638: { n: "RK", f: parse_RK }, 659: { n: "Style", f: parse_Style }, 1048: { n: "BigName", f: parse_BigName }, 1054: { n: "Format", f: parse_Format }, 1084: { n: "ContinueBigName", f: parse_ContinueBigName }, 1212: { n: "ShrFmla", f: parse_ShrFmla }, 2048: { n: "HLinkTooltip", f: parse_HLinkTooltip }, 2049: { n: "WebPub", f: parse_WebPub }, 2050: { n: "QsiSXTag", f: parse_QsiSXTag }, 2051: { n: "DBQueryExt", f: parse_DBQueryExt }, 2052: { n: "ExtString", f: parse_ExtString }, 2053: { n: "TxtQry", f: parse_TxtQry }, 2054: { n: "Qsir", f: parse_Qsir }, 2055: { n: "Qsif", f: parse_Qsif }, 2056: { n: "RRDTQSIF", f: parse_RRDTQSIF }, 2057: { n: "BOF", f: parse_BOF }, 2058: { n: "OleDbConn", f: parse_OleDbConn }, 2059: { n: "WOpt", f: parse_WOpt }, 2060: { n: "SXViewEx", f: parse_SXViewEx }, 2061: { n: "SXTH", f: parse_SXTH }, 2062: { n: "SXPIEx", f: parse_SXPIEx }, 2063: { n: "SXVDTEx", f: parse_SXVDTEx }, 2064: { n: "SXViewEx9", f: parse_SXViewEx9 }, 2066: { n: "ContinueFrt", f: parse_ContinueFrt }, 2067: { n: "RealTimeData", f: parse_RealTimeData }, 2128: { n: "ChartFrtInfo", f: parse_ChartFrtInfo }, 2129: { n: "FrtWrapper", f: parse_FrtWrapper }, 2130: { n: "StartBlock", f: parse_StartBlock }, 2131: { n: "EndBlock", f: parse_EndBlock }, 2132: { n: "StartObject", f: parse_StartObject }, 2133: { n: "EndObject", f: parse_EndObject }, 2134: { n: "CatLab", f: parse_CatLab }, 2135: { n: "YMult", f: parse_YMult }, 2136: { n: "SXViewLink", f: parse_SXViewLink }, 2137: { n: "PivotChartBits", f: parse_PivotChartBits }, 2138: { n: "FrtFontList", f: parse_FrtFontList }, 2146: { n: "SheetExt", f: parse_SheetExt }, 2147: { n: "BookExt", f: parse_BookExt, r: 12 }, 2148: { n: "SXAddl", f: parse_SXAddl }, 2149: { n: "CrErr", f: parse_CrErr }, 2150: { n: "HFPicture", f: parse_HFPicture }, 2151: { n: "FeatHdr", f: parse_FeatHdr }, 2152: { n: "Feat", f: parse_Feat }, 2154: { n: "DataLabExt", f: parse_DataLabExt }, 2155: { n: "DataLabExtContents", f: parse_DataLabExtContents }, 2156: { n: "CellWatch", f: parse_CellWatch }, 2161: { n: "FeatHdr11", f: parse_FeatHdr11 }, 2162: { n: "Feature11", f: parse_Feature11 }, 2164: { n: "DropDownObjIds", f: parse_DropDownObjIds }, 2165: { n: "ContinueFrt11", f: parse_ContinueFrt11 }, 2166: { n: "DConn", f: parse_DConn }, 2167: { n: "List12", f: parse_List12 }, 2168: { n: "Feature12", f: parse_Feature12 }, 2169: { n: "CondFmt12", f: parse_CondFmt12 }, 2170: { n: "CF12", f: parse_CF12 }, 2171: { n: "CFEx", f: parse_CFEx }, 2172: { n: "XFCRC", f: parse_XFCRC, r: 12 }, 2173: { n: "XFExt", f: parse_XFExt, r: 12 }, 2174: { n: "AutoFilter12", f: parse_AutoFilter12 }, 2175: { n: "ContinueFrt12", f: parse_ContinueFrt12 }, 2180: { n: "MDTInfo", f: parse_MDTInfo }, 2181: { n: "MDXStr", f: parse_MDXStr }, 2182: { n: "MDXTuple", f: parse_MDXTuple }, 2183: { n: "MDXSet", f: parse_MDXSet }, 2184: { n: "MDXProp", f: parse_MDXProp }, 2185: { n: "MDXKPI", f: parse_MDXKPI }, 2186: { n: "MDB", f: parse_MDB }, 2187: { n: "PLV", f: parse_PLV }, 2188: { n: "Compat12", f: parse_Compat12, r: 12 }, 2189: { n: "DXF", f: parse_DXF }, 2190: { n: "TableStyles", f: parse_TableStyles, r: 12 }, 2191: { n: "TableStyle", f: parse_TableStyle }, 2192: { n: "TableStyleElement", f: parse_TableStyleElement }, 2194: { n: "StyleExt", f: parse_StyleExt }, 2195: { n: "NamePublish", f: parse_NamePublish }, 2196: { n: "NameCmt", f: parse_NameCmt }, 2197: { n: "SortData", f: parse_SortData }, 2198: { n: "Theme", f: parse_Theme, r: 12 }, 2199: { n: "GUIDTypeLib", f: parse_GUIDTypeLib }, 2200: { n: "FnGrp12", f: parse_FnGrp12 }, 2201: { n: "NameFnGrp12", f: parse_NameFnGrp12 }, 2202: { n: "MTRSettings", f: parse_MTRSettings, r: 12 }, 2203: { n: "CompressPictures", f: parse_CompressPictures }, 2204: { n: "HeaderFooter", f: parse_HeaderFooter }, 2205: { n: "CrtLayout12", f: parse_CrtLayout12 }, 2206: { n: "CrtMlFrt", f: parse_CrtMlFrt }, 2207: { n: "CrtMlFrtContinue", f: parse_CrtMlFrtContinue }, 2211: { n: "ForceFullCalculation", f: parse_ForceFullCalculation }, 2212: { n: "ShapePropsStream", f: parse_ShapePropsStream }, 2213: { n: "TextPropsStream", f: parse_TextPropsStream }, 2214: { n: "RichTextStream", f: parse_RichTextStream }, 2215: { n: "CrtLayout12A", f: parse_CrtLayout12A }, 4097: { n: "Units", f: parse_Units }, 4098: { n: "Chart", f: parse_Chart }, 4099: { n: "Series", f: parse_Series }, 4102: { n: "DataFormat", f: parse_DataFormat }, 4103: { n: "LineFormat", f: parse_LineFormat }, 4105: { n: "MarkerFormat", f: parse_MarkerFormat }, 4106: { n: "AreaFormat", f: parse_AreaFormat }, 4107: { n: "PieFormat", f: parse_PieFormat }, 4108: { n: "AttachedLabel", f: parse_AttachedLabel }, 4109: { n: "SeriesText", f: parse_SeriesText }, 4116: { n: "ChartFormat", f: parse_ChartFormat }, 4117: { n: "Legend", f: parse_Legend }, 4118: { n: "SeriesList", f: parse_SeriesList }, 4119: { n: "Bar", f: parse_Bar }, 4120: { n: "Line", f: parse_Line }, 4121: { n: "Pie", f: parse_Pie }, 4122: { n: "Area", f: parse_Area }, 4123: { n: "Scatter", f: parse_Scatter }, 4124: { n: "CrtLine", f: parse_CrtLine }, 4125: { n: "Axis", f: parse_Axis }, 4126: { n: "Tick", f: parse_Tick }, 4127: { n: "ValueRange", f: parse_ValueRange }, 4128: { n: "CatSerRange", f: parse_CatSerRange }, 4129: { n: "AxisLine", f: parse_AxisLine }, 4130: { n: "CrtLink", f: parse_CrtLink }, 4132: { n: "DefaultText", f: parse_DefaultText }, 4133: { n: "Text", f: parse_Text }, 4134: { n: "FontX", f: parse_FontX }, 4135: { n: "ObjectLink", f: parse_ObjectLink }, 4146: { n: "Frame", f: parse_Frame }, 4147: { n: "Begin", f: parse_Begin }, 4148: { n: "End", f: parse_End }, 4149: { n: "PlotArea", f: parse_PlotArea }, 4154: { n: "Chart3d", f: parse_Chart3d }, 4156: { n: "PicF", f: parse_PicF }, 4157: { n: "DropBar", f: parse_DropBar }, 4158: { n: "Radar", f: parse_Radar }, 4159: { n: "Surf", f: parse_Surf }, 4160: { n: "RadarArea", f: parse_RadarArea }, 4161: { n: "AxisParent", f: parse_AxisParent }, 4163: { n: "LegendException", f: parse_LegendException }, 4164: { n: "ShtProps", f: parse_ShtProps }, 4165: { n: "SerToCrt", f: parse_SerToCrt }, 4166: { n: "AxesUsed", f: parse_AxesUsed }, 4168: { n: "SBaseRef", f: parse_SBaseRef }, 4170: { n: "SerParent", f: parse_SerParent }, 4171: { n: "SerAuxTrend", f: parse_SerAuxTrend }, 4174: { n: "IFmtRecord", f: parse_IFmtRecord }, 4175: { n: "Pos", f: parse_Pos }, 4176: { n: "AlRuns", f: parse_AlRuns }, 4177: { n: "BRAI", f: parse_BRAI }, 4187: { n: "SerAuxErrBar", f: parse_SerAuxErrBar }, 4188: { n: "ClrtClient", f: parse_ClrtClient }, 4189: { n: "SerFmt", f: parse_SerFmt }, 4191: { n: "Chart3DBarShape", f: parse_Chart3DBarShape }, 4192: { n: "Fbi", f: parse_Fbi }, 4193: { n: "BopPop", f: parse_BopPop }, 4194: { n: "AxcExt", f: parse_AxcExt }, 4195: { n: "Dat", f: parse_Dat }, 4196: { n: "PlotGrowth", f: parse_PlotGrowth }, 4197: { n: "SIIndex", f: parse_SIIndex }, 4198: { n: "GelFrame", f: parse_GelFrame }, 4199: { n: "BopPopCustom", f: parse_BopPopCustom }, 4200: { n: "Fbi2", f: parse_Fbi2 }, 22: { n: "ExternCount", f: parsenoop }, 126: { n: "RK", f: parsenoop }, 127: { n: "ImData", f: parsenoop }, 135: { n: "Addin", f: parsenoop }, 136: { n: "Edg", f: parsenoop }, 137: { n: "Pub", f: parsenoop }, 145: { n: "Sub", f: parsenoop }, 148: { n: "LHRecord", f: parsenoop }, 149: { n: "LHNGraph", f: parsenoop }, 150: { n: "Sound", f: parsenoop }, 169: { n: "CoordList", f: parsenoop }, 171: { n: "GCW", f: parsenoop }, 188: { n: "ShrFmla", f: parsenoop }, 194: { n: "AddMenu", f: parsenoop }, 195: { n: "DelMenu", f: parsenoop }, 214: { n: "RString", f: parsenoop }, 223: { n: "UDDesc", f: parsenoop }, 234: { n: "TabIdConf", f: parsenoop }, 354: { n: "XL5Modify", f: parsenoop }, 421: { n: "FileSharing2", f: parsenoop }, 536: { n: "Name", f: parsenoop }, 547: { n: "ExternName", f: parse_ExternName }, 561: { n: "Font", f: parsenoop }, 1030: { n: "Formula", f: parse_Formula }, 2157: { n: "FeatInfo", f: parsenoop }, 2163: { n: "FeatInfo11", f: parsenoop }, 2177: { n: "SXAddl12", f: parsenoop }, 2240: { n: "AutoWebPub", f: parsenoop }, 2241: { n: "ListObj", f: parsenoop }, 2242: { n: "ListField", f: parsenoop }, 2243: { n: "ListDV", f: parsenoop }, 2244: { n: "ListCondFmt", f: parsenoop }, 2245: { n: "ListCF", f: parsenoop }, 2246: { n: "FMQry", f: parsenoop }, 2247: { n: "FMSQry", f: parsenoop }, 2248: { n: "PLV", f: parsenoop }, 2249: { n: "LnExt", f: parsenoop }, 2250: { n: "MkrExt", f: parsenoop }, 2251: { n: "CrtCoopt", f: parsenoop }, 0: {} };
    var CountryEnum = { 1: "US", 2: "CA", 3: "", 7: "RU", 20: "EG", 30: "GR", 31: "NL", 32: "BE", 33: "FR", 34: "ES", 36: "HU", 39: "IT", 41: "CH", 43: "AT", 44: "GB", 45: "DK", 46: "SE", 47: "NO", 48: "PL", 49: "DE", 52: "MX", 55: "BR", 61: "AU", 64: "NZ", 66: "TH", 81: "JP", 82: "KR", 84: "VN", 86: "CN", 90: "TR", 105: "JS", 213: "DZ", 216: "MA", 218: "LY", 351: "PT", 354: "IS", 358: "FI", 420: "CZ", 886: "TW", 961: "LB", 962: "JO", 963: "SY", 964: "IQ", 965: "KW", 966: "SA", 971: "AE", 972: "IL", 974: "QA", 981: "IR", 65535: "US" };

    function fix_opts_func(defaults) { return function fix_opts(opts) { for (var i = 0; i != defaults.length; ++i) { var d = defaults[i]; if (opts[d[0]] === undefined) opts[d[0]] = d[1]; if (d[2] === "n") opts[d[0]] = Number(opts[d[0]]) } } }
    var fix_read_opts = fix_opts_func([
        ["cellNF", false],
        ["cellFormula", true],
        ["cellStyles", false],
        ["sheetRows", 0, "n"],
        ["bookSheets", false],
        ["bookProps", false],
        ["bookFiles", false],
        ["password", ""],
        ["WTF", false]
    ]);

    function parse_compobj(obj) {
        var v = {};
        var o = obj.content;
        var l = 28,
            m;
        m = __lpstr(o, l);
        l += 4 + __readUInt32LE(o, l);
        v.UserType = m;
        m = __readUInt32LE(o, l);
        l += 4;
        switch (m) {
            case 0:
                break;
            case 4294967295:
            case 4294967294:
                l += 4;
                break;
            default:
                if (m > 400) throw new Error("Unsupported Clipboard: " + m.toString(16));
                l += m
        }
        m = __lpstr(o, l);
        l += m.length === 0 ? 0 : 5 + m.length;
        v.Reserved1 = m;
        if ((m = __readUInt32LE(o, l)) !== 1907550708) return v;
        throw "Unsupported Unicode Extension"
    }

    function slurp(R, blob, length, opts) {
        var l = length;
        var bufs = [];
        var d = blob.slice(blob.l, blob.l + l);
        if (opts && opts.enc && opts.enc.insitu_decrypt) switch (R.n) {
            case "BOF":
            case "FilePass":
            case "FileLock":
            case "InterfaceHdr":
            case "RRDInfo":
            case "RRDHead":
            case "UsrExcl":
                break;
            default:
                if (d.length === 0) break;
                opts.enc.insitu_decrypt(d)
        }
        bufs.push(d);
        blob.l += l;
        var next = RecordEnum[__readUInt16LE(blob, blob.l)];
        while (next != null && next.n === "Continue") {
            l = __readUInt16LE(blob, blob.l + 2);
            bufs.push(blob.slice(blob.l + 4, blob.l + 4 + l));
            blob.l += 4 + l;
            next = RecordEnum[__readUInt16LE(blob, blob.l)]
        }
        var b = bconcat(bufs);
        prep_blob(b, 0);
        var ll = 0;
        b.lens = [];
        for (var j = 0; j < bufs.length; ++j) {
            b.lens.push(ll);
            ll += bufs[j].length
        }
        return R.f(b, b.length, opts)
    }

    function safe_format_xf(p, opts, date1904) {
        if (!p.XF) return;
        try {
            var fmtid = p.XF.ifmt || 0;
            if (p.t === "e") { p.w = p.w || BErr[p.v] } else if (fmtid === 0) {
                if (p.t === "n") {
                    if ((p.v | 0) === p.v) p.w = SSF._general_int(p.v);
                    else p.w = SSF._general_num(p.v)
                } else p.w = SSF._general(p.v)
            } else p.w = SSF.format(fmtid, p.v, { date1904: date1904 || false });
            if (opts.cellNF) p.z = SSF._table[fmtid]
        } catch (e) { if (opts.WTF) throw e }
    }

    function make_cell(val, ixfe, t) { return { v: val, ixfe: ixfe, t: t } }

    function parse_workbook(blob, options) {
        var wb = { opts: {} };
        var Sheets = {};
        var out = {};
        var Directory = {};
        var found_sheet = false;
        var range = {};
        var last_formula = null;
        var sst = [];
        var cur_sheet = "";
        var Preamble = {};
        var lastcell, last_cell, cc, cmnt, rng, rngC, rngR;
        var shared_formulae = {};
        var array_formulae = [];
        var temp_val;
        var country;
        var cell_valid = true;
        var XFs = [];
        var palette = [];
        var get_rgb = function getrgb(icv) { if (icv < 8) return Icv[icv]; if (icv < 64) return palette[icv - 8] || Icv[icv]; return Icv[icv] };
        var process_cell_style = function pcs(cell, line) {
            var xfd = line.XF.data;
            if (!xfd || !xfd.patternType) return;
            line.s = {};
            line.s.patternType = xfd.patternType;
            var t;
            if (t = rgb2Hex(get_rgb(xfd.icvFore))) { line.s.fgColor = { rgb: t } }
            if (t = rgb2Hex(get_rgb(xfd.icvBack))) { line.s.bgColor = { rgb: t } }
        };
        var addcell = function addcell(cell, line, options) {
            if (!cell_valid) return;
            if (options.cellStyles && line.XF && line.XF.data) process_cell_style(cell, line);
            lastcell = cell;
            last_cell = encode_cell(cell);
            if (range.s) { if (cell.r < range.s.r) range.s.r = cell.r; if (cell.c < range.s.c) range.s.c = cell.c }
            if (range.e) { if (cell.r + 1 > range.e.r) range.e.r = cell.r + 1; if (cell.c + 1 > range.e.c) range.e.c = cell.c + 1 }
            if (options.sheetRows && lastcell.r >= options.sheetRows) cell_valid = false;
            else out[last_cell] = line
        };
        var opts = { enc: false, sbcch: 0, snames: [], sharedf: shared_formulae, arrayf: array_formulae, rrtabid: [], lastuser: "", biff: 8, codepage: 0, winlocked: 0, wtf: false };
        if (options.password) opts.password = options.password;
        var mergecells = [];
        var objects = [];
        var supbooks = [
            []
        ];
        var sbc = 0,
            sbci = 0,
            sbcli = 0;
        supbooks.SheetNames = opts.snames;
        supbooks.sharedf = opts.sharedf;
        supbooks.arrayf = opts.arrayf;
        var last_Rn = "";
        var file_depth = 0;
        opts.codepage = 1200;
        set_cp(1200);
        while (blob.l < blob.length - 1) {
            var s = blob.l;
            var RecordType = blob.read_shift(2);
            if (RecordType === 0 && last_Rn === "EOF") break;
            var length = blob.l === blob.length ? 0 : blob.read_shift(2),
                y;
            var R = RecordEnum[RecordType];
            if (R && R.f) {
                if (options.bookSheets) { if (last_Rn === "BoundSheet8" && R.n !== "BoundSheet8") break }
                last_Rn = R.n;
                if (R.r === 2 || R.r == 12) {
                    var rt = blob.read_shift(2);
                    length -= 2;
                    if (!opts.enc && rt !== RecordType) throw "rt mismatch";
                    if (R.r == 12) {
                        blob.l += 10;
                        length -= 10
                    }
                }
                var val;
                if (R.n === "EOF") val = R.f(blob, length, opts);
                else val = slurp(R, blob, length, opts);
                var Rn = R.n;
                if (opts.biff === 5 || opts.biff === 2) switch (Rn) {
                    case "Lbl":
                        Rn = "Label";
                        break
                }
                switch (Rn) {
                    case "Date1904":
                        wb.opts.Date1904 = val;
                        break;
                    case "WriteProtect":
                        wb.opts.WriteProtect = true;
                        break;
                    case "FilePass":
                        if (!opts.enc) blob.l = 0;
                        opts.enc = val;
                        if (opts.WTF) console.error(val);
                        if (!options.password) throw new Error("File is password-protected");
                        if (val.Type !== 0) throw new Error("Encryption scheme unsupported");
                        if (!val.valid) throw new Error("Password is incorrect");
                        break;
                    case "WriteAccess":
                        opts.lastuser = val;
                        break;
                    case "FileSharing":
                        break;
                    case "CodePage":
                        if (val === 21010) val = 1200;
                        else if (val === 32769) val = 1252;
                        opts.codepage = val;
                        set_cp(val);
                        break;
                    case "RRTabId":
                        opts.rrtabid = val;
                        break;
                    case "WinProtect":
                        opts.winlocked = val;
                        break;
                    case "Template":
                        break;
                    case "RefreshAll":
                        wb.opts.RefreshAll = val;
                        break;
                    case "BookBool":
                        break;
                    case "UsesELFs":
                        break;
                    case "MTRSettings":
                        { if (val[0] && val[1]) throw "Unsupported threads: " + val }
                        break;
                    case "CalcCount":
                        wb.opts.CalcCount = val;
                        break;
                    case "CalcDelta":
                        wb.opts.CalcDelta = val;
                        break;
                    case "CalcIter":
                        wb.opts.CalcIter = val;
                        break;
                    case "CalcMode":
                        wb.opts.CalcMode = val;
                        break;
                    case "CalcPrecision":
                        wb.opts.CalcPrecision = val;
                        break;
                    case "CalcSaveRecalc":
                        wb.opts.CalcSaveRecalc = val;
                        break;
                    case "CalcRefMode":
                        opts.CalcRefMode = val;
                        break;
                    case "Uncalced":
                        break;
                    case "ForceFullCalculation":
                        wb.opts.FullCalc = val;
                        break;
                    case "WsBool":
                        break;
                    case "XF":
                        XFs.push(val);
                        break;
                    case "ExtSST":
                        break;
                    case "BookExt":
                        break;
                    case "RichTextStream":
                        break;
                    case "BkHim":
                        break;
                    case "SupBook":
                        supbooks[++sbc] = [val];
                        sbci = 0;
                        break;
                    case "ExternName":
                        supbooks[sbc][++sbci] = val;
                        break;
                    case "Index":
                        break;
                    case "Lbl":
                        supbooks[0][++sbcli] = val;
                        break;
                    case "ExternSheet":
                        supbooks[sbc] = supbooks[sbc].concat(val);
                        sbci += val.length;
                        break;
                    case "Protect":
                        out["!protect"] = val;
                        break;
                    case "Password":
                        if (val !== 0 && opts.WTF) console.error("Password verifier: " + val);
                        break;
                    case "Prot4Rev":
                    case "Prot4RevPass":
                        break;
                    case "BoundSheet8":
                        { Directory[val.pos] = val;opts.snames.push(val.name) }
                        break;
                    case "EOF":
                        {
                            if (--file_depth) break;
                            if (range.e) {
                                out["!range"] = range;
                                if (range.e.r > 0 && range.e.c > 0) {
                                    range.e.r--;
                                    range.e.c--;
                                    out["!ref"] = encode_range(range);
                                    range.e.r++;
                                    range.e.c++
                                }
                                if (mergecells.length > 0) out["!merges"] = mergecells;
                                if (objects.length > 0) out["!objects"] = objects
                            }
                            if (cur_sheet === "") Preamble = out;
                            else Sheets[cur_sheet] = out;out = {}
                        }
                        break;
                    case "BOF":
                        {
                            if (opts.biff !== 8);
                            else if (val.BIFFVer === 1280) opts.biff = 5;
                            else if (val.BIFFVer === 2) opts.biff = 2;
                            else if (val.BIFFVer === 7) opts.biff = 2;
                            if (file_depth++) break;cell_valid = true;out = {};
                            if (opts.biff === 2) {
                                if (cur_sheet === "") cur_sheet = "Sheet1";
                                range = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
                            } else cur_sheet = (Directory[s] || { name: "" }).name;mergecells = [];objects = []
                        }
                        break;
                    case "Number":
                    case "BIFF2NUM":
                        { temp_val = { ixfe: val.ixfe, XF: XFs[val.ixfe], v: val.val, t: "n" }; if (temp_val.XF) safe_format_xf(temp_val, options, wb.opts.Date1904);addcell({ c: val.c, r: val.r }, temp_val, options) }
                        break;
                    case "BoolErr":
                        { temp_val = { ixfe: val.ixfe, XF: XFs[val.ixfe], v: val.val, t: val.t }; if (temp_val.XF) safe_format_xf(temp_val, options, wb.opts.Date1904);addcell({ c: val.c, r: val.r }, temp_val, options) }
                        break;
                    case "RK":
                        { temp_val = { ixfe: val.ixfe, XF: XFs[val.ixfe], v: val.rknum, t: "n" }; if (temp_val.XF) safe_format_xf(temp_val, options, wb.opts.Date1904);addcell({ c: val.c, r: val.r }, temp_val, options) }
                        break;
                    case "MulRk":
                        {
                            for (var j = val.c; j <= val.C; ++j) {
                                var ixfe = val.rkrec[j - val.c][0];
                                temp_val = { ixfe: ixfe, XF: XFs[ixfe], v: val.rkrec[j - val.c][1], t: "n" };
                                if (temp_val.XF) safe_format_xf(temp_val, options, wb.opts.Date1904);
                                addcell({ c: j, r: val.r }, temp_val, options)
                            }
                        }
                        break;
                    case "Formula":
                        {
                            switch (val.val) {
                                case "String":
                                    last_formula = val;
                                    break;
                                case "Array Formula":
                                    throw "Array Formula unsupported";
                                default:
                                    temp_val = { v: val.val, ixfe: val.cell.ixfe, t: val.tt };
                                    temp_val.XF = XFs[temp_val.ixfe];
                                    if (options.cellFormula) temp_val.f = "=" + stringify_formula(val.formula, range, val.cell, supbooks, opts);
                                    if (temp_val.XF) safe_format_xf(temp_val, options, wb.opts.Date1904);
                                    addcell(val.cell, temp_val, options);
                                    last_formula = val
                            }
                        }
                        break;
                    case "String":
                        {
                            if (last_formula) {
                                last_formula.val = val;
                                temp_val = { v: last_formula.val, ixfe: last_formula.cell.ixfe, t: "s" };
                                temp_val.XF = XFs[temp_val.ixfe];
                                if (options.cellFormula) temp_val.f = "=" + stringify_formula(last_formula.formula, range, last_formula.cell, supbooks, opts);
                                if (temp_val.XF) safe_format_xf(temp_val, options, wb.opts.Date1904);
                                addcell(last_formula.cell, temp_val, options);
                                last_formula = null
                            }
                        }
                        break;
                    case "Array":
                        { array_formulae.push(val) }
                        break;
                    case "ShrFmla":
                        { if (!cell_valid) break;shared_formulae[encode_cell(last_formula.cell)] = val[0] }
                        break;
                    case "LabelSst":
                        temp_val = make_cell(sst[val.isst].t, val.ixfe, "s");
                        temp_val.XF = XFs[temp_val.ixfe];
                        if (temp_val.XF) safe_format_xf(temp_val, options, wb.opts.Date1904);
                        addcell({ c: val.c, r: val.r }, temp_val, options);
                        break;
                    case "Label":
                    case "BIFF2STR":
                        temp_val = make_cell(val.val, val.ixfe, "s");
                        temp_val.XF = XFs[temp_val.ixfe];
                        if (temp_val.XF) safe_format_xf(temp_val, options, wb.opts.Date1904);
                        addcell({ c: val.c, r: val.r }, temp_val, options);
                        break;
                    case "Dimensions":
                        { if (file_depth === 1) range = val }
                        break;
                    case "SST":
                        { sst = val }
                        break;
                    case "Format":
                        { SSF.load(val[1], val[0]) }
                        break;
                    case "MergeCells":
                        mergecells = mergecells.concat(val);
                        break;
                    case "Obj":
                        objects[val.cmo[0]] = opts.lastobj = val;
                        break;
                    case "TxO":
                        opts.lastobj.TxO = val;
                        break;
                    case "HLink":
                        {
                            for (rngR = val[0].s.r; rngR <= val[0].e.r; ++rngR)
                                for (rngC = val[0].s.c; rngC <= val[0].e.c; ++rngC)
                                    if (out[encode_cell({ c: rngC, r: rngR })]) out[encode_cell({ c: rngC, r: rngR })].l = val[1]
                        }
                        break;
                    case "HLinkTooltip":
                        {
                            for (rngR = val[0].s.r; rngR <= val[0].e.r; ++rngR)
                                for (rngC = val[0].s.c; rngC <= val[0].e.c; ++rngC)
                                    if (out[encode_cell({ c: rngC, r: rngR })]) out[encode_cell({ c: rngC, r: rngR })].l.tooltip = val[1]
                        }
                        break;
                    case "Note":
                        { if (opts.biff <= 5 && opts.biff >= 2) break;cc = out[encode_cell(val[0])]; var noteobj = objects[val[2]]; if (!cc) break; if (!cc.c) cc.c = [];cmnt = { a: val[1], t: noteobj.TxO.t };cc.c.push(cmnt) }
                        break;
                    default:
                        switch (R.n) {
                            case "ClrtClient":
                                break;
                            case "XFExt":
                                update_xfext(XFs[val.ixfe], val.ext);
                                break;
                            case "NameCmt":
                                break;
                            case "Header":
                                break;
                            case "Footer":
                                break;
                            case "HCenter":
                                break;
                            case "VCenter":
                                break;
                            case "Pls":
                                break;
                            case "Setup":
                                break;
                            case "DefColWidth":
                                break;
                            case "GCW":
                                break;
                            case "LHRecord":
                                break;
                            case "ColInfo":
                                break;
                            case "Row":
                                break;
                            case "DBCell":
                                break;
                            case "MulBlank":
                                break;
                            case "EntExU2":
                                break;
                            case "SxView":
                                break;
                            case "Sxvd":
                                break;
                            case "SXVI":
                                break;
                            case "SXVDEx":
                                break;
                            case "SxIvd":
                                break;
                            case "SXDI":
                                break;
                            case "SXLI":
                                break;
                            case "SXEx":
                                break;
                            case "QsiSXTag":
                                break;
                            case "Selection":
                                break;
                            case "Feat":
                                break;
                            case "FeatHdr":
                            case "FeatHdr11":
                                break;
                            case "Feature11":
                            case "Feature12":
                            case "List12":
                                break;
                            case "Blank":
                                break;
                            case "Country":
                                country = val;
                                break;
                            case "RecalcId":
                                break;
                            case "DefaultRowHeight":
                            case "DxGCol":
                                break;
                            case "Fbi":
                            case "Fbi2":
                            case "GelFrame":
                                break;
                            case "Font":
                                break;
                            case "XFCRC":
                                break;
                            case "Style":
                                break;
                            case "StyleExt":
                                break;
                            case "Palette":
                                palette = val;
                                break;
                            case "Theme":
                                break;
                            case "ScenarioProtect":
                                break;
                            case "ObjProtect":
                                break;
                            case "CondFmt12":
                                break;
                            case "Table":
                                break;
                            case "TableStyles":
                                break;
                            case "TableStyle":
                                break;
                            case "TableStyleElement":
                                break;
                            case "SXStreamID":
                                break;
                            case "SXVS":
                                break;
                            case "DConRef":
                                break;
                            case "SXAddl":
                                break;
                            case "DConBin":
                                break;
                            case "DConName":
                                break;
                            case "SXPI":
                                break;
                            case "SxFormat":
                                break;
                            case "SxSelect":
                                break;
                            case "SxRule":
                                break;
                            case "SxFilt":
                                break;
                            case "SxItm":
                                break;
                            case "SxDXF":
                                break;
                            case "ScenMan":
                                break;
                            case "DCon":
                                break;
                            case "CellWatch":
                                break;
                            case "PrintRowCol":
                                break;
                            case "PrintGrid":
                                break;
                            case "PrintSize":
                                break;
                            case "XCT":
                                break;
                            case "CRN":
                                break;
                            case "Scl":
                                {}
                                break;
                            case "SheetExt":
                                {}
                                break;
                            case "SheetExtOptional":
                                {}
                                break;
                            case "ObNoMacros":
                                {}
                                break;
                            case "ObProj":
                                {}
                                break;
                            case "CodeName":
                                {}
                                break;
                            case "GUIDTypeLib":
                                {}
                                break;
                            case "WOpt":
                                break;
                            case "PhoneticInfo":
                                break;
                            case "OleObjectSize":
                                break;
                            case "DXF":
                            case "DXFN":
                            case "DXFN12":
                            case "DXFN12List":
                            case "DXFN12NoCB":
                                break;
                            case "Dv":
                            case "DVal":
                                break;
                            case "BRAI":
                            case "Series":
                            case "SeriesText":
                                break;
                            case "DConn":
                                break;
                            case "DbOrParamQry":
                                break;
                            case "DBQueryExt":
                                break;
                            case "IFmtRecord":
                                break;
                            case "CondFmt":
                            case "CF":
                            case "CF12":
                            case "CFEx":
                                break;
                            case "Excel9File":
                                break;
                            case "Units":
                                break;
                            case "InterfaceHdr":
                            case "Mms":
                            case "InterfaceEnd":
                            case "DSF":
                            case "BuiltInFnGroupCount":
                            case "Window1":
                            case "Window2":
                            case "HideObj":
                            case "GridSet":
                            case "Guts":
                            case "UserBView":
                            case "UserSViewBegin":
                            case "UserSViewEnd":
                            case "Pane":
                                break;
                            default:
                                switch (R.n) {
                                    case "Dat":
                                    case "Begin":
                                    case "End":
                                    case "StartBlock":
                                    case "EndBlock":
                                    case "Frame":
                                    case "Area":
                                    case "Axis":
                                    case "AxisLine":
                                    case "Tick":
                                        break;
                                    case "AxesUsed":
                                    case "CrtLayout12":
                                    case "CrtLayout12A":
                                    case "CrtLink":
                                    case "CrtLine":
                                    case "CrtMlFrt":
                                    case "CrtMlFrtContinue":
                                        break;
                                    case "LineFormat":
                                    case "AreaFormat":
                                    case "Chart":
                                    case "Chart3d":
                                    case "Chart3DBarShape":
                                    case "ChartFormat":
                                    case "ChartFrtInfo":
                                        break;
                                    case "PlotArea":
                                    case "PlotGrowth":
                                        break;
                                    case "SeriesList":
                                    case "SerParent":
                                    case "SerAuxTrend":
                                        break;
                                    case "DataFormat":
                                    case "SerToCrt":
                                    case "FontX":
                                        break;
                                    case "CatSerRange":
                                    case "AxcExt":
                                    case "SerFmt":
                                        break;
                                    case "ShtProps":
                                        break;
                                    case "DefaultText":
                                    case "Text":
                                    case "CatLab":
                                        break;
                                    case "DataLabExtContents":
                                        break;
                                    case "Legend":
                                    case "LegendException":
                                        break;
                                    case "Pie":
                                    case "Scatter":
                                        break;
                                    case "PieFormat":
                                    case "MarkerFormat":
                                        break;
                                    case "StartObject":
                                    case "EndObject":
                                        break;
                                    case "AlRuns":
                                    case "ObjectLink":
                                        break;
                                    case "SIIndex":
                                        break;
                                    case "AttachedLabel":
                                    case "YMult":
                                        break;
                                    case "Line":
                                    case "Bar":
                                        break;
                                    case "Surf":
                                        break;
                                    case "AxisParent":
                                        break;
                                    case "Pos":
                                        break;
                                    case "ValueRange":
                                        break;
                                    case "SXViewEx9":
                                        break;
                                    case "SXViewLink":
                                        break;
                                    case "PivotChartBits":
                                        break;
                                    case "SBaseRef":
                                        break;
                                    case "TextPropsStream":
                                        break;
                                    case "LnExt":
                                        break;
                                    case "MkrExt":
                                        break;
                                    case "CrtCoopt":
                                        break;
                                    case "Qsi":
                                    case "Qsif":
                                    case "Qsir":
                                    case "QsiSXTag":
                                        break;
                                    case "TxtQry":
                                        break;
                                    case "FilterMode":
                                        break;
                                    case "AutoFilter":
                                    case "AutoFilterInfo":
                                        break;
                                    case "AutoFilter12":
                                        break;
                                    case "DropDownObjIds":
                                        break;
                                    case "Sort":
                                        break;
                                    case "SortData":
                                        break;
                                    case "ShapePropsStream":
                                        break;
                                    case "MsoDrawing":
                                    case "MsoDrawingGroup":
                                    case "MsoDrawingSelection":
                                        break;
                                    case "ImData":
                                        break;
                                    case "WebPub":
                                    case "AutoWebPub":
                                    case "RightMargin":
                                    case "LeftMargin":
                                    case "TopMargin":
                                    case "BottomMargin":
                                    case "HeaderFooter":
                                    case "HFPicture":
                                    case "PLV":
                                    case "HorizontalPageBreaks":
                                    case "VerticalPageBreaks":
                                    case "Backup":
                                    case "CompressPictures":
                                    case "Compat12":
                                        break;
                                    case "Continue":
                                    case "ContinueFrt12":
                                        break;
                                    case "FrtFontList":
                                    case "FrtWrapper":
                                        break;
                                    case "ExternCount":
                                        break;
                                    case "RString":
                                        break;
                                    case "TabIdConf":
                                    case "Radar":
                                    case "RadarArea":
                                    case "DropBar":
                                    case "Intl":
                                    case "CoordList":
                                    case "SerAuxErrBar":
                                        break;
                                    default:
                                        switch (R.n) {
                                            case "SCENARIO":
                                            case "DConBin":
                                            case "PicF":
                                            case "DataLabExt":
                                            case "Lel":
                                            case "BopPop":
                                            case "BopPopCustom":
                                            case "RealTimeData":
                                            case "Name":
                                                break;
                                            default:
                                                if (options.WTF) throw "Unrecognized Record " + R.n
                                        }
                                }
                        }
                }
            } else blob.l += length
        }
        var sheetnamesraw = opts.biff === 2 ? ["Sheet1"] : Object.keys(Directory).sort(function(a, b) { return Number(a) - Number(b) }).map(function(x) { return Directory[x].name });
        var sheetnames = sheetnamesraw.slice();
        wb.Directory = sheetnamesraw;
        wb.SheetNames = sheetnamesraw;
        if (!options.bookSheets) wb.Sheets = Sheets;
        wb.Preamble = Preamble;
        wb.Strings = sst;
        wb.SSF = SSF.get_table();
        if (opts.enc) wb.Encryption = opts.enc;
        wb.Metadata = {};
        if (country !== undefined) wb.Metadata.Country = country;
        return wb
    }

    function parse_xlscfb(cfb, options) {
        if (!options) options = {};
        fix_read_opts(options);
        reset_cp();
        var CompObj, Summary, Workbook;
        if (cfb.find) {
            CompObj = cfb.find("!CompObj");
            Summary = cfb.find("!SummaryInformation");
            Workbook = cfb.find("/Workbook")
        } else {
            prep_blob(cfb, 0);
            Workbook = { content: cfb }
        }
        if (!Workbook) Workbook = cfb.find("/Book");
        var CompObjP, SummaryP, WorkbookP;
        if (CompObj) CompObjP = parse_compobj(CompObj);
        if (options.bookProps && !options.bookSheets) WorkbookP = {};
        else {
            if (Workbook) WorkbookP = parse_workbook(Workbook.content, options, !!Workbook.find);
            else throw new Error("Cannot find Workbook stream")
        }
        if (cfb.find) parse_props(cfb);
        var props = {};
        for (var y in cfb.Summary) props[y] = cfb.Summary[y];
        for (y in cfb.DocSummary) props[y] = cfb.DocSummary[y];
        WorkbookP.Props = WorkbookP.Custprops = props;
        if (options.bookFiles) WorkbookP.cfb = cfb;
        WorkbookP.CompObjP = CompObjP;
        return WorkbookP
    }

    function parse_props(cfb) {
        var DSI = cfb.find("!DocumentSummaryInformation");
        if (DSI) try { cfb.DocSummary = parse_PropertySetStream(DSI, DocSummaryPIDDSI) } catch (e) {}
        var SI = cfb.find("!SummaryInformation");
        if (SI) try { cfb.Summary = parse_PropertySetStream(SI, SummaryPIDSI) } catch (e) {}
    }
    var encregex = /&[a-z]*;/g,
        coderegex = /_x([0-9a-fA-F]+)_/g;

    function coderepl(m, c) { return _chr(parseInt(c, 16)) }

    function encrepl($$) { return encodings[$$] }

    function unescapexml(s) { if (s.indexOf("&") > -1) s = s.replace(encregex, encrepl); return s.indexOf("_") === -1 ? s : s.replace(coderegex, coderepl) }

    function parsexmlbool(value, tag) {
        switch (value) {
            case "1":
            case "true":
            case "TRUE":
                return true;
            default:
                return false
        }
    }

    function matchtag(f, g) { return new RegExp("<" + f + '(?: xml:space="preserve")?>([^☃]*)</' + f + ">", (g || "") + "m") }
    var entregex = /&#(\d+);/g;

    function entrepl($$, $1) { return String.fromCharCode(parseInt($1, 10)) }

    function fixstr(str) { return str.replace(entregex, entrepl) }
    var magic_formats = { "General Number": "General", "General Date": SSF._table[22], "Long Date": "dddd, mmmm dd, yyyy", "Medium Date": SSF._table[15], "Short Date": SSF._table[14], "Long Time": SSF._table[19], "Medium Time": SSF._table[18], "Short Time": SSF._table[20], Currency: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)', Fixed: SSF._table[2], Standard: SSF._table[4], Percent: SSF._table[10], Scientific: SSF._table[11], "Yes/No": '"Yes";"Yes";"No";@', "True/False": '"True";"True";"False";@', "On/Off": '"Yes";"Yes";"No";@' };
    var PatternTypeMap = { None: "none", Solid: "solid", Gray50: "mediumGray", Gray75: "darkGray", Gray25: "lightGray", HorzStripe: "darkHorizontal", VertStripe: "darkVertical", ReverseDiagStripe: "darkDown", DiagStripe: "darkUp", DiagCross: "darkGrid", ThickDiagCross: "darkTrellis", ThinHorzStripe: "lightHorizontal", ThinVertStripe: "lightVertical", ThinReverseDiagStripe: "lightDown", ThinHorzCross: "lightGrid" };

    function xlml_set_prop(Props, tag, val) {
        switch (tag) {
            case "Description":
                tag = "Comments";
                break
        }
        Props[tag] = val
    }

    function xlml_format(format, value) { var fmt = magic_formats[format] || unescapexml(format); if (fmt === "General") return SSF._general(value); return SSF.format(fmt, value) }

    function xlml_set_custprop(Custprops, Rn, cp, val) {
        switch ((cp[0].match(/dt:dt="([\w.]+)"/) || ["", ""])[1]) {
            case "boolean":
                val = parsexmlbool(val);
                break;
            case "i2":
            case "int":
                val = parseInt(val, 10);
                break;
            case "r4":
            case "float":
                val = parseFloat(val);
                break;
            case "date":
            case "dateTime.tz":
                val = new Date(val);
                break;
            case "i8":
            case "string":
            case "fixed":
            case "uuid":
            case "bin.base64":
                break;
            default:
                throw "bad custprop:" + cp[0]
        }
        Custprops[unescapexml(Rn[3])] = val
    }

    function safe_format_xlml(cell, nf, o) {
        try {
            if (cell.t === "e") { cell.w = cell.w || BErr[cell.v] } else if (nf === "General") {
                if (cell.t === "n") {
                    if ((cell.v | 0) === cell.v) cell.w = SSF._general_int(cell.v);
                    else cell.w = SSF._general_num(cell.v)
                } else cell.w = SSF._general(cell.v)
            } else cell.w = xlml_format(nf || "General", cell.v);
            if (o.cellNF) cell.z = magic_formats[nf] || nf || "General"
        } catch (e) { if (o.WTF) throw e }
    }

    function process_style_xlml(styles, stag, opts) {
        if (opts.cellStyles) { if (stag.Interior) { var I = stag.Interior; if (I.Pattern) I.patternType = PatternTypeMap[I.Pattern] || I.Pattern } }
        styles[stag.ID] = stag
    }

    function parse_xlml_data(xml, ss, data, cell, base, styles, csty, row, o) {
        var nf = "General",
            sid = cell.StyleID,
            S = {};
        o = o || {};
        var interiors = [];
        if (sid === undefined && row) sid = row.StyleID;
        if (sid === undefined && csty) sid = csty.StyleID;
        while (styles[sid] !== undefined) {
            if (styles[sid].nf) nf = styles[sid].nf;
            if (styles[sid].Interior) interiors.push(styles[sid].Interior);
            if (!styles[sid].Parent) break;
            sid = styles[sid].Parent
        }
        switch (data.Type) {
            case "Boolean":
                cell.t = "b";
                cell.v = parsexmlbool(xml);
                break;
            case "String":
                cell.t = "s";
                cell.r = fixstr(unescapexml(xml));
                cell.v = xml.indexOf("<") > -1 ? ss : cell.r;
                break;
            case "DateTime":
                cell.v = (Date.parse(xml) - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1e3);
                if (cell.v !== cell.v) cell.v = unescapexml(xml);
                else if (cell.v >= 1 && cell.v < 60) cell.v = cell.v - 1;
                if (!nf || nf == "General") nf = "yyyy-mm-dd";
            case "Number":
                if (cell.v === undefined) cell.v = +xml;
                if (!cell.t) cell.t = "n";
                break;
            case "Error":
                cell.t = "e";
                cell.v = RBErr[xml];
                cell.w = xml;
                break;
            default:
                cell.t = "s";
                cell.v = fixstr(ss);
                break
        }
        safe_format_xlml(cell, nf, o);
        if (o.cellFormula != null && cell.Formula) {
            cell.f = rc_to_a1(unescapexml(cell.Formula), base);
            cell.Formula = undefined
        }
        if (o.cellStyles) {
            interiors.forEach(function(x) { if (!S.patternType && x.patternType) S.patternType = x.patternType });
            cell.s = S
        }
        cell.ixfe = cell.StyleID !== undefined ? cell.StyleID : "Default"
    }

    function xlml_clean_comment(comment) {
        comment.t = comment.v;
        comment.v = comment.w = comment.ixfe = undefined
    }

    function xlml_normalize(d) { if (has_buf && Buffer.isBuffer(d)) return d.toString("utf8"); if (typeof d === "string") return d; throw "badf" }
    var xlmlregex = /<(\/?)([a-z0-9]*:|)(\w+)[^>]*>/gm;

    function parse_xlml_xml(d, opts) {
        var str = xlml_normalize(d);
        var Rn;
        var state = [],
            tmp;
        var sheets = {},
            sheetnames = [],
            cursheet = {},
            sheetname = "";
        var table = {},
            cell = {},
            row = {},
            dtag, didx;
        var c = 0,
            r = 0;
        var refguess = { s: { r: 1e6, c: 1e6 }, e: { r: 0, c: 0 } };
        var styles = {},
            stag = {};
        var ss = "",
            fidx = 0;
        var mergecells = [];
        var Props = {},
            Custprops = {},
            pidx = 0,
            cp = {};
        var comments = [],
            comment = {};
        var cstys = [],
            csty;
        while (Rn = xlmlregex.exec(str)) switch (Rn[3]) {
            case "Data":
                if (state[state.length - 1][1]) break;
                if (Rn[1] === "/") parse_xlml_data(str.slice(didx, Rn.index), ss, dtag, state[state.length - 1][0] == "Comment" ? comment : cell, { c: c, r: r }, styles, cstys[c], row, opts);
                else {
                    ss = "";
                    dtag = parsexmltag(Rn[0]);
                    didx = Rn.index + Rn[0].length
                }
                break;
            case "Cell":
                if (Rn[1] === "/") {
                    if (comments.length > 0) cell.c = comments;
                    if ((!opts.sheetRows || opts.sheetRows > r) && cell.v !== undefined) cursheet[encode_col(c) + encode_row(r)] = cell;
                    if (cell.HRef) {
                        cell.l = { Target: cell.HRef, tooltip: cell.HRefScreenTip };
                        cell.HRef = cell.HRefScreenTip = undefined
                    }
                    if (cell.MergeAcross || cell.MergeDown) {
                        var cc = c + (parseInt(cell.MergeAcross, 10) | 0);
                        var rr = r + (parseInt(cell.MergeDown, 10) | 0);
                        mergecells.push({ s: { c: c, r: r }, e: { c: cc, r: rr } })
                    }++c;
                    if (cell.MergeAcross) c += +cell.MergeAcross
                } else {
                    cell = parsexmltagobj(Rn[0]);
                    if (cell.Index) c = +cell.Index - 1;
                    if (c < refguess.s.c) refguess.s.c = c;
                    if (c > refguess.e.c) refguess.e.c = c;
                    if (Rn[0].substr(-2) === "/>") ++c;
                    comments = []
                }
                break;
            case "Row":
                if (Rn[1] === "/" || Rn[0].substr(-2) === "/>") {
                    if (r < refguess.s.r) refguess.s.r = r;
                    if (r > refguess.e.r) refguess.e.r = r;
                    if (Rn[0].substr(-2) === "/>") { row = parsexmltag(Rn[0]); if (row.Index) r = +row.Index - 1 }
                    c = 0;
                    ++r
                } else { row = parsexmltag(Rn[0]); if (row.Index) r = +row.Index - 1 }
                break;
            case "Worksheet":
                if (Rn[1] === "/") {
                    if ((tmp = state.pop())[0] !== Rn[3]) throw "Bad state: " + tmp;
                    sheetnames.push(sheetname);
                    if (refguess.s.r <= refguess.e.r && refguess.s.c <= refguess.e.c) cursheet["!ref"] = encode_range(refguess);
                    if (mergecells.length) cursheet["!merges"] = mergecells;
                    sheets[sheetname] = cursheet
                } else {
                    refguess = { s: { r: 1e6, c: 1e6 }, e: { r: 0, c: 0 } };
                    r = c = 0;
                    state.push([Rn[3], false]);
                    tmp = parsexmltag(Rn[0]);
                    sheetname = tmp.Name;
                    cursheet = {};
                    mergecells = []
                }
                break;
            case "Table":
                if (Rn[1] === "/") { if ((tmp = state.pop())[0] !== Rn[3]) throw "Bad state: " + tmp } else if (Rn[0].slice(-2) == "/>") break;
                else {
                    table = parsexmltag(Rn[0]);
                    state.push([Rn[3], false]);
                    cstys = []
                }
                break;
            case "Style":
                if (Rn[1] === "/") process_style_xlml(styles, stag, opts);
                else stag = parsexmltag(Rn[0]);
                break;
            case "NumberFormat":
                stag.nf = parsexmltag(Rn[0]).Format || "General";
                break;
            case "Column":
                if (state[state.length - 1][0] !== "Table") break;
                csty = parsexmltag(Rn[0]);
                cstys[csty.Index - 1 || cstys.length] = csty;
                for (var i = 0; i < +csty.Span; ++i) cstys[cstys.length] = csty;
                break;
            case "NamedRange":
                break;
            case "NamedCell":
                break;
            case "B":
                break;
            case "I":
                break;
            case "U":
                break;
            case "S":
                break;
            case "Sub":
                break;
            case "Sup":
                break;
            case "Span":
                break;
            case "Border":
                break;
            case "Alignment":
                break;
            case "Borders":
                break;
            case "Font":
                if (Rn[0].substr(-2) === "/>") break;
                else if (Rn[1] === "/") ss += str.slice(fidx, Rn.index);
                else fidx = Rn.index + Rn[0].length;
                break;
            case "Interior":
                if (!opts.cellStyles) break;
                stag.Interior = parsexmltag(Rn[0]);
                break;
            case "Protection":
                break;
            case "Author":
            case "Title":
            case "Description":
            case "Created":
            case "Keywords":
            case "Subject":
            case "Category":
            case "Company":
            case "LastAuthor":
            case "LastSaved":
            case "LastPrinted":
            case "Version":
            case "Revision":
            case "TotalTime":
            case "HyperlinkBase":
            case "Manager":
                if (Rn[0].substr(-2) === "/>") break;
                else if (Rn[1] === "/") xlml_set_prop(Props, Rn[3], str.slice(pidx, Rn.index));
                else pidx = Rn.index + Rn[0].length;
                break;
            case "Paragraphs":
                break;
            case "Styles":
            case "Workbook":
                if (Rn[1] === "/") { if ((tmp = state.pop())[0] !== Rn[3]) throw "Bad state: " + tmp } else state.push([Rn[3], false]);
                break;
            case "Comment":
                if (Rn[1] === "/") {
                    if ((tmp = state.pop())[0] !== Rn[3]) throw "Bad state: " + tmp;
                    xlml_clean_comment(comment);
                    comments.push(comment)
                } else {
                    state.push([Rn[3], false]);
                    tmp = parsexmltag(Rn[0]);
                    comment = { a: tmp.Author }
                }
                break;
            case "Name":
                break;
            case "ComponentOptions":
            case "DocumentProperties":
            case "CustomDocumentProperties":
            case "OfficeDocumentSettings":
            case "PivotTable":
            case "PivotCache":
            case "Names":
            case "MapInfo":
            case "PageBreaks":
            case "QueryTable":
            case "DataValidation":
            case "AutoFilter":
            case "Sorting":
            case "Schema":
            case "data":
            case "ConditionalFormatting":
            case "SmartTagType":
            case "SmartTags":
            case "ExcelWorkbook":
            case "WorkbookOptions":
            case "WorksheetOptions":
                if (Rn[1] === "/") { if ((tmp = state.pop())[0] !== Rn[3]) throw "Bad state: " + tmp } else if (Rn[0].charAt(Rn[0].length - 2) !== "/") state.push([Rn[3], true]);
                break;
            default:
                var seen = true;
                switch (state[state.length - 1][0]) {
                    case "OfficeDocumentSettings":
                        switch (Rn[3]) {
                            case "AllowPNG":
                                break;
                            case "RemovePersonalInformation":
                                break;
                            case "DownloadComponents":
                                break;
                            case "LocationOfComponents":
                                break;
                            case "Colors":
                                break;
                            case "Color":
                                break;
                            case "Index":
                                break;
                            case "RGB":
                                break;
                            case "PixelsPerInch":
                                break;
                            case "TargetScreenSize":
                                break;
                            case "ReadOnlyRecommended":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "ComponentOptions":
                        switch (Rn[3]) {
                            case "Toolbar":
                                break;
                            case "HideOfficeLogo":
                                break;
                            case "SpreadsheetAutoFit":
                                break;
                            case "Label":
                                break;
                            case "Caption":
                                break;
                            case "MaxHeight":
                                break;
                            case "MaxWidth":
                                break;
                            case "NextSheetNumber":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "ExcelWorkbook":
                        switch (Rn[3]) {
                            case "WindowHeight":
                                break;
                            case "WindowWidth":
                                break;
                            case "WindowTopX":
                                break;
                            case "WindowTopY":
                                break;
                            case "TabRatio":
                                break;
                            case "ProtectStructure":
                                break;
                            case "ProtectWindows":
                                break;
                            case "ActiveSheet":
                                break;
                            case "DisplayInkNotes":
                                break;
                            case "FirstVisibleSheet":
                                break;
                            case "SupBook":
                                break;
                            case "SheetName":
                                break;
                            case "SheetIndex":
                                break;
                            case "SheetIndexFirst":
                                break;
                            case "SheetIndexLast":
                                break;
                            case "Dll":
                                break;
                            case "AcceptLabelsInFormulas":
                                break;
                            case "DoNotSaveLinkValues":
                                break;
                            case "Date1904":
                                break;
                            case "Iteration":
                                break;
                            case "MaxIterations":
                                break;
                            case "MaxChange":
                                break;
                            case "Path":
                                break;
                            case "Xct":
                                break;
                            case "Count":
                                break;
                            case "SelectedSheets":
                                break;
                            case "Calculation":
                                break;
                            case "Uncalced":
                                break;
                            case "StartupPrompt":
                                break;
                            case "Crn":
                                break;
                            case "ExternName":
                                break;
                            case "Formula":
                                break;
                            case "ColFirst":
                                break;
                            case "ColLast":
                                break;
                            case "WantAdvise":
                                break;
                            case "Boolean":
                                break;
                            case "Error":
                                break;
                            case "Text":
                                break;
                            case "OLE":
                                break;
                            case "NoAutoRecover":
                                break;
                            case "PublishObjects":
                                break;
                            case "DoNotCalculateBeforeSave":
                                break;
                            case "Number":
                                break;
                            case "RefModeR1C1":
                                break;
                            case "EmbedSaveSmartTags":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "WorkbookOptions":
                        switch (Rn[3]) {
                            case "OWCVersion":
                                break;
                            case "Height":
                                break;
                            case "Width":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "WorksheetOptions":
                        switch (Rn[3]) {
                            case "Unsynced":
                                break;
                            case "Visible":
                                break;
                            case "Print":
                                break;
                            case "Panes":
                                break;
                            case "Scale":
                                break;
                            case "Pane":
                                break;
                            case "Number":
                                break;
                            case "Layout":
                                break;
                            case "Header":
                                break;
                            case "Footer":
                                break;
                            case "PageSetup":
                                break;
                            case "PageMargins":
                                break;
                            case "Selected":
                                break;
                            case "ProtectObjects":
                                break;
                            case "EnableSelection":
                                break;
                            case "ProtectScenarios":
                                break;
                            case "ValidPrinterInfo":
                                break;
                            case "HorizontalResolution":
                                break;
                            case "VerticalResolution":
                                break;
                            case "NumberofCopies":
                                break;
                            case "ActiveRow":
                                break;
                            case "ActiveCol":
                                break;
                            case "ActivePane":
                                break;
                            case "TopRowVisible":
                                break;
                            case "TopRowBottomPane":
                                break;
                            case "LeftColumnVisible":
                                break;
                            case "LeftColumnRightPane":
                                break;
                            case "FitToPage":
                                break;
                            case "RangeSelection":
                                break;
                            case "PaperSizeIndex":
                                break;
                            case "PageLayoutZoom":
                                break;
                            case "PageBreakZoom":
                                break;
                            case "FilterOn":
                                break;
                            case "DoNotDisplayGridlines":
                                break;
                            case "SplitHorizontal":
                                break;
                            case "SplitVertical":
                                break;
                            case "FreezePanes":
                                break;
                            case "FrozenNoSplit":
                                break;
                            case "FitWidth":
                                break;
                            case "FitHeight":
                                break;
                            case "CommentsLayout":
                                break;
                            case "Zoom":
                                break;
                            case "LeftToRight":
                                break;
                            case "Gridlines":
                                break;
                            case "AllowSort":
                                break;
                            case "AllowFilter":
                                break;
                            case "AllowInsertRows":
                                break;
                            case "AllowDeleteRows":
                                break;
                            case "AllowInsertCols":
                                break;
                            case "AllowDeleteCols":
                                break;
                            case "AllowInsertHyperlinks":
                                break;
                            case "AllowFormatCells":
                                break;
                            case "AllowSizeCols":
                                break;
                            case "AllowSizeRows":
                                break;
                            case "NoSummaryRowsBelowDetail":
                                break;
                            case "TabColorIndex":
                                break;
                            case "DoNotDisplayHeadings":
                                break;
                            case "ShowPageLayoutZoom":
                                break;
                            case "NoSummaryColumnsRightDetail":
                                break;
                            case "BlackAndWhite":
                                break;
                            case "DoNotDisplayZeros":
                                break;
                            case "DisplayPageBreak":
                                break;
                            case "RowColHeadings":
                                break;
                            case "DoNotDisplayOutline":
                                break;
                            case "NoOrientation":
                                break;
                            case "AllowUsePivotTables":
                                break;
                            case "ZeroHeight":
                                break;
                            case "ViewableRange":
                                break;
                            case "Selection":
                                break;
                            case "ProtectContents":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "PivotTable":
                    case "PivotCache":
                        switch (Rn[3]) {
                            case "ImmediateItemsOnDrop":
                                break;
                            case "ShowPageMultipleItemLabel":
                                break;
                            case "CompactRowIndent":
                                break;
                            case "Location":
                                break;
                            case "PivotField":
                                break;
                            case "Orientation":
                                break;
                            case "LayoutForm":
                                break;
                            case "LayoutSubtotalLocation":
                                break;
                            case "LayoutCompactRow":
                                break;
                            case "Position":
                                break;
                            case "PivotItem":
                                break;
                            case "DataType":
                                break;
                            case "DataField":
                                break;
                            case "SourceName":
                                break;
                            case "ParentField":
                                break;
                            case "PTLineItems":
                                break;
                            case "PTLineItem":
                                break;
                            case "CountOfSameItems":
                                break;
                            case "Item":
                                break;
                            case "ItemType":
                                break;
                            case "PTSource":
                                break;
                            case "CacheIndex":
                                break;
                            case "ConsolidationReference":
                                break;
                            case "FileName":
                                break;
                            case "Reference":
                                break;
                            case "NoColumnGrand":
                                break;
                            case "NoRowGrand":
                                break;
                            case "BlankLineAfterItems":
                                break;
                            case "Hidden":
                                break;
                            case "Subtotal":
                                break;
                            case "BaseField":
                                break;
                            case "MapChildItems":
                                break;
                            case "Function":
                                break;
                            case "RefreshOnFileOpen":
                                break;
                            case "PrintSetTitles":
                                break;
                            case "MergeLabels":
                                break;
                            case "DefaultVersion":
                                break;
                            case "RefreshName":
                                break;
                            case "RefreshDate":
                                break;
                            case "RefreshDateCopy":
                                break;
                            case "VersionLastRefresh":
                                break;
                            case "VersionLastUpdate":
                                break;
                            case "VersionUpdateableMin":
                                break;
                            case "VersionRefreshableMin":
                                break;
                            case "Calculation":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "PageBreaks":
                        switch (Rn[3]) {
                            case "ColBreaks":
                                break;
                            case "ColBreak":
                                break;
                            case "RowBreaks":
                                break;
                            case "RowBreak":
                                break;
                            case "ColStart":
                                break;
                            case "ColEnd":
                                break;
                            case "RowEnd":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "AutoFilter":
                        switch (Rn[3]) {
                            case "AutoFilterColumn":
                                break;
                            case "AutoFilterCondition":
                                break;
                            case "AutoFilterAnd":
                                break;
                            case "AutoFilterOr":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "QueryTable":
                        switch (Rn[3]) {
                            case "Id":
                                break;
                            case "AutoFormatFont":
                                break;
                            case "AutoFormatPattern":
                                break;
                            case "QuerySource":
                                break;
                            case "QueryType":
                                break;
                            case "EnableRedirections":
                                break;
                            case "RefreshedInXl9":
                                break;
                            case "URLString":
                                break;
                            case "HTMLTables":
                                break;
                            case "Connection":
                                break;
                            case "CommandText":
                                break;
                            case "RefreshInfo":
                                break;
                            case "NoTitles":
                                break;
                            case "NextId":
                                break;
                            case "ColumnInfo":
                                break;
                            case "OverwriteCells":
                                break;
                            case "DoNotPromptForFile":
                                break;
                            case "TextWizardSettings":
                                break;
                            case "Source":
                                break;
                            case "Number":
                                break;
                            case "Decimal":
                                break;
                            case "ThousandSeparator":
                                break;
                            case "TrailingMinusNumbers":
                                break;
                            case "FormatSettings":
                                break;
                            case "FieldType":
                                break;
                            case "Delimiters":
                                break;
                            case "Tab":
                                break;
                            case "Comma":
                                break;
                            case "AutoFormatName":
                                break;
                            case "VersionLastEdit":
                                break;
                            case "VersionLastRefresh":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "Sorting":
                    case "ConditionalFormatting":
                    case "DataValidation":
                        switch (Rn[3]) {
                            case "Range":
                                break;
                            case "Type":
                                break;
                            case "Min":
                                break;
                            case "Max":
                                break;
                            case "Sort":
                                break;
                            case "Descending":
                                break;
                            case "Order":
                                break;
                            case "CaseSensitive":
                                break;
                            case "Value":
                                break;
                            case "ErrorStyle":
                                break;
                            case "ErrorMessage":
                                break;
                            case "ErrorTitle":
                                break;
                            case "CellRangeList":
                                break;
                            case "InputMessage":
                                break;
                            case "InputTitle":
                                break;
                            case "ComboHide":
                                break;
                            case "InputHide":
                                break;
                            case "Condition":
                                break;
                            case "Qualifier":
                                break;
                            case "UseBlank":
                                break;
                            case "Value1":
                                break;
                            case "Value2":
                                break;
                            case "Format":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "MapInfo":
                    case "Schema":
                    case "data":
                        switch (Rn[3]) {
                            case "Map":
                                break;
                            case "Entry":
                                break;
                            case "Range":
                                break;
                            case "XPath":
                                break;
                            case "Field":
                                break;
                            case "XSDType":
                                break;
                            case "FilterOn":
                                break;
                            case "Aggregate":
                                break;
                            case "ElementType":
                                break;
                            case "AttributeType":
                                break;
                            case "schema":
                            case "element":
                            case "complexType":
                            case "datatype":
                            case "all":
                            case "attribute":
                            case "extends":
                                break;
                            case "row":
                                break;
                            default:
                                seen = false
                        }
                        break;
                    case "SmartTags":
                        break;
                    default:
                        seen = false;
                        break
                }
                if (seen) break;
                if (!state[state.length - 1][1]) throw "Unrecognized tag: " + Rn[3] + "|" + state.join("|");
                if (state[state.length - 1][0] === "CustomDocumentProperties") {
                    if (Rn[0].substr(-2) === "/>") break;
                    else if (Rn[1] === "/") xlml_set_custprop(Custprops, Rn, cp, str.slice(pidx, Rn.index));
                    else {
                        cp = Rn;
                        pidx = Rn.index + Rn[0].length
                    }
                    break
                }
                if (opts.WTF) throw "Unrecognized tag: " + Rn[3] + "|" + state.join("|")
        }
        var out = {};
        if (!opts.bookSheets && !opts.bookProps) out.Sheets = sheets;
        out.SheetNames = sheetnames;
        out.SSF = SSF.get_table();
        out.Props = Props;
        out.Custprops = Custprops;
        return out
    }

    function parse_xlml(data, opts) {
        fix_read_opts(opts = opts || {});
        switch (opts.type || "base64") {
            case "base64":
                return parse_xlml_xml(Base64.decode(data), opts);
            case "binary":
            case "buffer":
            case "file":
                return parse_xlml_xml(data, opts);
            case "array":
                return parse_xlml_xml(data.map(_chr).join(""), opts)
        }
    }

    function write_xlml(wb, opts) {}
    var fs;
    if (typeof exports !== "undefined") { if (typeof module !== "undefined" && module.exports) { fs = require("fs") } }

    function firstbyte(f, o) {
        switch ((o || {}).type || "base64") {
            case "buffer":
                return f[0];
            case "base64":
                return Base64.decode(f.substr(0, 12)).charCodeAt(0);
            case "binary":
                return f.charCodeAt(0);
            case "array":
                return f[0];
            default:
                throw new Error("Unrecognized type " + o.type)
        }
    }

    function xlsread(f, o) {
        if (!o) o = {};
        if (!o.type) o.type = has_buf && Buffer.isBuffer(f) ? "buffer" : "base64";
        switch (firstbyte(f, o)) {
            case 208:
                return parse_xlscfb(CFB.read(f, o), o);
            case 9:
                return parse_xlscfb(s2a(o.type === "base64" ? Base64.decode(f) : f), o);
            case 60:
                return parse_xlml(f, o);
            default:
                throw "Unsupported file"
        }
    }
    var readFile = function(f, o) {
        var d = fs.readFileSync(f);
        if (!o) o = {};
        switch (firstbyte(d, { type: "buffer" })) {
            case 208:
                return parse_xlscfb(CFB.read(d, { type: "buffer" }), o);
            case 9:
                return parse_xlscfb(d, o);
            case 60:
                return parse_xlml(d, (o.type = "buffer", o));
            default:
                throw "Unsupported file"
        }
    };

    function writeSync(wb, opts) {
        var o = opts || {};
        switch (o.bookType) {
            case "xml":
                return write_xlml(wb, o);
            default:
                throw "unsupported output format " + o.bookType
        }
    }

    function writeFileSync(wb, filename, opts) {
        var o = opts | {};
        o.type = "file";
        o.file = filename;
        switch (o.file.substr(-4).toLowerCase()) {
            case ".xls":
                o.bookType = "xls";
                break;
            case ".xml":
                o.bookType = "xml";
                break
        }
        return writeSync(wb, o)
    }

    function shift_cell(cell, tgt) {
        if (tgt.s) { if (cell.cRel) cell.c += tgt.s.c; if (cell.rRel) cell.r += tgt.s.r } else {
            cell.c += tgt.c;
            cell.r += tgt.r
        }
        cell.cRel = cell.rRel = 0;
        while (cell.c >= 256) cell.c -= 256;
        while (cell.r >= 65536) cell.r -= 65536;
        return cell
    }

    function shift_range(cell, range) {
        cell.s = shift_cell(cell.s, range.s);
        cell.e = shift_cell(cell.e, range.s);
        return cell
    }

    function decode_row(rowstr) { return parseInt(unfix_row(rowstr), 10) - 1 }

    function encode_row(row) { return "" + (row + 1) }

    function fix_row(cstr) { return cstr.replace(/([A-Z]|^)(\d+)$/, "$1$$$2") }

    function unfix_row(cstr) { return cstr.replace(/\$(\d+)$/, "$1") }

    function decode_col(colstr) {
        var c = unfix_col(colstr),
            d = 0,
            i = 0;
        for (; i !== c.length; ++i) d = 26 * d + c.charCodeAt(i) - 64;
        return d - 1
    }

    function encode_col(col) { var s = ""; for (++col; col; col = Math.floor((col - 1) / 26)) s = String.fromCharCode((col - 1) % 26 + 65) + s; return s }

    function fix_col(cstr) { return cstr.replace(/^([A-Z])/, "$$$1") }

    function unfix_col(cstr) { return cstr.replace(/^\$([A-Z])/, "$1") }

    function split_cell(cstr) { return cstr.replace(/(\$?[A-Z]*)(\$?\d*)/, "$1,$2").split(",") }

    function decode_cell(cstr) { var splt = split_cell(cstr); return { c: decode_col(splt[0]), r: decode_row(splt[1]) } }

    function encode_cell(cell) { return encode_col(cell.c) + encode_row(cell.r) }

    function fix_cell(cstr) { return fix_col(fix_row(cstr)) }

    function unfix_cell(cstr) { return unfix_col(unfix_row(cstr)) }

    function decode_range(range) { var x = range.split(":").map(decode_cell); return { s: x[0], e: x[x.length - 1] } }

    function encode_range(cs, ce) { if (ce === undefined || typeof ce === "number") return encode_range(cs.s, cs.e); if (typeof cs !== "string") cs = encode_cell(cs); if (typeof ce !== "string") ce = encode_cell(ce); return cs == ce ? cs : cs + ":" + ce }

    function safe_decode_range(range) {
        var o = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
        var idx = 0,
            i = 0,
            cc = 0;
        var len = range.length;
        for (idx = 0; i < len; ++i) {
            if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
            idx = 26 * idx + cc
        }
        o.s.c = --idx;
        for (idx = 0; i < len; ++i) {
            if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) break;
            idx = 10 * idx + cc
        }
        o.s.r = --idx;
        if (i === len || range.charCodeAt(++i) === 58) {
            o.e.c = o.s.c;
            o.e.r = o.s.r;
            return o
        }
        for (idx = 0; i != len; ++i) {
            if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
            idx = 26 * idx + cc
        }
        o.e.c = --idx;
        for (idx = 0; i != len; ++i) {
            if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) break;
            idx = 10 * idx + cc
        }
        o.e.r = --idx;
        return o
    }

    function safe_format_cell(cell, v) {
        if (cell.z !== undefined) try { return cell.w = SSF.format(cell.z, v) } catch (e) {}
        if (!cell.XF) return v;
        try { return cell.w = SSF.format(cell.XF.ifmt || 0, v) } catch (e) { return "" + v }
    }

    function format_cell(cell, v) { if (cell == null || cell.t == null) return ""; if (cell.w !== undefined) return cell.w; if (v === undefined) return safe_format_cell(cell, cell.v); return safe_format_cell(cell, v) }

    function sheet_to_json(sheet, opts) {
        var val, row, range, header = 0,
            offset = 1,
            r, hdr = [],
            isempty, R, C, v;
        var o = opts != null ? opts : {};
        var raw = o.raw;
        if (sheet == null || sheet["!ref"] == null) return [];
        range = o.range !== undefined ? o.range : sheet["!ref"];
        if (o.header === 1) header = 1;
        else if (o.header === "A") header = 2;
        else if (Array.isArray(o.header)) header = 3;
        switch (typeof range) {
            case "string":
                r = safe_decode_range(range);
                break;
            case "number":
                r = safe_decode_range(sheet["!ref"]);
                r.s.r = range;
                break;
            default:
                r = range
        }
        if (header > 0) offset = 0;
        var rr = encode_row(r.s.r);
        var cols = new Array(r.e.c - r.s.c + 1);
        var out = new Array(r.e.r - r.s.r - offset + 1);
        var outi = 0;
        for (C = r.s.c; C <= r.e.c; ++C) {
            cols[C] = encode_col(C);
            val = sheet[cols[C] + rr];
            switch (header) {
                case 1:
                    hdr[C] = C;
                    break;
                case 2:
                    hdr[C] = cols[C];
                    break;
                case 3:
                    hdr[C] = o.header[C - r.s.c];
                    break;
                default:
                    if (val === undefined) continue;
                    hdr[C] = format_cell(val)
            }
        }
        for (R = r.s.r + offset; R <= r.e.r; ++R) {
            rr = encode_row(R);
            isempty = true;
            if (header === 1) row = [];
            else {
                row = {};
                if (Object.defineProperty) Object.defineProperty(row, "__rowNum__", { value: R, enumerable: false });
                else row.__rowNum__ = R
            }
            for (C = r.s.c; C <= r.e.c; ++C) {
                val = sheet[cols[C] + rr];
                if (val === undefined || val.t === undefined) continue;
                v = val.v;
                switch (val.t) {
                    case "e":
                        continue;
                    case "s":
                        break;
                    case "b":
                    case "n":
                        break;
                    default:
                        throw "unrecognized type " + val.t
                }
                if (v !== undefined) {
                    row[hdr[C]] = raw ? v : format_cell(val, v);
                    isempty = false
                }
            }
            if (isempty === false || header === 1) out[outi++] = row
        }
        out.length = outi;
        return out
    }

    function sheet_to_row_object_array(sheet, opts) { return sheet_to_json(sheet, opts != null ? opts : {}) }

    function sheet_to_csv(sheet, opts) {
        var out = "",
            txt = "",
            qreg = /"/g;
        var o = opts == null ? {} : opts;
        if (sheet == null || sheet["!ref"] == null) return "";
        var r = safe_decode_range(sheet["!ref"]);
        var FS = o.FS !== undefined ? o.FS : ",",
            fs = FS.charCodeAt(0);
        var RS = o.RS !== undefined ? o.RS : "\n",
            rs = RS.charCodeAt(0);
        var row = "",
            rr = "",
            cols = [];
        var i = 0,
            cc = 0,
            val;
        var R = 0,
            C = 0;
        for (C = r.s.c; C <= r.e.c; ++C) cols[C] = encode_col(C);
        for (R = r.s.r; R <= r.e.r; ++R) {
            row = "";
            rr = encode_row(R);
            for (C = r.s.c; C <= r.e.c; ++C) {
                val = sheet[cols[C] + rr];
                txt = val !== undefined ? "" + format_cell(val) : "";
                for (i = 0, cc = 0; i !== txt.length; ++i)
                    if ((cc = txt.charCodeAt(i)) === fs || cc === rs || cc === 34) { txt = '"' + txt.replace(qreg, '""') + '"'; break }
                row += (C === r.s.c ? "" : FS) + txt
            }
            out += row + RS
        }
        return out
    }
    var make_csv = sheet_to_csv;

    function sheet_to_formulae(sheet) {
        var cmds, y = "",
            x, val = "";
        if (sheet == null || sheet["!ref"] == null) return "";
        var r = safe_decode_range(sheet["!ref"]),
            rr = "",
            cols = [],
            C;
        cmds = new Array((r.e.r - r.s.r + 1) * (r.e.c - r.s.c + 1));
        var i = 0;
        for (C = r.s.c; C <= r.e.c; ++C) cols[C] = encode_col(C);
        for (var R = r.s.r; R <= r.e.r; ++R) {
            rr = encode_row(R);
            for (C = r.s.c; C <= r.e.c; ++C) {
                y = cols[C] + rr;
                x = sheet[y];
                val = "";
                if (x === undefined) continue;
                if (x.f != null) val = x.f;
                else if (x.w !== undefined) val = "'" + x.w;
                else if (x.v === undefined) continue;
                else val = "" + x.v;
                cmds[i++] = y + "=" + val
            }
        }
        cmds.length = i;
        return cmds
    }
    var utils = { encode_col: encode_col, encode_row: encode_row, encode_cell: encode_cell, encode_range: encode_range, decode_col: decode_col, decode_row: decode_row, split_cell: split_cell, decode_cell: decode_cell, decode_range: decode_range, format_cell: format_cell, get_formulae: sheet_to_formulae, make_csv: sheet_to_csv, make_json: sheet_to_json, make_formulae: sheet_to_formulae, sheet_to_csv: sheet_to_csv, sheet_to_json: sheet_to_json, sheet_to_formulae: sheet_to_formulae, sheet_to_row_object_array: sheet_to_row_object_array };
    XLS.parse_xlscfb = parse_xlscfb;
    XLS.read = xlsread;
    XLS.readFile = readFile;
    XLS.utils = utils;
    XLS.CFB = CFB;
    XLS.SSF = SSF
})(typeof exports !== "undefined" ? exports : XLS);