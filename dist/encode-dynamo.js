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
exports.encodeDynamoFormat = void 0;
const D = __importStar(require("io-ts/Decoder"));
const E = __importStar(require("fp-ts/Either"));
const R = __importStar(require("fp-ts/Record"));
const function_1 = require("fp-ts/lib/function");
function encodeDynamoFormat(raw) {
    const tryNumber = D.number.decode(raw);
    if (E.isRight(tryNumber)) {
        return E.right({ N: tryNumber.right.toString() });
    }
    const tryString = D.string.decode(raw);
    if (E.isRight(tryString)) {
        return E.right({ S: tryString.right });
    }
    const tryMap = D.UnknownRecord.decode(raw);
    if (E.isRight(tryMap)) {
        return function_1.pipe(tryMap.right, R.map(encodeDynamoFormat), R.sequence(E.either), E.map(m => ({ M: m })));
    }
    return E.left(`unable to encode ${raw}`);
}
exports.encodeDynamoFormat = encodeDynamoFormat;
