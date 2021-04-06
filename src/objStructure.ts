/**
 * Objects types
 */
export type IndexedElement = {
    value: string;
    index: number;
};

export type NestedObject = {
    [key: string]: any;
};

/**
 * Options types
 */
export type MakeOptionnal<T> = {
    [P in keyof T]+?: MakeOptionnal<T[P]>;
};

export type DefaultOptions = {
    comments: boolean;
    emptyLines: boolean;
    indexed: boolean;
    tabs: boolean;
    separator: string,
    key_separator: string
};

export type Options = MakeOptionnal<DefaultOptions>;