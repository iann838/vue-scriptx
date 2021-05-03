export default class {
    static isUndefined(x) {
        return x === undefined;
    }
    static pick(o, props) {
        let x = {};
        props.forEach(k => { x[k] = o[k]; });
        return x;
    }
    static omit(o, props) {
        let x = {};
        Object.keys(o).forEach((k) => {
            if (props.indexOf(k) === -1)
                x[k] = o[k];
        });
        return x;
    }
    static omitBy(o, pred) {
        let x = {};
        Object.keys(o).forEach((k) => {
            if (!pred(o[k]))
                x[k] = o[k];
        });
        return x;
    }
    // custom defaults function suited to our specific purpose
    static defaults(o, ...sources) {
        sources.forEach((s) => {
            Object.keys(s).forEach((k) => {
                if (this.isUndefined(o[k]) || o[k] === '')
                    o[k] = s[k];
            });
        });
    }
}
