import * as E from "fp-ts/Either";
export declare type DynamoN = {
    N: string;
};
export declare type DynamoS = {
    S: string;
};
export declare type DynamoM = {
    M: {
        [property: string]: DynamoAttribute;
    };
};
export declare type DynamoAttribute = DynamoM | DynamoN | DynamoS;
export declare function encodeDynamoFormat(raw: any): E.Either<string, DynamoAttribute>;
