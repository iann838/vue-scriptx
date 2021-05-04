import { App, h } from 'vue'
import Utils from './utils'

class VueScriptX {
    installed = false
    promise = Promise.resolve()
    
    loaded: Record<string, Promise<any>> = {}
    props: Array<string> = ['unload', 'src', 'type', 'async', 'integrity', 'text', 'crossorigin']
    
    install (app: App): void {
        app.config.globalProperties.$scriptx = this

        let self = this
        if (self.installed) return
        
        app.component('scriptx', {
            props: self.props,
            // Uses render method with <slot>s, see: https://v3.vuejs.org/guide/render-function.html
            render () {
                return h(
                    'div',
                    { style: 'display:none' },
                    this.$slots.default ? this.$slots.default(): undefined,
                )
            },
            mounted () {
                let parent = this.$el.parentElement
                if (!this.src) {
                    self.promise = self.promise
                    .then(() => {
                        let script = document.createElement('script')
                        let el = this.$el.innerHTML
                        el = el.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&')
                        script.type = 'text/javascript'
                        script.appendChild(document.createTextNode(el))
                        parent.appendChild(script)
                        this.$emit('loaded') // any other proper way to do this or emit error?
                    })
                } else {
                    let opts = Utils.omitBy(Utils.pick(this, self.props), Utils.isUndefined)
                    opts.parent = parent
                    // this syntax results in an implicit return
                    let load = () => {
                        self.load (this.src, opts)
                        .then(
                            () => this.$emit('loaded'),
                            (err: any) => this.$emit('error', err)
                        )
                    }
                    if (Utils.isUndefined(this.async) || this.async === 'false')
                        self.promise = self.promise.then(load) // serialize execution
                    else
                        load() // inject immediately
                }
                this.$nextTick(() => {
                    this.$el.parentElement.removeChild(this.$el)
                    // NOTE: this.$el.remove() may be used, but IE sucks, see: https://github.com/taoeffect/vue-script2/pull/17
                })
            },
            unmounted () {
                if (this.unload) {
                    new Function(this.unload)() // eslint-disable-line
                    delete self.loaded[this.src]
                }
            }
        })
        self.installed = true
    }
    
    load (src: string, opts: Record<string, any> = { parent: document.head }): Promise<any> {
        if (!this.loaded[src]) {
            this.loaded[src] = new Promise((resolve, reject) => {
                let script = document.createElement('script')

                // omit the special options that VueScriptX supports
                Utils.defaults(script, Utils.omit(opts, ['unload', 'parent']), { type: 'text/javascript' })

                // async may not be used with 'document.write'
                script.async = false
                script.src = src

                // crossorigin in HTML and crossOrigin in the DOM per HTML spec
                if (opts.crossorigin) {
                    script.crossOrigin = opts.crossorigin
                }

                // handle onload and onerror
                script.onload = () => resolve(src)
                script.onerror = () => reject(new Error(src))
                opts.parent.appendChild(script)
            })
        }
        return this.loaded[src]
    }

}

declare module '@vue/runtime-core' {

    interface ComponentCustomProperties {
        $scriptx: VueScriptX
    }
}

export default new VueScriptX()
