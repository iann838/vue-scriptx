
export default class {

    static isUndefined (x: any): boolean {
        return x === undefined
    }

    static pick (o: Record<string, any>, props: Array<string | number>): Record<string, any> {
        let x: Record<string, any> = {}
        props.forEach(k => { x[k] = o[k] })
        return x
    }

    static omit (o: Record<string, any>, props: Array<string | number>) {
        let x: Record<string, any> = {}
        Object.keys(o).forEach((k) => {
            if (props.indexOf(k) === -1) x[k] = o[k]
        })
        return x
    }

    static omitBy (o: Record<string, any>, pred: CallableFunction) {
        let x: Record<string, any> = {}
        Object.keys(o).forEach((k) => {
            if (!pred(o[k])) x[k] = o[k]
        })
        return x
    }

    // custom defaults function suited to our specific purpose
    static defaults (o: Record<string, any>, ...sources: Array<Record<string, any>>) {
        sources.forEach((s) => {
            Object.keys(s).forEach((k) => {
                if (this.isUndefined(o[k]) || o[k] === '') o[k] = s[k]
            })
        })
    }

}
