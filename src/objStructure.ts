export interface IndexedElement {
    value: string,
    index: number
}

export interface NestedObject {
    [key: string]: any
}

export interface Options {
    comments: boolean,
    emptyLines: boolean
}