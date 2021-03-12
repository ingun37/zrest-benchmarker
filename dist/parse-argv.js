"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgvs = exports.Info = exports.comparisonZrestURLsLongName = exports.tracingBucketLongName = exports.tracingZrestURLsLongName = exports.srestJsonURLsLongName = exports.fpsMSLongName = exports.fpsViewHeightLongName = exports.fpsViewWidthLongName = exports.ArgvParseError = exports.ArgvExhausted = void 0;
const ts_command_line_1 = require("@rushstack/ts-command-line");
const pipeable_1 = require("fp-ts/lib/pipeable");
const url_1 = require("url");
const D = __importStar(require("io-ts/Decoder"));
const O = __importStar(require("fp-ts/Option"));
const path = __importStar(require("path"));
const function_1 = require("fp-ts/lib/function");
const _ = __importStar(require("lodash"));
function checker(x) {
    return pipeable_1.pipe(x, D.string.decode, O.fromEither, O.map(path.basename), O.map((base) => base === "zrest-benchmarker.js" || base === "zrest-benchmarker" || base === "zrest-benchmarker.ts"), O.fold(() => false, function_1.identity));
}
class ArgvExhausted extends Error {
}
exports.ArgvExhausted = ArgvExhausted;
class ArgvParseError extends Error {
}
exports.ArgvParseError = ArgvParseError;
const libraryURLLongName = "--library-url";
const zrestsLongName = "--zrest-url";
const apiURLLongName = "--api-url";
const tableNameLongName = "--table-name";
const heavyZrestLongName = "--heavy-zrest";
exports.fpsViewWidthLongName = "--fps-view-width";
exports.fpsViewHeightLongName = "--fps-view-height";
exports.fpsMSLongName = "--fps-ms";
exports.srestJsonURLsLongName = "--srest-json-url";
exports.tracingZrestURLsLongName = "--tracing-zrest";
exports.tracingBucketLongName = "--tracing-bucket";
exports.comparisonZrestURLsLongName = "--compare-zrest-url";
class Info {
    constructor(libraryURL, zrestURLs, heavyZrestURL, apiURL, tableName, meta, fpsViewWidth, fpsViewHeight, fpsMS, srestJsonURLs, tracingZrestURLs, tracingBucket, comparisonZrestURLs) {
        this.libraryURL = libraryURL;
        this.zrestURLs = zrestURLs;
        this.heavyZrestURL = heavyZrestURL;
        this.apiURL = apiURL;
        this.tableName = tableName;
        this.meta = meta;
        this.fpsViewWidth = fpsViewWidth;
        this.fpsViewHeight = fpsViewHeight;
        this.fpsMS = fpsMS;
        this.srestJsonURLs = srestJsonURLs;
        this.tracingZrestURLs = tracingZrestURLs;
        this.tracingBucket = tracingBucket;
        this.comparisonZrestURLs = comparisonZrestURLs;
    }
}
exports.Info = Info;
function _parseArgvs(commandLineParser, argv) {
    if (argv.length === 0) {
        return Promise.reject(new ArgvExhausted());
    }
    const head = argv.shift();
    console.log("Entrypoint check: ", head);
    if (checker(head)) {
        return commandLineParser.executeWithoutErrorHandling(argv).then(() => {
            var _a, _b;
            const libURL = commandLineParser.getStringParameter(libraryURLLongName).value;
            const zrestURLs = commandLineParser.getStringListParameter(zrestsLongName).values;
            const apiURL = commandLineParser.getStringParameter(apiURLLongName).value;
            const flatMeta = (_b = (_a = commandLineParser.remainder) === null || _a === void 0 ? void 0 : _a.values) !== null && _b !== void 0 ? _b : [];
            const tableName = commandLineParser.getStringParameter(tableNameLongName).value;
            const heavyZrestURL = commandLineParser.getStringParameter(heavyZrestLongName).value;
            const meta = _.fromPairs(_.chunk(flatMeta, 2));
            const fpsViewW = commandLineParser.getIntegerParameter(exports.fpsViewWidthLongName).value;
            const fpsViewH = commandLineParser.getIntegerParameter(exports.fpsViewHeightLongName).value;
            const fpsMS = commandLineParser.getIntegerParameter(exports.fpsMSLongName).value;
            const tracingZrestURLs = commandLineParser.getStringListParameter(exports.tracingZrestURLsLongName).values;
            const tracingBucket = commandLineParser.getStringParameter(exports.tracingBucketLongName).value;
            const comparisonZrests = commandLineParser.getStringListParameter(exports.comparisonZrestURLsLongName).values;
            try {
                return new Info(new url_1.URL(libURL), zrestURLs.map((x) => new url_1.URL(x)), new url_1.URL(heavyZrestURL), new url_1.URL(apiURL), tableName, meta, fpsViewW, fpsViewH, fpsMS, commandLineParser.getStringListParameter(exports.srestJsonURLsLongName).values, tracingZrestURLs, tracingBucket, comparisonZrests.map((x) => new url_1.URL(x)));
                // return [new URL(libURL), zrestURLs.map((x) => new URL(x))];
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    else {
        return _parseArgvs(commandLineParser, argv);
    }
}
function parseArgvs(argv) {
    const commandLineParser = new ts_command_line_1.DynamicCommandLineParser({
        toolFilename: "zrest-benchmarker",
        toolDescription: "Performs benchmarking for given zrests and outputs the metrics as benchmarking-result.json",
    });
    commandLineParser.defineStringParameter({
        argumentName: "LIBRARYURL",
        parameterLongName: libraryURLLongName,
        parameterShortName: "-l",
        description: "URL to library. Can be file url.",
        required: true,
    });
    commandLineParser.defineStringListParameter({
        argumentName: "ZRESTURLS",
        parameterLongName: zrestsLongName,
        parameterShortName: "-z",
        description: "URL to a zrest. Can provide multiple.",
        required: true,
    });
    commandLineParser.defineStringParameter({
        argumentName: "APIURL",
        parameterLongName: apiURLLongName,
        parameterShortName: "-a",
        description: "URL to post json.",
        required: true,
    });
    commandLineParser.defineStringParameter({
        argumentName: "TABLENAME",
        parameterLongName: tableNameLongName,
        parameterShortName: "-t",
        description: "DynamoDB table name.",
        required: true,
    });
    commandLineParser.defineStringParameter({
        argumentName: "HEAVYZRESTURL",
        parameterLongName: heavyZrestLongName,
        description: "URL to heavy zrest for fps benchmarking.",
        required: true,
    });
    commandLineParser.defineIntegerParameter({
        argumentName: "FPSVIEWWIDTH",
        parameterLongName: exports.fpsViewWidthLongName,
        description: "Width of the frame buffer to which benchmarker renders during fps-benchmarking.",
        required: true,
    });
    commandLineParser.defineIntegerParameter({
        argumentName: "FPSVIEWHEIGHT",
        parameterLongName: exports.fpsViewHeightLongName,
        description: "Height of the frame buffer to which benchmarker renders during fps-benchmarking.",
        required: true,
    });
    commandLineParser.defineIntegerParameter({
        argumentName: 'FPSMILLISECONDS',
        parameterLongName: exports.fpsMSLongName,
        description: "Determine for how long you will run fps benchmarking (milliseconds)",
        required: true
    });
    commandLineParser.defineStringListParameter({
        argumentName: "SREST_JSON_URLS",
        description: "srest json urls",
        parameterLongName: exports.srestJsonURLsLongName,
        parameterShortName: "-s"
    });
    commandLineParser.defineStringListParameter({
        argumentName: "TRACING_ZREST_URLS",
        description: "tracing zrest urls",
        parameterLongName: exports.tracingZrestURLsLongName,
    });
    commandLineParser.defineStringParameter({
        argumentName: "TRACING_BUCKET",
        description: "tracing bucket name",
        parameterLongName: exports.tracingBucketLongName,
    });
    commandLineParser.defineStringListParameter({
        argumentName: "COMPARISON_ZREST_URLS",
        description: "zrests to compare with srest",
        parameterLongName: exports.comparisonZrestURLsLongName,
    });
    // Remainder Must be defined last
    commandLineParser.defineCommandLineRemainder({
        description: "Define meta here. e.g, AuthorDate 1993-10-08 CommitId 1234567"
    });
    return _parseArgvs(commandLineParser, argv);
}
exports.parseArgvs = parseArgvs;
