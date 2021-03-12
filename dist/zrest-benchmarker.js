#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const E = __importStar(require("fp-ts/Either"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const parse_argv_1 = require("./parse-argv");
const encode_dynamo_1 = require("./encode-dynamo");
const _ = __importStar(require("lodash"));
const function_1 = require("fp-ts/function");
const fp_ts_1 = require("fp-ts");
const uuid = __importStar(require("uuid"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const url_1 = require("url");
const Apply_1 = require("fp-ts/Apply");
const argTask = parse_argv_1.parseArgvs(process.argv);
argTask
    .then(async (info) => {
    const benchmarkingTasks = [
        await _1.benchmarkBundleSize(info.libraryURL),
        await _1.benchmarkZrestLoading(info.libraryURL, info.zrestURLs, "zrest loading benchmarking")(),
        await _1.benchmarkFPS(info.libraryURL, info.heavyZrestURL, info.fpsViewWidth, info.fpsViewHeight, info.fpsMS)(),
        await _1.benchmarkSrestLoading(info.libraryURL, info.srestJsonURLs)(),
        await _1.benchmarkZrestLoading(info.libraryURL, info.comparisonZrestURLs, "zrest set 2 loading")(),
    ];
    const benchmarkingResults = function_1.pipe(fp_ts_1.either.sequenceArray(benchmarkingTasks), fp_ts_1.either.map(fp_ts_1.readonlyArray.reduceRight({}, (result, agg) => {
        return _.assign(result, agg);
    })));
    const tracingResults = await rxjs_1.from(info.tracingZrestURLs).pipe(operators_1.concatMap(url => {
        return function_1.pipe(_1.traceZrestLoading(info.libraryURL, new url_1.URL(url), info.tracingBucket, uuid.v4().toString() + ".html"), fp_ts_1.taskEither.map((htmlurl) => [url, htmlurl]))();
    }), operators_1.reduce((acc, eth, index) => {
        return function_1.pipe(Apply_1.sequenceT(fp_ts_1.either.either)(acc, eth), fp_ts_1.either.map(([obj, [x, y]]) => {
            obj[x] = y;
            return obj;
        }));
    }, fp_ts_1.either.right({}))).toPromise();
    const encoded = function_1.pipe(Apply_1.sequenceT(fp_ts_1.either.either)(benchmarkingResults, tracingResults), fp_ts_1.either.map(([aggregatedBenchmark, aggregatedTracing]) => ({
        id: uuid.v4(),
        report: {
            benchmarks: aggregatedBenchmark,
            tracings: aggregatedTracing,
            meta: info.meta,
        }
    })), fp_ts_1.either.chainW(encode_dynamo_1.encodeDynamoFormat), fp_ts_1.either.map(xx => {
        return xx.M;
    }));
    return function_1.pipe(encoded, E.fold(x => Promise.reject(x), body => {
        const jsonStr = JSON.stringify({
            TableName: info.tableName,
            Item: body,
        });
        console.log("putting", jsonStr);
        return node_fetch_1.default(info.apiURL, {
            method: "post",
            body: jsonStr,
            headers: { "Content-Type": "application/json" },
        });
    }));
})
    .catch((err) => {
    console.log("caugut a error");
    console.error(err);
});
