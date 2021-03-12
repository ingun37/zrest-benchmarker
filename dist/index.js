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
exports.traceZrestLoading = exports.withCachedSrests = exports.benchmarkBundleSize = exports.benchmarkZrestLoading = exports.benchmarkFPS = exports.benchmarkPageMetric = exports.retryN = exports.benchmarkSrestLoading = exports.Measurement = void 0;
const P = __importStar(require("path"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const got_1 = __importDefault(require("got"));
const uuid_1 = require("uuid");
const url_1 = require("url");
const D = __importStar(require("io-ts/Decoder"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const os_1 = __importDefault(require("os"));
const template_1 = require("./template");
const Either_1 = require("fp-ts/Either");
const function_1 = require("fp-ts/lib/function");
const TaskEither_1 = require("fp-ts/TaskEither");
const fp_ts_1 = require("fp-ts");
const fp_ts_rxjs_1 = require("fp-ts-rxjs");
const ObservableEither_1 = require("fp-ts-rxjs/lib/ObservableEither");
const types_1 = require("./types");
const node_fetch_1 = __importDefault(require("node-fetch"));
const Option_1 = require("fp-ts/Option");
const Observable_1 = require("fp-ts-rxjs/lib/Observable");
const page_request_emitter_1 = require("page-request-emitter");
const retry_ts_1 = require("retry-ts");
const Task_1 = require("retry-ts/lib/Task");
const Console_1 = require("fp-ts/Console");
const child_process_1 = require("child_process");
const client_s3_1 = require("@aws-sdk/client-s3");
const Monoid_1 = require("fp-ts/Monoid");
const Apply_1 = require("fp-ts/Apply");
class Measurement {
    constructor(unit, value) {
        this.unit = unit;
        this.value = value;
    }
}
exports.Measurement = Measurement;
const fpsResponse = D.type({
    fps: D.number,
});
const launchOption = {
    args: ["--no-sandbox", "--disable-web-security", "--use-gl=egl"]
};
function fetchJSON(url) {
    return node_fetch_1.default(url).then(x => x.text()).then(JSON.parse);
}
function benchmarkSrestLoading(liburl, srestJsonURLs) {
    return function_1.pipe(srestJsonURLs, fp_ts_1.readonlyArray.map(TaskEither_1.tryCatchK(fetchJSON, function_1.identity)), fp_ts_1.readonlyArray.map(fp_ts_1.taskEither.chainEitherKW(types_1.D_SRest.decode)), fp_ts_1.taskEither.sequenceArray, fp_ts_1.taskEither.chainW(srests => {
        // return withCachedSrests(srests, (cachedSrests)=> benchmarkPageMetric(liburl, templateSrest(liburl, cachedSrests), "srest loading benchmarking"))
        return benchmarkPageMetric(liburl, template_1.templateSrest(liburl, srests), "srest loading benchmarking", srestJsonURLs.length);
    }));
}
exports.benchmarkSrestLoading = benchmarkSrestLoading;
function retryN(count, taskMaker) {
    const logDelay = (status) => fp_ts_1.taskEither.rightIO(Console_1.log(function_1.pipe(status.previousDelay, fp_ts_1.option.map(delay => `retrying in ${delay} milliseconds...`), fp_ts_1.option.getOrElse(() => 'first attempt...'))));
    return Task_1.retrying(retry_ts_1.capDelay(1000 * 60 * 3, retry_ts_1.monoidRetryPolicy.concat(retry_ts_1.exponentialBackoff(30000), retry_ts_1.limitRetries(count))), status => function_1.pipe(logDelay(status), fp_ts_1.taskEither.apSecond(taskMaker())), fp_ts_1.either.isLeft);
}
exports.retryN = retryN;
const metricSumMonoid = Monoid_1.getStructMonoid({
    Timestamp: Monoid_1.monoidSum,
    /** Number of documents in the page. */
    Documents: Monoid_1.monoidSum,
    /** Number of events in the page. */
    JSEventListeners: Monoid_1.monoidSum,
    /** Number of DOM nodes in the page. */
    Nodes: Monoid_1.monoidSum,
    /** Total monoidSum of full or partial page layout. */
    LayoutCount: Monoid_1.monoidSum,
    /** Total monoidSum of page style recalculations. */
    RecalcStyleCount: Monoid_1.monoidSum,
    /** Combined durations of all page layouts. */
    LayoutDuration: Monoid_1.monoidSum,
    /** Combined duration of all page style recalculations. */
    RecalcStyleDuration: Monoid_1.monoidSum,
    /** Combined duration of JavaScript execution. */
    ScriptDuration: Monoid_1.monoidSum,
    /** Combined duration of all tasks performed by the browser. */
    TaskDuration: Monoid_1.monoidSum,
    /** Used JavaScript heap size. */
    JSHeapUsedSize: Monoid_1.monoidSum,
    /** Total JavaScript heap size. */
    JSHeapTotalSize: Monoid_1.monoidSum,
});
const monoidMax = {
    concat: Math.max,
    empty: 0
};
const monoidMin = {
    concat: Math.min,
    empty: Number.MAX_VALUE
};
const metricMaxMonoid = Monoid_1.getStructMonoid({
    Timestamp: monoidMax,
    /** Number of documents in the page. */
    Documents: monoidMax,
    /** Number of frames in the page. */
    JSEventListeners: monoidMax,
    /** Number of DOM nodes in the page. */
    Nodes: monoidMax,
    /** Total monoidMax of full or partial page layout. */
    LayoutCount: monoidMax,
    /** Total monoidMax of page style recalculations. */
    RecalcStyleCount: monoidMax,
    /** Combined durations of all page layouts. */
    LayoutDuration: monoidMax,
    /** Combined duration of all page style recalculations. */
    RecalcStyleDuration: monoidMax,
    /** Combined duration of JavaScript execution. */
    ScriptDuration: monoidMax,
    /** Combined duration of all tasks performed by the browser. */
    TaskDuration: monoidMax,
    /** Used JavaScript heap size. */
    JSHeapUsedSize: monoidMax,
    /** Total JavaScript heap size. */
    JSHeapTotalSize: monoidMax,
});
function benchmarkPageMetric(liburl, jsx, benchmarkName, modelCount) {
    console.log("liburl", liburl);
    const readMetricFromPage = (page) => {
        const events = page_request_emitter_1.streamPageEvents(page, page_request_emitter_1.createTmpHTMLURL_JSX(jsx))({
            filter: (r) => r.url().startsWith(template_1.hookDomain),
            alterResponse: () => Option_1.none,
            debugResponse() {
            }
        }).pipe(stopWhenError, operators_1.map(fp_ts_1.either.map(logEvent)), operators_1.share());
        const durationMon = Either_1.getApplyMonoid(Monoid_1.getStructMonoid({
            start: monoidMin, end: monoidMax
        }));
        const timeOb = events.pipe(fp_ts_rxjs_1.observableEither.map(() => Date.now()), fp_ts_rxjs_1.observableEither.map(now => ({
            start: now,
            end: now
        })), operators_1.reduce(durationMon.concat, durationMon.empty), fp_ts_rxjs_1.observableEither.map(duration => duration.end - duration.start));
        const timeTask = ObservableEither_1.toTaskEither(timeOb);
        const metrics = events.pipe(fp_ts_rxjs_1.observableEither.map(event => {
            switch (event._tag) {
                case "RequestIntercept":
                    if (event.request.postData() === template_1.measureCue) {
                        const p = TaskEither_1.tryCatchK(() => page.metrics(), function_1.identity)();
                        return Option_1.some(p);
                    }
            }
            return Option_1.none;
        }), operators_1.map(fp_ts_1.either.sequence(fp_ts_1.option.option)), Observable_1.compact, fp_ts_rxjs_1.observableEither.chain(ObservableEither_1.fromTaskEither), operators_1.tap(eth => {
            if (Either_1.isRight(eth)) {
                console.log("Metrics !", eth.right);
            }
        }));
        const sumMon = Either_1.getApplyMonoid(metricSumMonoid);
        const maxMon = Either_1.getApplyMonoid(metricMaxMonoid);
        const measurementMapper = (key, val) => {
            switch (key) {
                case "JSHeapUsedSize":
                    return new Measurement("bytes", val);
                case "JSHeapTotalSize":
                    return new Measurement("bytes", val);
                case "TaskDuration":
                    return new Measurement("s", val);
                default:
                    return new Measurement("?", val);
            }
        };
        const metricPairOb = metrics.pipe(operators_1.publish(multicasted => rxjs_1.zip(
        // Average
        multicasted.pipe(operators_1.reduce(sumMon.concat, sumMon.empty)), 
        // Max
        multicasted.pipe(operators_1.reduce(maxMon.concat, maxMon.empty)))), operators_1.map(([averageEither, maxEither]) => {
            return Apply_1.sequenceT(fp_ts_1.either.either)(averageEither, maxEither);
        }));
        const metricPairTask = ObservableEither_1.toTaskEither(metricPairOb);
        return function_1.pipe(Apply_1.sequenceT(fp_ts_1.taskEither.taskEither)(metricPairTask, timeTask), fp_ts_1.taskEither.map(([[average, max], time]) => {
            const averageKeyChanged = function_1.pipe(average, fp_ts_1.record.map(v => v / modelCount), fp_ts_1.record.mapWithIndex(measurementMapper), fp_ts_1.record.reduceRightWithIndex({}, (k, v, b) => {
                b[k + "_Mean"] = v;
                return b;
            }));
            const maxKeyChanged = function_1.pipe(max, fp_ts_1.record.mapWithIndex(measurementMapper), fp_ts_1.record.reduceRightWithIndex({}, (k, v, b) => {
                b[k + "_Max"] = v;
                return b;
            }));
            return {
                [benchmarkName]: {
                    ...averageKeyChanged,
                    ...maxKeyChanged,
                    Time: new Measurement("ms", time)
                },
            };
        }));
    };
    const browserReader = (browser) => {
        return function_1.pipe(page_request_emitter_1.createNewIncognitoPage()(browser), fp_ts_1.taskEither.chain(readMetricFromPage), fp_ts_1.taskEither.mapLeft((err) => {
            if (err instanceof Error) {
                return err;
            }
            else {
                console.error(err);
                return new Error("Metric Benchmarking failed");
            }
        }));
    };
    return page_request_emitter_1.runWithBrowser(launchOption, browserReader);
}
exports.benchmarkPageMetric = benchmarkPageMetric;
function benchmarkFPS(libURL, heavyZrestURL, viewWidth, viewHeight, timeMS) {
    const jsx = template_1.templateForFPS(libURL, heavyZrestURL, timeMS, viewWidth, viewHeight);
    const pageurl = page_request_emitter_1.createTmpHTMLURL_JSX(jsx);
    const pageReader = (page) => {
        const eventStream = page_request_emitter_1.streamPageEvents(page, pageurl)({
            filter: r => r.url().startsWith(template_1.hookDomain),
            alterResponse: () => Option_1.none,
            debugResponse: () => {
            }
        });
        return function_1.pipe(stopWhenError(eventStream), fp_ts_rxjs_1.observableEither.map((xxx) => {
            switch (xxx._tag) {
                case "Log":
                    console.log(xxx.message);
                    return Option_1.none;
                case "RequestIntercept":
                    return Option_1.some(xxx.request.postData());
            }
        }), operators_1.map(fp_ts_1.either.sequence(fp_ts_1.option.option)), Observable_1.compact, operators_1.take(1), ObservableEither_1.toTaskEither, fp_ts_1.taskEither.chainEitherKW(D.string.decode), fp_ts_1.taskEither.map(JSON.parse), fp_ts_1.taskEither.chainEitherKW(fpsResponse.decode), fp_ts_1.taskEither.map((decoded) => ({
            "zrest orbiting fps benchmarking": {
                mean: new Measurement("fps", decoded.fps),
            },
        })));
    };
    return page_request_emitter_1.runWithBrowser(launchOption, (browser) => {
        return function_1.pipe(page_request_emitter_1.createNewPage()(browser), fp_ts_1.taskEither.chain(pageReader), fp_ts_1.taskEither.mapLeft(err => {
            if (err instanceof Error) {
                return err;
            }
            else {
                console.error(err);
                return new Error("Failed");
            }
        }));
    });
}
exports.benchmarkFPS = benchmarkFPS;
function withDownloadedZrests(zresturls, task) {
    const zrestsDir = P.resolve(os_1.default.tmpdir(), `zrests-${uuid_1.v4()}`);
    fs.mkdirSync(zrestsDir, { recursive: true });
    console.log("tmp directory is made: " + zrestsDir);
    const downloadObservable = rxjs_1.from(zresturls).pipe(operators_1.map(url => cacheFile_downloadDir(url.toString())(zrestsDir)), fp_ts_rxjs_1.observable.chain(ObservableEither_1.fromTaskEither), operators_1.toArray(), operators_1.map(fp_ts_1.either.sequenceArray));
    const downloadTask = ObservableEither_1.toTaskEither(downloadObservable);
    const releaseTask = () => {
        console.log("removing temporary directory ", zrestsDir, " ...");
        return fp_ts_1.taskEither.of(fs.rmdirSync(zrestsDir, { recursive: true }));
    };
    return TaskEither_1.bracket(downloadTask, task, releaseTask);
}
function benchmarkZrestLoading(libURL, zrestURLs, benchmarkName) {
    console.log("Loading benchmarking start");
    return withDownloadedZrests(zrestURLs, cachedzrests => {
        return benchmarkPageMetric(libURL, template_1.template(libURL, cachedzrests), benchmarkName, zrestURLs.length);
    });
}
exports.benchmarkZrestLoading = benchmarkZrestLoading;
async function benchmarkBundleSize(libURL) {
    console.log("Bundle size bechmarking start");
    return got_1.default(libURL.toString()).then(x => x.headers["content-length"]).then((x) => {
        if (x === undefined) {
            return Either_1.left(new Error("Unable to get content-length"));
        }
        else {
            console.log("Bundle size benchmarking end");
            return Either_1.right({
                "Bundle size test": {
                    "Bundle Size": new Measurement("mb", Number(x) / 1024 / 1024)
                }
            });
        }
    });
}
exports.benchmarkBundleSize = benchmarkBundleSize;
function stopWhenError(oe) {
    return new rxjs_1.Observable(subscriber => {
        oe.subscribe({
            next(either) {
                if (!subscriber.closed) {
                    subscriber.next(either);
                    if (Either_1.isLeft(either)) {
                        subscriber.complete();
                    }
                }
            },
            complete() {
                subscriber.complete();
            },
            error(err) {
                subscriber.error(err);
            }
        });
    });
}
const gotPromise = (url) => got_1.default(url).then(response => response.rawBody);
const downloadBuffer = TaskEither_1.tryCatchK(gotPromise, err => {
    if (err instanceof Error) {
        return err;
    }
    else {
        console.log(err);
        return new Error("download fail");
    }
});
function genTmpPathForCache(urlstr) {
    return (downloadDir) => {
        try {
            const url = new url_1.URL(urlstr);
            const newDir = P.resolve(downloadDir, uuid_1.v4());
            fs.mkdirSync(newDir);
            const newFileName = P.basename(url.pathname);
            return Either_1.right(P.resolve(newDir, newFileName));
        }
        catch (e) {
            if (e instanceof Error)
                return Either_1.left(e);
            console.error(e);
            return Either_1.left(new Error("Generating tmp path fail"));
        }
    };
}
function cacheFile_downloadDir(urlstr) {
    console.log("caching", urlstr);
    return function_1.pipe(genTmpPathForCache(urlstr), fp_ts_1.readerEither.map(newPath => {
        console.log("caching location:", newPath);
        return function_1.pipe(downloadBuffer(urlstr), fp_ts_1.taskEither.map(buffer => {
            fs.writeFileSync(newPath, buffer);
            return url_1.pathToFileURL(newPath);
        }));
    }), fp_ts_1.reader.map(fp_ts_1.either.sequence(fp_ts_1.taskEither.taskEither)), fp_ts_1.readerTaskEither.chainEitherK(xxx => xxx));
}
function cacheSrest(srest) {
    const cache = (x) => function_1.pipe(x, fp_ts_1.array.map(cacheFile_downloadDir), fp_ts_1.readerTaskEither.sequenceArray, fp_ts_1.readerTaskEither.map(urls => urls.map(url => url.toString())));
    return function_1.pipe(srest, fp_ts_1.record.map(cache), fp_ts_1.record.sequence(fp_ts_1.readerTaskEither.readerTaskEither), fp_ts_1.readerTaskEither.map(r => r));
}
function withCachedSrests(srests, task) {
    const tmpDir = P.resolve(os_1.default.tmpdir(), `srests-${uuid_1.v4()}`);
    console.log("Creating new srests cache location", tmpDir);
    fs.mkdirSync(tmpDir, { recursive: true });
    const cacheTask = function_1.pipe(srests, fp_ts_1.readonlyArray.map(cacheSrest), fp_ts_1.readonlyArray.sequence(fp_ts_1.readerTaskEither.readerTaskEither))(tmpDir);
    const mainTask = function_1.pipe(task);
    return TaskEither_1.bracket(cacheTask, mainTask, () => {
        console.log("Releasing cached srests", tmpDir);
        return fp_ts_1.taskEither.of(fs.rmdirSync(tmpDir, { recursive: true }));
    });
}
exports.withCachedSrests = withCachedSrests;
const startTracing = TaskEither_1.tryCatchK((page) => page.tracing.start({}), function_1.identity);
const stopTracing = TaskEither_1.tryCatchK((page) => page.tracing.stop(), function_1.identity);
const s3 = new client_s3_1.S3Client({ region: 'ap-northeast-2' });
function keyToURL(key, bucket) {
    const path = key.split("/").map(encodeURIComponent).join("/");
    const safebucket = encodeURIComponent(bucket);
    return `https://${safebucket}.s3.ap-northeast-2.amazonaws.com/${path}`;
}
const uploadTask = TaskEither_1.tryCatchK((buffer, bucket, key) => {
    return s3.send(new client_s3_1.PutObjectCommand({
        Body: buffer,
        ContentLength: buffer.length,
        Bucket: bucket,
        GrantRead: 'uri="http://acs.amazonaws.com/groups/global/AllUsers"',
        ContentType: "text/html",
        Key: key
    }));
}, function_1.identity);
function traceZrestLoading(liburl, zrestURL, bucket, key) {
    console.log("Trace zrest start", liburl);
    const browserReader = (browser) => {
        const pageTask = page_request_emitter_1.createNewIncognitoPage()(browser);
        const htmlurl = page_request_emitter_1.createTmpHTMLURL_JSX(template_1.zrestTraceTemplate(liburl, zrestURL));
        return function_1.pipe(pageTask, fp_ts_1.taskEither.chainFirst(startTracing), fp_ts_1.taskEither.chainFirstW(page => {
            const events = page_request_emitter_1.streamPageEvents(page, htmlurl)({
                filter: r => r.url().startsWith(template_1.hookDomain),
                alterResponse: () => Option_1.none,
                debugResponse: () => {
                }
            }).pipe(stopWhenError, operators_1.map(fp_ts_1.either.map(logEvent)));
            return ObservableEither_1.toTaskEither(events);
        }), fp_ts_1.taskEither.chain(stopTracing), fp_ts_1.taskEither.chainW((buffer) => {
            const uuid = uuid_1.v4().toString();
            const jsonname = uuid + ".json";
            fs.writeFileSync(jsonname, buffer);
            const htmlname = uuid + ".html";
            const result = child_process_1.spawnSync(path.resolve(__dirname, "..", "catapult", "tracing", "bin", "trace2html"), [jsonname, "--output=" + htmlname]);
            const stdout = result.stdout;
            if (stdout instanceof Buffer) {
                console.log("CATAPULT", stdout.toString("utf8"));
            }
            else if (typeof stdout === 'string') {
                console.log("CATAPULT", stdout);
            }
            const status = result.status;
            console.log("CATAPULT status", result.status);
            if (status !== null) {
                if (status === 0) {
                    return fp_ts_1.taskEither.right(htmlname);
                }
                else {
                    return fp_ts_1.taskEither.left(new Error("CATAPULT failed with status " + status.toString()));
                }
            }
            else {
                return fp_ts_1.taskEither.left(new Error("CATAPULT failed with status null"));
            }
        }), fp_ts_1.taskEither.chainW(htmlname => {
            const htmlbuffer = fs.readFileSync(htmlname);
            return uploadTask(htmlbuffer, bucket, key);
        }), fp_ts_1.taskEither.map(_ => {
            return keyToURL(key, bucket);
        }), fp_ts_1.taskEither.mapLeft(e => {
            if (e instanceof Error) {
                return e;
            }
            else {
                console.error(e);
                return new Error("failed");
            }
        }));
    };
    return page_request_emitter_1.runWithBrowser(launchOption, browserReader);
}
exports.traceZrestLoading = traceZrestLoading;
function logEvent(e) {
    switch (e._tag) {
        case "Log":
            console.log("PPEvent", "Log", e.message);
            break;
        case "RequestIntercept":
            console.log("PPEvent", "Request", e);
            break;
    }
    return e;
}
