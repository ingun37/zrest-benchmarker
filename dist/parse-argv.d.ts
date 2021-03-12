/// <reference types="node" />
import { URL } from "url";
export declare class ArgvExhausted extends Error {
}
export declare class ArgvParseError extends Error {
}
export declare const fpsViewWidthLongName = "--fps-view-width";
export declare const fpsViewHeightLongName = "--fps-view-height";
export declare const fpsMSLongName = "--fps-ms";
export declare const srestJsonURLsLongName = "--srest-json-url";
export declare const tracingZrestURLsLongName = "--tracing-zrest";
export declare const tracingBucketLongName = "--tracing-bucket";
export declare const comparisonZrestURLsLongName = "--compare-zrest-url";
export declare class Info {
    libraryURL: URL;
    zrestURLs: URL[];
    heavyZrestURL: URL;
    apiURL: URL;
    tableName: string;
    meta: {
        [property: string]: string;
    };
    fpsViewWidth: number;
    fpsViewHeight: number;
    fpsMS: number;
    readonly srestJsonURLs: readonly string[];
    readonly tracingZrestURLs: readonly string[];
    readonly tracingBucket: string;
    readonly comparisonZrestURLs: URL[];
    constructor(libraryURL: URL, zrestURLs: URL[], heavyZrestURL: URL, apiURL: URL, tableName: string, meta: {
        [property: string]: string;
    }, fpsViewWidth: number, fpsViewHeight: number, fpsMS: number, srestJsonURLs: readonly string[], tracingZrestURLs: readonly string[], tracingBucket: string, comparisonZrestURLs: URL[]);
}
export declare function parseArgvs(argv: string[]): Promise<Info>;
