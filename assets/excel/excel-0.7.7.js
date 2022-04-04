/* xlsx.js (C) 2013-2014 SheetJS -- http://sheetjs.com */
var JSZip = function(data, options) {
    this.files = {};
    this.root = "";
    if (data) { this.load(data, options) }
};
JSZip.signature = { LOCAL_FILE_HEADER: "PK", CENTRAL_FILE_HEADER: "PK", CENTRAL_DIRECTORY_END: "PK", ZIP64_CENTRAL_DIRECTORY_LOCATOR: "PK", ZIP64_CENTRAL_DIRECTORY_END: "PK", DATA_DESCRIPTOR: "PK\b" };
JSZip.defaults = { base64: false, binary: false, dir: false, date: null, compression: null };
JSZip.support = {
    arraybuffer: function() { return typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined" }(),
    nodebuffer: function() { return typeof Buffer !== "undefined" }(),
    uint8array: function() { return typeof Uint8Array !== "undefined" }(),
    blob: function() {
        if (typeof ArrayBuffer === "undefined") { return false }
        var buffer = new ArrayBuffer(0);
        try { return new Blob([buffer], { type: "application/zip" }).size === 0 } catch (e) {}
        try {
            var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            var builder = new BlobBuilder;
            builder.append(buffer);
            return builder.getBlob("application/zip").size === 0
        } catch (e) {}
        return false
    }()
};
JSZip.prototype = function() {
    var textEncoder, textDecoder;
    if (JSZip.support.uint8array && typeof TextEncoder === "function" && typeof TextDecoder === "function") {
        textEncoder = new TextEncoder("utf-8");
        textDecoder = new TextDecoder("utf-8")
    }
    var getRawData = function(file) {
        if (file._data instanceof JSZip.CompressedObject) {
            file._data = file._data.getContent();
            file.options.binary = true;
            file.options.base64 = false;
            if (JSZip.utils.getTypeOf(file._data) === "uint8array") {
                var copy = file._data;
                file._data = new Uint8Array(copy.length);
                if (copy.length !== 0) { file._data.set(copy, 0) }
            }
        }
        return file._data
    };
    var getBinaryData = function(file) {
        var result = getRawData(file),
            type = JSZip.utils.getTypeOf(result);
        if (type === "string") { if (!file.options.binary) { if (textEncoder) { return textEncoder.encode(result) } if (JSZip.support.nodebuffer) { return new Buffer(result, "utf-8") } } return file.asBinary() }
        return result
    };
    var dataToString = function(asUTF8) { var result = getRawData(this); if (result === null || typeof result === "undefined") { return "" } if (this.options.base64) { result = JSZip.base64.decode(result) } if (asUTF8 && this.options.binary) { result = JSZip.prototype.utf8decode(result) } else { result = JSZip.utils.transformTo("string", result) } if (!asUTF8 && !this.options.binary) { result = JSZip.prototype.utf8encode(result) } return result };
    var ZipObject = function(name, data, options) {
        this.name = name;
        this._data = data;
        this.options = options
    };
    ZipObject.prototype = { asText: function() { return dataToString.call(this, true) }, asBinary: function() { return dataToString.call(this, false) }, asNodeBuffer: function() { var result = getBinaryData(this); return JSZip.utils.transformTo("nodebuffer", result) }, asUint8Array: function() { var result = getBinaryData(this); return JSZip.utils.transformTo("uint8array", result) }, asArrayBuffer: function() { return this.asUint8Array().buffer } };
    var decToHex = function(dec, bytes) {
        var hex = "",
            i;
        for (i = 0; i < bytes; i++) {
            hex += String.fromCharCode(dec & 255);
            dec = dec >>> 8
        }
        return hex
    };
    var extend = function() {
        var result = {},
            i, attr;
        for (i = 0; i < arguments.length; i++) { for (attr in arguments[i]) { if (arguments[i].hasOwnProperty(attr) && typeof result[attr] === "undefined") { result[attr] = arguments[i][attr] } } }
        return result
    };
    var prepareFileAttrs = function(o) {
        o = o || {};
        if (o.base64 === true && o.binary == null) { o.binary = true }
        o = extend(o, JSZip.defaults);
        o.date = o.date || new Date;
        if (o.compression !== null) o.compression = o.compression.toUpperCase();
        return o
    };
    var fileAdd = function(name, data, o) {
        var parent = parentFolder(name),
            dataType = JSZip.utils.getTypeOf(data);
        if (parent) { folderAdd.call(this, parent) }
        o = prepareFileAttrs(o);
        if (o.dir || data === null || typeof data === "undefined") {
            o.base64 = false;
            o.binary = false;
            data = null
        } else if (dataType === "string") { if (o.binary && !o.base64) { if (o.optimizedBinaryString !== true) { data = JSZip.utils.string2binary(data) } } } else {
            o.base64 = false;
            o.binary = true;
            if (!dataType && !(data instanceof JSZip.CompressedObject)) { throw new Error("The data of '" + name + "' is in an unsupported format !") }
            if (dataType === "arraybuffer") { data = JSZip.utils.transformTo("uint8array", data) }
        }
        var object = new ZipObject(name, data, o);
        this.files[name] = object;
        return object
    };
    var parentFolder = function(path) { if (path.slice(-1) == "/") { path = path.substring(0, path.length - 1) } var lastSlash = path.lastIndexOf("/"); return lastSlash > 0 ? path.substring(0, lastSlash) : "" };
    var folderAdd = function(name) { if (name.slice(-1) != "/") { name += "/" } if (!this.files[name]) { fileAdd.call(this, name, null, { dir: true }) } return this.files[name] };
    var generateCompressedObjectFrom = function(file, compression) {
        var result = new JSZip.CompressedObject,
            content;
        if (file._data instanceof JSZip.CompressedObject) {
            result.uncompressedSize = file._data.uncompressedSize;
            result.crc32 = file._data.crc32;
            if (result.uncompressedSize === 0 || file.options.dir) {
                compression = JSZip.compressions["STORE"];
                result.compressedContent = "";
                result.crc32 = 0
            } else if (file._data.compressionMethod === compression.magic) { result.compressedContent = file._data.getCompressedContent() } else {
                content = file._data.getContent();
                result.compressedContent = compression.compress(JSZip.utils.transformTo(compression.compressInputType, content))
            }
        } else {
            content = getBinaryData(file);
            if (!content || content.length === 0 || file.options.dir) {
                compression = JSZip.compressions["STORE"];
                content = ""
            }
            result.uncompressedSize = content.length;
            result.crc32 = this.crc32(content);
            result.compressedContent = compression.compress(JSZip.utils.transformTo(compression.compressInputType, content))
        }
        result.compressedSize = result.compressedContent.length;
        result.compressionMethod = compression.magic;
        return result
    };
    var generateZipParts = function(name, file, compressedObject, offset) {
        var data = compressedObject.compressedContent,
            utfEncodedFileName = this.utf8encode(file.name),
            useUTF8 = utfEncodedFileName !== file.name,
            o = file.options,
            dosTime, dosDate;
        dosTime = o.date.getHours();
        dosTime = dosTime << 6;
        dosTime = dosTime | o.date.getMinutes();
        dosTime = dosTime << 5;
        dosTime = dosTime | o.date.getSeconds() / 2;
        dosDate = o.date.getFullYear() - 1980;
        dosDate = dosDate << 4;
        dosDate = dosDate | o.date.getMonth() + 1;
        dosDate = dosDate << 5;
        dosDate = dosDate | o.date.getDate();
        var header = "";
        header += "\n\x00";
        header += useUTF8 ? "\x00\b" : "\x00\x00";
        header += compressedObject.compressionMethod;
        header += decToHex(dosTime, 2);
        header += decToHex(dosDate, 2);
        header += decToHex(compressedObject.crc32, 4);
        header += decToHex(compressedObject.compressedSize, 4);
        header += decToHex(compressedObject.uncompressedSize, 4);
        header += decToHex(utfEncodedFileName.length, 2);
        header += "\x00\x00";
        var fileRecord = JSZip.signature.LOCAL_FILE_HEADER + header + utfEncodedFileName;
        var dirRecord = JSZip.signature.CENTRAL_FILE_HEADER + "\x00" + header + "\x00\x00" + "\x00\x00" + "\x00\x00" + (file.options.dir === true ? "\x00\x00\x00" : "\x00\x00\x00\x00") + decToHex(offset, 4) + utfEncodedFileName;
        return { fileRecord: fileRecord, dirRecord: dirRecord, compressedObject: compressedObject }
    };
    var StringWriter = function() { this.data = [] };
    StringWriter.prototype = {
        append: function(input) {
            input = JSZip.utils.transformTo("string", input);
            this.data.push(input)
        },
        finalize: function() { return this.data.join("") }
    };
    var Uint8ArrayWriter = function(length) {
        this.data = new Uint8Array(length);
        this.index = 0
    };
    Uint8ArrayWriter.prototype = {
        append: function(input) {
            if (input.length !== 0) {
                input = JSZip.utils.transformTo("uint8array", input);
                this.data.set(input, this.index);
                this.index += input.length
            }
        },
        finalize: function() { return this.data }
    };
    return {
        load: function(stream, options) { throw new Error("Load method is not defined. Is the file jszip-load.js included ?") },
        filter: function(search) {
            var result = [],
                filename, relativePath, file, fileClone;
            for (filename in this.files) {
                if (!this.files.hasOwnProperty(filename)) { continue }
                file = this.files[filename];
                fileClone = new ZipObject(file.name, file._data, extend(file.options));
                relativePath = filename.slice(this.root.length, filename.length);
                if (filename.slice(0, this.root.length) === this.root && search(relativePath, fileClone)) { result.push(fileClone) }
            }
            return result
        },
        file: function(name, data, o) {
            if (arguments.length === 1) { if (JSZip.utils.isRegExp(name)) { var regexp = name; return this.filter(function(relativePath, file) { return !file.options.dir && regexp.test(relativePath) }) } else { return this.filter(function(relativePath, file) { return !file.options.dir && relativePath === name })[0] || null } } else {
                name = this.root + name;
                fileAdd.call(this, name, data, o)
            }
            return this
        },
        folder: function(arg) {
            if (!arg) { return this }
            if (JSZip.utils.isRegExp(arg)) { return this.filter(function(relativePath, file) { return file.options.dir && arg.test(relativePath) }) }
            var name = this.root + arg;
            var newFolder = folderAdd.call(this, name);
            var ret = this.clone();
            ret.root = newFolder.name;
            return ret
        },
        remove: function(name) {
            name = this.root + name;
            var file = this.files[name];
            if (!file) {
                if (name.slice(-1) != "/") { name += "/" }
                file = this.files[name]
            }
            if (file) { if (!file.options.dir) { delete this.files[name] } else { var kids = this.filter(function(relativePath, file) { return file.name.slice(0, name.length) === name }); for (var i = 0; i < kids.length; i++) { delete this.files[kids[i].name] } } }
            return this
        },
        generate: function(options) {
            options = extend(options || {}, { base64: true, compression: "STORE", type: "base64" });
            JSZip.utils.checkSupport(options.type);
            var zipData = [],
                localDirLength = 0,
                centralDirLength = 0,
                writer, i;
            for (var name in this.files) {
                if (!this.files.hasOwnProperty(name)) { continue }
                var file = this.files[name];
                var compressionName = file.options.compression || options.compression.toUpperCase();
                var compression = JSZip.compressions[compressionName];
                if (!compression) { throw new Error(compressionName + " is not a valid compression method !") }
                var compressedObject = generateCompressedObjectFrom.call(this, file, compression);
                var zipPart = generateZipParts.call(this, name, file, compressedObject, localDirLength);
                localDirLength += zipPart.fileRecord.length + compressedObject.compressedSize;
                centralDirLength += zipPart.dirRecord.length;
                zipData.push(zipPart)
            }
            var dirEnd = "";
            dirEnd = JSZip.signature.CENTRAL_DIRECTORY_END + "\x00\x00" + "\x00\x00" + decToHex(zipData.length, 2) + decToHex(zipData.length, 2) + decToHex(centralDirLength, 4) + decToHex(localDirLength, 4) + "\x00\x00";
            switch (options.type.toLowerCase()) {
                case "uint8array":
                case "arraybuffer":
                case "blob":
                case "nodebuffer":
                    writer = new Uint8ArrayWriter(localDirLength + centralDirLength + dirEnd.length);
                    break;
                default:
                    writer = new StringWriter(localDirLength + centralDirLength + dirEnd.length);
                    break
            }
            for (i = 0; i < zipData.length; i++) {
                writer.append(zipData[i].fileRecord);
                writer.append(zipData[i].compressedObject.compressedContent)
            }
            for (i = 0; i < zipData.length; i++) { writer.append(zipData[i].dirRecord) }
            writer.append(dirEnd);
            var zip = writer.finalize();
            switch (options.type.toLowerCase()) {
                case "uint8array":
                case "arraybuffer":
                case "nodebuffer":
                    return JSZip.utils.transformTo(options.type.toLowerCase(), zip);
                case "blob":
                    return JSZip.utils.arrayBuffer2Blob(JSZip.utils.transformTo("arraybuffer", zip));
                case "base64":
                    return options.base64 ? JSZip.base64.encode(zip) : zip;
                default:
                    return zip
            }
        },
        crc32: function crc32(input, crc) {
            if (typeof input === "undefined" || !input.length) { return 0 }
            var isArray = JSZip.utils.getTypeOf(input) !== "string";
            var table = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918e3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
            if (typeof crc == "undefined") { crc = 0 }
            var x = 0;
            var y = 0;
            var byte = 0;
            crc = crc ^ -1;
            for (var i = 0, iTop = input.length; i < iTop; i++) {
                byte = isArray ? input[i] : input.charCodeAt(i);
                y = (crc ^ byte) & 255;
                x = table[y];
                crc = crc >>> 8 ^ x
            }
            return crc ^ -1
        },
        clone: function() { var newObj = new JSZip; for (var i in this) { if (typeof this[i] !== "function") { newObj[i] = this[i] } } return newObj },
        utf8encode: function(string) {
            if (textEncoder) { var u8 = textEncoder.encode(string); return JSZip.utils.transformTo("string", u8) }
            if (JSZip.support.nodebuffer) { return JSZip.utils.transformTo("string", new Buffer(string, "utf-8")) }
            var result = [],
                resIndex = 0;
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) { result[resIndex++] = String.fromCharCode(c) } else if (c > 127 && c < 2048) {
                    result[resIndex++] = String.fromCharCode(c >> 6 | 192);
                    result[resIndex++] = String.fromCharCode(c & 63 | 128)
                } else {
                    result[resIndex++] = String.fromCharCode(c >> 12 | 224);
                    result[resIndex++] = String.fromCharCode(c >> 6 & 63 | 128);
                    result[resIndex++] = String.fromCharCode(c & 63 | 128)
                }
            }
            return result.join("")
        },
        utf8decode: function(input) {
            var result = [],
                resIndex = 0;
            var type = JSZip.utils.getTypeOf(input);
            var isArray = type !== "string";
            var i = 0;
            var c = 0,
                c1 = 0,
                c2 = 0,
                c3 = 0;
            if (textDecoder) { return textDecoder.decode(JSZip.utils.transformTo("uint8array", input)) }
            if (JSZip.support.nodebuffer) { return JSZip.utils.transformTo("nodebuffer", input).toString("utf-8") }
            while (i < input.length) {
                c = isArray ? input[i] : input.charCodeAt(i);
                if (c < 128) {
                    result[resIndex++] = String.fromCharCode(c);
                    i++
                } else if (c > 191 && c < 224) {
                    c2 = isArray ? input[i + 1] : input.charCodeAt(i + 1);
                    result[resIndex++] = String.fromCharCode((c & 31) << 6 | c2 & 63);
                    i += 2
                } else {
                    c2 = isArray ? input[i + 1] : input.charCodeAt(i + 1);
                    c3 = isArray ? input[i + 2] : input.charCodeAt(i + 2);
                    result[resIndex++] = String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    i += 3
                }
            }
            return result.join("")
        }
    }
}();
JSZip.compressions = { STORE: { magic: "\x00\x00", compress: function(content) { return content }, uncompress: function(content) { return content }, compressInputType: null, uncompressInputType: null } };
(function() {
    JSZip.utils = {
        string2binary: function(str) { var result = ""; for (var i = 0; i < str.length; i++) { result += String.fromCharCode(str.charCodeAt(i) & 255) } return result },
        string2Uint8Array: function(str) { return JSZip.utils.transformTo("uint8array", str) },
        uint8Array2String: function(array) { return JSZip.utils.transformTo("string", array) },
        arrayBuffer2Blob: function(buffer) {
            JSZip.utils.checkSupport("blob");
            try { return new Blob([buffer], { type: "application/zip" }) } catch (e) {}
            try {
                var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                var builder = new BlobBuilder;
                builder.append(buffer);
                return builder.getBlob("application/zip")
            } catch (e) {}
            throw new Error("Bug : can't construct the Blob.")
        },
        string2Blob: function(str) { var buffer = JSZip.utils.transformTo("arraybuffer", str); return JSZip.utils.arrayBuffer2Blob(buffer) }
    };

    function identity(input) { return input }

    function stringToArrayLike(str, array) { for (var i = 0; i < str.length; ++i) { array[i] = str.charCodeAt(i) & 255 } return array }

    function arrayLikeToString(array) {
        var chunk = 65536;
        var result = [],
            len = array.length,
            type = JSZip.utils.getTypeOf(array),
            k = 0;
        var canUseApply = true;
        try {
            switch (type) {
                case "uint8array":
                    String.fromCharCode.apply(null, new Uint8Array(0));
                    break;
                case "nodebuffer":
                    String.fromCharCode.apply(null, new Buffer(0));
                    break
            }
        } catch (e) { canUseApply = false }
        if (!canUseApply) { var resultStr = ""; for (var i = 0; i < array.length; i++) { resultStr += String.fromCharCode(array[i]) } return resultStr }
        while (k < len && chunk > 1) {
            try {
                if (type === "array" || type === "nodebuffer") { result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len)))) } else { result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len)))) }
                k += chunk
            } catch (e) { chunk = Math.floor(chunk / 2) }
        }
        return result.join("")
    }

    function arrayLikeToArrayLike(arrayFrom, arrayTo) { for (var i = 0; i < arrayFrom.length; i++) { arrayTo[i] = arrayFrom[i] } return arrayTo }
    var transform = {};
    transform["string"] = { string: identity, array: function(input) { return stringToArrayLike(input, new Array(input.length)) }, arraybuffer: function(input) { return transform["string"]["uint8array"](input).buffer }, uint8array: function(input) { return stringToArrayLike(input, new Uint8Array(input.length)) }, nodebuffer: function(input) { return stringToArrayLike(input, new Buffer(input.length)) } };
    transform["array"] = { string: arrayLikeToString, array: identity, arraybuffer: function(input) { return new Uint8Array(input).buffer }, uint8array: function(input) { return new Uint8Array(input) }, nodebuffer: function(input) { return new Buffer(input) } };
    transform["arraybuffer"] = { string: function(input) { return arrayLikeToString(new Uint8Array(input)) }, array: function(input) { return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength)) }, arraybuffer: identity, uint8array: function(input) { return new Uint8Array(input) }, nodebuffer: function(input) { return new Buffer(new Uint8Array(input)) } };
    transform["uint8array"] = { string: arrayLikeToString, array: function(input) { return arrayLikeToArrayLike(input, new Array(input.length)) }, arraybuffer: function(input) { return input.buffer }, uint8array: identity, nodebuffer: function(input) { return new Buffer(input) } };
    transform["nodebuffer"] = { string: arrayLikeToString, array: function(input) { return arrayLikeToArrayLike(input, new Array(input.length)) }, arraybuffer: function(input) { return transform["nodebuffer"]["uint8array"](input).buffer }, uint8array: function(input) { return arrayLikeToArrayLike(input, new Uint8Array(input.length)) }, nodebuffer: identity };
    JSZip.utils.transformTo = function(outputType, input) {
        if (!input) { input = "" }
        if (!outputType) { return input }
        JSZip.utils.checkSupport(outputType);
        var inputType = JSZip.utils.getTypeOf(input);
        var result = transform[inputType][outputType](input);
        return result
    };
    JSZip.utils.getTypeOf = function(input) { if (typeof input === "string") { return "string" } if (Object.prototype.toString.call(input) === "[object Array]") { return "array" } if (JSZip.support.nodebuffer && Buffer.isBuffer(input)) { return "nodebuffer" } if (JSZip.support.uint8array && input instanceof Uint8Array) { return "uint8array" } if (JSZip.support.arraybuffer && input instanceof ArrayBuffer) { return "arraybuffer" } };
    JSZip.utils.isRegExp = function(object) { return Object.prototype.toString.call(object) === "[object RegExp]" };
    JSZip.utils.checkSupport = function(type) {
        var supported = true;
        switch (type.toLowerCase()) {
            case "uint8array":
                supported = JSZip.support.uint8array;
                break;
            case "arraybuffer":
                supported = JSZip.support.arraybuffer;
                break;
            case "nodebuffer":
                supported = JSZip.support.nodebuffer;
                break;
            case "blob":
                supported = JSZip.support.blob;
                break
        }
        if (!supported) { throw new Error(type + " is not supported by this browser") }
    }
})();
(function() {
    JSZip.CompressedObject = function() {
        this.compressedSize = 0;
        this.uncompressedSize = 0;
        this.crc32 = 0;
        this.compressionMethod = null;
        this.compressedContent = null
    };
    JSZip.CompressedObject.prototype = { getContent: function() { return null }, getCompressedContent: function() { return null } }
})();
JSZip.base64 = function() {
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    return {
        encode: function(input, utf8) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = (chr1 & 3) << 4 | chr2 >> 4;
                enc3 = (chr2 & 15) << 2 | chr3 >> 6;
                enc4 = chr3 & 63;
                if (isNaN(chr2)) { enc3 = enc4 = 64 } else if (isNaN(chr3)) { enc4 = 64 }
                output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4)
            }
            return output
        },
        decode: function(input, utf8) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                chr1 = enc1 << 2 | enc2 >> 4;
                chr2 = (enc2 & 15) << 4 | enc3 >> 2;
                chr3 = (enc3 & 3) << 6 | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) { output = output + String.fromCharCode(chr2) }
                if (enc4 != 64) { output = output + String.fromCharCode(chr3) }
            }
            return output
        }
    }
}();
(function() {
    "use strict";
    if (!JSZip) { throw "JSZip not defined" }
    var context = {};
    (function() {
        (function() {
            "use strict";
            var n = void 0,
                u = !0,
                aa = this;

            function ba(e, d) {
                var c = e.split("."),
                    f = aa;
                !(c[0] in f) && f.execScript && f.execScript("var " + c[0]);
                for (var a; c.length && (a = c.shift());) !c.length && d !== n ? f[a] = d : f = f[a] ? f[a] : f[a] = {}
            }
            var C = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array;

            function K(e, d) {
                this.index = "number" === typeof d ? d : 0;
                this.d = 0;
                this.buffer = e instanceof(C ? Uint8Array : Array) ? e : new(C ? Uint8Array : Array)(32768);
                if (2 * this.buffer.length <= this.index) throw Error("invalid index");
                this.buffer.length <= this.index && ca(this)
            }

            function ca(e) {
                var d = e.buffer,
                    c, f = d.length,
                    a = new(C ? Uint8Array : Array)(f << 1);
                if (C) a.set(d);
                else
                    for (c = 0; c < f; ++c) a[c] = d[c];
                return e.buffer = a
            }
            K.prototype.a = function(e, d, c) {
                var f = this.buffer,
                    a = this.index,
                    b = this.d,
                    k = f[a],
                    m;
                c && 1 < d && (e = 8 < d ? (L[e & 255] << 24 | L[e >>> 8 & 255] << 16 | L[e >>> 16 & 255] << 8 | L[e >>> 24 & 255]) >> 32 - d : L[e] >> 8 - d);
                if (8 > d + b) k = k << d | e, b += d;
                else
                    for (m = 0; m < d; ++m) k = k << 1 | e >> d - m - 1 & 1, 8 === ++b && (b = 0, f[a++] = L[k], k = 0, a === f.length && (f = ca(this)));
                f[a] = k;
                this.buffer = f;
                this.d = b;
                this.index = a
            };
            K.prototype.finish = function() {
                var e = this.buffer,
                    d = this.index,
                    c;
                0 < this.d && (e[d] <<= 8 - this.d, e[d] = L[e[d]], d++);
                C ? c = e.subarray(0, d) : (e.length = d, c = e);
                return c
            };
            var ga = new(C ? Uint8Array : Array)(256),
                M;
            for (M = 0; 256 > M; ++M) {
                for (var R = M, S = R, ha = 7, R = R >>> 1; R; R >>>= 1) S <<= 1, S |= R & 1, --ha;
                ga[M] = (S << ha & 255) >>> 0
            }
            var L = ga;

            function ja(e) {
                this.buffer = new(C ? Uint16Array : Array)(2 * e);
                this.length = 0
            }
            ja.prototype.getParent = function(e) { return 2 * ((e - 2) / 4 | 0) };
            ja.prototype.push = function(e, d) {
                var c, f, a = this.buffer,
                    b;
                c = this.length;
                a[this.length++] = d;
                for (a[this.length++] = e; 0 < c;)
                    if (f = this.getParent(c), a[c] > a[f]) b = a[c], a[c] = a[f], a[f] = b, b = a[c + 1], a[c + 1] = a[f + 1], a[f + 1] = b, c = f;
                    else break;
                return this.length
            };
            ja.prototype.pop = function() {
                var e, d, c = this.buffer,
                    f, a, b;
                d = c[0];
                e = c[1];
                this.length -= 2;
                c[0] = c[this.length];
                c[1] = c[this.length + 1];
                for (b = 0;;) {
                    a = 2 * b + 2;
                    if (a >= this.length) break;
                    a + 2 < this.length && c[a + 2] > c[a] && (a += 2);
                    if (c[a] > c[b]) f = c[b], c[b] = c[a], c[a] = f, f = c[b + 1], c[b + 1] = c[a + 1], c[a + 1] = f;
                    else break;
                    b = a
                }
                return { index: e, value: d, length: this.length }
            };

            function ka(e, d) {
                this.e = ma;
                this.f = 0;
                this.input = C && e instanceof Array ? new Uint8Array(e) : e;
                this.c = 0;
                d && (d.lazy && (this.f = d.lazy), "number" === typeof d.compressionType && (this.e = d.compressionType), d.outputBuffer && (this.b = C && d.outputBuffer instanceof Array ? new Uint8Array(d.outputBuffer) : d.outputBuffer), "number" === typeof d.outputIndex && (this.c = d.outputIndex));
                this.b || (this.b = new(C ? Uint8Array : Array)(32768))
            }
            var ma = 2,
                T = [],
                U;
            for (U = 0; 288 > U; U++) switch (u) {
                case 143 >= U:
                    T.push([U + 48, 8]);
                    break;
                case 255 >= U:
                    T.push([U - 144 + 400, 9]);
                    break;
                case 279 >= U:
                    T.push([U - 256 + 0, 7]);
                    break;
                case 287 >= U:
                    T.push([U - 280 + 192, 8]);
                    break;
                default:
                    throw "invalid literal: " + U
            }
            ka.prototype.h = function() {
                var e, d, c, f, a = this.input;
                switch (this.e) {
                    case 0:
                        c = 0;
                        for (f = a.length; c < f;) {
                            d = C ? a.subarray(c, c + 65535) : a.slice(c, c + 65535);
                            c += d.length;
                            var b = d,
                                k = c === f,
                                m = n,
                                g = n,
                                p = n,
                                v = n,
                                x = n,
                                l = this.b,
                                h = this.c;
                            if (C) {
                                for (l = new Uint8Array(this.b.buffer); l.length <= h + b.length + 5;) l = new Uint8Array(l.length << 1);
                                l.set(this.b)
                            }
                            m = k ? 1 : 0;
                            l[h++] = m | 0;
                            g = b.length;
                            p = ~g + 65536 & 65535;
                            l[h++] = g & 255;
                            l[h++] = g >>> 8 & 255;
                            l[h++] = p & 255;
                            l[h++] = p >>> 8 & 255;
                            if (C) l.set(b, h), h += b.length, l = l.subarray(0, h);
                            else {
                                v = 0;
                                for (x = b.length; v < x; ++v) l[h++] = b[v];
                                l.length = h
                            }
                            this.c = h;
                            this.b = l
                        }
                        break;
                    case 1:
                        var q = new K(C ? new Uint8Array(this.b.buffer) : this.b, this.c);
                        q.a(1, 1, u);
                        q.a(1, 2, u);
                        var t = na(this, a),
                            w, da, z;
                        w = 0;
                        for (da = t.length; w < da; w++)
                            if (z = t[w], K.prototype.a.apply(q, T[z]), 256 < z) q.a(t[++w], t[++w], u), q.a(t[++w], 5), q.a(t[++w], t[++w], u);
                            else if (256 === z) break;
                        this.b = q.finish();
                        this.c = this.b.length;
                        break;
                    case ma:
                        var B = new K(C ? new Uint8Array(this.b.buffer) : this.b, this.c),
                            ra, J, N, O, P, Ia = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
                            W, sa, X, ta, ea, ia = Array(19),
                            ua, Q, fa, y, va;
                        ra = ma;
                        B.a(1, 1, u);
                        B.a(ra, 2, u);
                        J = na(this, a);
                        W = oa(this.j, 15);
                        sa = pa(W);
                        X = oa(this.i, 7);
                        ta = pa(X);
                        for (N = 286; 257 < N && 0 === W[N - 1]; N--);
                        for (O = 30; 1 < O && 0 === X[O - 1]; O--);
                        var wa = N,
                            xa = O,
                            F = new(C ? Uint32Array : Array)(wa + xa),
                            r, G, s, Y, E = new(C ? Uint32Array : Array)(316),
                            D, A, H = new(C ? Uint8Array : Array)(19);
                        for (r = G = 0; r < wa; r++) F[G++] = W[r];
                        for (r = 0; r < xa; r++) F[G++] = X[r];
                        if (!C) { r = 0; for (Y = H.length; r < Y; ++r) H[r] = 0 }
                        r = D = 0;
                        for (Y = F.length; r < Y; r += G) {
                            for (G = 1; r + G < Y && F[r + G] === F[r]; ++G);
                            s = G;
                            if (0 === F[r])
                                if (3 > s)
                                    for (; 0 < s--;) E[D++] = 0, H[0]++;
                                else
                                    for (; 0 < s;) A = 138 > s ? s : 138, A > s - 3 && A < s && (A = s - 3), 10 >= A ? (E[D++] = 17, E[D++] = A - 3, H[17]++) : (E[D++] = 18, E[D++] = A - 11, H[18]++), s -= A;
                            else if (E[D++] = F[r], H[F[r]]++, s--, 3 > s)
                                for (; 0 < s--;) E[D++] = F[r], H[F[r]]++;
                            else
                                for (; 0 < s;) A = 6 > s ? s : 6, A > s - 3 && A < s && (A = s - 3), E[D++] = 16, E[D++] = A - 3, H[16]++, s -= A
                        }
                        e = C ? E.subarray(0, D) : E.slice(0, D);
                        ea = oa(H, 7);
                        for (y = 0; 19 > y; y++) ia[y] = ea[Ia[y]];
                        for (P = 19; 4 < P && 0 === ia[P - 1]; P--);
                        ua = pa(ea);
                        B.a(N - 257, 5, u);
                        B.a(O - 1, 5, u);
                        B.a(P - 4, 4, u);
                        for (y = 0; y < P; y++) B.a(ia[y], 3, u);
                        y = 0;
                        for (va = e.length; y < va; y++)
                            if (Q = e[y], B.a(ua[Q], ea[Q], u), 16 <= Q) {
                                y++;
                                switch (Q) {
                                    case 16:
                                        fa = 2;
                                        break;
                                    case 17:
                                        fa = 3;
                                        break;
                                    case 18:
                                        fa = 7;
                                        break;
                                    default:
                                        throw "invalid code: " + Q
                                }
                                B.a(e[y], fa, u)
                            }
                        var ya = [sa, W],
                            za = [ta, X],
                            I, Aa, Z, la, Ba, Ca, Da, Ea;
                        Ba = ya[0];
                        Ca = ya[1];
                        Da = za[0];
                        Ea = za[1];
                        I = 0;
                        for (Aa = J.length; I < Aa; ++I)
                            if (Z = J[I], B.a(Ba[Z], Ca[Z], u), 256 < Z) B.a(J[++I], J[++I], u), la = J[++I], B.a(Da[la], Ea[la], u), B.a(J[++I], J[++I], u);
                            else if (256 === Z) break;
                        this.b = B.finish();
                        this.c = this.b.length;
                        break;
                    default:
                        throw "invalid compression type"
                }
                return this.b
            };

            function qa(e, d) {
                this.length = e;
                this.g = d
            }
            var Fa = function() {
                    function e(a) {
                        switch (u) {
                            case 3 === a:
                                return [257, a - 3, 0];
                            case 4 === a:
                                return [258, a - 4, 0];
                            case 5 === a:
                                return [259, a - 5, 0];
                            case 6 === a:
                                return [260, a - 6, 0];
                            case 7 === a:
                                return [261, a - 7, 0];
                            case 8 === a:
                                return [262, a - 8, 0];
                            case 9 === a:
                                return [263, a - 9, 0];
                            case 10 === a:
                                return [264, a - 10, 0];
                            case 12 >= a:
                                return [265, a - 11, 1];
                            case 14 >= a:
                                return [266, a - 13, 1];
                            case 16 >= a:
                                return [267, a - 15, 1];
                            case 18 >= a:
                                return [268, a - 17, 1];
                            case 22 >= a:
                                return [269, a - 19, 2];
                            case 26 >= a:
                                return [270, a - 23, 2];
                            case 30 >= a:
                                return [271, a - 27, 2];
                            case 34 >= a:
                                return [272, a - 31, 2];
                            case 42 >= a:
                                return [273, a - 35, 3];
                            case 50 >= a:
                                return [274, a - 43, 3];
                            case 58 >= a:
                                return [275, a - 51, 3];
                            case 66 >= a:
                                return [276, a - 59, 3];
                            case 82 >= a:
                                return [277, a - 67, 4];
                            case 98 >= a:
                                return [278, a - 83, 4];
                            case 114 >= a:
                                return [279, a - 99, 4];
                            case 130 >= a:
                                return [280, a - 115, 4];
                            case 162 >= a:
                                return [281, a - 131, 5];
                            case 194 >= a:
                                return [282, a - 163, 5];
                            case 226 >= a:
                                return [283, a - 195, 5];
                            case 257 >= a:
                                return [284, a - 227, 5];
                            case 258 === a:
                                return [285, a - 258, 0];
                            default:
                                throw "invalid length: " + a
                        }
                    }
                    var d = [],
                        c, f;
                    for (c = 3; 258 >= c; c++) f = e(c), d[c] = f[2] << 24 | f[1] << 16 | f[0];
                    return d
                }(),
                Ga = C ? new Uint32Array(Fa) : Fa;

            function na(e, d) {
                function c(a, c) {
                    var b = a.g,
                        d = [],
                        f = 0,
                        e;
                    e = Ga[a.length];
                    d[f++] = e & 65535;
                    d[f++] = e >> 16 & 255;
                    d[f++] = e >> 24;
                    var g;
                    switch (u) {
                        case 1 === b:
                            g = [0, b - 1, 0];
                            break;
                        case 2 === b:
                            g = [1, b - 2, 0];
                            break;
                        case 3 === b:
                            g = [2, b - 3, 0];
                            break;
                        case 4 === b:
                            g = [3, b - 4, 0];
                            break;
                        case 6 >= b:
                            g = [4, b - 5, 1];
                            break;
                        case 8 >= b:
                            g = [5, b - 7, 1];
                            break;
                        case 12 >= b:
                            g = [6, b - 9, 2];
                            break;
                        case 16 >= b:
                            g = [7, b - 13, 2];
                            break;
                        case 24 >= b:
                            g = [8, b - 17, 3];
                            break;
                        case 32 >= b:
                            g = [9, b - 25, 3];
                            break;
                        case 48 >= b:
                            g = [10, b - 33, 4];
                            break;
                        case 64 >= b:
                            g = [11, b - 49, 4];
                            break;
                        case 96 >= b:
                            g = [12, b - 65, 5];
                            break;
                        case 128 >= b:
                            g = [13, b - 97, 5];
                            break;
                        case 192 >= b:
                            g = [14, b - 129, 6];
                            break;
                        case 256 >= b:
                            g = [15, b - 193, 6];
                            break;
                        case 384 >= b:
                            g = [16, b - 257, 7];
                            break;
                        case 512 >= b:
                            g = [17, b - 385, 7];
                            break;
                        case 768 >= b:
                            g = [18, b - 513, 8];
                            break;
                        case 1024 >= b:
                            g = [19, b - 769, 8];
                            break;
                        case 1536 >= b:
                            g = [20, b - 1025, 9];
                            break;
                        case 2048 >= b:
                            g = [21, b - 1537, 9];
                            break;
                        case 3072 >= b:
                            g = [22, b - 2049, 10];
                            break;
                        case 4096 >= b:
                            g = [23, b - 3073, 10];
                            break;
                        case 6144 >= b:
                            g = [24, b - 4097, 11];
                            break;
                        case 8192 >= b:
                            g = [25, b - 6145, 11];
                            break;
                        case 12288 >= b:
                            g = [26, b - 8193, 12];
                            break;
                        case 16384 >= b:
                            g = [27, b - 12289, 12];
                            break;
                        case 24576 >= b:
                            g = [28, b - 16385, 13];
                            break;
                        case 32768 >= b:
                            g = [29, b - 24577, 13];
                            break;
                        default:
                            throw "invalid distance"
                    }
                    e = g;
                    d[f++] = e[0];
                    d[f++] = e[1];
                    d[f++] = e[2];
                    var k, m;
                    k = 0;
                    for (m = d.length; k < m; ++k) l[h++] = d[k];
                    t[d[0]]++;
                    w[d[3]]++;
                    q = a.length + c - 1;
                    x = null
                }
                var f, a, b, k, m, g = {},
                    p, v, x, l = C ? new Uint16Array(2 * d.length) : [],
                    h = 0,
                    q = 0,
                    t = new(C ? Uint32Array : Array)(286),
                    w = new(C ? Uint32Array : Array)(30),
                    da = e.f,
                    z;
                if (!C) { for (b = 0; 285 >= b;) t[b++] = 0; for (b = 0; 29 >= b;) w[b++] = 0 }
                t[256] = 1;
                f = 0;
                for (a = d.length; f < a; ++f) {
                    b = m = 0;
                    for (k = 3; b < k && f + b !== a; ++b) m = m << 8 | d[f + b];
                    g[m] === n && (g[m] = []);
                    p = g[m];
                    if (!(0 < q--)) {
                        for (; 0 < p.length && 32768 < f - p[0];) p.shift();
                        if (f + 3 >= a) {
                            x && c(x, -1);
                            b = 0;
                            for (k = a - f; b < k; ++b) z = d[f + b], l[h++] = z, ++t[z];
                            break
                        }
                        0 < p.length ? (v = Ha(d, f, p), x ? x.length < v.length ? (z = d[f - 1], l[h++] = z, ++t[z], c(v, 0)) : c(x, -1) : v.length < da ? x = v : c(v, 0)) : x ? c(x, -1) : (z = d[f], l[h++] = z, ++t[z])
                    }
                    p.push(f)
                }
                l[h++] = 256;
                t[256]++;
                e.j = t;
                e.i = w;
                return C ? l.subarray(0, h) : l
            }

            function Ha(e, d, c) {
                var f, a, b = 0,
                    k, m, g, p, v = e.length;
                m = 0;
                p = c.length;
                a: for (; m < p; m++) {
                    f = c[p - m - 1];
                    k = 3;
                    if (3 < b) {
                        for (g = b; 3 < g; g--)
                            if (e[f + g - 1] !== e[d + g - 1]) continue a;
                        k = b
                    }
                    for (; 258 > k && d + k < v && e[f + k] === e[d + k];) ++k;
                    k > b && (a = f, b = k);
                    if (258 === k) break
                }
                return new qa(b, d - a)
            }

            function oa(e, d) {
                var c = e.length,
                    f = new ja(572),
                    a = new(C ? Uint8Array : Array)(c),
                    b, k, m, g, p;
                if (!C)
                    for (g = 0; g < c; g++) a[g] = 0;
                for (g = 0; g < c; ++g) 0 < e[g] && f.push(g, e[g]);
                b = Array(f.length / 2);
                k = new(C ? Uint32Array : Array)(f.length / 2);
                if (1 === b.length) return a[f.pop().index] = 1, a;
                g = 0;
                for (p = f.length / 2; g < p; ++g) b[g] = f.pop(), k[g] = b[g].value;
                m = Ja(k, k.length, d);
                g = 0;
                for (p = b.length; g < p; ++g) a[b[g].index] = m[g];
                return a
            }

            function Ja(e, d, c) {
                function f(a) {
                    var b = g[a][p[a]];
                    b === d ? (f(a + 1), f(a + 1)) : --k[b];
                    ++p[a]
                }
                var a = new(C ? Uint16Array : Array)(c),
                    b = new(C ? Uint8Array : Array)(c),
                    k = new(C ? Uint8Array : Array)(d),
                    m = Array(c),
                    g = Array(c),
                    p = Array(c),
                    v = (1 << c) - d,
                    x = 1 << c - 1,
                    l, h, q, t, w;
                a[c - 1] = d;
                for (h = 0; h < c; ++h) v < x ? b[h] = 0 : (b[h] = 1, v -= x), v <<= 1, a[c - 2 - h] = (a[c - 1 - h] / 2 | 0) + d;
                a[0] = b[0];
                m[0] = Array(a[0]);
                g[0] = Array(a[0]);
                for (h = 1; h < c; ++h) a[h] > 2 * a[h - 1] + b[h] && (a[h] = 2 * a[h - 1] + b[h]), m[h] = Array(a[h]), g[h] = Array(a[h]);
                for (l = 0; l < d; ++l) k[l] = c;
                for (q = 0; q < a[c - 1]; ++q) m[c - 1][q] = e[q], g[c - 1][q] = q;
                for (l = 0; l < c; ++l) p[l] = 0;
                1 === b[c - 1] && (--k[0], ++p[c - 1]);
                for (h = c - 2; 0 <= h; --h) {
                    t = l = 0;
                    w = p[h + 1];
                    for (q = 0; q < a[h]; q++) t = m[h + 1][w] + m[h + 1][w + 1], t > e[l] ? (m[h][q] = t, g[h][q] = d, w += 2) : (m[h][q] = e[l], g[h][q] = l, ++l);
                    p[h] = 0;
                    1 === b[h] && f(h)
                }
                return k
            }

            function pa(e) {
                var d = new(C ? Uint16Array : Array)(e.length),
                    c = [],
                    f = [],
                    a = 0,
                    b, k, m, g;
                b = 0;
                for (k = e.length; b < k; b++) c[e[b]] = (c[e[b]] | 0) + 1;
                b = 1;
                for (k = 16; b <= k; b++) f[b] = a, a += c[b] | 0, a <<= 1;
                b = 0;
                for (k = e.length; b < k; b++) {
                    a = f[e[b]];
                    f[e[b]] += 1;
                    m = d[b] = 0;
                    for (g = e[b]; m < g; m++) d[b] = d[b] << 1 | a & 1, a >>>= 1
                }
                return d
            }
            ba("Zlib.RawDeflate", ka);
            ba("Zlib.RawDeflate.prototype.compress", ka.prototype.h);
            var Ka = { NONE: 0, FIXED: 1, DYNAMIC: ma },
                V, La, $, Ma;
            if (Object.keys) V = Object.keys(Ka);
            else
                for (La in V = [], $ = 0, Ka) V[$++] = La;
            $ = 0;
            for (Ma = V.length; $ < Ma; ++$) La = V[$], ba("Zlib.RawDeflate.CompressionType." + La, Ka[La])
        }).call(this)
    }).call(context);
    var compress = function(input) { var deflate = new context.Zlib.RawDeflate(input); return deflate.compress() };
    var USE_TYPEDARRAY = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Uint32Array !== "undefined";
    if (!JSZip.compressions["DEFLATE"]) {
        JSZip.compressions["DEFLATE"] = { magic: "\b\x00", compress: compress, compressInputType: USE_TYPEDARRAY ? "uint8array" : "array" }
    } else {
        JSZip.compressions["DEFLATE"].compress = compress;
        JSZip.compressions["DEFLATE"].compressInputType = USE_TYPEDARRAY ? "uint8array" : "array"
    }
})();
(function() {
    "use strict";
    if (!JSZip) { throw "JSZip not defined" }
    var context = {};
    (function() {
        (function() {
            "use strict";
            var l = void 0,
                p = this;

            function q(c, d) {
                var a = c.split("."),
                    b = p;
                !(a[0] in b) && b.execScript && b.execScript("var " + a[0]);
                for (var e; a.length && (e = a.shift());) !a.length && d !== l ? b[e] = d : b = b[e] ? b[e] : b[e] = {}
            }
            var r = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array;

            function u(c) {
                var d = c.length,
                    a = 0,
                    b = Number.POSITIVE_INFINITY,
                    e, f, g, h, k, m, s, n, t;
                for (n = 0; n < d; ++n) c[n] > a && (a = c[n]), c[n] < b && (b = c[n]);
                e = 1 << a;
                f = new(r ? Uint32Array : Array)(e);
                g = 1;
                h = 0;
                for (k = 2; g <= a;) {
                    for (n = 0; n < d; ++n)
                        if (c[n] === g) {
                            m = 0;
                            s = h;
                            for (t = 0; t < g; ++t) m = m << 1 | s & 1, s >>= 1;
                            for (t = m; t < e; t += k) f[t] = g << 16 | n;
                            ++h
                        }++g;
                    h <<= 1;
                    k <<= 1
                }
                return [f, a, b]
            }

            function v(c, d) {
                this.g = [];
                this.h = 32768;
                this.c = this.f = this.d = this.k = 0;
                this.input = r ? new Uint8Array(c) : c;
                this.l = !1;
                this.i = w;
                this.p = !1;
                if (d || !(d = {})) d.index && (this.d = d.index), d.bufferSize && (this.h = d.bufferSize), d.bufferType && (this.i = d.bufferType), d.resize && (this.p = d.resize);
                switch (this.i) {
                    case x:
                        this.a = 32768;
                        this.b = new(r ? Uint8Array : Array)(32768 + this.h + 258);
                        break;
                    case w:
                        this.a = 0;
                        this.b = new(r ? Uint8Array : Array)(this.h);
                        this.e = this.u;
                        this.m = this.r;
                        this.j = this.s;
                        break;
                    default:
                        throw Error("invalid inflate mode")
                }
            }
            var x = 0,
                w = 1;
            v.prototype.t = function() {
                for (; !this.l;) {
                    var c = y(this, 3);
                    c & 1 && (this.l = !0);
                    c >>>= 1;
                    switch (c) {
                        case 0:
                            var d = this.input,
                                a = this.d,
                                b = this.b,
                                e = this.a,
                                f = l,
                                g = l,
                                h = l,
                                k = b.length,
                                m = l;
                            this.c = this.f = 0;
                            f = d[a++];
                            if (f === l) throw Error("invalid uncompressed block header: LEN (first byte)");
                            g = f;
                            f = d[a++];
                            if (f === l) throw Error("invalid uncompressed block header: LEN (second byte)");
                            g |= f << 8;
                            f = d[a++];
                            if (f === l) throw Error("invalid uncompressed block header: NLEN (first byte)");
                            h = f;
                            f = d[a++];
                            if (f === l) throw Error("invalid uncompressed block header: NLEN (second byte)");
                            h |= f << 8;
                            if (g === ~h) throw Error("invalid uncompressed block header: length verify");
                            if (a + g > d.length) throw Error("input buffer is broken");
                            switch (this.i) {
                                case x:
                                    for (; e + g > b.length;) {
                                        m = k - e;
                                        g -= m;
                                        if (r) b.set(d.subarray(a, a + m), e), e += m, a += m;
                                        else
                                            for (; m--;) b[e++] = d[a++];
                                        this.a = e;
                                        b = this.e();
                                        e = this.a
                                    }
                                    break;
                                case w:
                                    for (; e + g > b.length;) b = this.e({ o: 2 });
                                    break;
                                default:
                                    throw Error("invalid inflate mode")
                            }
                            if (r) b.set(d.subarray(a, a + g), e), e += g, a += g;
                            else
                                for (; g--;) b[e++] = d[a++];
                            this.d = a;
                            this.a = e;
                            this.b = b;
                            break;
                        case 1:
                            this.j(z, A);
                            break;
                        case 2:
                            B(this);
                            break;
                        default:
                            throw Error("unknown BTYPE: " + c)
                    }
                }
                return this.m()
            };
            var C = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
                D = r ? new Uint16Array(C) : C,
                E = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258],
                F = r ? new Uint16Array(E) : E,
                G = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0],
                H = r ? new Uint8Array(G) : G,
                I = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577],
                J = r ? new Uint16Array(I) : I,
                K = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13],
                L = r ? new Uint8Array(K) : K,
                M = new(r ? Uint8Array : Array)(288),
                N, O;
            N = 0;
            for (O = M.length; N < O; ++N) M[N] = 143 >= N ? 8 : 255 >= N ? 9 : 279 >= N ? 7 : 8;
            var z = u(M),
                P = new(r ? Uint8Array : Array)(30),
                Q, R;
            Q = 0;
            for (R = P.length; Q < R; ++Q) P[Q] = 5;
            var A = u(P);

            function y(c, d) {
                for (var a = c.f, b = c.c, e = c.input, f = c.d, g; b < d;) {
                    g = e[f++];
                    if (g === l) throw Error("input buffer is broken");
                    a |= g << b;
                    b += 8
                }
                g = a & (1 << d) - 1;
                c.f = a >>> d;
                c.c = b - d;
                c.d = f;
                return g
            }

            function S(c, d) {
                for (var a = c.f, b = c.c, e = c.input, f = c.d, g = d[0], h = d[1], k, m, s; b < h;) {
                    k = e[f++];
                    if (k === l) break;
                    a |= k << b;
                    b += 8
                }
                m = g[a & (1 << h) - 1];
                s = m >>> 16;
                c.f = a >> s;
                c.c = b - s;
                c.d = f;
                return m & 65535
            }

            function B(c) {
                function d(a, c, b) {
                    var d, f, e, g;
                    for (g = 0; g < a;) switch (d = S(this, c), d) {
                        case 16:
                            for (e = 3 + y(this, 2); e--;) b[g++] = f;
                            break;
                        case 17:
                            for (e = 3 + y(this, 3); e--;) b[g++] = 0;
                            f = 0;
                            break;
                        case 18:
                            for (e = 11 + y(this, 7); e--;) b[g++] = 0;
                            f = 0;
                            break;
                        default:
                            f = b[g++] = d
                    }
                    return b
                }
                var a = y(c, 5) + 257,
                    b = y(c, 5) + 1,
                    e = y(c, 4) + 4,
                    f = new(r ? Uint8Array : Array)(D.length),
                    g, h, k, m;
                for (m = 0; m < e; ++m) f[D[m]] = y(c, 3);
                g = u(f);
                h = new(r ? Uint8Array : Array)(a);
                k = new(r ? Uint8Array : Array)(b);
                c.j(u(d.call(c, a, g, h)), u(d.call(c, b, g, k)))
            }
            v.prototype.j = function(c, d) {
                var a = this.b,
                    b = this.a;
                this.n = c;
                for (var e = a.length - 258, f, g, h, k; 256 !== (f = S(this, c));)
                    if (256 > f) b >= e && (this.a = b, a = this.e(), b = this.a), a[b++] = f;
                    else {
                        g = f - 257;
                        k = F[g];
                        0 < H[g] && (k += y(this, H[g]));
                        f = S(this, d);
                        h = J[f];
                        0 < L[f] && (h += y(this, L[f]));
                        b >= e && (this.a = b, a = this.e(), b = this.a);
                        for (; k--;) a[b] = a[b++ - h]
                    }
                for (; 8 <= this.c;) this.c -= 8, this.d--;
                this.a = b
            };
            v.prototype.s = function(c, d) {
                var a = this.b,
                    b = this.a;
                this.n = c;
                for (var e = a.length, f, g, h, k; 256 !== (f = S(this, c));)
                    if (256 > f) b >= e && (a = this.e(), e = a.length), a[b++] = f;
                    else {
                        g = f - 257;
                        k = F[g];
                        0 < H[g] && (k += y(this, H[g]));
                        f = S(this, d);
                        h = J[f];
                        0 < L[f] && (h += y(this, L[f]));
                        b + k > e && (a = this.e(), e = a.length);
                        for (; k--;) a[b] = a[b++ - h]
                    }
                for (; 8 <= this.c;) this.c -= 8, this.d--;
                this.a = b
            };
            v.prototype.e = function() {
                var c = new(r ? Uint8Array : Array)(this.a - 32768),
                    d = this.a - 32768,
                    a, b, e = this.b;
                if (r) c.set(e.subarray(32768, c.length));
                else { a = 0; for (b = c.length; a < b; ++a) c[a] = e[a + 32768] }
                this.g.push(c);
                this.k += c.length;
                if (r) e.set(e.subarray(d, d + 32768));
                else
                    for (a = 0; 32768 > a; ++a) e[a] = e[d + a];
                this.a = 32768;
                return e
            };
            v.prototype.u = function(c) {
                var d, a = this.input.length / this.d + 1 | 0,
                    b, e, f, g = this.input,
                    h = this.b;
                c && ("number" === typeof c.o && (a = c.o), "number" === typeof c.q && (a += c.q));
                2 > a ? (b = (g.length - this.d) / this.n[2], f = 258 * (b / 2) | 0, e = f < h.length ? h.length + f : h.length << 1) : e = h.length * a;
                r ? (d = new Uint8Array(e), d.set(h)) : d = h;
                return this.b = d
            };
            v.prototype.m = function() {
                var c = 0,
                    d = this.b,
                    a = this.g,
                    b, e = new(r ? Uint8Array : Array)(this.k + (this.a - 32768)),
                    f, g, h, k;
                if (0 === a.length) return r ? this.b.subarray(32768, this.a) : this.b.slice(32768, this.a);
                f = 0;
                for (g = a.length; f < g; ++f) {
                    b = a[f];
                    h = 0;
                    for (k = b.length; h < k; ++h) e[c++] = b[h]
                }
                f = 32768;
                for (g = this.a; f < g; ++f) e[c++] = d[f];
                this.g = [];
                return this.buffer = e
            };
            v.prototype.r = function() {
                var c, d = this.a;
                r ? this.p ? (c = new Uint8Array(d), c.set(this.b.subarray(0, d))) : c = this.b.subarray(0, d) : (this.b.length > d && (this.b.length = d), c = this.b);
                return this.buffer = c
            };
            q("Zlib.RawInflate", v);
            q("Zlib.RawInflate.prototype.decompress", v.prototype.t);
            var T = { ADAPTIVE: w, BLOCK: x },
                U, V, W, X;
            if (Object.keys) U = Object.keys(T);
            else
                for (V in U = [], W = 0, T) U[W++] = V;
            W = 0;
            for (X = U.length; W < X; ++W) V = U[W], q("Zlib.RawInflate.BufferType." + V, T[V])
        }).call(this)
    }).call(context);
    var uncompress = function(input) { var inflate = new context.Zlib.RawInflate(input); return inflate.decompress() };
    var USE_TYPEDARRAY = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Uint32Array !== "undefined";
    if (!JSZip.compressions["DEFLATE"]) { JSZip.compressions["DEFLATE"] = { magic: "\b\x00", uncompress: uncompress, uncompressInputType: USE_TYPEDARRAY ? "uint8array" : "array" } } else {
        JSZip.compressions["DEFLATE"].uncompress = uncompress;
        JSZip.compressions["DEFLATE"].uncompressInputType = USE_TYPEDARRAY ? "uint8array" : "array"
    }
})();
(function(root) {
    "use strict";
    var MAX_VALUE_16BITS = 65535;
    var MAX_VALUE_32BITS = -1;
    var pretty = function(str) {
        var res = "",
            code, i;
        for (i = 0; i < (str || "").length; i++) {
            code = str.charCodeAt(i);
            res += "\\x" + (code < 16 ? "0" : "") + code.toString(16).toUpperCase()
        }
        return res
    };
    var findCompression = function(compressionMethod) { for (var method in JSZip.compressions) { if (!JSZip.compressions.hasOwnProperty(method)) { continue } if (JSZip.compressions[method].magic === compressionMethod) { return JSZip.compressions[method] } } return null };

    function DataReader(data) {
        this.data = null;
        this.length = 0;
        this.index = 0
    }
    DataReader.prototype = {
        checkOffset: function(offset) { this.checkIndex(this.index + offset) },
        checkIndex: function(newIndex) { if (this.length < newIndex || newIndex < 0) { throw new Error("End of data reached (data length = " + this.length + ", asked index = " + newIndex + "). Corrupted zip ?") } },
        setIndex: function(newIndex) {
            this.checkIndex(newIndex);
            this.index = newIndex
        },
        skip: function(n) { this.setIndex(this.index + n) },
        byteAt: function(i) {},
        readInt: function(size) {
            var result = 0,
                i;
            this.checkOffset(size);
            for (i = this.index + size - 1; i >= this.index; i--) { result = (result << 8) + this.byteAt(i) }
            this.index += size;
            return result
        },
        readString: function(size) { return JSZip.utils.transformTo("string", this.readData(size)) },
        readData: function(size) {},
        lastIndexOfSignature: function(sig) {},
        readDate: function() { var dostime = this.readInt(4); return new Date((dostime >> 25 & 127) + 1980, (dostime >> 21 & 15) - 1, dostime >> 16 & 31, dostime >> 11 & 31, dostime >> 5 & 63, (dostime & 31) << 1) }
    };

    function StringReader(data, optimizedBinaryString) {
        this.data = data;
        if (!optimizedBinaryString) { this.data = JSZip.utils.string2binary(this.data) }
        this.length = this.data.length;
        this.index = 0
    }
    StringReader.prototype = new DataReader;
    StringReader.prototype.byteAt = function(i) { return this.data.charCodeAt(i) };
    StringReader.prototype.lastIndexOfSignature = function(sig) { return this.data.lastIndexOf(sig) };
    StringReader.prototype.readData = function(size) {
        this.checkOffset(size);
        var result = this.data.slice(this.index, this.index + size);
        this.index += size;
        return result
    };

    function Uint8ArrayReader(data) {
        if (data) {
            this.data = data;
            this.length = this.data.length;
            this.index = 0
        }
    }
    Uint8ArrayReader.prototype = new DataReader;
    Uint8ArrayReader.prototype.byteAt = function(i) { return this.data[i] };
    Uint8ArrayReader.prototype.lastIndexOfSignature = function(sig) {
        var sig0 = sig.charCodeAt(0),
            sig1 = sig.charCodeAt(1),
            sig2 = sig.charCodeAt(2),
            sig3 = sig.charCodeAt(3);
        for (var i = this.length - 4; i >= 0; --i) { if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) { return i } }
        return -1
    };
    Uint8ArrayReader.prototype.readData = function(size) {
        this.checkOffset(size);
        var result = this.data.subarray(this.index, this.index + size);
        this.index += size;
        return result
    };

    function NodeBufferReader(data) {
        this.data = data;
        this.length = this.data.length;
        this.index = 0
    }
    NodeBufferReader.prototype = new Uint8ArrayReader;
    NodeBufferReader.prototype.readData = function(size) {
        this.checkOffset(size);
        var result = this.data.slice(this.index, this.index + size);
        this.index += size;
        return result
    };

    function ZipEntry(options, loadOptions) {
        this.options = options;
        this.loadOptions = loadOptions
    }
    ZipEntry.prototype = {
        isEncrypted: function() { return (this.bitFlag & 1) === 1 },
        useUTF8: function() { return (this.bitFlag & 2048) === 2048 },
        prepareCompressedContent: function(reader, from, length) {
            return function() {
                var previousIndex = reader.index;
                reader.setIndex(from);
                var compressedFileData = reader.readData(length);
                reader.setIndex(previousIndex);
                return compressedFileData
            }
        },
        prepareContent: function(reader, from, length, compression, uncompressedSize) { return function() { var compressedFileData = JSZip.utils.transformTo(compression.uncompressInputType, this.getCompressedContent()); var uncompressedFileData = compression.uncompress(compressedFileData); if (uncompressedFileData.length !== uncompressedSize) { throw new Error("Bug : uncompressed data size mismatch") } return uncompressedFileData } },
        readLocalPart: function(reader) {
            var compression, localExtraFieldsLength;
            reader.skip(22);
            this.fileNameLength = reader.readInt(2);
            localExtraFieldsLength = reader.readInt(2);
            this.fileName = reader.readString(this.fileNameLength);
            reader.skip(localExtraFieldsLength);
            if (this.compressedSize == -1 || this.uncompressedSize == -1) { throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory " + "(compressedSize == -1 || uncompressedSize == -1)") }
            compression = findCompression(this.compressionMethod);
            if (compression === null) { throw new Error("Corrupted zip : compression " + pretty(this.compressionMethod) + " unknown (inner file : " + this.fileName + ")") }
            this.decompressed = new JSZip.CompressedObject;
            this.decompressed.compressedSize = this.compressedSize;
            this.decompressed.uncompressedSize = this.uncompressedSize;
            this.decompressed.crc32 = this.crc32;
            this.decompressed.compressionMethod = this.compressionMethod;
            this.decompressed.getCompressedContent = this.prepareCompressedContent(reader, reader.index, this.compressedSize, compression);
            this.decompressed.getContent = this.prepareContent(reader, reader.index, this.compressedSize, compression, this.uncompressedSize);
            if (this.loadOptions.checkCRC32) { this.decompressed = JSZip.utils.transformTo("string", this.decompressed.getContent()); if (JSZip.prototype.crc32(this.decompressed) !== this.crc32) { throw new Error("Corrupted zip : CRC32 mismatch") } }
        },
        readCentralPart: function(reader) {
            this.versionMadeBy = reader.readString(2);
            this.versionNeeded = reader.readInt(2);
            this.bitFlag = reader.readInt(2);
            this.compressionMethod = reader.readString(2);
            this.date = reader.readDate();
            this.crc32 = reader.readInt(4);
            this.compressedSize = reader.readInt(4);
            this.uncompressedSize = reader.readInt(4);
            this.fileNameLength = reader.readInt(2);
            this.extraFieldsLength = reader.readInt(2);
            this.fileCommentLength = reader.readInt(2);
            this.diskNumberStart = reader.readInt(2);
            this.internalFileAttributes = reader.readInt(2);
            this.externalFileAttributes = reader.readInt(4);
            this.localHeaderOffset = reader.readInt(4);
            if (this.isEncrypted()) { throw new Error("Encrypted zip are not supported") }
            this.fileName = reader.readString(this.fileNameLength);
            this.readExtraFields(reader);
            this.parseZIP64ExtraField(reader);
            this.fileComment = reader.readString(this.fileCommentLength);
            this.dir = this.externalFileAttributes & 16 ? true : false
        },
        parseZIP64ExtraField: function(reader) { if (!this.extraFields[1]) { return } var extraReader = new StringReader(this.extraFields[1].value); if (this.uncompressedSize === MAX_VALUE_32BITS) { this.uncompressedSize = extraReader.readInt(8) } if (this.compressedSize === MAX_VALUE_32BITS) { this.compressedSize = extraReader.readInt(8) } if (this.localHeaderOffset === MAX_VALUE_32BITS) { this.localHeaderOffset = extraReader.readInt(8) } if (this.diskNumberStart === MAX_VALUE_32BITS) { this.diskNumberStart = extraReader.readInt(4) } },
        readExtraFields: function(reader) {
            var start = reader.index,
                extraFieldId, extraFieldLength, extraFieldValue;
            this.extraFields = this.extraFields || {};
            while (reader.index < start + this.extraFieldsLength) {
                extraFieldId = reader.readInt(2);
                extraFieldLength = reader.readInt(2);
                extraFieldValue = reader.readString(extraFieldLength);
                this.extraFields[extraFieldId] = { id: extraFieldId, length: extraFieldLength, value: extraFieldValue }
            }
        },
        handleUTF8: function() {
            if (this.useUTF8()) {
                this.fileName = JSZip.prototype.utf8decode(this.fileName);
                this.fileComment = JSZip.prototype.utf8decode(this.fileComment)
            }
        }
    };

    function ZipEntries(data, loadOptions) {
        this.files = [];
        this.loadOptions = loadOptions;
        if (data) { this.load(data) }
    }
    ZipEntries.prototype = {
        checkSignature: function(expectedSignature) { var signature = this.reader.readString(4); if (signature !== expectedSignature) { throw new Error("Corrupted zip or bug : unexpected signature " + "(" + pretty(signature) + ", expected " + pretty(expectedSignature) + ")") } },
        readBlockEndOfCentral: function() {
            this.diskNumber = this.reader.readInt(2);
            this.diskWithCentralDirStart = this.reader.readInt(2);
            this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
            this.centralDirRecords = this.reader.readInt(2);
            this.centralDirSize = this.reader.readInt(4);
            this.centralDirOffset = this.reader.readInt(4);
            this.zipCommentLength = this.reader.readInt(2);
            this.zipComment = this.reader.readString(this.zipCommentLength)
        },
        readBlockZip64EndOfCentral: function() {
            this.zip64EndOfCentralSize = this.reader.readInt(8);
            this.versionMadeBy = this.reader.readString(2);
            this.versionNeeded = this.reader.readInt(2);
            this.diskNumber = this.reader.readInt(4);
            this.diskWithCentralDirStart = this.reader.readInt(4);
            this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
            this.centralDirRecords = this.reader.readInt(8);
            this.centralDirSize = this.reader.readInt(8);
            this.centralDirOffset = this.reader.readInt(8);
            this.zip64ExtensibleData = {};
            var extraDataSize = this.zip64EndOfCentralSize - 44,
                index = 0,
                extraFieldId, extraFieldLength, extraFieldValue;
            while (index < extraDataSize) {
                extraFieldId = this.reader.readInt(2);
                extraFieldLength = this.reader.readInt(4);
                extraFieldValue = this.reader.readString(extraFieldLength);
                this.zip64ExtensibleData[extraFieldId] = { id: extraFieldId, length: extraFieldLength, value: extraFieldValue }
            }
        },
        readBlockZip64EndOfCentralLocator: function() {
            this.diskWithZip64CentralDirStart = this.reader.readInt(4);
            this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
            this.disksCount = this.reader.readInt(4);
            if (this.disksCount > 1) { throw new Error("Multi-volumes zip are not supported") }
        },
        readLocalFiles: function() {
            var i, file;
            for (i = 0; i < this.files.length; i++) {
                file = this.files[i];
                this.reader.setIndex(file.localHeaderOffset);
                this.checkSignature(JSZip.signature.LOCAL_FILE_HEADER);
                file.readLocalPart(this.reader);
                file.handleUTF8()
            }
        },
        readCentralDir: function() {
            var file;
            this.reader.setIndex(this.centralDirOffset);
            while (this.reader.readString(4) === JSZip.signature.CENTRAL_FILE_HEADER) {
                file = new ZipEntry({ zip64: this.zip64 }, this.loadOptions);
                file.readCentralPart(this.reader);
                this.files.push(file)
            }
        },
        readEndOfCentral: function() {
            var offset = this.reader.lastIndexOfSignature(JSZip.signature.CENTRAL_DIRECTORY_END);
            if (offset === -1) { throw new Error("Corrupted zip : can't find end of central directory") }
            this.reader.setIndex(offset);
            this.checkSignature(JSZip.signature.CENTRAL_DIRECTORY_END);
            this.readBlockEndOfCentral();
            if (this.diskNumber === MAX_VALUE_16BITS || this.diskWithCentralDirStart === MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === MAX_VALUE_16BITS || this.centralDirRecords === MAX_VALUE_16BITS || this.centralDirSize === MAX_VALUE_32BITS || this.centralDirOffset === MAX_VALUE_32BITS) {
                this.zip64 = true;
                offset = this.reader.lastIndexOfSignature(JSZip.signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
                if (offset === -1) { throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator") }
                this.reader.setIndex(offset);
                this.checkSignature(JSZip.signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
                this.readBlockZip64EndOfCentralLocator();
                this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
                this.checkSignature(JSZip.signature.ZIP64_CENTRAL_DIRECTORY_END);
                this.readBlockZip64EndOfCentral()
            }
        },
        prepareReader: function(data) { var type = JSZip.utils.getTypeOf(data); if (type === "string" && !JSZip.support.uint8array) { this.reader = new StringReader(data, this.loadOptions.optimizedBinaryString) } else if (type === "nodebuffer") { this.reader = new NodeBufferReader(data) } else { this.reader = new Uint8ArrayReader(JSZip.utils.transformTo("uint8array", data)) } },
        load: function(data) {
            this.prepareReader(data);
            this.readEndOfCentral();
            this.readCentralDir();
            this.readLocalFiles()
        }
    };
    JSZip.prototype.load = function(data, options) {
        var files, zipEntries, i, input;
        options = options || {};
        if (options.base64) { data = JSZip.base64.decode(data) }
        zipEntries = new ZipEntries(data, options);
        files = zipEntries.files;
        for (i = 0; i < files.length; i++) {
            input = files[i];
            this.file(input.fileName, input.decompressed, { binary: true, optimizedBinaryString: true, date: input.date, dir: input.dir })
        }
        return this
    }
})(this);
if (typeof exports !== "undefined") exports.JSZip = JSZip;
var XLSX = {};
(function(XLSX) {
    XLSX.version = "0.7.7";
    var current_codepage = 1252,
        current_cptable;
    if (typeof module !== "undefined" && typeof require !== "undefined") {
        if (typeof cptable === "undefined") cptable = require("./dist/cpexcel");
        current_cptable = cptable[current_codepage]
    }

    function reset_cp() { set_cp(1252) }

    function set_cp(cp) { current_codepage = cp; if (typeof cptable !== "undefined") current_cptable = cptable[cp] }

    function char_codes(data) { var o = []; for (var i = 0; i != data.length; ++i) o[i] = data.charCodeAt(i); return o }

    function debom_xml(data) { if (typeof cptable !== "undefined") { if (data.charCodeAt(0) === 255 && data.charCodeAt(1) === 254) { return cptable.utils.decode(1200, char_codes(data.substr(2))) } } return data }
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
    make_ssf(SSF);

    function isval(x) { return x !== undefined && x !== null }

    function keys(o) { return Object.keys(o) }

    function evert_key(obj, key) {
        var o = [],
            K = keys(obj);
        for (var i = 0; i !== K.length; ++i) o[obj[K[i]][key]] = K[i];
        return o
    }

    function evert(obj) {
        var o = [],
            K = keys(obj);
        for (var i = 0; i !== K.length; ++i) o[obj[K[i]]] = K[i];
        return o
    }

    function evert_num(obj) {
        var o = [],
            K = keys(obj);
        for (var i = 0; i !== K.length; ++i) o[obj[K[i]]] = parseInt(K[i], 10);
        return o
    }

    function evert_arr(obj) {
        var o = [],
            K = keys(obj);
        for (var i = 0; i !== K.length; ++i) {
            if (o[obj[K[i]]] == null) o[obj[K[i]]] = [];
            o[obj[K[i]]].push(K[i])
        }
        return o
    }

    function datenum(v, date1904) { if (date1904) v += 1462; var epoch = Date.parse(v); return (epoch + 22091616e5) / (24 * 60 * 60 * 1e3) }

    function cc2str(arr) { var o = ""; for (var i = 0; i != arr.length; ++i) o += String.fromCharCode(arr[i]); return o }

    function getdata(data) { if (!data) return null; if (data.name.substr(-4) === ".bin") { if (data.data) return char_codes(data.data); if (data.asNodeBuffer && typeof Buffer !== "undefined") return data.asNodeBuffer(); if (data._data && data._data.getContent) return Array.prototype.slice.call(data._data.getContent()) } else { if (data.data) return data.name.substr(-4) !== ".bin" ? debom_xml(data.data) : char_codes(data.data); if (data.asNodeBuffer && typeof Buffer !== "undefined") return debom_xml(data.asNodeBuffer().toString("binary")); if (data.asBinary) return debom_xml(data.asBinary()); if (data._data && data._data.getContent) return debom_xml(cc2str(Array.prototype.slice.call(data._data.getContent(), 0))) } return null }

    function getzipfile(zip, file) {
        var f = file;
        if (zip.files[f]) return zip.files[f];
        f = file.toLowerCase();
        if (zip.files[f]) return zip.files[f];
        f = f.replace(/\//g, "\\");
        if (zip.files[f]) return zip.files[f];
        throw new Error("Cannot find file " + file + " in zip")
    }

    function getzipdata(zip, file, safe) { if (!safe) return getdata(getzipfile(zip, file)); if (!file) return null; try { return getzipdata(zip, file) } catch (e) { return null } }
    var _fs, jszip;
    if (typeof JSZip !== "undefined") jszip = JSZip;
    if (typeof exports !== "undefined") {
        if (typeof module !== "undefined" && module.exports) {
            if (typeof Buffer !== "undefined" && typeof jszip === "undefined") jszip = require("jszip");
            if (typeof jszip === "undefined") jszip = require("./jszip").JSZip;
            _fs = require("fs")
        }
    }
    var _chr = function(c) { return String.fromCharCode(c) };
    var attregexg = /\b[\w:]+=["'][^"]*['"]/g;
    var tagregex = /<[^>]*>/g;
    var nsregex = /<\w*:/,
        nsregex2 = /<(\/?)\w+:/;

    function parsexmltag(tag, skip_root) {
        var z = [];
        var eq = 0,
            c = 0;
        for (; eq !== tag.length; ++eq)
            if ((c = tag.charCodeAt(eq)) === 32 || c === 10 || c === 13) break;
        if (!skip_root) z[0] = tag.substr(0, eq);
        if (eq === tag.length) return z;
        var m = tag.match(attregexg),
            j = 0,
            w = "",
            v = "",
            i = 0,
            q = "",
            cc = "";
        if (m)
            for (i = 0; i != m.length; ++i) {
                cc = m[i];
                for (c = 0; c != cc.length; ++c)
                    if (cc.charCodeAt(c) === 61) break;
                q = cc.substr(0, c);
                v = cc.substring(c + 2, cc.length - 1);
                for (j = 0; j != q.length; ++j)
                    if (q.charCodeAt(j) === 58) break;
                if (j === q.length) z[q] = v;
                else z[(j === 5 && q.substr(0, 5) === "xmlns" ? "xmlns" : "") + q.substr(j + 1)] = v
            }
        return z
    }

    function strip_ns(x) { return x.replace(nsregex2, "<$1") }
    var encodings = { "&quot;": '"', "&apos;": "'", "&gt;": ">", "&lt;": "<", "&amp;": "&" };
    var rencoding = evert(encodings);
    var rencstr = "&<>'\"".split("");
    var encregex = /&[a-z]*;/g,
        coderegex = /_x([0-9a-fA-F]+)_/g;

    function unescapexml(text) { var s = text + ""; return s.replace(encregex, function($$) { return encodings[$$] }).replace(coderegex, function(m, c) { return _chr(parseInt(c, 16)) }) }
    var decregex = /[&<>'"]/g,
        charegex = /[\u0000-\u0008\u000b-\u001f]/g;

    function escapexml(text) { var s = text + ""; return s.replace(decregex, function(y) { return rencoding[y] }).replace(charegex, function(s) { return "_x" + ("000" + s.charCodeAt(0).toString(16)).substr(-4) + "_" }) }

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
    var utf8read = function utf8reada(orig) {
        var out = "",
            i = 0,
            c = 0,
            d = 0,
            e = 0,
            f = 0,
            w = 0;
        while (i < orig.length) {
            c = orig.charCodeAt(i++);
            if (c < 128) { out += String.fromCharCode(c); continue }
            d = orig.charCodeAt(i++);
            if (c > 191 && c < 224) { out += String.fromCharCode((c & 31) << 6 | d & 63); continue }
            e = orig.charCodeAt(i++);
            if (c < 240) { out += String.fromCharCode((c & 15) << 12 | (d & 63) << 6 | e & 63); continue }
            f = orig.charCodeAt(i++);
            w = ((c & 7) << 18 | (d & 63) << 12 | (e & 63) << 6 | f & 63) - 65536;
            out += String.fromCharCode(55296 + (w >>> 10 & 1023));
            out += String.fromCharCode(56320 + (w & 1023))
        }
        return out
    };
    if (typeof Buffer !== "undefined") {
        var utf8readb = function utf8readb(data) {
            var out = new Buffer(2 * data.length),
                w, i, j = 1,
                k = 0,
                ww = 0,
                c;
            for (i = 0; i < data.length; i += j) {
                j = 1;
                if ((c = data.charCodeAt(i)) < 128) w = c;
                else if (c < 224) {
                    w = (c & 31) * 64 + (data.charCodeAt(i + 1) & 63);
                    j = 2
                } else if (c < 240) {
                    w = (c & 15) * 4096 + (data.charCodeAt(i + 1) & 63) * 64 + (data.charCodeAt(i + 2) & 63);
                    j = 3
                } else {
                    j = 4;
                    w = (c & 7) * 262144 + (data.charCodeAt(i + 1) & 63) * 4096 + (data.charCodeAt(i + 2) & 63) * 64 + (data.charCodeAt(i + 3) & 63);
                    w -= 65536;
                    ww = 55296 + (w >>> 10 & 1023);
                    w = 56320 + (w & 1023)
                }
                if (ww !== 0) {
                    out[k++] = ww & 255;
                    out[k++] = ww >>> 8;
                    ww = 0
                }
                out[k++] = w % 256;
                out[k++] = w >>> 8
            }
            out.length = k;
            return out.toString("ucs2")
        };
        var corpus = "foo bar bazâð£";
        if (utf8read(corpus) == utf8readb(corpus)) utf8read = utf8readb;
        var utf8readc = function utf8readc(data) { return Buffer(data, "binary").toString("utf8") };
        if (utf8read(corpus) == utf8readc(corpus)) utf8read = utf8readc
    }
    var matchtag = function() { var mtcache = {}; return function matchtag(f, g) { var t = f + "|" + g; if (mtcache[t] !== undefined) return mtcache[t]; return mtcache[t] = new RegExp("<(?:\\w+:)?" + f + '(?: xml:space="preserve")?(?:[^>]*)>([^☃]*)</(?:\\w+:)?' + f + ">", g || "") } }();
    var vtregex = function() { var vt_cache = {}; return function vt_regex(bt) { if (vt_cache[bt] !== undefined) return vt_cache[bt]; return vt_cache[bt] = new RegExp("<vt:" + bt + ">(.*?)</vt:" + bt + ">", "g") } }();
    var vtvregex = /<\/?vt:variant>/g,
        vtmregex = /<vt:([^>]*)>(.*)</;

    function parseVector(data) {
        var h = parsexmltag(data);
        var matches = data.match(vtregex(h.baseType)) || [];
        if (matches.length != h.size) throw "unexpected vector length " + matches.length + " != " + h.size;
        var res = [];
        matches.forEach(function(x) {
            var v = x.replace(vtvregex, "").match(vtmregex);
            res.push({ v: v[2], t: v[1] })
        });
        return res
    }
    var wtregex = /(^\s|\s$|\n)/;

    function writetag(f, g) { return "<" + f + (g.match(wtregex) ? ' xml:space="preserve"' : "") + ">" + g + "</" + f + ">" }

    function wxt_helper(h) { return keys(h).map(function(k) { return " " + k + '="' + h[k] + '"' }).join("") }

    function writextag(f, g, h) { return "<" + f + (isval(h) ? wxt_helper(h) : "") + (isval(g) ? (g.match(wtregex) ? ' xml:space="preserve"' : "") + ">" + g + "</" + f : "/") + ">" }

    function write_w3cdtf(d, t) { try { return d.toISOString().replace(/\.\d*/, "") } catch (e) { if (t) throw e } }

    function write_vt(s) {
        switch (typeof s) {
            case "string":
                return writextag("vt:lpwstr", s);
            case "number":
                return writextag((s | 0) == s ? "vt:i4" : "vt:r8", String(s));
            case "boolean":
                return writextag("vt:bool", s ? "true" : "false")
        }
        if (s instanceof Date) return writextag("vt:filetime", write_w3cdtf(s));
        throw new Error("Unable to serialize " + s)
    }
    var XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n';
    var XMLNS = { dc: "http://purl.org/dc/elements/1.1/", dcterms: "http://purl.org/dc/terms/", dcmitype: "http://purl.org/dc/dcmitype/", mx: "http://schemas.microsoft.com/office/mac/excel/2008/main", r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships", sjs: "http://schemas.openxmlformats.org/package/2006/sheetjs/core-properties", vt: "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes", xsi: "http://www.w3.org/2001/XMLSchema-instance", xsd: "http://www.w3.org/2001/XMLSchema" };
    XMLNS.main = ["http://schemas.openxmlformats.org/spreadsheetml/2006/main", "http://purl.oclc.org/ooxml/spreadsheetml/main", "http://schemas.microsoft.com/office/excel/2006/main", "http://schemas.microsoft.com/office/excel/2006/2"];

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
    var __toBuffer, ___toBuffer;
    __toBuffer = ___toBuffer = function(bufs) { var x = []; for (var i = 0; i != bufs[0].length; ++i) { x = x.concat(bufs[0][i]) } return x };
    if (typeof Buffer !== "undefined") { __toBuffer = function(bufs) { return bufs[0].length > 0 && Buffer.isBuffer(bufs[0][0]) ? Buffer.concat(bufs[0]) : ___toBuffer(bufs) } }
    var ___readUInt32LE = function(b, idx) { return b.readUInt32LE ? b.readUInt32LE(idx) : b[idx + 3] * (1 << 24) + (b[idx + 2] << 16) + (b[idx + 1] << 8) + b[idx] };
    var ___readInt32LE = function(b, idx) { return (b[idx + 3] << 24) + (b[idx + 2] << 16) + (b[idx + 1] << 8) + b[idx] };
    var __readUInt8 = function(b, idx) { return b.readUInt8 ? b.readUInt8(idx) : b[idx] };
    var __readUInt16LE = function(b, idx) { return b.readUInt16LE ? b.readUInt16LE(idx) : b[idx + 1] * (1 << 8) + b[idx] };
    var __readInt16LE = function(b, idx) { var u = __readUInt16LE(b, idx); if (!(u & 32768)) return u; return (65535 - u + 1) * -1 };
    var __readUInt32LE = typeof Buffer !== "undefined" ? function(b, i) { return Buffer.isBuffer(b) ? b.readUInt32LE(i) : ___readUInt32LE(b, i) } : ___readUInt32LE;
    var __readInt32LE = typeof Buffer !== "undefined" ? function(b, i) { return Buffer.isBuffer(b) ? b.readInt32LE(i) : ___readInt32LE(b, i) } : ___readInt32LE;
    var __readDoubleLE = function(b, idx) { return b.readDoubleLE ? b.readDoubleLE(idx) : readIEEE754(b, idx || 0) };

    function ReadShift(size, t) {
        var o = "",
            oo = [],
            w, vv, i, loc;
        if (t === "dbcs") {
            loc = this.l;
            if (typeof Buffer !== "undefined" && this instanceof Buffer) o = this.slice(this.l, this.l + 2 * size).toString("utf16le");
            else
                for (i = 0; i != size; ++i) {
                    o += String.fromCharCode(__readUInt16LE(this, loc));
                    loc += 2
                }
            size *= 2
        } else switch (size) {
            case 1:
                o = __readUInt8(this, this.l);
                break;
            case 2:
                o = (t === "i" ? __readInt16LE : __readUInt16LE)(this, this.l);
                break;
            case 4:
                o = __readUInt32LE(this, this.l);
                break;
            case 8:
                if (t === "f") { o = __readDoubleLE(this, this.l); break }
        }
        this.l += size;
        return o
    }

    function WriteShift(t, val, f) {
        var size, i;
        if (f === "dbcs") {
            for (i = 0; i != val.length; ++i) this.writeUInt16LE(val.charCodeAt(i), this.l + 2 * i);
            size = 2 * val.length
        } else switch (t) {
            case 1:
                size = 1;
                this.writeUInt8(val, this.l);
                break;
            case 4:
                size = 4;
                this.writeUInt32LE(val, this.l);
                break;
            case 8:
                size = 8;
                if (f === "f") { this.writeDoubleLE(val, this.l); break }
            case 16:
                break;
            case -4:
                size = 4;
                this.writeInt32LE(val, this.l);
                break
        }
        this.l += size;
        return this
    }

    function prep_blob(blob, pos) {
        blob.l = pos || 0;
        blob.read_shift = ReadShift;
        blob.write_shift = WriteShift
    }

    function parsenoop(blob, length) { blob.l += length }

    function writenoop(blob, length) { blob.l += length }

    function new_buf(sz) {
        var o = typeof Buffer !== "undefined" ? new Buffer(sz) : new Array(sz);
        prep_blob(o, 0);
        return o
    }

    function is_buf(a) { return typeof Buffer !== "undefined" && a instanceof Buffer || Array.isArray(a) }

    function recordhopper(data, cb, opts) {
        var tmpbyte, cntbyte, length;
        prep_blob(data, data.l || 0);
        while (data.l < data.length) {
            var RT = data.read_shift(1);
            if (RT & 128) RT = (RT & 127) + ((data.read_shift(1) & 127) << 7);
            var R = RecordEnum[RT] || RecordEnum[65535];
            tmpbyte = data.read_shift(1);
            length = tmpbyte & 127;
            for (cntbyte = 1; cntbyte < 4 && tmpbyte & 128; ++cntbyte) length += ((tmpbyte = data.read_shift(1)) & 127) << 7 * cntbyte;
            var d = R.f(data, length, opts);
            if (cb(d, R, RT)) return
        }
    }

    function buf_array() {
        var bufs = [],
            blksz = 2048;
        var newblk = function ba_newblk(sz) {
            var o = new_buf(sz);
            prep_blob(o, 0);
            return o
        };
        var curbuf = newblk(blksz);
        var endbuf = function ba_endbuf() {
            curbuf.length = curbuf.l;
            if (curbuf.length > 0) bufs.push(curbuf);
            curbuf = null
        };
        var next = function ba_next(sz) {
            if (sz < curbuf.length - curbuf.l) return curbuf;
            endbuf();
            return curbuf = newblk(Math.max(sz + 1, blksz))
        };
        var end = function ba_end() { endbuf(); return __toBuffer([bufs]) };
        var push = function ba_push(buf) {
            endbuf();
            curbuf = buf;
            next(blksz)
        };
        return { next: next, push: push, end: end, _bufs: bufs }
    }

    function write_record(ba, type, payload, length) {
        var t = evert_RE[type],
            l;
        if (!length) length = RecordEnum[t].p || (payload || []).length || 0;
        l = 1 + (t >= 128 ? 1 : 0) + 1 + length;
        if (length >= 128) ++l;
        if (length >= 16384) ++l;
        if (length >= 2097152) ++l;
        var o = ba.next(l);
        if (t <= 127) o.write_shift(1, t);
        else {
            o.write_shift(1, (t & 127) + 128);
            o.write_shift(1, t >> 7)
        }
        for (var i = 0; i != 4; ++i) {
            if (length >= 128) {
                o.write_shift(1, (length & 127) + 128);
                length >>= 7
            } else { o.write_shift(1, length); break }
        }
        if (length > 0 && is_buf(payload)) ba.push(payload)
    }

    function parse_StrRun(data, length) { return { ich: data.read_shift(2), ifnt: data.read_shift(2) } }

    function parse_RichStr(data, length) {
        var start = data.l;
        var flags = data.read_shift(1);
        var str = parse_XLWideString(data);
        var rgsStrRun = [];
        var z = { t: str, h: str };
        if ((flags & 1) !== 0) {
            var dwSizeStrRun = data.read_shift(4);
            for (var i = 0; i != dwSizeStrRun; ++i) rgsStrRun.push(parse_StrRun(data));
            z.r = rgsStrRun
        } else z.r = "<t>" + escapexml(str) + "</t>";
        if ((flags & 2) !== 0) {}
        data.l = start + length;
        return z
    }

    function parse_Cell(data) {
        var col = data.read_shift(4);
        var iStyleRef = data.read_shift(2);
        iStyleRef += data.read_shift(1) << 16;
        var fPhShow = data.read_shift(1);
        return { c: col, iStyleRef: iStyleRef }
    }

    function parse_CodeName(data, length) { return parse_XLWideString(data, length) }

    function parse_XLNullableWideString(data) { var cchCharacters = data.read_shift(4); return cchCharacters === 0 || cchCharacters === 4294967295 ? "" : data.read_shift(cchCharacters, "dbcs") }

    function write_XLNullableWideString(data, o) {
        if (!o) o = new_buf(127);
        o.write_shift(4, data.length > 0 ? data.length : 4294967295);
        if (data.length > 0) o.write_shift(0, data, "dbcs");
        return o
    }

    function parse_XLWideString(data) { var cchCharacters = data.read_shift(4); return cchCharacters === 0 ? "" : data.read_shift(cchCharacters, "dbcs") }

    function write_XLWideString(data, o) {
        if (o == null) o = new_buf(127);
        o.write_shift(4, data.length);
        if (data.length > 0) o.write_shift(0, data, "dbcs");
        return o
    }
    var parse_RelID = parse_XLNullableWideString;
    var write_RelID = write_XLNullableWideString;

    function parse_RkNumber(data) {
        var b = data.slice(data.l, data.l + 4);
        var fX100 = b[0] & 1,
            fInt = b[0] & 2;
        data.l += 4;
        b[0] &= 252;
        var RK = fInt === 0 ? __readDoubleLE([0, 0, 0, 0, b[0], b[1], b[2], b[3]], 0) : __readInt32LE(b, 0) >> 2;
        return fX100 ? RK / 100 : RK
    }

    function parse_UncheckedRfX(data) {
        var cell = { s: {}, e: {} };
        cell.s.r = data.read_shift(4);
        cell.e.r = data.read_shift(4);
        cell.s.c = data.read_shift(4);
        cell.e.c = data.read_shift(4);
        return cell
    }

    function write_UncheckedRfX(r, o) {
        if (!o) o = new_buf(16);
        o.write_shift(4, r.s.r);
        o.write_shift(4, r.e.r);
        o.write_shift(4, r.s.c);
        o.write_shift(4, r.e.c);
        return o
    }

    function parse_Xnum(data, length) { return data.read_shift(8, "f") }

    function write_Xnum(data, o) { return (o || new_buf(8)).write_shift(8, "f", data) }
    var BErr = { 0: "#NULL!", 7: "#DIV/0!", 15: "#VALUE!", 23: "#REF!", 29: "#NAME?", 36: "#NUM!", 42: "#N/A", 43: "#GETTING_DATA", 255: "#WTF?" };
    var RBErr = evert_num(BErr);

    function parse_BrtColor(data, length) {
        var out = {};
        var d = data.read_shift(1);
        out.fValidRGB = d & 1;
        out.xColorType = d >>> 1;
        out.index = data.read_shift(1);
        out.nTintAndShade = data.read_shift(2, "i");
        out.bRed = data.read_shift(1);
        out.bGreen = data.read_shift(1);
        out.bBlue = data.read_shift(1);
        out.bAlpha = data.read_shift(1)
    }

    function parse_FontFlags(data, length) {
        var d = data.read_shift(1);
        data.l++;
        var out = { fItalic: d & 2, fStrikeout: d & 8, fOutline: d & 16, fShadow: d & 32, fCondense: d & 64, fExtend: d & 128 };
        return out
    }
    var ct2type = { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": "workbooks", "application/vnd.ms-excel.binIndexWs": "TODO", "application/vnd.ms-excel.chartsheet": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": "TODO", "application/vnd.ms-excel.dialogsheet": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": "TODO", "application/vnd.ms-excel.macrosheet": "TODO", "application/vnd.ms-excel.macrosheet+xml": "TODO", "application/vnd.ms-excel.intlmacrosheet": "TODO", "application/vnd.ms-excel.binIndexMs": "TODO", "application/vnd.openxmlformats-package.core-properties+xml": "coreprops", "application/vnd.openxmlformats-officedocument.custom-properties+xml": "custprops", "application/vnd.openxmlformats-officedocument.extended-properties+xml": "extprops", "application/vnd.openxmlformats-officedocument.customXmlProperties+xml": "TODO", "application/vnd.ms-excel.comments": "comments", "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": "comments", "application/vnd.ms-excel.pivotTable": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotTable+xml": "TODO", "application/vnd.ms-excel.calcChain": "calcchains", "application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml": "calcchains", "application/vnd.openxmlformats-officedocument.spreadsheetml.printerSettings": "TODO", "application/vnd.ms-office.activeX": "TODO", "application/vnd.ms-office.activeX+xml": "TODO", "application/vnd.ms-excel.attachedToolbars": "TODO", "application/vnd.ms-excel.connections": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": "TODO", "application/vnd.ms-excel.externalLink": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml": "TODO", "application/vnd.ms-excel.sheetMetadata": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml": "TODO", "application/vnd.ms-excel.pivotCacheDefinition": "TODO", "application/vnd.ms-excel.pivotCacheRecords": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheDefinition+xml": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheRecords+xml": "TODO", "application/vnd.ms-excel.queryTable": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.queryTable+xml": "TODO", "application/vnd.ms-excel.userNames": "TODO", "application/vnd.ms-excel.revisionHeaders": "TODO", "application/vnd.ms-excel.revisionLog": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionHeaders+xml": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionLog+xml": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.userNames+xml": "TODO", "application/vnd.ms-excel.tableSingleCells": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.tableSingleCells+xml": "TODO", "application/vnd.ms-excel.slicer": "TODO", "application/vnd.ms-excel.slicerCache": "TODO", "application/vnd.ms-excel.slicer+xml": "TODO", "application/vnd.ms-excel.slicerCache+xml": "TODO", "application/vnd.ms-excel.wsSortMap": "TODO", "application/vnd.ms-excel.table": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": "TODO", "application/vnd.openxmlformats-officedocument.theme+xml": "themes", "application/vnd.ms-excel.Timeline+xml": "TODO", "application/vnd.ms-excel.TimelineCache+xml": "TODO", "application/vnd.ms-office.vbaProject": "vba", "application/vnd.ms-office.vbaProjectSignature": "vba", "application/vnd.ms-office.volatileDependencies": "TODO", "application/vnd.openxmlformats-officedocument.spreadsheetml.volatileDependencies+xml": "TODO", "application/vnd.ms-excel.controlproperties+xml": "TODO", "application/vnd.openxmlformats-officedocument.model+data": "TODO", "application/vnd.ms-excel.Survey+xml": "TODO", "application/vnd.openxmlformats-officedocument.drawing+xml": "TODO", "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": "TODO", "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": "TODO", "application/vnd.openxmlformats-officedocument.drawingml.diagramColors+xml": "TODO", "application/vnd.openxmlformats-officedocument.drawingml.diagramData+xml": "TODO", "application/vnd.openxmlformats-officedocument.drawingml.diagramLayout+xml": "TODO", "application/vnd.openxmlformats-officedocument.drawingml.diagramStyle+xml": "TODO", "application/vnd.openxmlformats-officedocument.vmlDrawing": "TODO", "application/vnd.openxmlformats-package.relationships+xml": "rels", "application/vnd.openxmlformats-officedocument.oleObject": "TODO", sheet: "js" };
    var CT_LIST = function() {
        var o = { workbooks: { xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml", xlsm: "application/vnd.ms-excel.sheet.macroEnabled.main+xml", xlsb: "application/vnd.ms-excel.sheet.binary.macroEnabled.main", xltx: "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml" }, strs: { xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml", xlsb: "application/vnd.ms-excel.sharedStrings" }, sheets: { xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml", xlsb: "application/vnd.ms-excel.worksheet" }, styles: { xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml", xlsb: "application/vnd.ms-excel.styles" } };
        keys(o).forEach(function(k) { if (!o[k].xlsm) o[k].xlsm = o[k].xlsx });
        keys(o).forEach(function(k) { keys(o[k]).forEach(function(v) { ct2type[o[k][v]] = k }) });
        return o
    }();
    var type2ct = evert_arr(ct2type);
    XMLNS.CT = "http://schemas.openxmlformats.org/package/2006/content-types";

    function parse_ct(data, opts) {
        var ctext = {};
        if (!data || !data.match) return data;
        var ct = { workbooks: [], sheets: [], calcchains: [], themes: [], styles: [], coreprops: [], extprops: [], custprops: [], strs: [], comments: [], vba: [], TODO: [], rels: [], xmlns: "" };
        (data.match(tagregex) || []).forEach(function(x) {
            var y = parsexmltag(x);
            switch (y[0].replace(nsregex, "<")) {
                case "<?xml":
                    break;
                case "<Types":
                    ct.xmlns = y["xmlns" + (y[0].match(/<(\w+):/) || ["", ""])[1]];
                    break;
                case "<Default":
                    ctext[y.Extension] = y.ContentType;
                    break;
                case "<Override":
                    if (ct[ct2type[y.ContentType]] !== undefined) ct[ct2type[y.ContentType]].push(y.PartName);
                    else if (opts.WTF) console.error(y);
                    break
            }
        });
        if (ct.xmlns !== XMLNS.CT) throw new Error("Unknown Namespace: " + ct.xmlns);
        ct.calcchain = ct.calcchains.length > 0 ? ct.calcchains[0] : "";
        ct.sst = ct.strs.length > 0 ? ct.strs[0] : "";
        ct.style = ct.styles.length > 0 ? ct.styles[0] : "";
        ct.defaults = ctext;
        delete ct.calcchains;
        return ct
    }
    var CTYPE_XML_ROOT = writextag("Types", null, { xmlns: XMLNS.CT, "xmlns:xsd": XMLNS.xsd, "xmlns:xsi": XMLNS.xsi });
    var CTYPE_DEFAULTS = [
        ["xml", "application/xml"],
        ["bin", "application/vnd.ms-excel.sheet.binary.macroEnabled.main"],
        ["rels", type2ct.rels[0]]
    ].map(function(x) { return writextag("Default", null, { Extension: x[0], ContentType: x[1] }) });

    function write_ct(ct, opts) {
        var o = [],
            v;
        o[o.length] = XML_HEADER;
        o[o.length] = CTYPE_XML_ROOT;
        o = o.concat(CTYPE_DEFAULTS);
        var f1 = function(w) {
            if (ct[w] && ct[w].length > 0) {
                v = ct[w][0];
                o[o.length] = writextag("Override", null, { PartName: (v[0] == "/" ? "" : "/") + v, ContentType: CT_LIST[w][opts.bookType || "xlsx"] })
            }
        };
        var f2 = function(w) { ct[w].forEach(function(v) { o[o.length] = writextag("Override", null, { PartName: (v[0] == "/" ? "" : "/") + v, ContentType: CT_LIST[w][opts.bookType || "xlsx"] }) }) };
        var f3 = function(t) {
            (ct[t] || []).forEach(function(v) { o[o.length] = writextag("Override", null, { PartName: (v[0] == "/" ? "" : "/") + v, ContentType: type2ct[t][0] }) })
        };
        f1("workbooks");
        f2("sheets");
        f3("themes");
        ["strs", "styles"].forEach(f1);
        ["coreprops", "extprops", "custprops"].forEach(f3);
        if (o.length > 2) {
            o[o.length] = "</Types>";
            o[1] = o[1].replace("/>", ">")
        }
        return o.join("")
    }
    var RELS = { WB: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument", SHEET: "http://sheetjs.openxmlformats.org/officeDocument/2006/relationships/officeDocument" };

    function parse_rels(data, currentFilePath) {
        if (!data) return data;
        if (currentFilePath.charAt(0) !== "/") { currentFilePath = "/" + currentFilePath }
        var rels = {};
        var hash = {};
        var resolveRelativePathIntoAbsolute = function(to) {
            var toksFrom = currentFilePath.split("/");
            toksFrom.pop();
            var toksTo = to.split("/");
            var reversed = [];
            while (toksTo.length !== 0) { var tokTo = toksTo.shift(); if (tokTo === "..") { toksFrom.pop() } else if (tokTo !== ".") { toksFrom.push(tokTo) } }
            return toksFrom.join("/")
        };
        data.match(tagregex).forEach(function(x) {
            var y = parsexmltag(x);
            if (y[0] === "<Relationship") {
                var rel = {};
                rel.Type = y.Type;
                rel.Target = y.Target;
                rel.Id = y.Id;
                rel.TargetMode = y.TargetMode;
                var canonictarget = y.TargetMode === "External" ? y.Target : resolveRelativePathIntoAbsolute(y.Target);
                rels[canonictarget] = rel;
                hash[y.Id] = rel
            }
        });
        rels["!id"] = hash;
        return rels
    }
    XMLNS.RELS = "http://schemas.openxmlformats.org/package/2006/relationships";
    var RELS_ROOT = writextag("Relationships", null, { xmlns: XMLNS.RELS });

    function write_rels(rels) {
        var o = [];
        o[o.length] = XML_HEADER;
        o[o.length] = RELS_ROOT;
        keys(rels["!id"]).forEach(function(rid) {
            var rel = rels["!id"][rid];
            o[o.length] = writextag("Relationship", null, rel)
        });
        if (o.length > 2) {
            o[o.length] = "</Relationships>";
            o[1] = o[1].replace("/>", ">")
        }
        return o.join("")
    }
    var CORE_PROPS = [
        ["cp:category", "Category"],
        ["cp:contentStatus", "ContentStatus"],
        ["cp:keywords", "Keywords"],
        ["cp:lastModifiedBy", "LastAuthor"],
        ["cp:lastPrinted", "LastPrinted"],
        ["cp:revision", "RevNumber"],
        ["cp:version", "Version"],
        ["dc:creator", "Author"],
        ["dc:description", "Comments"],
        ["dc:identifier", "Identifier"],
        ["dc:language", "Language"],
        ["dc:subject", "Subject"],
        ["dc:title", "Title"],
        ["dcterms:created", "CreatedDate", "date"],
        ["dcterms:modified", "ModifiedDate", "date"]
    ];
    XMLNS.CORE_PROPS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties";
    RELS.CORE_PROPS = "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties";

    function parse_core_props(data) { var p = {}; for (var i = 0; i != CORE_PROPS.length; ++i) { var f = CORE_PROPS[i]; var g = "(?:" + f[0].substr(0, f[0].indexOf(":")) + ":)" + f[0].substr(f[0].indexOf(":") + 1); var cur = data.match(new RegExp("<" + g + "[^>]*>(.*)</" + g + ">")); if (cur != null && cur.length > 0) p[f[1]] = cur[1]; if (f[2] === "date" && p[f[1]]) p[f[1]] = new Date(p[f[1]]) } return p }
    var CORE_PROPS_XML_ROOT = writextag("cp:coreProperties", null, { "xmlns:cp": XMLNS.CORE_PROPS, "xmlns:dc": XMLNS.dc, "xmlns:dcterms": XMLNS.dcterms, "xmlns:dcmitype": XMLNS.dcmitype, "xmlns:xsi": XMLNS.xsi });

    function cp_doit(f, g, h, o, p) {
        if (p[f] != null || g == null || g === "") return;
        if (typeof g !== "string") g = String(g);
        p[f] = g;
        o[o.length] = h ? writextag(f, g, h) : writetag(f, g)
    }

    function write_core_props(cp, opts) {
        var o = [XML_HEADER, CORE_PROPS_XML_ROOT],
            p = {};
        if (!cp) return o.join("");
        if (cp.CreatedDate != null) cp_doit("dcterms:created", typeof cp.CreatedDate === "string" ? cp.CreatedDate : write_w3cdtf(cp.CreatedDate, opts.WTF), { "xsi:type": "dcterms:W3CDTF" }, o, p);
        if (cp.ModifiedDate != null) cp_doit("dcterms:modified", typeof cp.ModifiedDate === "string" ? cp.ModifiedDate : write_w3cdtf(cp.ModifiedDate, opts.WTF), { "xsi:type": "dcterms:W3CDTF" }, o, p);
        for (var i = 0; i != CORE_PROPS.length; ++i) {
            var f = CORE_PROPS[i];
            cp_doit(f[0], cp[f[1]], null, o, p)
        }
        if (o.length > 2) {
            o[o.length] = "</cp:coreProperties>";
            o[1] = o[1].replace("/>", ">")
        }
        return o.join("")
    }
    var EXT_PROPS = [
        ["Application", "Application", "string"],
        ["AppVersion", "AppVersion", "string"],
        ["Company", "Company", "string"],
        ["DocSecurity", "DocSecurity", "string"],
        ["Manager", "Manager", "string"],
        ["HyperlinksChanged", "HyperlinksChanged", "bool"],
        ["SharedDoc", "SharedDoc", "bool"],
        ["LinksUpToDate", "LinksUpToDate", "bool"],
        ["ScaleCrop", "ScaleCrop", "bool"],
        ["HeadingPairs", "HeadingPairs", "raw"],
        ["TitlesOfParts", "TitlesOfParts", "raw"]
    ];
    XMLNS.EXT_PROPS = "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties";
    RELS.EXT_PROPS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties";

    function parse_ext_props(data, p) {
        var q = {};
        if (!p) p = {};
        EXT_PROPS.forEach(function(f) {
            switch (f[2]) {
                case "string":
                    p[f[1]] = (data.match(matchtag(f[0])) || [])[1];
                    break;
                case "bool":
                    p[f[1]] = (data.match(matchtag(f[0])) || [])[1] === "true";
                    break;
                case "raw":
                    var cur = data.match(new RegExp("<" + f[0] + "[^>]*>(.*)</" + f[0] + ">"));
                    if (cur && cur.length > 0) q[f[1]] = cur[1];
                    break
            }
        });
        if (q.HeadingPairs && q.TitlesOfParts) {
            var v = parseVector(q.HeadingPairs);
            var j = 0,
                widx = 0;
            for (var i = 0; i !== v.length; ++i) {
                switch (v[i].v) {
                    case "Worksheets":
                        widx = j;
                        p.Worksheets = +v[++i].v;
                        break;
                    case "Named Ranges":
                        ++i;
                        break
                }
            }
            var parts = parseVector(q.TitlesOfParts).map(function(x) { return utf8read(x.v) });
            p.SheetNames = parts.slice(widx, widx + p.Worksheets)
        }
        return p
    }
    var EXT_PROPS_XML_ROOT = writextag("Properties", null, { xmlns: XMLNS.EXT_PROPS, "xmlns:vt": XMLNS.vt });

    function write_ext_props(cp, opts) {
        var o = [],
            p = {},
            W = writextag;
        if (!cp) cp = {};
        cp.Application = "SheetJS";
        o[o.length] = XML_HEADER;
        o[o.length] = EXT_PROPS_XML_ROOT;
        EXT_PROPS.forEach(function(f) {
            if (typeof cp[f[1]] === "undefined") return;
            var v;
            switch (f[2]) {
                case "string":
                    v = cp[f[1]];
                    break;
                case "bool":
                    v = cp[f[1]] ? "true" : "false";
                    break
            }
            if (typeof v !== "undefined") o[o.length] = W(f[0], v)
        });
        o[o.length] = W("HeadingPairs", W("vt:vector", W("vt:variant", "<vt:lpstr>Worksheets</vt:lpstr>") + W("vt:variant", W("vt:i4", String(cp.Worksheets))), { size: 2, baseType: "variant" }));
        o[o.length] = W("TitlesOfParts", W("vt:vector", cp.SheetNames.map(function(s) { return "<vt:lpstr>" + s + "</vt:lpstr>" }).join(""), { size: cp.Worksheets, baseType: "lpstr" }));
        if (o.length > 2) {
            o[o.length] = "</Properties>";
            o[1] = o[1].replace("/>", ">")
        }
        return o.join("")
    }
    XMLNS.CUST_PROPS = "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties";
    RELS.CUST_PROPS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties";
    var custregex = /<[^>]+>[^<]*/g;

    function parse_cust_props(data, opts) {
        var p = {},
            name;
        var m = data.match(custregex);
        if (m)
            for (var i = 0; i != m.length; ++i) {
                var x = m[i],
                    y = parsexmltag(x);
                switch (y[0]) {
                    case "<?xml":
                        break;
                    case "<Properties":
                        if (y.xmlns !== XMLNS.CUST_PROPS) throw "unrecognized xmlns " + y.xmlns;
                        if (y.xmlnsvt && y.xmlnsvt !== XMLNS.vt) throw "unrecognized vt " + y.xmlnsvt;
                        break;
                    case "<property":
                        name = y.name;
                        break;
                    case "</property>":
                        name = null;
                        break;
                    default:
                        if (x.indexOf("<vt:") === 0) {
                            var toks = x.split(">");
                            var type = toks[0].substring(4),
                                text = toks[1];
                            switch (type) {
                                case "lpstr":
                                case "lpwstr":
                                case "bstr":
                                case "lpwstr":
                                    p[name] = unescapexml(text);
                                    break;
                                case "bool":
                                    p[name] = parsexmlbool(text, "<vt:bool>");
                                    break;
                                case "i1":
                                case "i2":
                                case "i4":
                                case "i8":
                                case "int":
                                case "uint":
                                    p[name] = parseInt(text, 10);
                                    break;
                                case "r4":
                                case "r8":
                                case "decimal":
                                    p[name] = parseFloat(text);
                                    break;
                                case "filetime":
                                case "date":
                                    p[name] = new Date(text);
                                    break;
                                case "cy":
                                case "error":
                                    p[name] = unescapexml(text);
                                    break;
                                default:
                                    if (typeof console !== "undefined") console.warn("Unexpected", x, type, toks)
                            }
                        } else if (x.substr(0, 2) === "</") {} else if (opts.WTF) throw new Error(x)
                }
            }
        return p
    }
    var CUST_PROPS_XML_ROOT = writextag("Properties", null, { xmlns: XMLNS.CUST_PROPS, "xmlns:vt": XMLNS.vt });

    function write_cust_props(cp, opts) {
        var o = [XML_HEADER, CUST_PROPS_XML_ROOT];
        if (!cp) return o.join("");
        var pid = 1;
        keys(cp).forEach(function custprop(k) {
            ++pid;
            o[o.length] = writextag("property", write_vt(cp[k]), { fmtid: "{D5CDD505-2E9C-101B-9397-08002B2CF9AE}", pid: pid, name: k })
        });
        if (o.length > 2) {
            o[o.length] = "</Properties>";
            o[1] = o[1].replace("/>", ">")
        }
        return o.join("")
    }
    var CS2CP = { 0: 1252, 1: 65001, 2: 65001, 77: 1e4, 128: 932, 129: 949, 130: 1361, 134: 936, 136: 950, 161: 1253, 162: 1254, 163: 1258, 177: 1255, 178: 1256, 186: 1257, 204: 1251, 222: 874, 238: 1250, 255: 1252, 69: 6969 };
    var parse_rs = function parse_rs_factory() {
        var tregex = matchtag("t"),
            rpregex = matchtag("rPr"),
            rregex = /<r>/g,
            rend = /<\/r>/,
            nlregex = /\r\n/g;
        var parse_rpr = function parse_rpr(rpr, intro, outro) {
            var font = {},
                cp = 65001;
            var m = rpr.match(tagregex),
                i = 0;
            if (m)
                for (; i != m.length; ++i) {
                    var y = parsexmltag(m[i]);
                    switch (y[0]) {
                        case "<condense":
                            break;
                        case "<extend":
                            break;
                        case "<shadow":
                        case "<shadow/>":
                            break;
                        case "<charset":
                            if (y.val == "1") break;
                            cp = CS2CP[parseInt(y.val, 10)];
                            break;
                        case "<outline":
                        case "<outline/>":
                            break;
                        case "<rFont":
                            font.name = y.val;
                            break;
                        case "<sz":
                            font.sz = y.val;
                            break;
                        case "<strike":
                            if (!y.val) break;
                        case "<strike/>":
                            font.strike = 1;
                            break;
                        case "</strike>":
                            break;
                        case "<u":
                            if (!y.val) break;
                        case "<u/>":
                            font.u = 1;
                            break;
                        case "</u>":
                            break;
                        case "<b":
                            if (!y.val) break;
                        case "<b/>":
                            font.b = 1;
                            break;
                        case "</b>":
                            break;
                        case "<i":
                            if (!y.val) break;
                        case "<i/>":
                            font.i = 1;
                            break;
                        case "</i>":
                            break;
                        case "<color":
                            if (y.rgb) font.color = y.rgb.substr(2, 6);
                            break;
                        case "<family":
                            font.family = y.val;
                            break;
                        case "<vertAlign":
                            break;
                        case "<scheme":
                            break;
                        default:
                            if (y[0].charCodeAt(1) !== 47) throw "Unrecognized rich format " + y[0]
                    }
                }
            var style = [];
            if (font.b) style.push("font-weight: bold;");
            if (font.i) style.push("font-style: italic;");
            intro.push('<span style="' + style.join("") + '">');
            outro.push("</span>");
            return cp
        };

        function parse_r(r) {
            var terms = [
                [], "", []
            ];
            var t = r.match(tregex),
                cp = 65001;
            if (!isval(t)) return "";
            terms[1] = t[1];
            var rpr = r.match(rpregex);
            if (isval(rpr)) cp = parse_rpr(rpr[1], terms[0], terms[2]);
            return terms[0].join("") + terms[1].replace(nlregex, "<br/>") + terms[2].join("")
        }
        return function parse_rs(rs) { return rs.replace(rregex, "").split(rend).map(parse_r).join("") }
    }();
    var sitregex = /<t[^>]*>([^<]*)<\/t>/g,
        sirregex = /<r>/;

    function parse_si(x, opts) {
        var html = opts ? opts.cellHTML : true;
        var z = {};
        if (!x) return null;
        var y;
        if (x.charCodeAt(1) === 116) {
            z.t = utf8read(unescapexml(x.substr(x.indexOf(">") + 1).split(/<\/t>/)[0]));
            z.r = x;
            if (html) z.h = z.t
        } else if (y = x.match(sirregex)) {
            z.r = x;
            z.t = utf8read(unescapexml(x.match(sitregex).join("").replace(tagregex, "")));
            if (html) z.h = parse_rs(x)
        }
        return z
    }
    var sstr0 = /<sst([^>]*)>([\s\S]*)<\/sst>/;
    var sstr1 = /<(?:si|sstItem)>/g;
    var sstr2 = /<\/(?:si|sstItem)>/;

    function parse_sst_xml(data, opts) {
        var s = [],
            ss;
        var sst = data.match(sstr0);
        if (isval(sst)) {
            ss = sst[2].replace(sstr1, "").split(sstr2);
            for (var i = 0; i != ss.length; ++i) { var o = parse_si(ss[i], opts); if (o != null) s[s.length] = o }
            sst = parsexmltag(sst[1]);
            s.Count = sst.count;
            s.Unique = sst.uniqueCount
        }
        return s
    }
    RELS.SST = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings";

    function write_sst_xml(sst, opts) {
        if (!opts.bookSST) return "";
        var o = [XML_HEADER];
        o[o.length] = writextag("sst", null, { xmlns: XMLNS.main[0], count: sst.Count, uniqueCount: sst.Unique });
        for (var i = 0; i != sst.length; ++i) {
            if (sst[i] == null) continue;
            var s = sst[i];
            var sitag = "<si>";
            if (s.r) sitag += s.r;
            else {
                sitag += "<t";
                if (s.t.match(/^\s|\s$|[\t\n\r]/)) sitag += ' xml:space="preserve"';
                sitag += ">" + escapexml(s.t) + "</t>"
            }
            sitag += "</si>";
            o[o.length] = sitag
        }
        if (o.length > 2) {
            o[o.length] = "</sst>";
            o[1] = o[1].replace("/>", ">")
        }
        return o.join("")
    }

    function parse_BrtBeginSst(data, length) { return [data.read_shift(4), data.read_shift(4)] }

    function parse_sst_bin(data, opts) {
        var s = [];
        var pass = false;
        recordhopper(data, function hopper_sst(val, R, RT) {
            switch (R.n) {
                case "BrtBeginSst":
                    s.Count = val[0];
                    s.Unique = val[1];
                    break;
                case "BrtSSTItem":
                    s.push(val);
                    break;
                case "BrtEndSst":
                    return true;
                case "BrtFRTBegin":
                    pass = true;
                    break;
                case "BrtFRTEnd":
                    pass = false;
                    break;
                default:
                    if (!pass || opts.WTF) throw new Error("Unexpected record " + RT + " " + R.n)
            }
        });
        return s
    }

    function write_sst_bin(sst, opts) {}

    function hex2RGB(h) { var o = h.substr(h[0] === "#" ? 1 : 0, 6); return [parseInt(o.substr(0, 2), 16), parseInt(o.substr(0, 2), 16), parseInt(o.substr(0, 2), 16)] }

    function rgb2Hex(rgb) { for (var i = 0, o = 1; i != 3; ++i) o = o * 256 + (rgb[i] > 255 ? 255 : rgb[i] < 0 ? 0 : rgb[i]); return o.toString(16).toUpperCase().substr(1) }

    function rgb2HSL(rgb) {
        var R = rgb[0] / 255,
            G = rgb[1] / 255,
            B = rgb[2] / 255;
        var M = Math.max(R, G, B),
            m = Math.min(R, G, B),
            C = M - m;
        if (C === 0) return [0, 0, R];
        var H6 = 0,
            S = 0,
            L2 = M + m;
        S = C / (L2 > 1 ? 2 - L2 : L2);
        switch (M) {
            case R:
                H6 = ((G - B) / C + 6) % 6;
                break;
            case G:
                H6 = (B - R) / C + 2;
                break;
            case B:
                H6 = (R - G) / C + 4;
                break
        }
        return [H6 / 6, S, L2 / 2]
    }

    function hsl2RGB(hsl) {
        var H = hsl[0],
            S = hsl[1],
            L = hsl[2];
        var C = S * 2 * (L < .5 ? L : 1 - L),
            m = L - C / 2;
        var rgb = [m, m, m],
            h6 = 6 * H;
        var X;
        if (S !== 0) switch (h6 | 0) {
            case 0:
            case 6:
                X = C * h6;
                rgb[0] += C;
                rgb[1] += X;
                break;
            case 1:
                X = C * (2 - h6);
                rgb[0] += X;
                rgb[1] += C;
                break;
            case 2:
                X = C * (h6 - 2);
                rgb[1] += C;
                rgb[2] += X;
                break;
            case 3:
                X = C * (4 - h6);
                rgb[1] += X;
                rgb[2] += C;
                break;
            case 4:
                X = C * (h6 - 4);
                rgb[2] += C;
                rgb[0] += X;
                break;
            case 5:
                X = C * (6 - h6);
                rgb[2] += X;
                rgb[0] += C;
                break
        }
        for (var i = 0; i != 3; ++i) rgb[i] = Math.round(rgb[i] * 255);
        return rgb
    }

    function rgb_tint(hex, tint) {
        if (tint === 0) return hex;
        var hsl = rgb2HSL(hex2RGB(hex));
        if (tint < 0) hsl[2] = hsl[2] * (1 + tint);
        else hsl[2] = 1 - (1 - hsl[2]) * (1 - tint);
        return rgb2Hex(hsl2RGB(hsl))
    }
    var DEF_MDW = 7,
        MAX_MDW = 15,
        MIN_MDW = 1,
        MDW = DEF_MDW;

    function width2px(width) { return (width + (128 / MDW | 0) / 256) * MDW | 0 }

    function px2char(px) { return ((px - 5) / MDW * 100 + .5 | 0) / 100 }

    function char2width(chr) { return ((chr * MDW + 5) / MDW * 256 | 0) / 256 }

    function cycle_width(collw) { return char2width(px2char(width2px(collw))) }

    function find_mdw(collw, coll) {
        if (cycle_width(collw) != collw) {
            for (MDW = DEF_MDW; MDW > MIN_MDW; --MDW)
                if (cycle_width(collw) === collw) break;
            if (MDW === MIN_MDW)
                for (MDW = DEF_MDW + 1; MDW < MAX_MDW; ++MDW)
                    if (cycle_width(collw) === collw) break;
            if (MDW === MAX_MDW) MDW = DEF_MDW
        }
    }
    var styles = {};
    var themes = {};

    function parse_fills(t, opts) {
        styles.Fills = [];
        var fill = {};
        t[0].match(tagregex).forEach(function(x) {
            var y = parsexmltag(x);
            switch (y[0]) {
                case "<fills":
                case "<fills>":
                case "</fills>":
                    break;
                case "<fill>":
                    break;
                case "</fill>":
                    styles.Fills.push(fill);
                    fill = {};
                    break;
                case "<patternFill":
                    if (y.patternType) fill.patternType = y.patternType;
                    break;
                case "<patternFill/>":
                case "</patternFill>":
                    break;
                case "<bgColor":
                    if (!fill.bgColor) fill.bgColor = {};
                    if (y.indexed) fill.bgColor.indexed = parseInt(y.indexed, 10);
                    if (y.theme) fill.bgColor.theme = parseInt(y.theme, 10);
                    if (y.tint) fill.bgColor.tint = parseFloat(y.tint);
                    if (y.rgb) fill.bgColor.rgb = y.rgb.substring(y.rgb.length - 6);
                    break;
                case "<bgColor/>":
                case "</bgColor>":
                    break;
                case "<fgColor":
                    if (!fill.fgColor) fill.fgColor = {};
                    if (y.theme) fill.fgColor.theme = parseInt(y.theme, 10);
                    if (y.tint) fill.fgColor.tint = parseFloat(y.tint);
                    if (y.rgb) fill.fgColor.rgb = y.rgb.substring(y.rgb.length - 6);
                    break;
                case "<bgColor/>":
                case "</fgColor>":
                    break;
                default:
                    if (opts.WTF) throw "unrecognized " + y[0] + " in fills"
            }
        })
    }

    function parse_numFmts(t, opts) {
        styles.NumberFmt = [];
        var k = keys(SSF._table);
        for (var i = 0; i != k.length; ++i) styles.NumberFmt[k[i]] = SSF._table[k[i]];
        var m = t[0].match(tagregex);
        for (i = 0; i != m.length; ++i) {
            var y = parsexmltag(m[i]);
            switch (y[0]) {
                case "<numFmts":
                case "</numFmts>":
                case "<numFmts/>":
                case "<numFmts>":
                    break;
                case "<numFmt":
                    {
                        var f = unescapexml(y.formatCode),
                            j = parseInt(y.numFmtId, 10);styles.NumberFmt[j] = f;
                        if (j > 0) SSF.load(f, j)
                    }
                    break;
                default:
                    if (opts.WTF) throw "unrecognized " + y[0] + " in numFmts"
            }
        }
    }

    function write_numFmts(NF, opts) {
        var o = ["<numFmts>"];
        [
            [5, 8],
            [23, 26],
            [41, 44],
            [63, 66],
            [164, 392]
        ].forEach(function(r) {
            for (var i = r[0]; i <= r[1]; ++i)
                if (NF[i] !== undefined) o[o.length] = writextag("numFmt", null, { numFmtId: i, formatCode: escapexml(NF[i]) })
        });
        o[o.length] = "</numFmts>";
        if (o.length === 2) return "";
        o[0] = writextag("numFmts", null, { count: o.length - 2 }).replace("/>", ">");
        return o.join("")
    }

    function parse_cellXfs(t, opts) {
        styles.CellXf = [];
        t[0].match(tagregex).forEach(function(x) {
            var y = parsexmltag(x);
            switch (y[0]) {
                case "<cellXfs":
                case "<cellXfs>":
                case "<cellXfs/>":
                case "</cellXfs>":
                    break;
                case "<xf":
                    delete y[0];
                    if (y.numFmtId) y.numFmtId = parseInt(y.numFmtId, 10);
                    if (y.fillId) y.fillId = parseInt(y.fillId, 10);
                    styles.CellXf.push(y);
                    break;
                case "</xf>":
                    break;
                case "<alignment":
                case "<alignment/>":
                    break;
                case "<protection":
                case "</protection>":
                case "<protection/>":
                    break;
                case "<extLst":
                case "</extLst>":
                    break;
                case "<ext":
                    break;
                default:
                    if (opts.WTF) throw "unrecognized " + y[0] + " in cellXfs"
            }
        })
    }

    function write_cellXfs(cellXfs) {
        var o = [];
        o[o.length] = writextag("cellXfs", null);
        cellXfs.forEach(function(c) { o[o.length] = writextag("xf", null, c) });
        o[o.length] = "</cellXfs>";
        if (o.length === 2) return "";
        o[0] = writextag("cellXfs", null, { count: o.length - 2 }).replace("/>", ">");
        return o.join("")
    }

    function parse_sty_xml(data, opts) { var t; if (t = data.match(/<numFmts([^>]*)>.*<\/numFmts>/)) parse_numFmts(t, opts); if (t = data.match(/<fills([^>]*)>.*<\/fills>/)) parse_fills(t, opts); if (t = data.match(/<cellXfs([^>]*)>.*<\/cellXfs>/)) parse_cellXfs(t, opts); return styles }
    var STYLES_XML_ROOT = writextag("styleSheet", null, { xmlns: XMLNS.main[0], "xmlns:vt": XMLNS.vt });
    RELS.STY = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles";

    function write_sty_xml(wb, opts) {
        var o = [],
            p = {},
            w;
        o[o.length] = XML_HEADER;
        o[o.length] = STYLES_XML_ROOT;
        if (w = write_numFmts(wb.SSF)) o[o.length] = w;
        o[o.length] = '<fonts count="1"><font><sz val="12"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts>';
        o[o.length] = '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>';
        o[o.length] = '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>';
        o[o.length] = '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>';
        if (w = write_cellXfs(opts.cellXfs)) o[o.length] = w;
        o[o.length] = '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>';
        o[o.length] = '<dxfs count="0"/>';
        o[o.length] = '<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4"/>';
        if (o.length > 2) {
            o[o.length] = "</styleSheet>";
            o[1] = o[1].replace("/>", ">")
        }
        return o.join("")
    }

    function parse_BrtFmt(data, length) { var ifmt = data.read_shift(2); var stFmtCode = parse_XLWideString(data, length - 2); return [ifmt, stFmtCode] }

    function parse_BrtFont(data, length) {
        var out = { flags: {} };
        out.dyHeight = data.read_shift(2);
        out.grbit = parse_FontFlags(data, 2);
        out.bls = data.read_shift(2);
        out.sss = data.read_shift(2);
        out.uls = data.read_shift(1);
        out.bFamily = data.read_shift(1);
        out.bCharSet = data.read_shift(1);
        data.l++;
        out.brtColor = parse_BrtColor(data, 8);
        out.bFontScheme = data.read_shift(1);
        out.name = parse_XLWideString(data, length - 21);
        out.flags.Bold = out.bls === 700;
        out.flags.Italic = out.grbit.fItalic;
        out.flags.Strikeout = out.grbit.fStrikeout;
        out.flags.Outline = out.grbit.fOutline;
        out.flags.Shadow = out.grbit.fShadow;
        out.flags.Condense = out.grbit.fCondense;
        out.flags.Extend = out.grbit.fExtend;
        out.flags.Sub = out.sss & 2;
        out.flags.Sup = out.sss & 1;
        return out
    }

    function parse_BrtXF(data, length) {
        var ixfeParent = data.read_shift(2);
        var ifmt = data.read_shift(2);
        parsenoop(data, length - 4);
        return { ixfe: ixfeParent, ifmt: ifmt }
    }

    function parse_sty_bin(data, opts) {
        styles.NumberFmt = [];
        for (var y in SSF._table) styles.NumberFmt[y] = SSF._table[y];
        styles.CellXf = [];
        var state = "";
        var pass = false;
        recordhopper(data, function hopper_sty(val, R, RT) {
            switch (R.n) {
                case "BrtFmt":
                    styles.NumberFmt[val[0]] = val[1];
                    SSF.load(val[1], val[0]);
                    break;
                case "BrtFont":
                    break;
                case "BrtKnownFonts":
                    break;
                case "BrtFill":
                    break;
                case "BrtBorder":
                    break;
                case "BrtXF":
                    if (state === "CELLXFS") { styles.CellXf.push(val) }
                    break;
                case "BrtStyle":
                    break;
                case "BrtDXF":
                    break;
                case "BrtMRUColor":
                    break;
                case "BrtIndexedColor":
                    break;
                case "BrtBeginStyleSheet":
                    break;
                case "BrtEndStyleSheet":
                    break;
                case "BrtBeginTableStyle":
                    break;
                case "BrtTableStyleElement":
                    break;
                case "BrtEndTableStyle":
                    break;
                case "BrtBeginFmts":
                    state = "FMTS";
                    break;
                case "BrtEndFmts":
                    state = "";
                    break;
                case "BrtBeginFonts":
                    state = "FONTS";
                    break;
                case "BrtEndFonts":
                    state = "";
                    break;
                case "BrtACBegin":
                    state = "ACFONTS";
                    break;
                case "BrtACEnd":
                    state = "";
                    break;
                case "BrtBeginFills":
                    state = "FILLS";
                    break;
                case "BrtEndFills":
                    state = "";
                    break;
                case "BrtBeginBorders":
                    state = "BORDERS";
                    break;
                case "BrtEndBorders":
                    state = "";
                    break;
                case "BrtBeginCellStyleXFs":
                    state = "CELLSTYLEXFS";
                    break;
                case "BrtEndCellStyleXFs":
                    state = "";
                    break;
                case "BrtBeginCellXFs":
                    state = "CELLXFS";
                    break;
                case "BrtEndCellXFs":
                    state = "";
                    break;
                case "BrtBeginStyles":
                    state = "STYLES";
                    break;
                case "BrtEndStyles":
                    state = "";
                    break;
                case "BrtBeginDXFs":
                    state = "DXFS";
                    break;
                case "BrtEndDXFs":
                    state = "";
                    break;
                case "BrtBeginTableStyles":
                    state = "TABLESTYLES";
                    break;
                case "BrtEndTableStyles":
                    state = "";
                    break;
                case "BrtBeginColorPalette":
                    state = "COLORPALETTE";
                    break;
                case "BrtEndColorPalette":
                    state = "";
                    break;
                case "BrtBeginIndexedColors":
                    state = "INDEXEDCOLORS";
                    break;
                case "BrtEndIndexedColors":
                    state = "";
                    break;
                case "BrtBeginMRUColors":
                    state = "MRUCOLORS";
                    break;
                case "BrtEndMRUColors":
                    state = "";
                    break;
                case "BrtFRTBegin":
                    pass = true;
                    break;
                case "BrtFRTEnd":
                    pass = false;
                    break;
                case "BrtBeginStyleSheetExt14":
                    break;
                case "BrtBeginSlicerStyles":
                    break;
                case "BrtEndSlicerStyles":
                    break;
                case "BrtBeginTimelineStylesheetExt15":
                    break;
                case "BrtEndTimelineStylesheetExt15":
                    break;
                case "BrtBeginTimelineStyles":
                    break;
                case "BrtEndTimelineStyles":
                    break;
                case "BrtEndStyleSheetExt14":
                    break;
                default:
                    if (!pass || opts.WTF) throw new Error("Unexpected record " + RT + " " + R.n)
            }
        });
        return styles
    }

    function write_sty_bin(data, opts) {}
    RELS.THEME = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme";

    function parse_clrScheme(t, opts) {
        themes.themeElements.clrScheme = [];
        var color = {};
        t[0].match(tagregex).forEach(function(x) {
            var y = parsexmltag(x);
            switch (y[0]) {
                case "<a:clrScheme":
                case "</a:clrScheme>":
                    break;
                case "<a:srgbClr":
                    color.rgb = y.val;
                    break;
                case "<a:sysClr":
                    color.rgb = y.lastClr;
                    break;
                case "<a:dk1>":
                case "</a:dk1>":
                case "<a:dk2>":
                case "</a:dk2>":
                case "<a:lt1>":
                case "</a:lt1>":
                case "<a:lt2>":
                case "</a:lt2>":
                case "<a:accent1>":
                case "</a:accent1>":
                case "<a:accent2>":
                case "</a:accent2>":
                case "<a:accent3>":
                case "</a:accent3>":
                case "<a:accent4>":
                case "</a:accent4>":
                case "<a:accent5>":
                case "</a:accent5>":
                case "<a:accent6>":
                case "</a:accent6>":
                case "<a:hlink>":
                case "</a:hlink>":
                case "<a:folHlink>":
                case "</a:folHlink>":
                    if (y[0][1] === "/") {
                        themes.themeElements.clrScheme.push(color);
                        color = {}
                    } else { color.name = y[0].substring(3, y[0].length - 1) }
                    break;
                default:
                    if (opts.WTF) throw "unrecognized " + y[0] + " in clrScheme"
            }
        })
    }
    var clrsregex = /<a:clrScheme([^>]*)>.*<\/a:clrScheme>/;

    function parse_theme_xml(data, opts) {
        if (!data || data.length === 0) return themes;
        themes.themeElements = {};
        var t;
        if (t = data.match(clrsregex)) parse_clrScheme(t, opts);
        return themes
    }

    function write_theme() { return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F497D"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2><a:accent1><a:srgbClr val="4F81BD"/></a:accent1><a:accent2><a:srgbClr val="C0504D"/></a:accent2><a:accent3><a:srgbClr val="9BBB59"/></a:accent3><a:accent4><a:srgbClr val="8064A2"/></a:accent4><a:accent5><a:srgbClr val="4BACC6"/></a:accent5><a:accent6><a:srgbClr val="F79646"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Cambria"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="宋体"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="宋体"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="1"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="100000"/><a:shade val="100000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="50000"/><a:shade val="100000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst><a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d><a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults><a:spDef><a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="1"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="3"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="2"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></a:style></a:spDef><a:lnDef><a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="2"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="1"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef></a:style></a:lnDef></a:objectDefaults><a:extraClrSchemeLst/></a:theme>' }

    function parse_cc_xml(data, opts) {
        var d = [];
        var l = 0,
            i = 1;
        (data.match(tagregex) || []).forEach(function(x) {
            var y = parsexmltag(x);
            switch (y[0]) {
                case "<?xml":
                    break;
                case "<calcChain":
                case "<calcChain>":
                case "</calcChain>":
                    break;
                case "<c":
                    delete y[0];
                    if (y.i) i = y.i;
                    else y.i = i;
                    d.push(y);
                    break
            }
        });
        return d
    }

    function write_cc_xml(data, opts) {}

    function parse_BrtCalcChainItem$(data, length) {
        var out = {};
        out.i = data.read_shift(4);
        var cell = {};
        cell.r = data.read_shift(4);
        cell.c = data.read_shift(4);
        out.r = encode_cell(cell);
        var flags = data.read_shift(1);
        if (flags & 2) out.l = "1";
        if (flags & 8) out.a = "1";
        return out
    }

    function parse_cc_bin(data, opts) {
        var out = [];
        var pass = false;
        recordhopper(data, function hopper_cc(val, R, RT) {
            switch (R.n) {
                case "BrtCalcChainItem$":
                    out.push(val);
                    break;
                case "BrtBeginCalcChain$":
                    break;
                case "BrtEndCalcChain$":
                    break;
                default:
                    if (!pass || opts.WTF) throw new Error("Unexpected record " + RT + " " + R.n)
            }
        });
        return out
    }

    function write_cc_bin(data, opts) {}

    function parse_comments(zip, dirComments, sheets, sheetRels, opts) {
        for (var i = 0; i != dirComments.length; ++i) {
            var canonicalpath = dirComments[i];
            var comments = parse_cmnt(getzipdata(zip, canonicalpath.replace(/^\//, ""), true), canonicalpath, opts);
            if (!comments || !comments.length) continue;
            var sheetNames = keys(sheets);
            for (var j = 0; j != sheetNames.length; ++j) { var sheetName = sheetNames[j]; var rels = sheetRels[sheetName]; if (rels) { var rel = rels[canonicalpath]; if (rel) insertCommentsIntoSheet(sheetName, sheets[sheetName], comments) } }
        }
    }

    function insertCommentsIntoSheet(sheetName, sheet, comments) {
        comments.forEach(function(comment) {
            var cell = sheet[comment.ref];
            if (!cell) {
                cell = {};
                sheet[comment.ref] = cell;
                var range = safe_decode_range(sheet["!ref"] || "BDWGO1000001:A1");
                var thisCell = decode_cell(comment.ref);
                if (range.s.r > thisCell.r) range.s.r = thisCell.r;
                if (range.e.r < thisCell.r) range.e.r = thisCell.r;
                if (range.s.c > thisCell.c) range.s.c = thisCell.c;
                if (range.e.c < thisCell.c) range.e.c = thisCell.c;
                var encoded = encode_range(range);
                if (encoded !== sheet["!ref"]) sheet["!ref"] = encoded
            }
            if (!cell.c) cell.c = [];
            var o = { a: comment.author, t: comment.t, r: comment.r };
            if (comment.h) o.h = comment.h;
            cell.c.push(o)
        })
    }

    function parse_comments_xml(data, opts) {
        if (data.match(/<(?:\w+:)?comments *\/>/)) return [];
        var authors = [];
        var commentList = [];
        data.match(/<(?:\w+:)?authors>([^\u2603]*)<\/(?:\w+:)?authors>/)[1].split(/<\/\w*:?author>/).forEach(function(x) {
            if (x === "" || x.trim() === "") return;
            authors.push(x.match(/<(?:\w+:)?author[^>]*>(.*)/)[1])
        });
        (data.match(/<(?:\w+:)?commentList>([^\u2603]*)<\/(?:\w+:)?commentList>/) || ["", ""])[1].split(/<\/\w*:?comment>/).forEach(function(x, index) {
            if (x === "" || x.trim() === "") return;
            var y = parsexmltag(x.match(/<(?:\w+:)?comment[^>]*>/)[0]);
            var comment = { author: y.authorId && authors[y.authorId] ? authors[y.authorId] : undefined, ref: y.ref, guid: y.guid };
            var cell = decode_cell(y.ref);
            if (opts.sheetRows && opts.sheetRows <= cell.r) return;
            var textMatch = x.match(/<text>([^\u2603]*)<\/text>/);
            if (!textMatch || !textMatch[1]) return;
            var rt = parse_si(textMatch[1]);
            comment.r = rt.r;
            comment.t = rt.t;
            if (opts.cellHTML) comment.h = rt.h;
            commentList.push(comment)
        });
        return commentList
    }

    function write_comments_xml(data, opts) {}

    function parse_BrtBeginComment(data, length) {
        var out = {};
        out.iauthor = data.read_shift(4);
        var rfx = parse_UncheckedRfX(data, 16);
        out.rfx = rfx.s;
        out.ref = encode_cell(rfx.s);
        data.l += 16;
        return out
    }
    var parse_BrtCommentAuthor = parse_XLWideString;
    var parse_BrtCommentText = parse_RichStr;

    function parse_comments_bin(data, opts) {
        var out = [];
        var authors = [];
        var c = {};
        var pass = false;
        recordhopper(data, function hopper_cmnt(val, R, RT) {
            switch (R.n) {
                case "BrtCommentAuthor":
                    authors.push(val);
                    break;
                case "BrtBeginComment":
                    c = val;
                    break;
                case "BrtCommentText":
                    c.t = val.t;
                    c.h = val.h;
                    c.r = val.r;
                    break;
                case "BrtEndComment":
                    c.author = authors[c.iauthor];
                    delete c.iauthor;
                    if (opts.sheetRows && opts.sheetRows <= c.rfx.r) break;
                    delete c.rfx;
                    out.push(c);
                    break;
                case "BrtBeginComments":
                    break;
                case "BrtEndComments":
                    break;
                case "BrtBeginCommentAuthors":
                    break;
                case "BrtEndCommentAuthors":
                    break;
                case "BrtBeginCommentList":
                    break;
                case "BrtEndCommentList":
                    break;
                default:
                    if (!pass || opts.WTF) throw new Error("Unexpected record " + RT + " " + R.n)
            }
        });
        return out
    }

    function write_comments_bin(data, opts) {}

    function parse_CellParsedFormula(data, length) { var cce = data.read_shift(4); return parsenoop(data, length - 4) }
    var strs = {};
    var _ssfopts = {};
    RELS.WS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet";

    function get_sst_id(sst, str) {
        for (var i = 0; i != sst.length; ++i)
            if (sst[i].t === str) { sst.Count++; return i }
        sst[sst.length] = { t: str };
        sst.Count++;
        sst.Unique++;
        return sst.length - 1
    }

    function get_cell_style(styles, cell, opts) {
        var z = opts.revssf[cell.z != null ? cell.z : "General"];
        for (var i = 0; i != styles.length; ++i)
            if (styles[i].numFmtId === z) return i;
        styles[styles.length] = { numFmtId: z, fontId: 0, fillId: 0, borderId: 0, xfId: 0, applyNumberFormat: 1 };
        return styles.length - 1
    }

    function safe_format(p, fmtid, fillid, opts) {
        try {
            if (fmtid === 0) {
                if (p.t === "n") {
                    if ((p.v | 0) === p.v) p.w = SSF._general_int(p.v, _ssfopts);
                    else p.w = SSF._general_num(p.v, _ssfopts)
                } else if (p.v === undefined) return "";
                else p.w = SSF._general(p.v, _ssfopts)
            } else p.w = SSF.format(fmtid, p.v, _ssfopts);
            if (opts.cellNF) p.z = SSF._table[fmtid]
        } catch (e) { if (opts.WTF) throw e }
        if (fillid) try { p.s = styles.Fills[fillid]; if (p.s.fgColor && p.s.fgColor.theme) { p.s.fgColor.rgb = rgb_tint(themes.themeElements.clrScheme[p.s.fgColor.theme].rgb, p.s.fgColor.tint || 0); if (opts.WTF) p.s.fgColor.raw_rgb = themes.themeElements.clrScheme[p.s.fgColor.theme].rgb } if (p.s.bgColor && p.s.bgColor.theme) { p.s.bgColor.rgb = rgb_tint(themes.themeElements.clrScheme[p.s.bgColor.theme].rgb, p.s.bgColor.tint || 0); if (opts.WTF) p.s.bgColor.raw_rgb = themes.themeElements.clrScheme[p.s.bgColor.theme].rgb } } catch (e) { if (opts.WTF) throw e }
    }

    function parse_ws_xml_dim(ws, s) { var d = safe_decode_range(s); if (d.s.r <= d.e.r && d.s.c <= d.e.c && d.s.r >= 0 && d.e.r >= 0) ws["!ref"] = encode_range(d) }
    var mergecregex = /<mergeCell ref="[A-Z0-9:]+"\s*\/>/g;
    var sheetdataregex = /<(?:\w+:)?sheetData>([^\u2603]*)<\/(?:\w+:)?sheetData>/;
    var hlinkregex = /<hyperlink[^>]*\/>/g;

    function parse_ws_xml(data, opts, rels) {
        if (!data) return data;
        var s = {};
        var ridx = data.indexOf("<dimension");
        if (ridx > 0) { var ref = data.substr(ridx, 50).match(/"(\w*:\w*)"/); if (ref != null) parse_ws_xml_dim(s, ref[1]) }
        var mergecells = [];
        if (data.indexOf("</mergeCells>") !== -1) { var merges = data.match(mergecregex); for (ridx = 0; ridx != merges.length; ++ridx) mergecells[ridx] = safe_decode_range(merges[ridx].substr(merges[ridx].indexOf('"') + 1)) }
        var columns = [];
        if (opts.cellStyles && data.indexOf("</cols>") !== -1) {
            var cols = data.match(/<col[^>]*\/>/g);
            parse_ws_xml_cols(columns, cols)
        }
        var refguess = { s: { r: 1e6, c: 1e6 }, e: { r: 0, c: 0 } };
        var mtch = data.match(sheetdataregex);
        if (mtch) parse_ws_xml_data(mtch[1], s, opts, refguess);
        if (data.indexOf("</hyperlinks>") !== -1) parse_ws_xml_hlinks(s, data.match(hlinkregex), rels);
        if (!s["!ref"] && refguess.e.c >= refguess.s.c && refguess.e.r >= refguess.s.r) s["!ref"] = encode_range(refguess);
        if (opts.sheetRows > 0 && s["!ref"]) {
            var tmpref = safe_decode_range(s["!ref"]);
            if (opts.sheetRows < +tmpref.e.r) {
                tmpref.e.r = opts.sheetRows - 1;
                if (tmpref.e.r > refguess.e.r) tmpref.e.r = refguess.e.r;
                if (tmpref.e.r < tmpref.s.r) tmpref.s.r = tmpref.e.r;
                if (tmpref.e.c > refguess.e.c) tmpref.e.c = refguess.e.c;
                if (tmpref.e.c < tmpref.s.c) tmpref.s.c = tmpref.e.c;
                s["!fullref"] = s["!ref"];
                s["!ref"] = encode_range(tmpref)
            }
        }
        if (mergecells.length > 0) s["!merges"] = mergecells;
        if (columns.length > 0) s["!cols"] = columns;
        return s
    }

    function parse_ws_xml_hlinks(s, data, rels) {
        for (var i = 0; i != data.length; ++i) {
            var val = parsexmltag(data[i], true);
            if (!val.ref) return;
            var rel = rels["!id"][val.id];
            if (rel) {
                val.Target = rel.Target;
                if (val.location) val.Target += "#" + val.location;
                val.Rel = rel
            }
            var rng = safe_decode_range(val.ref);
            for (var R = rng.s.r; R <= rng.e.r; ++R)
                for (var C = rng.s.c; C <= rng.e.c; ++C) {
                    var addr = encode_cell({ c: C, r: R });
                    if (!s[addr]) s[addr] = { t: "str", v: undefined };
                    s[addr].l = val
                }
        }
    }

    function parse_ws_xml_cols(columns, cols) {
        var seencol = false;
        for (var coli = 0; coli != cols.length; ++coli) {
            var coll = parsexmltag(cols[coli], true);
            var colm = parseInt(coll.min, 10) - 1,
                colM = parseInt(coll.max, 10) - 1;
            delete coll.min;
            delete coll.max;
            if (!seencol && coll.width) {
                seencol = true;
                find_mdw(+coll.width, coll)
            }
            if (coll.width) {
                coll.wpx = width2px(+coll.width);
                coll.wch = px2char(coll.wpx);
                coll.MDW = MDW
            }
            while (colm <= colM) columns[colm++] = coll
        }
    }

    function write_ws_xml_cols(ws, cols) {
        var o = ["<cols>"],
            col, width;
        for (var i = 0; i != cols.length; ++i) {
            if (!(col = cols[i])) continue;
            var p = { min: i + 1, max: i + 1 };
            width = -1;
            if (col.wpx) width = px2char(col.wpx);
            else if (col.wch) width = col.wch;
            if (width > -1) {
                p.width = char2width(width);
                p.customWidth = 1
            }
            o[o.length] = writextag("col", null, p)
        }
        o[o.length] = "</cols>";
        return o.join("")
    }

    function write_ws_xml_cell(cell, ref, ws, opts, idx, wb) {
        if (cell.v === undefined) return "";
        var vv = "";
        switch (cell.t) {
            case "b":
                vv = cell.v ? "1" : "0";
                break;
            case "n":
            case "e":
                vv = "" + cell.v;
                break;
            default:
                vv = cell.v;
                break
        }
        var v = writetag("v", escapexml(vv)),
            o = { r: ref };
        var os = get_cell_style(opts.cellXfs, cell, opts);
        if (os !== 0) o.s = os;
        switch (cell.t) {
            case "s":
            case "str":
                if (opts.bookSST) {
                    v = writetag("v", "" + get_sst_id(opts.Strings, cell.v));
                    o.t = "s";
                    break
                }
                o.t = "str";
                break;
            case "n":
                break;
            case "b":
                o.t = "b";
                break;
            case "e":
                o.t = "e";
                break
        }
        return writextag("c", v, o)
    }
    var parse_ws_xml_data = function parse_ws_xml_data_factory() {
        var cellregex = /<(?:\w+:)?c /,
            rowregex = /<\/(?:\w+:)?row>/;
        var rregex = /r=["']([^"']*)["']/,
            isregex = /<is>([\S\s]*?)<\/is>/;
        var match_v = matchtag("v"),
            match_f = matchtag("f");
        return function parse_ws_xml_data(sdata, s, opts, guess) {
            var ri = 0,
                x = "",
                cells = [],
                cref = [],
                idx = 0,
                i = 0,
                cc = 0,
                d = "",
                p;
            var tag;
            var sstr;
            var fmtid = 0,
                fillid = 0,
                do_format = Array.isArray(styles.CellXf),
                cf;
            for (var marr = sdata.split(rowregex), mt = 0; mt != marr.length; ++mt) {
                x = marr[mt].trim();
                if (x.length === 0) continue;
                for (ri = 0; ri != x.length; ++ri)
                    if (x.charCodeAt(ri) === 62) break;
                    ++ri;
                tag = parsexmltag(x.substr(0, ri), true);
                if (opts.sheetRows && opts.sheetRows < +tag.r) continue;
                if (guess.s.r > tag.r - 1) guess.s.r = tag.r - 1;
                if (guess.e.r < tag.r - 1) guess.e.r = tag.r - 1;
                cells = x.substr(ri).split(cellregex);
                for (ri = 0; ri != cells.length; ++ri) {
                    x = cells[ri].trim();
                    if (x.length === 0) continue;
                    cref = x.match(rregex);
                    idx = ri;
                    i = 0;
                    cc = 0;
                    x = "<c " + x;
                    if (cref !== null && cref.length === 2) {
                        idx = 0;
                        d = cref[1];
                        for (i = 0; i != d.length; ++i) {
                            if ((cc = d.charCodeAt(i) - 64) < 1 || cc > 26) break;
                            idx = 26 * idx + cc
                        }--idx
                    }
                    for (i = 0; i != x.length; ++i)
                        if (x.charCodeAt(i) === 62) break;
                        ++i;
                    tag = parsexmltag(x.substr(0, i), true);
                    d = x.substr(i);
                    p = { t: "" };
                    if ((cref = d.match(match_v)) !== null) p.v = unescapexml(cref[1]);
                    if (opts.cellFormula && (cref = d.match(match_f)) !== null) p.f = unescapexml(cref[1]);
                    if (tag.t === undefined && p.v === undefined) {
                        if (!opts.sheetStubs) continue;
                        p.t = "str"
                    } else p.t = tag.t || "n";
                    if (guess.s.c > idx) guess.s.c = idx;
                    if (guess.e.c < idx) guess.e.c = idx;
                    switch (p.t) {
                        case "n":
                            p.v = parseFloat(p.v);
                            break;
                        case "s":
                            sstr = strs[parseInt(p.v, 10)];
                            p.v = sstr.t;
                            p.r = sstr.r;
                            if (opts.cellHTML) p.h = sstr.h;
                            break;
                        case "str":
                            if (p.v != null) p.v = utf8read(p.v);
                            else p.v = "";
                            break;
                        case "inlineStr":
                            cref = d.match(isregex);
                            p.t = "str";
                            if (cref !== null) {
                                sstr = parse_si(cref[1]);
                                p.v = sstr.t
                            } else p.v = "";
                            break;
                        case "b":
                            p.v = parsexmlbool(p.v);
                            break;
                        case "d":
                            p.v = datenum(p.v);
                            p.t = "n";
                            break;
                        case "e":
                            p.raw = RBErr[p.v];
                            break
                    }
                    fmtid = fillid = 0;
                    if (do_format && tag.s !== undefined) { cf = styles.CellXf[tag.s]; if (cf != null) { if (cf.numFmtId != null) fmtid = cf.numFmtId; if (opts.cellStyles && cf.fillId != undefined) fillid = cf.fillId } }
                    safe_format(p, fmtid, fillid, opts);
                    s[tag.r] = p
                }
            }
        }
    }();

    function write_ws_xml_data(ws, opts, idx, wb) {
        var o = [],
            r = [],
            range = safe_decode_range(ws["!ref"]),
            cell, ref, rr = "",
            cols = [];
        for (var R = range.s.r; R <= range.e.r; ++R) {
            r = [];
            rr = encode_row(R);
            for (var C = range.s.c; C <= range.e.c; ++C) {
                if (R === range.s.r) cols[C] = encode_col(C);
                ref = cols[C] + rr;
                if (!ws[ref]) continue;
                if (cell = write_ws_xml_cell(ws[ref], ref, ws, opts, idx, wb)) r.push(cell)
            }
            if (r.length) o[o.length] = writextag("row", r.join(""), { r: rr })
        }
        return o.join("")
    }
    var WS_XML_ROOT = writextag("worksheet", null, { xmlns: XMLNS.main[0], "xmlns:r": XMLNS.r });

    function write_ws_xml(idx, opts, wb) {
        var o = [XML_HEADER, WS_XML_ROOT];
        var s = wb.SheetNames[idx],
            ws = wb.Sheets[s] || {},
            sidx = 0,
            rdata = "";
        o[o.length] = writextag("dimension", null, { ref: ws["!ref"] || "A1" });
        if ((ws["!cols"] || []).length > 0) o[o.length] = write_ws_xml_cols(ws, ws["!cols"]);
        sidx = o.length;
        o[o.length] = writextag("sheetData", null);
        if (ws["!ref"]) rdata = write_ws_xml_data(ws, opts, idx, wb);
        if (rdata.length) o[o.length] = rdata;
        if (o.length > sidx + 1) {
            o[o.length] = "</sheetData>";
            o[sidx] = o[sidx].replace("/>", ">")
        }
        if (o.length > 2) {
            o[o.length] = "</worksheet>";
            o[1] = o[1].replace("/>", ">")
        }
        return o.join("")
    }

    function parse_BrtRowHdr(data, length) {
        var z = [];
        z.r = data.read_shift(4);
        data.l += length - 4;
        return z
    }
    var parse_BrtWsDim = parse_UncheckedRfX;
    var write_BrtWsDim = write_UncheckedRfX;

    function parse_BrtWsProp(data, length) {
        var z = {};
        data.l += 19;
        z.name = parse_CodeName(data, length - 19);
        return z
    }

    function parse_BrtCellBlank(data, length) { var cell = parse_Cell(data); return [cell] }

    function parse_BrtCellBool(data, length) { var cell = parse_Cell(data); var fBool = data.read_shift(1); return [cell, fBool, "b"] }

    function parse_BrtCellError(data, length) { var cell = parse_Cell(data); var fBool = data.read_shift(1); return [cell, fBool, "e"] }

    function parse_BrtCellIsst(data, length) { var cell = parse_Cell(data); var isst = data.read_shift(4); return [cell, isst, "s"] }

    function parse_BrtCellReal(data, length) { var cell = parse_Cell(data); var value = parse_Xnum(data); return [cell, value, "n"] }

    function parse_BrtCellRk(data, length) { var cell = parse_Cell(data); var value = parse_RkNumber(data); return [cell, value, "n"] }

    function parse_BrtCellSt(data, length) { var cell = parse_Cell(data); var value = parse_XLWideString(data); return [cell, value, "str"] }

    function parse_BrtFmlaBool(data, length, opts) {
        var cell = parse_Cell(data);
        var value = data.read_shift(1);
        var o = [cell, value, "b"];
        if (opts.cellFormula) {
            var formula = parse_CellParsedFormula(data, length - 9);
            o[3] = ""
        } else data.l += length - 9;
        return o
    }

    function parse_BrtFmlaError(data, length, opts) {
        var cell = parse_Cell(data);
        var value = data.read_shift(1);
        var o = [cell, value, "e"];
        if (opts.cellFormula) {
            var formula = parse_CellParsedFormula(data, length - 9);
            o[3] = ""
        } else data.l += length - 9;
        return o
    }

    function parse_BrtFmlaNum(data, length, opts) {
        var cell = parse_Cell(data);
        var value = parse_Xnum(data);
        var o = [cell, value, "n"];
        if (opts.cellFormula) {
            var formula = parse_CellParsedFormula(data, length - 16);
            o[3] = ""
        } else data.l += length - 16;
        return o
    }

    function parse_BrtFmlaString(data, length, opts) { var start = data.l; var cell = parse_Cell(data); var value = parse_XLWideString(data); var o = [cell, value, "str"]; if (opts.cellFormula) { var formula = parse_CellParsedFormula(data, start + length - data.l) } else data.l = start + length; return o }
    var parse_BrtMergeCell = parse_UncheckedRfX;

    function parse_BrtHLink(data, length, opts) {
        var end = data.l + length;
        var rfx = parse_UncheckedRfX(data, 16);
        var relId = parse_XLNullableWideString(data);
        var loc = parse_XLWideString(data);
        var tooltip = parse_XLWideString(data);
        var display = parse_XLWideString(data);
        data.l = end;
        return { rfx: rfx, relId: relId, loc: loc, tooltip: tooltip, display: display }
    }

    function parse_ws_bin(data, opts, rels) {
        if (!data) return data;
        if (!rels) rels = { "!id": {} };
        var s = {};
        var ref;
        var refguess = { s: { r: 1e6, c: 1e6 }, e: { r: 0, c: 0 } };
        var pass = false,
            end = false;
        var row, p, cf, R, C, addr, sstr, rr;
        var mergecells = [];
        recordhopper(data, function ws_parse(val, R) {
            if (end) return;
            switch (R.n) {
                case "BrtWsDim":
                    ref = val;
                    break;
                case "BrtRowHdr":
                    row = val;
                    if (opts.sheetRows && opts.sheetRows <= row.r) end = true;
                    rr = encode_row(row.r);
                    break;
                case "BrtFmlaBool":
                case "BrtFmlaError":
                case "BrtFmlaNum":
                case "BrtFmlaString":
                case "BrtCellBool":
                case "BrtCellError":
                case "BrtCellIsst":
                case "BrtCellReal":
                case "BrtCellRk":
                case "BrtCellSt":
                    p = { t: val[2] };
                    switch (val[2]) {
                        case "n":
                            p.v = val[1];
                            break;
                        case "s":
                            sstr = strs[val[1]];
                            p.v = sstr.t;
                            p.r = sstr.r;
                            break;
                        case "b":
                            p.v = val[1] ? true : false;
                            break;
                        case "e":
                            p.raw = val[1];
                            p.v = BErr[p.raw];
                            break;
                        case "str":
                            p.v = utf8read(val[1]);
                            break
                    }
                    if (opts.cellFormula && val.length > 3) p.f = val[3];
                    if (cf = styles.CellXf[val[0].iStyleRef]) safe_format(p, cf.ifmt, null, opts);
                    s[encode_col(C = val[0].c) + rr] = p;
                    if (refguess.s.r > row.r) refguess.s.r = row.r;
                    if (refguess.s.c > C) refguess.s.c = C;
                    if (refguess.e.r < row.r) refguess.e.r = row.r;
                    if (refguess.e.c < C) refguess.e.c = C;
                    break;
                case "BrtCellBlank":
                    if (!opts.sheetStubs) break;
                    p = { t: "str", v: undefined };
                    s[encode_col(C = val[0].c) + rr] = p;
                    if (refguess.s.r > row.r) refguess.s.r = row.r;
                    if (refguess.s.c > C) refguess.s.c = C;
                    if (refguess.e.r < row.r) refguess.e.r = row.r;
                    if (refguess.e.c < C) refguess.e.c = C;
                    break;
                case "BrtBeginMergeCells":
                    break;
                case "BrtEndMergeCells":
                    break;
                case "BrtMergeCell":
                    mergecells.push(val);
                    break;
                case "BrtHLink":
                    var rel = rels["!id"][val.relId];
                    if (rel) {
                        val.Target = rel.Target;
                        if (val.loc) val.Target += "#" + val.loc;
                        val.Rel = rel
                    }
                    for (R = val.rfx.s.r; R <= val.rfx.e.r; ++R)
                        for (C = val.rfx.s.c; C <= val.rfx.e.c; ++C) {
                            addr = encode_cell({ c: C, r: R });
                            if (!s[addr]) s[addr] = { t: "str", v: undefined };
                            s[addr].l = val
                        }
                    break;
                case "BrtArrFmla":
                    break;
                case "BrtShrFmla":
                    break;
                case "BrtBeginSheet":
                    break;
                case "BrtWsProp":
                    break;
                case "BrtSheetCalcProp":
                    break;
                case "BrtBeginWsViews":
                    break;
                case "BrtBeginWsView":
                    break;
                case "BrtPane":
                    break;
                case "BrtSel":
                    break;
                case "BrtEndWsView":
                    break;
                case "BrtEndWsViews":
                    break;
                case "BrtACBegin":
                    break;
                case "BrtRwDescent":
                    break;
                case "BrtACEnd":
                    break;
                case "BrtWsFmtInfoEx14":
                    break;
                case "BrtWsFmtInfo":
                    break;
                case "BrtBeginColInfos":
                    break;
                case "BrtColInfo":
                    break;
                case "BrtEndColInfos":
                    break;
                case "BrtBeginSheetData":
                    break;
                case "BrtEndSheetData":
                    break;
                case "BrtSheetProtection":
                    break;
                case "BrtPrintOptions":
                    break;
                case "BrtMargins":
                    break;
                case "BrtPageSetup":
                    break;
                case "BrtFRTBegin":
                    pass = true;
                    break;
                case "BrtFRTEnd":
                    pass = false;
                    break;
                case "BrtEndSheet":
                    break;
                case "BrtDrawing":
                    break;
                case "BrtLegacyDrawing":
                    break;
                case "BrtLegacyDrawingHF":
                    break;
                case "BrtPhoneticInfo":
                    break;
                case "BrtBeginHeaderFooter":
                    break;
                case "BrtEndHeaderFooter":
                    break;
                case "BrtBrk":
                    break;
                case "BrtBeginRwBrk":
                    break;
                case "BrtEndRwBrk":
                    break;
                case "BrtBeginColBrk":
                    break;
                case "BrtEndColBrk":
                    break;
                case "BrtBeginUserShViews":
                    break;
                case "BrtBeginUserShView":
                    break;
                case "BrtEndUserShView":
                    break;
                case "BrtEndUserShViews":
                    break;
                case "BrtBkHim":
                    break;
                case "BrtBeginOleObjects":
                    break;
                case "BrtOleObject":
                    break;
                case "BrtEndOleObjects":
                    break;
                case "BrtBeginListParts":
                    break;
                case "BrtListPart":
                    break;
                case "BrtEndListParts":
                    break;
                case "BrtBeginSortState":
                    break;
                case "BrtBeginSortCond":
                    break;
                case "BrtEndSortCond":
                    break;
                case "BrtEndSortState":
                    break;
                case "BrtBeginConditionalFormatting":
                    break;
                case "BrtEndConditionalFormatting":
                    break;
                case "BrtBeginCFRule":
                    break;
                case "BrtEndCFRule":
                    break;
                case "BrtBeginDVals":
                    break;
                case "BrtDVal":
                    break;
                case "BrtEndDVals":
                    break;
                case "BrtRangeProtection":
                    break;
                case "BrtBeginDCon":
                    break;
                case "BrtEndDCon":
                    break;
                case "BrtBeginDRefs":
                    break;
                case "BrtDRef":
                    break;
                case "BrtEndDRefs":
                    break;
                case "BrtBeginActiveXControls":
                    break;
                case "BrtActiveX":
                    break;
                case "BrtEndActiveXControls":
                    break;
                case "BrtBeginAFilter":
                    break;
                case "BrtEndAFilter":
                    break;
                case "BrtBeginFilterColumn":
                    break;
                case "BrtBeginFilters":
                    break;
                case "BrtFilter":
                    break;
                case "BrtEndFilters":
                    break;
                case "BrtEndFilterColumn":
                    break;
                case "BrtDynamicFilter":
                    break;
                case "BrtTop10Filter":
                    break;
                case "BrtBeginCustomFilters":
                    break;
                case "BrtCustomFilter":
                    break;
                case "BrtEndCustomFilters":
                    break;
                case "BrtBeginCellWatches":
                    break;
                case "BrtCellWatch":
                    break;
                case "BrtEndCellWatches":
                    break;
                case "BrtTable":
                    break;
                case "BrtBeginCellIgnoreECs":
                    break;
                case "BrtCellIgnoreEC":
                    break;
                case "BrtEndCellIgnoreECs":
                    break;
                default:
                    if (!pass || opts.WTF) throw new Error("Unexpected record " + R.n)
            }
        }, opts);
        if (!s["!ref"] && (refguess.s.r < 1e6 || ref.e.r > 0 || ref.e.c > 0 || ref.s.r > 0 || ref.s.c > 0)) s["!ref"] = encode_range(ref);
        if (opts.sheetRows && s["!ref"]) {
            var tmpref = safe_decode_range(s["!ref"]);
            if (opts.sheetRows < +tmpref.e.r) {
                tmpref.e.r = opts.sheetRows - 1;
                if (tmpref.e.r > refguess.e.r) tmpref.e.r = refguess.e.r;
                if (tmpref.e.r < tmpref.s.r) tmpref.s.r = tmpref.e.r;
                if (tmpref.e.c > refguess.e.c) tmpref.e.c = refguess.e.c;
                if (tmpref.e.c < tmpref.s.c) tmpref.s.c = tmpref.e.c;
                s["!fullref"] = s["!ref"];
                s["!ref"] = encode_range(tmpref)
            }
        }
        if (mergecells.length > 0) s["!merges"] = mergecells;
        return s
    }

    function write_CELLTABLE(ba, ws, idx, opts, wb) {
        var r = safe_decode_range(ws["!ref"] || "A1");
        write_record(ba, "BrtBeginSheetData");
        for (var i = r.s.r; i <= r.e.r; ++i) {}
        write_record(ba, "BrtEndSheetData")
    }

    function write_ws_bin(idx, opts, wb) {
        var ba = buf_array();
        var s = wb.SheetNames[idx],
            ws = wb.Sheets[s] || {};
        var r = safe_decode_range(ws["!ref"] || "A1");
        write_record(ba, "BrtBeginSheet");
        write_record(ba, "BrtWsDim", write_BrtWsDim(r));
        write_CELLTABLE(ba, ws, idx, opts, wb);
        write_record(ba, "BrtEndSheet");
        return ba.end()
    }
    var WBPropsDef = [
        ["allowRefreshQuery", "0"],
        ["autoCompressPictures", "1"],
        ["backupFile", "0"],
        ["checkCompatibility", "0"],
        ["codeName", ""],
        ["date1904", "0"],
        ["dateCompatibility", "1"],
        ["filterPrivacy", "0"],
        ["hidePivotFieldList", "0"],
        ["promptedSolutions", "0"],
        ["publishItems", "0"],
        ["refreshAllConnections", false],
        ["saveExternalLinkValues", "1"],
        ["showBorderUnselectedTables", "1"],
        ["showInkAnnotation", "1"],
        ["showObjects", "all"],
        ["showPivotChartFilter", "0"]
    ];
    var WBViewDef = [
        ["activeTab", "0"],
        ["autoFilterDateGrouping", "1"],
        ["firstSheet", "0"],
        ["minimized", "0"],
        ["showHorizontalScroll", "1"],
        ["showSheetTabs", "1"],
        ["showVerticalScroll", "1"],
        ["tabRatio", "600"],
        ["visibility", "visible"]
    ];
    var SheetDef = [
        ["state", "visible"]
    ];
    var CalcPrDef = [
        ["calcCompleted", "true"],
        ["calcMode", "auto"],
        ["calcOnSave", "true"],
        ["concurrentCalc", "true"],
        ["fullCalcOnLoad", "false"],
        ["fullPrecision", "true"],
        ["iterate", "false"],
        ["iterateCount", "100"],
        ["iterateDelta", "0.001"],
        ["refMode", "A1"]
    ];
    var CustomWBViewDef = [
        ["autoUpdate", "false"],
        ["changesSavedWin", "false"],
        ["includeHiddenRowCol", "true"],
        ["includePrintSettings", "true"],
        ["maximized", "false"],
        ["minimized", "false"],
        ["onlySync", "false"],
        ["personalView", "false"],
        ["showComments", "commIndicator"],
        ["showFormulaBar", "true"],
        ["showHorizontalScroll", "true"],
        ["showObjects", "all"],
        ["showSheetTabs", "true"],
        ["showStatusbar", "true"],
        ["showVerticalScroll", "true"],
        ["tabRatio", "600"],
        ["xWindow", "0"],
        ["yWindow", "0"]
    ];

    function push_defaults_array(target, defaults) { for (var j = 0; j != target.length; ++j) { var w = target[j]; for (var i = 0; i != defaults.length; ++i) { var z = defaults[i]; if (w[z[0]] == null) w[z[0]] = z[1] } } }

    function push_defaults(target, defaults) { for (var i = 0; i != defaults.length; ++i) { var z = defaults[i]; if (target[z[0]] == null) target[z[0]] = z[1] } }

    function parse_wb_defaults(wb) {
        push_defaults(wb.WBProps, WBPropsDef);
        push_defaults(wb.CalcPr, CalcPrDef);
        push_defaults_array(wb.WBView, WBViewDef);
        push_defaults_array(wb.Sheets, SheetDef);
        _ssfopts.date1904 = parsexmlbool(wb.WBProps.date1904, "date1904")
    }

    function parse_wb_xml(data, opts) {
        var wb = { AppVersion: {}, WBProps: {}, WBView: [], Sheets: [], CalcPr: {}, xmlns: "" };
        var pass = false,
            xmlns = "xmlns";
        data.match(tagregex).forEach(function xml_wb(x) {
            var y = parsexmltag(x);
            switch (strip_ns(y[0])) {
                case "<?xml":
                    break;
                case "<workbook":
                    if (x.match(/<\w+:workbook/)) xmlns = "xmlns" + x.match(/<(\w+):/)[1];
                    wb.xmlns = y[xmlns];
                    break;
                case "</workbook>":
                    break;
                case "<fileVersion":
                    delete y[0];
                    wb.AppVersion = y;
                    break;
                case "<fileVersion/>":
                    break;
                case "<fileSharing":
                case "<fileSharing/>":
                    break;
                case "<workbookPr":
                    delete y[0];
                    wb.WBProps = y;
                    break;
                case "<workbookPr/>":
                    delete y[0];
                    wb.WBProps = y;
                    break;
                case "<workbookProtection":
                    break;
                case "<workbookProtection/>":
                    break;
                case "<bookViews>":
                case "</bookViews>":
                    break;
                case "<workbookView":
                    delete y[0];
                    wb.WBView.push(y);
                    break;
                case "<sheets>":
                case "</sheets>":
                    break;
                case "<sheet":
                    delete y[0];
                    y.name = utf8read(y.name);
                    wb.Sheets.push(y);
                    break;
                case "<functionGroups":
                case "<functionGroups/>":
                    break;
                case "<functionGroup":
                    break;
                case "<externalReferences":
                case "</externalReferences>":
                case "<externalReferences>":
                    break;
                case "<externalReference":
                    break;
                case "<definedNames/>":
                    break;
                case "<definedNames>":
                case "<definedNames":
                    pass = true;
                    break;
                case "</definedNames>":
                    pass = false;
                    break;
                case "<definedName":
                case "<definedName/>":
                case "</definedName>":
                    break;
                case "<calcPr":
                    delete y[0];
                    wb.CalcPr = y;
                    break;
                case "<calcPr/>":
                    delete y[0];
                    wb.CalcPr = y;
                    break;
                case "<oleSize":
                    break;
                case "<customWorkbookViews>":
                case "</customWorkbookViews>":
                case "<customWorkbookViews":
                    break;
                case "<customWorkbookView":
                case "</customWorkbookView>":
                    break;
                case "<pivotCaches>":
                case "</pivotCaches>":
                case "<pivotCaches":
                    break;
                case "<pivotCache":
                    break;
                case "<smartTagPr":
                case "<smartTagPr/>":
                    break;
                case "<smartTagTypes":
                case "<smartTagTypes>":
                case "</smartTagTypes>":
                    break;
                case "<smartTagType":
                    break;
                case "<webPublishing":
                case "<webPublishing/>":
                    break;
                case "<fileRecoveryPr":
                case "<fileRecoveryPr/>":
                    break;
                case "<webPublishObjects>":
                case "<webPublishObjects":
                case "</webPublishObjects>":
                    break;
                case "<webPublishObject":
                    break;
                case "<extLst>":
                case "</extLst>":
                case "<extLst/>":
                    break;
                case "<ext":
                    pass = true;
                    break;
                case "</ext>":
                    pass = false;
                    break;
                case "<ArchID":
                    break;
                case "<AlternateContent":
                    pass = true;
                    break;
                case "</AlternateContent>":
                    pass = false;
                    break;
                default:
                    if (!pass && opts.WTF) throw "unrecognized " + y[0] + " in workbook"
            }
        });
        if (XMLNS.main.indexOf(wb.xmlns) === -1) throw new Error("Unknown Namespace: " + wb.xmlns);
        parse_wb_defaults(wb);
        return wb
    }
    var WB_XML_ROOT = writextag("workbook", null, { xmlns: XMLNS.main[0], "xmlns:r": XMLNS.r });

    function safe1904(wb) { try { return parsexmlbool(wb.Workbook.WBProps.date1904) ? "true" : "false" } catch (e) { return "false" } }

    function write_wb_xml(wb, opts) {
        var o = [XML_HEADER];
        o[o.length] = WB_XML_ROOT;
        o[o.length] = writextag("workbookPr", null, { date1904: safe1904(wb) });
        o[o.length] = "<sheets>";
        for (var i = 0; i != wb.SheetNames.length; ++i) o[o.length] = writextag("sheet", null, { name: wb.SheetNames[i].substr(0, 31), sheetId: "" + (i + 1), "r:id": "rId" + (i + 1) });
        o[o.length] = "</sheets>";
        if (o.length > 2) {
            o[o.length] = "</workbook>";
            o[1] = o[1].replace("/>", ">")
        }
        return o.join("")
    }

    function parse_BrtBundleSh(data, length) {
        var z = {};
        z.hsState = data.read_shift(4);
        z.iTabID = data.read_shift(4);
        z.strRelID = parse_RelID(data, length - 8);
        z.name = parse_XLWideString(data);
        return z
    }

    function write_BrtBundleSh(data, o) {
        if (!o) o = new_buf(127);
        o.write_shift(4, data.hsState);
        o.write_shift(4, data.iTabID);
        write_RelID(data.strRelID, o);
        write_XLWideString(data.name.substr(0, 31), o);
        return o
    }

    function parse_BrtWbProp(data, length) { data.read_shift(4); var dwThemeVersion = data.read_shift(4); var strName = length > 8 ? parse_XLWideString(data) : ""; return [dwThemeVersion, strName] }

    function write_BrtWbProp(data, o) {
        if (!o) o = new_buf(8);
        o.write_shift(4, 0);
        o.write_shift(4, 0);
        return o
    }

    function parse_BrtFRTArchID$(data, length) {
        var o = {};
        data.read_shift(4);
        o.ArchID = data.read_shift(4);
        data.l += length - 8;
        return o
    }

    function parse_wb_bin(data, opts) {
        var wb = { AppVersion: {}, WBProps: {}, WBView: [], Sheets: [], CalcPr: {}, xmlns: "" };
        var pass = false,
            z;
        recordhopper(data, function hopper_wb(val, R) {
            switch (R.n) {
                case "BrtBundleSh":
                    wb.Sheets.push(val);
                    break;
                case "BrtBeginBook":
                    break;
                case "BrtFileVersion":
                    break;
                case "BrtWbProp":
                    break;
                case "BrtACBegin":
                    break;
                case "BrtAbsPath15":
                    break;
                case "BrtACEnd":
                    break;
                case "BrtBookProtection":
                    break;
                case "BrtBeginBookViews":
                    break;
                case "BrtBookView":
                    break;
                case "BrtEndBookViews":
                    break;
                case "BrtBeginBundleShs":
                    break;
                case "BrtEndBundleShs":
                    break;
                case "BrtBeginFnGroup":
                    break;
                case "BrtEndFnGroup":
                    break;
                case "BrtBeginExternals":
                    break;
                case "BrtSupSelf":
                    break;
                case "BrtSupBookSrc":
                    break;
                case "BrtExternSheet":
                    break;
                case "BrtEndExternals":
                    break;
                case "BrtName":
                    break;
                case "BrtCalcProp":
                    break;
                case "BrtUserBookView":
                    break;
                case "BrtBeginPivotCacheIDs":
                    break;
                case "BrtBeginPivotCacheID":
                    break;
                case "BrtEndPivotCacheID":
                    break;
                case "BrtEndPivotCacheIDs":
                    break;
                case "BrtWebOpt":
                    break;
                case "BrtFileRecover":
                    break;
                case "BrtFileSharing":
                    break;
                case "BrtFRTBegin":
                    pass = true;
                    break;
                case "BrtFRTArchID$":
                    break;
                case "BrtFRTEnd":
                    pass = false;
                    break;
                case "BrtEndBook":
                    break;
                default:
                    if (!pass) throw new Error("Unexpected record " + R.n)
            }
        });
        parse_wb_defaults(wb);
        return wb
    }

    function write_BUNDLESHS(ba, wb, opts) {
        write_record(ba, "BrtBeginBundleShs");
        for (var idx = 0; idx != wb.SheetNames.length; ++idx) {
            var d = { hsState: 0, iTabID: idx + 1, strRelID: "rId" + (idx + 1), name: wb.SheetNames[idx] };
            write_record(ba, "BrtBundleSh", write_BrtBundleSh(d))
        }
        write_record(ba, "BrtEndBundleShs")
    }

    function write_BrtFileVersion(data, o) {
        if (!o) o = new_buf(127);
        for (var i = 0; i != 4; ++i) o.write_shift(4, 0);
        write_XLWideString("SheetJS", o);
        write_XLWideString(XLSX.version, o);
        write_XLWideString(XLSX.version, o);
        write_XLWideString("7262", o);
        o.length = o.l;
        return o
    }

    function write_BOOKVIEWS(ba, wb, opts) {
        write_record(ba, "BrtBeginBookViews");
        write_record(ba, "BrtEndBookViews")
    }

    function write_BrtCalcProp(data, o) {
        if (!o) o = new_buf(26);
        o.write_shift(4, 0);
        o.write_shift(4, 1);
        o.write_shift(4, 0);
        write_Xnum(0, o);
        o.write_shift(-4, 1023);
        o.write_shift(1, 51);
        o.write_shift(1, 0);
        return o
    }

    function write_BrtFileRecover(data, o) {
        if (!o) o = new_buf(1);
        o.write_shift(1, 0);
        return o
    }

    function write_wb_bin(wb, opts) {
        var ba = buf_array();
        write_record(ba, "BrtBeginBook");
        write_record(ba, "BrtFileVersion", write_BrtFileVersion());
        write_record(ba, "BrtWbProp", write_BrtWbProp());
        write_BOOKVIEWS(ba, wb, opts);
        write_BUNDLESHS(ba, wb, opts);
        write_record(ba, "BrtCalcProp", write_BrtCalcProp());
        write_record(ba, "BrtFileRecover", write_BrtFileRecover());
        write_record(ba, "BrtEndBook");
        return ba.end()
    }

    function parse_wb(data, name, opts) { return (name.substr(-4) === ".bin" ? parse_wb_bin : parse_wb_xml)(data, opts) }

    function parse_ws(data, name, opts, rels) { return (name.substr(-4) === ".bin" ? parse_ws_bin : parse_ws_xml)(data, opts, rels) }

    function parse_sty(data, name, opts) { return (name.substr(-4) === ".bin" ? parse_sty_bin : parse_sty_xml)(data, opts) }

    function parse_theme(data, name, opts) { return parse_theme_xml(data, opts) }

    function parse_sst(data, name, opts) { return (name.substr(-4) === ".bin" ? parse_sst_bin : parse_sst_xml)(data, opts) }

    function parse_cmnt(data, name, opts) { return (name.substr(-4) === ".bin" ? parse_comments_bin : parse_comments_xml)(data, opts) }

    function parse_cc(data, name, opts) { return (name.substr(-4) === ".bin" ? parse_cc_bin : parse_cc_xml)(data, opts) }

    function write_wb(wb, name, opts) { return (name.substr(-4) === ".bin" ? write_wb_bin : write_wb_xml)(wb, opts) }

    function write_ws(data, name, opts, wb) { return (name.substr(-4) === ".bin" ? write_ws_bin : write_ws_xml)(data, opts, wb) }

    function write_sty(data, name, opts) { return (name.substr(-4) === ".bin" ? write_sty_bin : write_sty_xml)(data, opts) }

    function write_sst(data, name, opts) { return (name.substr(-4) === ".bin" ? write_sst_bin : write_sst_xml)(data, opts) }
    var RecordEnum = { 0: { n: "BrtRowHdr", f: parse_BrtRowHdr }, 1: { n: "BrtCellBlank", f: parse_BrtCellBlank }, 2: { n: "BrtCellRk", f: parse_BrtCellRk }, 3: { n: "BrtCellError", f: parse_BrtCellError }, 4: { n: "BrtCellBool", f: parse_BrtCellBool }, 5: { n: "BrtCellReal", f: parse_BrtCellReal }, 6: { n: "BrtCellSt", f: parse_BrtCellSt }, 7: { n: "BrtCellIsst", f: parse_BrtCellIsst }, 8: { n: "BrtFmlaString", f: parse_BrtFmlaString }, 9: { n: "BrtFmlaNum", f: parse_BrtFmlaNum }, 10: { n: "BrtFmlaBool", f: parse_BrtFmlaBool }, 11: { n: "BrtFmlaError", f: parse_BrtFmlaError }, 16: { n: "BrtFRTArchID$", f: parse_BrtFRTArchID$ }, 19: { n: "BrtSSTItem", f: parse_RichStr }, 20: { n: "BrtPCDIMissing", f: parsenoop }, 21: { n: "BrtPCDINumber", f: parsenoop }, 22: { n: "BrtPCDIBoolean", f: parsenoop }, 23: { n: "BrtPCDIError", f: parsenoop }, 24: { n: "BrtPCDIString", f: parsenoop }, 25: { n: "BrtPCDIDatetime", f: parsenoop }, 26: { n: "BrtPCDIIndex", f: parsenoop }, 27: { n: "BrtPCDIAMissing", f: parsenoop }, 28: { n: "BrtPCDIANumber", f: parsenoop }, 29: { n: "BrtPCDIABoolean", f: parsenoop }, 30: { n: "BrtPCDIAError", f: parsenoop }, 31: { n: "BrtPCDIAString", f: parsenoop }, 32: { n: "BrtPCDIADatetime", f: parsenoop }, 33: { n: "BrtPCRRecord", f: parsenoop }, 34: { n: "BrtPCRRecordDt", f: parsenoop }, 35: { n: "BrtFRTBegin", f: parsenoop }, 36: { n: "BrtFRTEnd", f: parsenoop }, 37: { n: "BrtACBegin", f: parsenoop }, 38: { n: "BrtACEnd", f: parsenoop }, 39: { n: "BrtName", f: parsenoop }, 40: { n: "BrtIndexRowBlock", f: parsenoop }, 42: { n: "BrtIndexBlock", f: parsenoop }, 43: { n: "BrtFont", f: parse_BrtFont }, 44: { n: "BrtFmt", f: parse_BrtFmt }, 45: { n: "BrtFill", f: parsenoop }, 46: { n: "BrtBorder", f: parsenoop }, 47: { n: "BrtXF", f: parse_BrtXF }, 48: { n: "BrtStyle", f: parsenoop }, 49: { n: "BrtCellMeta", f: parsenoop }, 50: { n: "BrtValueMeta", f: parsenoop }, 51: { n: "BrtMdb", f: parsenoop }, 52: { n: "BrtBeginFmd", f: parsenoop }, 53: { n: "BrtEndFmd", f: parsenoop }, 54: { n: "BrtBeginMdx", f: parsenoop }, 55: { n: "BrtEndMdx", f: parsenoop }, 56: { n: "BrtBeginMdxTuple", f: parsenoop }, 57: { n: "BrtEndMdxTuple", f: parsenoop }, 58: { n: "BrtMdxMbrIstr", f: parsenoop }, 59: { n: "BrtStr", f: parsenoop }, 60: { n: "BrtColInfo", f: parsenoop }, 62: { n: "BrtCellRString", f: parsenoop }, 63: { n: "BrtCalcChainItem$", f: parse_BrtCalcChainItem$ }, 64: { n: "BrtDVal", f: parsenoop }, 65: { n: "BrtSxvcellNum", f: parsenoop }, 66: { n: "BrtSxvcellStr", f: parsenoop }, 67: { n: "BrtSxvcellBool", f: parsenoop }, 68: { n: "BrtSxvcellErr", f: parsenoop }, 69: { n: "BrtSxvcellDate", f: parsenoop }, 70: { n: "BrtSxvcellNil", f: parsenoop }, 128: { n: "BrtFileVersion", f: parsenoop }, 129: { n: "BrtBeginSheet", f: parsenoop }, 130: { n: "BrtEndSheet", f: parsenoop }, 131: { n: "BrtBeginBook", f: parsenoop, p: 0 }, 132: { n: "BrtEndBook", f: parsenoop }, 133: { n: "BrtBeginWsViews", f: parsenoop }, 134: { n: "BrtEndWsViews", f: parsenoop }, 135: { n: "BrtBeginBookViews", f: parsenoop }, 136: { n: "BrtEndBookViews", f: parsenoop }, 137: { n: "BrtBeginWsView", f: parsenoop }, 138: { n: "BrtEndWsView", f: parsenoop }, 139: { n: "BrtBeginCsViews", f: parsenoop }, 140: { n: "BrtEndCsViews", f: parsenoop }, 141: { n: "BrtBeginCsView", f: parsenoop }, 142: { n: "BrtEndCsView", f: parsenoop }, 143: { n: "BrtBeginBundleShs", f: parsenoop }, 144: { n: "BrtEndBundleShs", f: parsenoop }, 145: { n: "BrtBeginSheetData", f: parsenoop }, 146: { n: "BrtEndSheetData", f: parsenoop }, 147: { n: "BrtWsProp", f: parse_BrtWsProp }, 148: { n: "BrtWsDim", f: parse_BrtWsDim, p: 16 }, 151: { n: "BrtPane", f: parsenoop }, 152: { n: "BrtSel", f: parsenoop }, 153: { n: "BrtWbProp", f: parse_BrtWbProp }, 154: { n: "BrtWbFactoid", f: parsenoop }, 155: { n: "BrtFileRecover", f: parsenoop }, 156: { n: "BrtBundleSh", f: parse_BrtBundleSh }, 157: { n: "BrtCalcProp", f: parsenoop }, 158: { n: "BrtBookView", f: parsenoop }, 159: { n: "BrtBeginSst", f: parse_BrtBeginSst }, 160: { n: "BrtEndSst", f: parsenoop }, 161: { n: "BrtBeginAFilter", f: parsenoop }, 162: { n: "BrtEndAFilter", f: parsenoop }, 163: { n: "BrtBeginFilterColumn", f: parsenoop }, 164: { n: "BrtEndFilterColumn", f: parsenoop }, 165: { n: "BrtBeginFilters", f: parsenoop }, 166: { n: "BrtEndFilters", f: parsenoop }, 167: { n: "BrtFilter", f: parsenoop }, 168: { n: "BrtColorFilter", f: parsenoop }, 169: { n: "BrtIconFilter", f: parsenoop }, 170: { n: "BrtTop10Filter", f: parsenoop }, 171: { n: "BrtDynamicFilter", f: parsenoop }, 172: { n: "BrtBeginCustomFilters", f: parsenoop }, 173: { n: "BrtEndCustomFilters", f: parsenoop }, 174: { n: "BrtCustomFilter", f: parsenoop }, 175: { n: "BrtAFilterDateGroupItem", f: parsenoop }, 176: { n: "BrtMergeCell", f: parse_BrtMergeCell }, 177: { n: "BrtBeginMergeCells", f: parsenoop }, 178: { n: "BrtEndMergeCells", f: parsenoop }, 179: { n: "BrtBeginPivotCacheDef", f: parsenoop }, 180: { n: "BrtEndPivotCacheDef", f: parsenoop }, 181: { n: "BrtBeginPCDFields", f: parsenoop }, 182: { n: "BrtEndPCDFields", f: parsenoop }, 183: { n: "BrtBeginPCDField", f: parsenoop }, 184: { n: "BrtEndPCDField", f: parsenoop }, 185: { n: "BrtBeginPCDSource", f: parsenoop }, 186: { n: "BrtEndPCDSource", f: parsenoop }, 187: { n: "BrtBeginPCDSRange", f: parsenoop }, 188: { n: "BrtEndPCDSRange", f: parsenoop }, 189: { n: "BrtBeginPCDFAtbl", f: parsenoop }, 190: { n: "BrtEndPCDFAtbl", f: parsenoop }, 191: { n: "BrtBeginPCDIRun", f: parsenoop }, 192: { n: "BrtEndPCDIRun", f: parsenoop }, 193: { n: "BrtBeginPivotCacheRecords", f: parsenoop }, 194: { n: "BrtEndPivotCacheRecords", f: parsenoop }, 195: { n: "BrtBeginPCDHierarchies", f: parsenoop }, 196: { n: "BrtEndPCDHierarchies", f: parsenoop }, 197: { n: "BrtBeginPCDHierarchy", f: parsenoop }, 198: { n: "BrtEndPCDHierarchy", f: parsenoop }, 199: { n: "BrtBeginPCDHFieldsUsage", f: parsenoop }, 200: { n: "BrtEndPCDHFieldsUsage", f: parsenoop }, 201: { n: "BrtBeginExtConnection", f: parsenoop }, 202: { n: "BrtEndExtConnection", f: parsenoop }, 203: { n: "BrtBeginECDbProps", f: parsenoop }, 204: { n: "BrtEndECDbProps", f: parsenoop }, 205: { n: "BrtBeginECOlapProps", f: parsenoop }, 206: { n: "BrtEndECOlapProps", f: parsenoop }, 207: { n: "BrtBeginPCDSConsol", f: parsenoop }, 208: { n: "BrtEndPCDSConsol", f: parsenoop }, 209: { n: "BrtBeginPCDSCPages", f: parsenoop }, 210: { n: "BrtEndPCDSCPages", f: parsenoop }, 211: { n: "BrtBeginPCDSCPage", f: parsenoop }, 212: { n: "BrtEndPCDSCPage", f: parsenoop }, 213: { n: "BrtBeginPCDSCPItem", f: parsenoop }, 214: { n: "BrtEndPCDSCPItem", f: parsenoop }, 215: { n: "BrtBeginPCDSCSets", f: parsenoop }, 216: { n: "BrtEndPCDSCSets", f: parsenoop }, 217: { n: "BrtBeginPCDSCSet", f: parsenoop }, 218: { n: "BrtEndPCDSCSet", f: parsenoop }, 219: { n: "BrtBeginPCDFGroup", f: parsenoop }, 220: { n: "BrtEndPCDFGroup", f: parsenoop }, 221: { n: "BrtBeginPCDFGItems", f: parsenoop }, 222: { n: "BrtEndPCDFGItems", f: parsenoop }, 223: { n: "BrtBeginPCDFGRange", f: parsenoop }, 224: { n: "BrtEndPCDFGRange", f: parsenoop }, 225: { n: "BrtBeginPCDFGDiscrete", f: parsenoop }, 226: { n: "BrtEndPCDFGDiscrete", f: parsenoop }, 227: { n: "BrtBeginPCDSDTupleCache", f: parsenoop }, 228: { n: "BrtEndPCDSDTupleCache", f: parsenoop }, 229: { n: "BrtBeginPCDSDTCEntries", f: parsenoop }, 230: { n: "BrtEndPCDSDTCEntries", f: parsenoop }, 231: { n: "BrtBeginPCDSDTCEMembers", f: parsenoop }, 232: { n: "BrtEndPCDSDTCEMembers", f: parsenoop }, 233: { n: "BrtBeginPCDSDTCEMember", f: parsenoop }, 234: { n: "BrtEndPCDSDTCEMember", f: parsenoop }, 235: { n: "BrtBeginPCDSDTCQueries", f: parsenoop }, 236: { n: "BrtEndPCDSDTCQueries", f: parsenoop }, 237: { n: "BrtBeginPCDSDTCQuery", f: parsenoop }, 238: { n: "BrtEndPCDSDTCQuery", f: parsenoop }, 239: { n: "BrtBeginPCDSDTCSets", f: parsenoop }, 240: { n: "BrtEndPCDSDTCSets", f: parsenoop }, 241: { n: "BrtBeginPCDSDTCSet", f: parsenoop }, 242: { n: "BrtEndPCDSDTCSet", f: parsenoop }, 243: { n: "BrtBeginPCDCalcItems", f: parsenoop }, 244: { n: "BrtEndPCDCalcItems", f: parsenoop }, 245: { n: "BrtBeginPCDCalcItem", f: parsenoop }, 246: { n: "BrtEndPCDCalcItem", f: parsenoop }, 247: { n: "BrtBeginPRule", f: parsenoop }, 248: { n: "BrtEndPRule", f: parsenoop }, 249: { n: "BrtBeginPRFilters", f: parsenoop }, 250: { n: "BrtEndPRFilters", f: parsenoop }, 251: { n: "BrtBeginPRFilter", f: parsenoop }, 252: { n: "BrtEndPRFilter", f: parsenoop }, 253: { n: "BrtBeginPNames", f: parsenoop }, 254: { n: "BrtEndPNames", f: parsenoop }, 255: { n: "BrtBeginPName", f: parsenoop }, 256: { n: "BrtEndPName", f: parsenoop }, 257: { n: "BrtBeginPNPairs", f: parsenoop }, 258: { n: "BrtEndPNPairs", f: parsenoop }, 259: { n: "BrtBeginPNPair", f: parsenoop }, 260: { n: "BrtEndPNPair", f: parsenoop }, 261: { n: "BrtBeginECWebProps", f: parsenoop }, 262: { n: "BrtEndECWebProps", f: parsenoop }, 263: { n: "BrtBeginEcWpTables", f: parsenoop }, 264: { n: "BrtEndECWPTables", f: parsenoop }, 265: { n: "BrtBeginECParams", f: parsenoop }, 266: { n: "BrtEndECParams", f: parsenoop }, 267: { n: "BrtBeginECParam", f: parsenoop }, 268: { n: "BrtEndECParam", f: parsenoop }, 269: { n: "BrtBeginPCDKPIs", f: parsenoop }, 270: { n: "BrtEndPCDKPIs", f: parsenoop }, 271: { n: "BrtBeginPCDKPI", f: parsenoop }, 272: { n: "BrtEndPCDKPI", f: parsenoop }, 273: { n: "BrtBeginDims", f: parsenoop }, 274: { n: "BrtEndDims", f: parsenoop }, 275: { n: "BrtBeginDim", f: parsenoop }, 276: { n: "BrtEndDim", f: parsenoop }, 277: { n: "BrtIndexPartEnd", f: parsenoop }, 278: { n: "BrtBeginStyleSheet", f: parsenoop }, 279: { n: "BrtEndStyleSheet", f: parsenoop }, 280: { n: "BrtBeginSXView", f: parsenoop }, 281: { n: "BrtEndSXVI", f: parsenoop }, 282: { n: "BrtBeginSXVI", f: parsenoop }, 283: { n: "BrtBeginSXVIs", f: parsenoop }, 284: { n: "BrtEndSXVIs", f: parsenoop }, 285: { n: "BrtBeginSXVD", f: parsenoop }, 286: { n: "BrtEndSXVD", f: parsenoop }, 287: { n: "BrtBeginSXVDs", f: parsenoop }, 288: { n: "BrtEndSXVDs", f: parsenoop }, 289: { n: "BrtBeginSXPI", f: parsenoop }, 290: { n: "BrtEndSXPI", f: parsenoop }, 291: { n: "BrtBeginSXPIs", f: parsenoop }, 292: { n: "BrtEndSXPIs", f: parsenoop }, 293: { n: "BrtBeginSXDI", f: parsenoop }, 294: { n: "BrtEndSXDI", f: parsenoop }, 295: { n: "BrtBeginSXDIs", f: parsenoop }, 296: { n: "BrtEndSXDIs", f: parsenoop }, 297: { n: "BrtBeginSXLI", f: parsenoop }, 298: { n: "BrtEndSXLI", f: parsenoop }, 299: { n: "BrtBeginSXLIRws", f: parsenoop }, 300: { n: "BrtEndSXLIRws", f: parsenoop }, 301: { n: "BrtBeginSXLICols", f: parsenoop }, 302: { n: "BrtEndSXLICols", f: parsenoop }, 303: { n: "BrtBeginSXFormat", f: parsenoop }, 304: { n: "BrtEndSXFormat", f: parsenoop }, 305: { n: "BrtBeginSXFormats", f: parsenoop }, 306: { n: "BrtEndSxFormats", f: parsenoop }, 307: { n: "BrtBeginSxSelect", f: parsenoop }, 308: { n: "BrtEndSxSelect", f: parsenoop }, 309: { n: "BrtBeginISXVDRws", f: parsenoop }, 310: { n: "BrtEndISXVDRws", f: parsenoop }, 311: { n: "BrtBeginISXVDCols", f: parsenoop }, 312: { n: "BrtEndISXVDCols", f: parsenoop }, 313: { n: "BrtEndSXLocation", f: parsenoop }, 314: { n: "BrtBeginSXLocation", f: parsenoop }, 315: { n: "BrtEndSXView", f: parsenoop }, 316: { n: "BrtBeginSXTHs", f: parsenoop }, 317: { n: "BrtEndSXTHs", f: parsenoop }, 318: { n: "BrtBeginSXTH", f: parsenoop }, 319: { n: "BrtEndSXTH", f: parsenoop }, 320: { n: "BrtBeginISXTHRws", f: parsenoop }, 321: { n: "BrtEndISXTHRws", f: parsenoop }, 322: { n: "BrtBeginISXTHCols", f: parsenoop }, 323: { n: "BrtEndISXTHCols", f: parsenoop }, 324: { n: "BrtBeginSXTDMPS", f: parsenoop }, 325: { n: "BrtEndSXTDMPs", f: parsenoop }, 326: { n: "BrtBeginSXTDMP", f: parsenoop }, 327: { n: "BrtEndSXTDMP", f: parsenoop }, 328: { n: "BrtBeginSXTHItems", f: parsenoop }, 329: { n: "BrtEndSXTHItems", f: parsenoop }, 330: { n: "BrtBeginSXTHItem", f: parsenoop }, 331: { n: "BrtEndSXTHItem", f: parsenoop }, 332: { n: "BrtBeginMetadata", f: parsenoop }, 333: { n: "BrtEndMetadata", f: parsenoop }, 334: { n: "BrtBeginEsmdtinfo", f: parsenoop }, 335: { n: "BrtMdtinfo", f: parsenoop }, 336: { n: "BrtEndEsmdtinfo", f: parsenoop }, 337: { n: "BrtBeginEsmdb", f: parsenoop }, 338: { n: "BrtEndEsmdb", f: parsenoop }, 339: { n: "BrtBeginEsfmd", f: parsenoop }, 340: { n: "BrtEndEsfmd", f: parsenoop }, 341: { n: "BrtBeginSingleCells", f: parsenoop }, 342: { n: "BrtEndSingleCells", f: parsenoop }, 343: { n: "BrtBeginList", f: parsenoop }, 344: { n: "BrtEndList", f: parsenoop }, 345: { n: "BrtBeginListCols", f: parsenoop }, 346: { n: "BrtEndListCols", f: parsenoop }, 347: { n: "BrtBeginListCol", f: parsenoop }, 348: { n: "BrtEndListCol", f: parsenoop }, 349: { n: "BrtBeginListXmlCPr", f: parsenoop }, 350: { n: "BrtEndListXmlCPr", f: parsenoop }, 351: { n: "BrtListCCFmla", f: parsenoop }, 352: { n: "BrtListTrFmla", f: parsenoop }, 353: { n: "BrtBeginExternals", f: parsenoop }, 354: { n: "BrtEndExternals", f: parsenoop }, 355: { n: "BrtSupBookSrc", f: parsenoop }, 357: { n: "BrtSupSelf", f: parsenoop }, 358: { n: "BrtSupSame", f: parsenoop }, 359: { n: "BrtSupTabs", f: parsenoop }, 360: { n: "BrtBeginSupBook", f: parsenoop }, 361: { n: "BrtPlaceholderName", f: parsenoop }, 362: { n: "BrtExternSheet", f: parsenoop }, 363: { n: "BrtExternTableStart", f: parsenoop }, 364: { n: "BrtExternTableEnd", f: parsenoop }, 366: { n: "BrtExternRowHdr", f: parsenoop }, 367: { n: "BrtExternCellBlank", f: parsenoop }, 368: { n: "BrtExternCellReal", f: parsenoop }, 369: { n: "BrtExternCellBool", f: parsenoop }, 370: { n: "BrtExternCellError", f: parsenoop }, 371: { n: "BrtExternCellString", f: parsenoop }, 372: { n: "BrtBeginEsmdx", f: parsenoop }, 373: { n: "BrtEndEsmdx", f: parsenoop }, 374: { n: "BrtBeginMdxSet", f: parsenoop }, 375: { n: "BrtEndMdxSet", f: parsenoop }, 376: { n: "BrtBeginMdxMbrProp", f: parsenoop }, 377: { n: "BrtEndMdxMbrProp", f: parsenoop }, 378: { n: "BrtBeginMdxKPI", f: parsenoop }, 379: { n: "BrtEndMdxKPI", f: parsenoop }, 380: { n: "BrtBeginEsstr", f: parsenoop }, 381: { n: "BrtEndEsstr", f: parsenoop }, 382: { n: "BrtBeginPRFItem", f: parsenoop }, 383: { n: "BrtEndPRFItem", f: parsenoop }, 384: { n: "BrtBeginPivotCacheIDs", f: parsenoop }, 385: { n: "BrtEndPivotCacheIDs", f: parsenoop }, 386: { n: "BrtBeginPivotCacheID", f: parsenoop }, 387: { n: "BrtEndPivotCacheID", f: parsenoop }, 388: { n: "BrtBeginISXVIs", f: parsenoop }, 389: { n: "BrtEndISXVIs", f: parsenoop }, 390: { n: "BrtBeginColInfos", f: parsenoop }, 391: { n: "BrtEndColInfos", f: parsenoop }, 392: { n: "BrtBeginRwBrk", f: parsenoop }, 393: { n: "BrtEndRwBrk", f: parsenoop }, 394: { n: "BrtBeginColBrk", f: parsenoop }, 395: { n: "BrtEndColBrk", f: parsenoop }, 396: { n: "BrtBrk", f: parsenoop }, 397: { n: "BrtUserBookView", f: parsenoop }, 398: { n: "BrtInfo", f: parsenoop }, 399: { n: "BrtCUsr", f: parsenoop }, 400: { n: "BrtUsr", f: parsenoop }, 401: { n: "BrtBeginUsers", f: parsenoop }, 403: { n: "BrtEOF", f: parsenoop }, 404: { n: "BrtUCR", f: parsenoop }, 405: { n: "BrtRRInsDel", f: parsenoop }, 406: { n: "BrtRREndInsDel", f: parsenoop }, 407: { n: "BrtRRMove", f: parsenoop }, 408: { n: "BrtRREndMove", f: parsenoop }, 409: { n: "BrtRRChgCell", f: parsenoop }, 410: { n: "BrtRREndChgCell", f: parsenoop }, 411: { n: "BrtRRHeader", f: parsenoop }, 412: { n: "BrtRRUserView", f: parsenoop }, 413: { n: "BrtRRRenSheet", f: parsenoop }, 414: { n: "BrtRRInsertSh", f: parsenoop }, 415: { n: "BrtRRDefName", f: parsenoop }, 416: { n: "BrtRRNote", f: parsenoop }, 417: { n: "BrtRRConflict", f: parsenoop }, 418: { n: "BrtRRTQSIF", f: parsenoop }, 419: { n: "BrtRRFormat", f: parsenoop }, 420: { n: "BrtRREndFormat", f: parsenoop }, 421: { n: "BrtRRAutoFmt", f: parsenoop }, 422: { n: "BrtBeginUserShViews", f: parsenoop }, 423: { n: "BrtBeginUserShView", f: parsenoop }, 424: { n: "BrtEndUserShView", f: parsenoop }, 425: { n: "BrtEndUserShViews", f: parsenoop }, 426: { n: "BrtArrFmla", f: parsenoop }, 427: { n: "BrtShrFmla", f: parsenoop }, 428: { n: "BrtTable", f: parsenoop }, 429: { n: "BrtBeginExtConnections", f: parsenoop }, 430: { n: "BrtEndExtConnections", f: parsenoop }, 431: { n: "BrtBeginPCDCalcMems", f: parsenoop }, 432: { n: "BrtEndPCDCalcMems", f: parsenoop }, 433: { n: "BrtBeginPCDCalcMem", f: parsenoop }, 434: { n: "BrtEndPCDCalcMem", f: parsenoop }, 435: { n: "BrtBeginPCDHGLevels", f: parsenoop }, 436: { n: "BrtEndPCDHGLevels", f: parsenoop }, 437: { n: "BrtBeginPCDHGLevel", f: parsenoop }, 438: { n: "BrtEndPCDHGLevel", f: parsenoop }, 439: { n: "BrtBeginPCDHGLGroups", f: parsenoop }, 440: { n: "BrtEndPCDHGLGroups", f: parsenoop }, 441: { n: "BrtBeginPCDHGLGroup", f: parsenoop }, 442: { n: "BrtEndPCDHGLGroup", f: parsenoop }, 443: { n: "BrtBeginPCDHGLGMembers", f: parsenoop }, 444: { n: "BrtEndPCDHGLGMembers", f: parsenoop }, 445: { n: "BrtBeginPCDHGLGMember", f: parsenoop }, 446: { n: "BrtEndPCDHGLGMember", f: parsenoop }, 447: { n: "BrtBeginQSI", f: parsenoop }, 448: { n: "BrtEndQSI", f: parsenoop }, 449: { n: "BrtBeginQSIR", f: parsenoop }, 450: { n: "BrtEndQSIR", f: parsenoop }, 451: { n: "BrtBeginDeletedNames", f: parsenoop }, 452: { n: "BrtEndDeletedNames", f: parsenoop }, 453: { n: "BrtBeginDeletedName", f: parsenoop }, 454: { n: "BrtEndDeletedName", f: parsenoop }, 455: { n: "BrtBeginQSIFs", f: parsenoop }, 456: { n: "BrtEndQSIFs", f: parsenoop }, 457: { n: "BrtBeginQSIF", f: parsenoop }, 458: { n: "BrtEndQSIF", f: parsenoop }, 459: { n: "BrtBeginAutoSortScope", f: parsenoop }, 460: { n: "BrtEndAutoSortScope", f: parsenoop }, 461: { n: "BrtBeginConditionalFormatting", f: parsenoop }, 462: { n: "BrtEndConditionalFormatting", f: parsenoop }, 463: { n: "BrtBeginCFRule", f: parsenoop }, 464: { n: "BrtEndCFRule", f: parsenoop }, 465: { n: "BrtBeginIconSet", f: parsenoop }, 466: { n: "BrtEndIconSet", f: parsenoop }, 467: { n: "BrtBeginDatabar", f: parsenoop }, 468: { n: "BrtEndDatabar", f: parsenoop }, 469: { n: "BrtBeginColorScale", f: parsenoop }, 470: { n: "BrtEndColorScale", f: parsenoop }, 471: { n: "BrtCFVO", f: parsenoop }, 472: { n: "BrtExternValueMeta", f: parsenoop }, 473: { n: "BrtBeginColorPalette", f: parsenoop }, 474: { n: "BrtEndColorPalette", f: parsenoop }, 475: { n: "BrtIndexedColor", f: parsenoop }, 476: { n: "BrtMargins", f: parsenoop }, 477: { n: "BrtPrintOptions", f: parsenoop }, 478: { n: "BrtPageSetup", f: parsenoop }, 479: { n: "BrtBeginHeaderFooter", f: parsenoop }, 480: { n: "BrtEndHeaderFooter", f: parsenoop }, 481: { n: "BrtBeginSXCrtFormat", f: parsenoop }, 482: { n: "BrtEndSXCrtFormat", f: parsenoop }, 483: { n: "BrtBeginSXCrtFormats", f: parsenoop }, 484: { n: "BrtEndSXCrtFormats", f: parsenoop }, 485: { n: "BrtWsFmtInfo", f: parsenoop }, 486: { n: "BrtBeginMgs", f: parsenoop }, 487: { n: "BrtEndMGs", f: parsenoop }, 488: { n: "BrtBeginMGMaps", f: parsenoop }, 489: { n: "BrtEndMGMaps", f: parsenoop }, 490: { n: "BrtBeginMG", f: parsenoop }, 491: { n: "BrtEndMG", f: parsenoop }, 492: { n: "BrtBeginMap", f: parsenoop }, 493: { n: "BrtEndMap", f: parsenoop }, 494: { n: "BrtHLink", f: parse_BrtHLink }, 495: { n: "BrtBeginDCon", f: parsenoop }, 496: { n: "BrtEndDCon", f: parsenoop }, 497: { n: "BrtBeginDRefs", f: parsenoop }, 498: { n: "BrtEndDRefs", f: parsenoop }, 499: { n: "BrtDRef", f: parsenoop }, 500: { n: "BrtBeginScenMan", f: parsenoop }, 501: { n: "BrtEndScenMan", f: parsenoop }, 502: { n: "BrtBeginSct", f: parsenoop }, 503: { n: "BrtEndSct", f: parsenoop }, 504: { n: "BrtSlc", f: parsenoop }, 505: { n: "BrtBeginDXFs", f: parsenoop }, 506: { n: "BrtEndDXFs", f: parsenoop }, 507: { n: "BrtDXF", f: parsenoop }, 508: { n: "BrtBeginTableStyles", f: parsenoop }, 509: { n: "BrtEndTableStyles", f: parsenoop }, 510: { n: "BrtBeginTableStyle", f: parsenoop }, 511: { n: "BrtEndTableStyle", f: parsenoop }, 512: { n: "BrtTableStyleElement", f: parsenoop }, 513: { n: "BrtTableStyleClient", f: parsenoop }, 514: { n: "BrtBeginVolDeps", f: parsenoop }, 515: { n: "BrtEndVolDeps", f: parsenoop }, 516: { n: "BrtBeginVolType", f: parsenoop }, 517: { n: "BrtEndVolType", f: parsenoop }, 518: { n: "BrtBeginVolMain", f: parsenoop }, 519: { n: "BrtEndVolMain", f: parsenoop }, 520: { n: "BrtBeginVolTopic", f: parsenoop }, 521: { n: "BrtEndVolTopic", f: parsenoop }, 522: { n: "BrtVolSubtopic", f: parsenoop }, 523: { n: "BrtVolRef", f: parsenoop }, 524: { n: "BrtVolNum", f: parsenoop }, 525: { n: "BrtVolErr", f: parsenoop }, 526: { n: "BrtVolStr", f: parsenoop }, 527: { n: "BrtVolBool", f: parsenoop }, 528: { n: "BrtBeginCalcChain$", f: parsenoop }, 529: { n: "BrtEndCalcChain$", f: parsenoop }, 530: { n: "BrtBeginSortState", f: parsenoop }, 531: { n: "BrtEndSortState", f: parsenoop }, 532: { n: "BrtBeginSortCond", f: parsenoop }, 533: { n: "BrtEndSortCond", f: parsenoop }, 534: { n: "BrtBookProtection", f: parsenoop }, 535: { n: "BrtSheetProtection", f: parsenoop }, 536: { n: "BrtRangeProtection", f: parsenoop }, 537: { n: "BrtPhoneticInfo", f: parsenoop }, 538: { n: "BrtBeginECTxtWiz", f: parsenoop }, 539: { n: "BrtEndECTxtWiz", f: parsenoop }, 540: { n: "BrtBeginECTWFldInfoLst", f: parsenoop }, 541: { n: "BrtEndECTWFldInfoLst", f: parsenoop }, 542: { n: "BrtBeginECTwFldInfo", f: parsenoop }, 548: { n: "BrtFileSharing", f: parsenoop }, 549: { n: "BrtOleSize", f: parsenoop }, 550: { n: "BrtDrawing", f: parsenoop }, 551: { n: "BrtLegacyDrawing", f: parsenoop }, 552: { n: "BrtLegacyDrawingHF", f: parsenoop }, 553: { n: "BrtWebOpt", f: parsenoop }, 554: { n: "BrtBeginWebPubItems", f: parsenoop }, 555: { n: "BrtEndWebPubItems", f: parsenoop }, 556: { n: "BrtBeginWebPubItem", f: parsenoop }, 557: { n: "BrtEndWebPubItem", f: parsenoop }, 558: { n: "BrtBeginSXCondFmt", f: parsenoop }, 559: { n: "BrtEndSXCondFmt", f: parsenoop }, 560: { n: "BrtBeginSXCondFmts", f: parsenoop }, 561: { n: "BrtEndSXCondFmts", f: parsenoop }, 562: { n: "BrtBkHim", f: parsenoop }, 564: { n: "BrtColor", f: parsenoop }, 565: { n: "BrtBeginIndexedColors", f: parsenoop }, 566: { n: "BrtEndIndexedColors", f: parsenoop }, 569: { n: "BrtBeginMRUColors", f: parsenoop }, 570: { n: "BrtEndMRUColors", f: parsenoop }, 572: { n: "BrtMRUColor", f: parsenoop }, 573: { n: "BrtBeginDVals", f: parsenoop }, 574: { n: "BrtEndDVals", f: parsenoop }, 577: { n: "BrtSupNameStart", f: parsenoop }, 578: { n: "BrtSupNameValueStart", f: parsenoop }, 579: { n: "BrtSupNameValueEnd", f: parsenoop }, 580: { n: "BrtSupNameNum", f: parsenoop }, 581: { n: "BrtSupNameErr", f: parsenoop }, 582: { n: "BrtSupNameSt", f: parsenoop }, 583: { n: "BrtSupNameNil", f: parsenoop }, 584: { n: "BrtSupNameBool", f: parsenoop }, 585: { n: "BrtSupNameFmla", f: parsenoop }, 586: { n: "BrtSupNameBits", f: parsenoop }, 587: { n: "BrtSupNameEnd", f: parsenoop }, 588: { n: "BrtEndSupBook", f: parsenoop }, 589: { n: "BrtCellSmartTagProperty", f: parsenoop }, 590: { n: "BrtBeginCellSmartTag", f: parsenoop }, 591: { n: "BrtEndCellSmartTag", f: parsenoop }, 592: { n: "BrtBeginCellSmartTags", f: parsenoop }, 593: { n: "BrtEndCellSmartTags", f: parsenoop }, 594: { n: "BrtBeginSmartTags", f: parsenoop }, 595: { n: "BrtEndSmartTags", f: parsenoop }, 596: { n: "BrtSmartTagType", f: parsenoop }, 597: { n: "BrtBeginSmartTagTypes", f: parsenoop }, 598: { n: "BrtEndSmartTagTypes", f: parsenoop }, 599: { n: "BrtBeginSXFilters", f: parsenoop }, 600: { n: "BrtEndSXFilters", f: parsenoop }, 601: { n: "BrtBeginSXFILTER", f: parsenoop }, 602: { n: "BrtEndSXFilter", f: parsenoop }, 603: { n: "BrtBeginFills", f: parsenoop }, 604: { n: "BrtEndFills", f: parsenoop }, 605: { n: "BrtBeginCellWatches", f: parsenoop }, 606: { n: "BrtEndCellWatches", f: parsenoop }, 607: { n: "BrtCellWatch", f: parsenoop }, 608: { n: "BrtBeginCRErrs", f: parsenoop }, 609: { n: "BrtEndCRErrs", f: parsenoop }, 610: { n: "BrtCrashRecErr", f: parsenoop }, 611: { n: "BrtBeginFonts", f: parsenoop }, 612: { n: "BrtEndFonts", f: parsenoop }, 613: { n: "BrtBeginBorders", f: parsenoop }, 614: { n: "BrtEndBorders", f: parsenoop }, 615: { n: "BrtBeginFmts", f: parsenoop }, 616: { n: "BrtEndFmts", f: parsenoop }, 617: { n: "BrtBeginCellXFs", f: parsenoop }, 618: { n: "BrtEndCellXFs", f: parsenoop }, 619: { n: "BrtBeginStyles", f: parsenoop }, 620: { n: "BrtEndStyles", f: parsenoop }, 625: { n: "BrtBigName", f: parsenoop }, 626: { n: "BrtBeginCellStyleXFs", f: parsenoop }, 627: { n: "BrtEndCellStyleXFs", f: parsenoop }, 628: { n: "BrtBeginComments", f: parsenoop }, 629: { n: "BrtEndComments", f: parsenoop }, 630: { n: "BrtBeginCommentAuthors", f: parsenoop }, 631: { n: "BrtEndCommentAuthors", f: parsenoop }, 632: { n: "BrtCommentAuthor", f: parse_BrtCommentAuthor }, 633: { n: "BrtBeginCommentList", f: parsenoop }, 634: { n: "BrtEndCommentList", f: parsenoop }, 635: { n: "BrtBeginComment", f: parse_BrtBeginComment }, 636: { n: "BrtEndComment", f: parsenoop }, 637: { n: "BrtCommentText", f: parse_BrtCommentText }, 638: { n: "BrtBeginOleObjects", f: parsenoop }, 639: { n: "BrtOleObject", f: parsenoop }, 640: { n: "BrtEndOleObjects", f: parsenoop }, 641: { n: "BrtBeginSxrules", f: parsenoop }, 642: { n: "BrtEndSxRules", f: parsenoop }, 643: { n: "BrtBeginActiveXControls", f: parsenoop }, 644: { n: "BrtActiveX", f: parsenoop }, 645: { n: "BrtEndActiveXControls", f: parsenoop }, 646: { n: "BrtBeginPCDSDTCEMembersSortBy", f: parsenoop }, 648: { n: "BrtBeginCellIgnoreECs", f: parsenoop }, 649: { n: "BrtCellIgnoreEC", f: parsenoop }, 650: { n: "BrtEndCellIgnoreECs", f: parsenoop }, 651: { n: "BrtCsProp", f: parsenoop }, 652: { n: "BrtCsPageSetup", f: parsenoop }, 653: { n: "BrtBeginUserCsViews", f: parsenoop }, 654: { n: "BrtEndUserCsViews", f: parsenoop }, 655: { n: "BrtBeginUserCsView", f: parsenoop }, 656: { n: "BrtEndUserCsView", f: parsenoop }, 657: { n: "BrtBeginPcdSFCIEntries", f: parsenoop }, 658: { n: "BrtEndPCDSFCIEntries", f: parsenoop }, 659: { n: "BrtPCDSFCIEntry", f: parsenoop }, 660: { n: "BrtBeginListParts", f: parsenoop }, 661: { n: "BrtListPart", f: parsenoop }, 662: { n: "BrtEndListParts", f: parsenoop }, 663: { n: "BrtSheetCalcProp", f: parsenoop }, 664: { n: "BrtBeginFnGroup", f: parsenoop }, 665: { n: "BrtFnGroup", f: parsenoop }, 666: { n: "BrtEndFnGroup", f: parsenoop }, 667: { n: "BrtSupAddin", f: parsenoop }, 668: { n: "BrtSXTDMPOrder", f: parsenoop }, 669: { n: "BrtCsProtection", f: parsenoop }, 671: { n: "BrtBeginWsSortMap", f: parsenoop }, 672: { n: "BrtEndWsSortMap", f: parsenoop }, 673: { n: "BrtBeginRRSort", f: parsenoop }, 674: { n: "BrtEndRRSort", f: parsenoop }, 675: { n: "BrtRRSortItem", f: parsenoop }, 676: { n: "BrtFileSharingIso", f: parsenoop }, 677: { n: "BrtBookProtectionIso", f: parsenoop }, 678: { n: "BrtSheetProtectionIso", f: parsenoop }, 679: { n: "BrtCsProtectionIso", f: parsenoop }, 680: { n: "BrtRangeProtectionIso", f: parsenoop }, 1024: { n: "BrtRwDescent", f: parsenoop }, 1025: { n: "BrtKnownFonts", f: parsenoop }, 1026: { n: "BrtBeginSXTupleSet", f: parsenoop }, 1027: { n: "BrtEndSXTupleSet", f: parsenoop }, 1028: { n: "BrtBeginSXTupleSetHeader", f: parsenoop }, 1029: { n: "BrtEndSXTupleSetHeader", f: parsenoop }, 1030: { n: "BrtSXTupleSetHeaderItem", f: parsenoop }, 1031: { n: "BrtBeginSXTupleSetData", f: parsenoop }, 1032: { n: "BrtEndSXTupleSetData", f: parsenoop }, 1033: { n: "BrtBeginSXTupleSetRow", f: parsenoop }, 1034: { n: "BrtEndSXTupleSetRow", f: parsenoop }, 1035: { n: "BrtSXTupleSetRowItem", f: parsenoop }, 1036: { n: "BrtNameExt", f: parsenoop }, 1037: { n: "BrtPCDH14", f: parsenoop }, 1038: { n: "BrtBeginPCDCalcMem14", f: parsenoop }, 1039: { n: "BrtEndPCDCalcMem14", f: parsenoop }, 1040: { n: "BrtSXTH14", f: parsenoop }, 1041: { n: "BrtBeginSparklineGroup", f: parsenoop }, 1042: { n: "BrtEndSparklineGroup", f: parsenoop }, 1043: { n: "BrtSparkline", f: parsenoop }, 1044: { n: "BrtSXDI14", f: parsenoop }, 1045: { n: "BrtWsFmtInfoEx14", f: parsenoop }, 1046: { n: "BrtBeginConditionalFormatting14", f: parsenoop }, 1047: { n: "BrtEndConditionalFormatting14", f: parsenoop }, 1048: { n: "BrtBeginCFRule14", f: parsenoop }, 1049: { n: "BrtEndCFRule14", f: parsenoop }, 1050: { n: "BrtCFVO14", f: parsenoop }, 1051: { n: "BrtBeginDatabar14", f: parsenoop }, 1052: { n: "BrtBeginIconSet14", f: parsenoop }, 1053: { n: "BrtDVal14", f: parsenoop }, 1054: { n: "BrtBeginDVals14", f: parsenoop }, 1055: { n: "BrtColor14", f: parsenoop }, 1056: { n: "BrtBeginSparklines", f: parsenoop }, 1057: { n: "BrtEndSparklines", f: parsenoop }, 1058: { n: "BrtBeginSparklineGroups", f: parsenoop }, 1059: { n: "BrtEndSparklineGroups", f: parsenoop }, 1061: { n: "BrtSXVD14", f: parsenoop }, 1062: { n: "BrtBeginSxview14", f: parsenoop }, 1063: { n: "BrtEndSxview14", f: parsenoop }, 1066: { n: "BrtBeginPCD14", f: parsenoop }, 1067: { n: "BrtEndPCD14", f: parsenoop }, 1068: { n: "BrtBeginExtConn14", f: parsenoop }, 1069: { n: "BrtEndExtConn14", f: parsenoop }, 1070: { n: "BrtBeginSlicerCacheIDs", f: parsenoop }, 1071: { n: "BrtEndSlicerCacheIDs", f: parsenoop }, 1072: { n: "BrtBeginSlicerCacheID", f: parsenoop }, 1073: { n: "BrtEndSlicerCacheID", f: parsenoop }, 1075: { n: "BrtBeginSlicerCache", f: parsenoop }, 1076: { n: "BrtEndSlicerCache", f: parsenoop }, 1077: { n: "BrtBeginSlicerCacheDef", f: parsenoop }, 1078: { n: "BrtEndSlicerCacheDef", f: parsenoop }, 1079: { n: "BrtBeginSlicersEx", f: parsenoop }, 1080: { n: "BrtEndSlicersEx", f: parsenoop }, 1081: { n: "BrtBeginSlicerEx", f: parsenoop }, 1082: { n: "BrtEndSlicerEx", f: parsenoop }, 1083: { n: "BrtBeginSlicer", f: parsenoop }, 1084: { n: "BrtEndSlicer", f: parsenoop }, 1085: { n: "BrtSlicerCachePivotTables", f: parsenoop }, 1086: { n: "BrtBeginSlicerCacheOlapImpl", f: parsenoop }, 1087: { n: "BrtEndSlicerCacheOlapImpl", f: parsenoop }, 1088: { n: "BrtBeginSlicerCacheLevelsData", f: parsenoop }, 1089: { n: "BrtEndSlicerCacheLevelsData", f: parsenoop }, 1090: { n: "BrtBeginSlicerCacheLevelData", f: parsenoop }, 1091: { n: "BrtEndSlicerCacheLevelData", f: parsenoop }, 1092: { n: "BrtBeginSlicerCacheSiRanges", f: parsenoop }, 1093: { n: "BrtEndSlicerCacheSiRanges", f: parsenoop }, 1094: { n: "BrtBeginSlicerCacheSiRange", f: parsenoop }, 1095: { n: "BrtEndSlicerCacheSiRange", f: parsenoop }, 1096: { n: "BrtSlicerCacheOlapItem", f: parsenoop }, 1097: { n: "BrtBeginSlicerCacheSelections", f: parsenoop }, 1098: { n: "BrtSlicerCacheSelection", f: parsenoop }, 1099: { n: "BrtEndSlicerCacheSelections", f: parsenoop }, 1100: { n: "BrtBeginSlicerCacheNative", f: parsenoop }, 1101: { n: "BrtEndSlicerCacheNative", f: parsenoop }, 1102: { n: "BrtSlicerCacheNativeItem", f: parsenoop }, 1103: { n: "BrtRangeProtection14", f: parsenoop }, 1104: { n: "BrtRangeProtectionIso14", f: parsenoop }, 1105: { n: "BrtCellIgnoreEC14", f: parsenoop }, 1111: { n: "BrtList14", f: parsenoop }, 1112: { n: "BrtCFIcon", f: parsenoop }, 1113: { n: "BrtBeginSlicerCachesPivotCacheIDs", f: parsenoop }, 1114: { n: "BrtEndSlicerCachesPivotCacheIDs", f: parsenoop }, 1115: { n: "BrtBeginSlicers", f: parsenoop }, 1116: { n: "BrtEndSlicers", f: parsenoop }, 1117: { n: "BrtWbProp14", f: parsenoop }, 1118: { n: "BrtBeginSXEdit", f: parsenoop }, 1119: { n: "BrtEndSXEdit", f: parsenoop }, 1120: { n: "BrtBeginSXEdits", f: parsenoop }, 1121: { n: "BrtEndSXEdits", f: parsenoop }, 1122: { n: "BrtBeginSXChange", f: parsenoop }, 1123: { n: "BrtEndSXChange", f: parsenoop }, 1124: { n: "BrtBeginSXChanges", f: parsenoop }, 1125: { n: "BrtEndSXChanges", f: parsenoop }, 1126: { n: "BrtSXTupleItems", f: parsenoop }, 1128: { n: "BrtBeginSlicerStyle", f: parsenoop }, 1129: { n: "BrtEndSlicerStyle", f: parsenoop }, 1130: { n: "BrtSlicerStyleElement", f: parsenoop }, 1131: { n: "BrtBeginStyleSheetExt14", f: parsenoop }, 1132: { n: "BrtEndStyleSheetExt14", f: parsenoop }, 1133: { n: "BrtBeginSlicerCachesPivotCacheID", f: parsenoop }, 1134: { n: "BrtEndSlicerCachesPivotCacheID", f: parsenoop }, 1135: { n: "BrtBeginConditionalFormattings", f: parsenoop }, 1136: { n: "BrtEndConditionalFormattings", f: parsenoop }, 1137: { n: "BrtBeginPCDCalcMemExt", f: parsenoop }, 1138: { n: "BrtEndPCDCalcMemExt", f: parsenoop }, 1139: { n: "BrtBeginPCDCalcMemsExt", f: parsenoop }, 1140: { n: "BrtEndPCDCalcMemsExt", f: parsenoop }, 1141: { n: "BrtPCDField14", f: parsenoop }, 1142: { n: "BrtBeginSlicerStyles", f: parsenoop }, 1143: { n: "BrtEndSlicerStyles", f: parsenoop }, 1144: { n: "BrtBeginSlicerStyleElements", f: parsenoop }, 1145: { n: "BrtEndSlicerStyleElements", f: parsenoop }, 1146: { n: "BrtCFRuleExt", f: parsenoop }, 1147: { n: "BrtBeginSXCondFmt14", f: parsenoop }, 1148: { n: "BrtEndSXCondFmt14", f: parsenoop }, 1149: { n: "BrtBeginSXCondFmts14", f: parsenoop }, 1150: { n: "BrtEndSXCondFmts14", f: parsenoop }, 1152: { n: "BrtBeginSortCond14", f: parsenoop }, 1153: { n: "BrtEndSortCond14", f: parsenoop }, 1154: { n: "BrtEndDVals14", f: parsenoop }, 1155: { n: "BrtEndIconSet14", f: parsenoop }, 1156: { n: "BrtEndDatabar14", f: parsenoop }, 1157: { n: "BrtBeginColorScale14", f: parsenoop }, 1158: { n: "BrtEndColorScale14", f: parsenoop }, 1159: { n: "BrtBeginSxrules14", f: parsenoop }, 1160: { n: "BrtEndSxrules14", f: parsenoop }, 1161: { n: "BrtBeginPRule14", f: parsenoop }, 1162: { n: "BrtEndPRule14", f: parsenoop }, 1163: { n: "BrtBeginPRFilters14", f: parsenoop }, 1164: { n: "BrtEndPRFilters14", f: parsenoop }, 1165: { n: "BrtBeginPRFilter14", f: parsenoop }, 1166: { n: "BrtEndPRFilter14", f: parsenoop }, 1167: { n: "BrtBeginPRFItem14", f: parsenoop }, 1168: { n: "BrtEndPRFItem14", f: parsenoop }, 1169: { n: "BrtBeginCellIgnoreECs14", f: parsenoop }, 1170: { n: "BrtEndCellIgnoreECs14", f: parsenoop }, 1171: { n: "BrtDxf14", f: parsenoop }, 1172: { n: "BrtBeginDxF14s", f: parsenoop }, 1173: { n: "BrtEndDxf14s", f: parsenoop }, 1177: { n: "BrtFilter14", f: parsenoop }, 1178: { n: "BrtBeginCustomFilters14", f: parsenoop }, 1180: { n: "BrtCustomFilter14", f: parsenoop }, 1181: { n: "BrtIconFilter14", f: parsenoop }, 1182: { n: "BrtPivotCacheConnectionName", f: parsenoop }, 2048: { n: "BrtBeginDecoupledPivotCacheIDs", f: parsenoop }, 2049: { n: "BrtEndDecoupledPivotCacheIDs", f: parsenoop }, 2050: { n: "BrtDecoupledPivotCacheID", f: parsenoop }, 2051: { n: "BrtBeginPivotTableRefs", f: parsenoop }, 2052: { n: "BrtEndPivotTableRefs", f: parsenoop }, 2053: { n: "BrtPivotTableRef", f: parsenoop }, 2054: { n: "BrtSlicerCacheBookPivotTables", f: parsenoop }, 2055: { n: "BrtBeginSxvcells", f: parsenoop }, 2056: { n: "BrtEndSxvcells", f: parsenoop }, 2057: { n: "BrtBeginSxRow", f: parsenoop }, 2058: { n: "BrtEndSxRow", f: parsenoop }, 2060: { n: "BrtPcdCalcMem15", f: parsenoop }, 2067: { n: "BrtQsi15", f: parsenoop }, 2068: { n: "BrtBeginWebExtensions", f: parsenoop }, 2069: { n: "BrtEndWebExtensions", f: parsenoop }, 2070: { n: "BrtWebExtension", f: parsenoop }, 2071: { n: "BrtAbsPath15", f: parsenoop }, 2072: { n: "BrtBeginPivotTableUISettings", f: parsenoop }, 2073: { n: "BrtEndPivotTableUISettings", f: parsenoop }, 2075: { n: "BrtTableSlicerCacheIDs", f: parsenoop }, 2076: { n: "BrtTableSlicerCacheID", f: parsenoop }, 2077: { n: "BrtBeginTableSlicerCache", f: parsenoop }, 2078: { n: "BrtEndTableSlicerCache", f: parsenoop }, 2079: { n: "BrtSxFilter15", f: parsenoop }, 2080: { n: "BrtBeginTimelineCachePivotCacheIDs", f: parsenoop }, 2081: { n: "BrtEndTimelineCachePivotCacheIDs", f: parsenoop }, 2082: { n: "BrtTimelineCachePivotCacheID", f: parsenoop }, 2083: { n: "BrtBeginTimelineCacheIDs", f: parsenoop }, 2084: { n: "BrtEndTimelineCacheIDs", f: parsenoop }, 2085: { n: "BrtBeginTimelineCacheID", f: parsenoop }, 2086: { n: "BrtEndTimelineCacheID", f: parsenoop }, 2087: { n: "BrtBeginTimelinesEx", f: parsenoop }, 2088: { n: "BrtEndTimelinesEx", f: parsenoop }, 2089: { n: "BrtBeginTimelineEx", f: parsenoop }, 2090: { n: "BrtEndTimelineEx", f: parsenoop }, 2091: { n: "BrtWorkBookPr15", f: parsenoop }, 2092: { n: "BrtPCDH15", f: parsenoop }, 2093: { n: "BrtBeginTimelineStyle", f: parsenoop }, 2094: { n: "BrtEndTimelineStyle", f: parsenoop }, 2095: { n: "BrtTimelineStyleElement", f: parsenoop }, 2096: { n: "BrtBeginTimelineStylesheetExt15", f: parsenoop }, 2097: { n: "BrtEndTimelineStylesheetExt15", f: parsenoop }, 2098: { n: "BrtBeginTimelineStyles", f: parsenoop }, 2099: { n: "BrtEndTimelineStyles", f: parsenoop }, 2100: { n: "BrtBeginTimelineStyleElements", f: parsenoop }, 2101: { n: "BrtEndTimelineStyleElements", f: parsenoop }, 2102: { n: "BrtDxf15", f: parsenoop }, 2103: { n: "BrtBeginDxfs15", f: parsenoop }, 2104: { n: "brtEndDxfs15", f: parsenoop }, 2105: { n: "BrtSlicerCacheHideItemsWithNoData", f: parsenoop }, 2106: { n: "BrtBeginItemUniqueNames", f: parsenoop }, 2107: { n: "BrtEndItemUniqueNames", f: parsenoop }, 2108: { n: "BrtItemUniqueName", f: parsenoop }, 2109: { n: "BrtBeginExtConn15", f: parsenoop }, 2110: { n: "BrtEndExtConn15", f: parsenoop }, 2111: { n: "BrtBeginOledbPr15", f: parsenoop }, 2112: { n: "BrtEndOledbPr15", f: parsenoop }, 2113: { n: "BrtBeginDataFeedPr15", f: parsenoop }, 2114: { n: "BrtEndDataFeedPr15", f: parsenoop }, 2115: { n: "BrtTextPr15", f: parsenoop }, 2116: { n: "BrtRangePr15", f: parsenoop }, 2117: { n: "BrtDbCommand15", f: parsenoop }, 2118: { n: "BrtBeginDbTables15", f: parsenoop }, 2119: { n: "BrtEndDbTables15", f: parsenoop }, 2120: { n: "BrtDbTable15", f: parsenoop }, 2121: { n: "BrtBeginDataModel", f: parsenoop }, 2122: { n: "BrtEndDataModel", f: parsenoop }, 2123: { n: "BrtBeginModelTables", f: parsenoop }, 2124: { n: "BrtEndModelTables", f: parsenoop }, 2125: { n: "BrtModelTable", f: parsenoop }, 2126: { n: "BrtBeginModelRelationships", f: parsenoop }, 2127: { n: "BrtEndModelRelationships", f: parsenoop }, 2128: { n: "BrtModelRelationship", f: parsenoop }, 2129: { n: "BrtBeginECTxtWiz15", f: parsenoop }, 2130: { n: "BrtEndECTxtWiz15", f: parsenoop }, 2131: { n: "BrtBeginECTWFldInfoLst15", f: parsenoop }, 2132: { n: "BrtEndECTWFldInfoLst15", f: parsenoop }, 2133: { n: "BrtBeginECTWFldInfo15", f: parsenoop }, 2134: { n: "BrtFieldListActiveItem", f: parsenoop }, 2135: { n: "BrtPivotCacheIdVersion", f: parsenoop }, 2136: { n: "BrtSXDI15", f: parsenoop }, 65535: { n: "", f: parsenoop } };
    var evert_RE = evert_key(RecordEnum, "n");

    function fix_opts_func(defaults) { return function fix_opts(opts) { for (var i = 0; i != defaults.length; ++i) { var d = defaults[i]; if (typeof opts[d[0]] === "undefined") opts[d[0]] = d[1]; if (d[2] === "n") opts[d[0]] = Number(opts[d[0]]) } } }
    var fix_read_opts = fix_opts_func([
        ["cellNF", false],
        ["cellHTML", true],
        ["cellFormula", true],
        ["cellStyles", false],
        ["sheetStubs", false],
        ["sheetRows", 0, "n"],
        ["bookDeps", false],
        ["bookSheets", false],
        ["bookProps", false],
        ["bookFiles", false],
        ["bookVBA", false],
        ["WTF", false]
    ]);
    var fix_write_opts = fix_opts_func([
        ["bookSST", false],
        ["bookType", "xlsx"],
        ["WTF", false]
    ]);

    function safe_parse_wbrels(wbrels, sheets) { if (!wbrels) return 0; try { wbrels = sheets.map(function pwbr(w) { return [w.name, wbrels["!id"][w.id].Target] }) } catch (e) { return null } return !wbrels || wbrels.length === 0 ? null : wbrels }

    function safe_parse_ws(zip, path, relsPath, sheet, sheetRels, sheets, opts) {
        try {
            sheetRels[sheet] = parse_rels(getzipdata(zip, relsPath, true), path);
            sheets[sheet] = parse_ws(getzipdata(zip, path), path, opts, sheetRels[sheet])
        } catch (e) { if (opts.WTF) throw e }
    }
    var nodirs = function nodirs(x) { return x.substr(-1) != "/" };

    function parse_zip(zip, opts) {
        make_ssf(SSF);
        opts = opts || {};
        fix_read_opts(opts);
        reset_cp();
        var entries = keys(zip.files).filter(nodirs).sort();
        var dir = parse_ct(getzipdata(zip, "[Content_Types].xml"), opts);
        var xlsb = false;
        var sheets, binname;
        if (dir.workbooks.length === 0) { binname = "xl/workbook.xml"; if (getzipdata(zip, binname, true)) dir.workbooks.push(binname) }
        if (dir.workbooks.length === 0) {
            binname = "xl/workbook.bin";
            if (!getzipfile(zip, binname, true)) throw new Error("Could not find workbook");
            dir.workbooks.push(binname);
            xlsb = true
        }
        if (dir.workbooks[0].substr(-3) == "bin") xlsb = true;
        if (xlsb) set_cp(1200);
        if (!opts.bookSheets && !opts.bookProps) {
            strs = [];
            if (dir.sst) strs = parse_sst(getzipdata(zip, dir.sst.replace(/^\//, "")), dir.sst, opts);
            styles = {};
            if (dir.style) styles = parse_sty(getzipdata(zip, dir.style.replace(/^\//, "")), dir.style, opts);
            themes = {};
            if (opts.cellStyles && dir.themes.length) themes = parse_theme(getzipdata(zip, dir.themes[0].replace(/^\//, ""), true), dir.themes[0], opts)
        }
        var wb = parse_wb(getzipdata(zip, dir.workbooks[0].replace(/^\//, "")), dir.workbooks[0], opts);
        var props = {},
            propdata = "";
        if (dir.coreprops.length !== 0) { propdata = getzipdata(zip, dir.coreprops[0].replace(/^\//, ""), true); if (propdata) props = parse_core_props(propdata); if (dir.extprops.length !== 0) { propdata = getzipdata(zip, dir.extprops[0].replace(/^\//, ""), true); if (propdata) parse_ext_props(propdata, props) } }
        var custprops = {};
        if (!opts.bookSheets || opts.bookProps) { if (dir.custprops.length !== 0) { propdata = getzipdata(zip, dir.custprops[0].replace(/^\//, ""), true); if (propdata) custprops = parse_cust_props(propdata, opts) } }
        var out = {};
        if (opts.bookSheets || opts.bookProps) {
            if (props.Worksheets && props.SheetNames.length > 0) sheets = props.SheetNames;
            else if (wb.Sheets) sheets = wb.Sheets.map(function pluck(x) { return x.name });
            if (opts.bookProps) {
                out.Props = props;
                out.Custprops = custprops
            }
            if (typeof sheets !== "undefined") out.SheetNames = sheets;
            if (opts.bookSheets ? out.SheetNames : opts.bookProps) return out
        }
        sheets = {};
        var deps = {};
        if (opts.bookDeps && dir.calcchain) deps = parse_cc(getzipdata(zip, dir.calcchain.replace(/^\//, "")), dir.calcchain, opts);
        var i = 0;
        var sheetRels = {};
        var path, relsPath;
        if (!props.Worksheets) {
            var wbsheets = wb.Sheets;
            props.Worksheets = wbsheets.length;
            props.SheetNames = [];
            for (var j = 0; j != wbsheets.length; ++j) { props.SheetNames[j] = wbsheets[j].name }
        }
        var wbext = xlsb ? "bin" : "xml";
        var wbrelsfile = "xl/_rels/workbook." + wbext + ".rels";
        var wbrels = parse_rels(getzipdata(zip, wbrelsfile, true), wbrelsfile);
        if (wbrels) wbrels = safe_parse_wbrels(wbrels, wb.Sheets);
        var nmode = getzipdata(zip, "xl/worksheets/sheet.xml", true) ? 1 : 0;
        for (i = 0; i != props.Worksheets; ++i) {
            if (wbrels) path = "xl/" + wbrels[i][1].replace(/[\/]?xl\//, "");
            else {
                path = "xl/worksheets/sheet" + (i + 1 - nmode) + "." + wbext;
                path = path.replace(/sheet0\./, "sheet.")
            }
            relsPath = path.replace(/^(.*)(\/)([^\/]*)$/, "$1/_rels/$3.rels");
            safe_parse_ws(zip, path, relsPath, props.SheetNames[i], sheetRels, sheets, opts)
        }
        if (dir.comments) parse_comments(zip, dir.comments, sheets, sheetRels, opts);
        out = { Directory: dir, Workbook: wb, Props: props, Custprops: custprops, Deps: deps, Sheets: sheets, SheetNames: props.SheetNames, Strings: strs, Styles: styles, Themes: themes, SSF: SSF.get_table() };
        if (opts.bookFiles) {
            out.keys = entries;
            out.files = zip.files
        }
        if (opts.bookVBA) {
            if (dir.vba.length > 0) out.vbaraw = getzipdata(zip, dir.vba[0], true);
            else if (dir.defaults.bin === "application/vnd.ms-office.vbaProject") out.vbaraw = getzipdata(zip, "xl/vbaProject.bin", true)
        }
        return out
    }

    function add_rels(rels, rId, f, type, relobj) {
        if (!relobj) relobj = {};
        if (!rels["!id"]) rels["!id"] = {};
        relobj.Id = "rId" + rId;
        relobj.Type = type;
        relobj.Target = f;
        if (rels["!id"][relobj.Id]) throw new Error("Cannot rewrite rId " + rId);
        rels["!id"][relobj.Id] = relobj;
        rels[("/" + relobj.Target).replace("//", "/")] = relobj
    }

    function write_zip(wb, opts) {
        if (wb && !wb.SSF) { wb.SSF = SSF.get_table() }
        if (wb && wb.SSF) {
            make_ssf(SSF);
            SSF.load_table(wb.SSF);
            opts.revssf = evert_num(wb.SSF);
            opts.revssf[wb.SSF[65535]] = 0
        }
        opts.rels = {};
        opts.wbrels = {};
        opts.Strings = [];
        opts.Strings.Count = 0;
        opts.Strings.Unique = 0;
        var wbext = opts.bookType == "xlsb" ? "bin" : "xml";
        var ct = { workbooks: [], sheets: [], calcchains: [], themes: [], styles: [], coreprops: [], extprops: [], custprops: [], strs: [], comments: [], vba: [], TODO: [], rels: [], xmlns: "" };
        fix_write_opts(opts = opts || {});
        var zip = new jszip;
        var f = "",
            rId = 0;
        opts.cellXfs = [];
        get_cell_style(opts.cellXfs, {}, { revssf: { General: 0 } });
        f = "docProps/core.xml";
        zip.file(f, write_core_props(wb.Props, opts));
        ct.coreprops.push(f);
        add_rels(opts.rels, 2, f, RELS.CORE_PROPS);
        f = "docProps/app.xml";
        if (!wb.Props) wb.Props = {};
        wb.Props.SheetNames = wb.SheetNames;
        wb.Props.Worksheets = wb.SheetNames.length;
        zip.file(f, write_ext_props(wb.Props, opts));
        ct.extprops.push(f);
        add_rels(opts.rels, 3, f, RELS.EXT_PROPS);
        if (wb.Custprops !== wb.Props && keys(wb.Custprops || {}).length > 0) {
            f = "docProps/custom.xml";
            zip.file(f, write_cust_props(wb.Custprops, opts));
            ct.custprops.push(f);
            add_rels(opts.rels, 4, f, RELS.CUST_PROPS)
        }
        f = "xl/workbook." + wbext;
        zip.file(f, write_wb(wb, f, opts));
        ct.workbooks.push(f);
        add_rels(opts.rels, 1, f, RELS.WB);
        for (rId = 1; rId <= wb.SheetNames.length; ++rId) {
            f = "xl/worksheets/sheet" + rId + "." + wbext;
            zip.file(f, write_ws(rId - 1, f, opts, wb));
            ct.sheets.push(f);
            add_rels(opts.wbrels, rId, "worksheets/sheet" + rId + "." + wbext, RELS.WS)
        }
        if (opts.Strings != null && opts.Strings.length > 0) {
            f = "xl/sharedStrings." + wbext;
            zip.file(f, write_sst(opts.Strings, f, opts));
            ct.strs.push(f);
            add_rels(opts.wbrels, ++rId, "sharedStrings." + wbext, RELS.SST)
        }
        f = "xl/theme/theme1.xml";
        zip.file(f, write_theme());
        ct.themes.push(f);
        add_rels(opts.wbrels, ++rId, "theme/theme1.xml", RELS.THEME);
        f = "xl/styles." + wbext;
        zip.file(f, write_sty(wb, f, opts));
        ct.styles.push(f);
        add_rels(opts.wbrels, ++rId, "styles." + wbext, RELS.STY);
        zip.file("[Content_Types].xml", write_ct(ct, opts));
        zip.file("_rels/.rels", write_rels(opts.rels));
        zip.file("xl/_rels/workbook." + wbext + ".rels", write_rels(opts.wbrels));
        return zip
    }

    function readSync(data, opts) {
        var zip, d = data;
        var o = opts || {};
        if (!o.type) o.type = typeof Buffer !== "undefined" && data instanceof Buffer ? "buffer" : "base64";
        switch (o.type) {
            case "base64":
                zip = new jszip(d, { base64: true });
                break;
            case "binary":
                zip = new jszip(d, { base64: false });
                break;
            case "buffer":
                zip = new jszip(d);
                break;
            case "file":
                zip = new jszip(d = _fs.readFileSync(data));
                break;
            default:
                throw new Error("Unrecognized type " + o.type)
        }
        return parse_zip(zip, o)
    }

    function readFileSync(data, opts) {
        var o = opts || {};
        o.type = "file";
        return readSync(data, o)
    }

    function writeSync(wb, opts) {
        var o = opts || {};
        var z = write_zip(wb, o);
        switch (o.type) {
            case "base64":
                return z.generate({ type: "base64" });
            case "binary":
                return z.generate({ type: "string" });
            case "buffer":
                return z.generate({ type: "nodebuffer" });
            case "file":
                return _fs.writeFileSync(o.file, z.generate({ type: "nodebuffer" }));
            default:
                throw new Error("Unrecognized type " + o.type)
        }
    }

    function writeFileSync(wb, filename, opts) {
        var o = opts || {};
        o.type = "file";
        o.file = filename;
        switch (o.file.substr(-5).toLowerCase()) {
            case ".xlsm":
                o.bookType = "xlsm";
                break;
            case ".xlsb":
                o.bookType = "xlsb";
                break
        }
        return writeSync(wb, o)
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
        for (idx = 0; i != range.length; ++i) {
            if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
            idx = 26 * idx + cc
        }
        o.s.c = --idx;
        for (idx = 0; i != range.length; ++i) {
            if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) break;
            idx = 10 * idx + cc
        }
        o.s.r = --idx;
        if (i === range.length || range.charCodeAt(++i) === 58) {
            o.e.c = o.s.c;
            o.e.r = o.s.r;
            return o
        }
        for (idx = 0; i != range.length; ++i) {
            if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
            idx = 26 * idx + cc
        }
        o.e.c = --idx;
        for (idx = 0; i != range.length; ++i) {
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
        var out = [];
        var o = opts != null ? opts : {};
        if (!sheet || !sheet["!ref"]) return out;
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
        var cols = [];
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
                    if (!val) continue;
                    hdr[C] = format_cell(val)
            }
        }
        for (R = r.s.r + offset; R <= r.e.r; ++R) {
            rr = encode_row(R);
            isempty = true;
            row = header === 1 ? [] : Object.create({ __rowNum__: R });
            for (C = r.s.c; C <= r.e.c; ++C) {
                val = sheet[cols[C] + rr];
                if (!val || !val.t) continue;
                v = val.v;
                switch (val.t) {
                    case "e":
                        continue;
                    case "s":
                    case "str":
                        break;
                    case "b":
                    case "n":
                        break;
                    default:
                        throw "unrecognized type " + val.t
                }
                if (v !== undefined) {
                    row[hdr[C]] = o.raw ? v : format_cell(val, v);
                    isempty = false
                }
            }
            if (!isempty) out.push(row)
        }
        return out
    }

    function sheet_to_row_object_array(sheet, opts) { return sheet_to_json(sheet, opts == null ? opts : {}) }

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
        for (R = r.s.r; R <= r.e.r; ++R) {
            row = "";
            rr = encode_row(R);
            for (C = r.s.c; C <= r.e.c; ++C) {
                if (R === r.s.r) cols[C] = encode_col(C);
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
            cols = [];
        cmds = new Array((r.e.r - r.s.r + 1) * (r.e.c - r.s.c + 1));
        var i = 0;
        for (var R = r.s.r; R <= r.e.r; ++R) {
            rr = encode_row(R);
            for (var C = r.s.c; C <= r.e.c; ++C) {
                if (R === r.s.r) cols[C] = encode_col(C);
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
    XLSX.parseZip = parse_zip;
    XLSX.read = readSync;
    XLSX.readFile = readFileSync;
    XLSX.write = writeSync;
    XLSX.writeFile = writeFileSync;
    XLSX.utils = utils;
    XLSX.SSF = SSF
})(typeof exports !== "undefined" ? exports : XLSX);
//# sourceMappingURL=dist/xlsx.core.min.map