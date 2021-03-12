/// <reference types="node" />
/// <reference types="react" />
import * as U from "url";
import { URL } from "url";
import { Either } from "fp-ts/Either";
import { ReaderTaskEither } from "fp-ts/ReaderTaskEither";
import { TaskEither } from "fp-ts/TaskEither";
import { SRest } from "./types";
export declare class Measurement {
    unit: string;
    value: number;
    constructor(unit: string, value: number);
}
export declare type Result = Record<string, Record<string, Measurement>>;
export declare function benchmarkSrestLoading(liburl: U.URL, srestJsonURLs: readonly string[]): TaskEither<unknown, Record<string, Record<string, Measurement>>>;
export declare function retryN<E, A>(count: number, taskMaker: () => TaskEither<E, A>): import("fp-ts/lib/Task").Task<Either<E, A>>;
export declare function benchmarkPageMetric(liburl: U.URL, jsx: JSX.Element, benchmarkName: string, modelCount: number): TaskEither<Error, Record<string, Record<string, Measurement>>>;
export declare function benchmarkFPS(libURL: U.URL, heavyZrestURL: U.URL, viewWidth: number, viewHeight: number, timeMS: number): TaskEither<Error, Record<string, Record<string, Measurement>>>;
export declare function benchmarkZrestLoading(libURL: U.URL, zrestURLs: U.URL[], benchmarkName: string): TaskEither<Error, Result>;
export declare function benchmarkBundleSize(libURL: U.URL): Promise<Either<Error, Record<string, Record<string, Measurement>>>>;
export declare function withCachedSrests<_V>(srests: readonly SRest[], task: ReaderTaskEither<readonly SRest[], Error, _V>): TaskEither<Error, _V>;
export declare function traceZrestLoading(liburl: URL, zrestURL: URL, bucket: string, key: string): TaskEither<Error, string>;
