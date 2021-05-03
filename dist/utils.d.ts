export default class {
    static isUndefined(x: any): boolean;
    static pick(o: Record<string, any>, props: Array<string | number>): Record<string, any>;
    static omit(o: Record<string, any>, props: Array<string | number>): Record<string, any>;
    static omitBy(o: Record<string, any>, pred: CallableFunction): Record<string, any>;
    static defaults(o: Record<string, any>, ...sources: Array<Record<string, any>>): void;
}
