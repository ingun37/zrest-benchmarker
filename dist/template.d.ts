/// <reference types="react" />
import U from "url";
import { SRest } from "./types";
export declare const hookDomain = "http://screenshotrequest.clo";
export declare const timestampLabel = "closet viewer benchmark";
export declare const template: (libURL: U.URL, modelURLs: readonly U.URL[]) => JSX.Element;
export declare const templateForFPS: (libURL: U.URL, modelURL: U.URL, secInMS: number, viewWidth: number, viewHeight: number) => JSX.Element;
export declare const measureCue = "measure cue";
export declare const templateSrest: (libURL: U.URL, srests: readonly SRest[]) => JSX.Element;
export declare const zrestTraceTemplate: (libURL: U.URL, zrestURL: U.URL) => JSX.Element;
