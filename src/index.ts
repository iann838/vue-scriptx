import { App, h } from 'vue'
import Utils from './utils'

class Script2 {
    installed = false
    promise = Promise.resolve()
    
    loaded: Record<string, Promise<any>> = {}
    attrs: Array<string> = ['unload']
    props: Array<string> = ['unload', 'src', 'type', 'async', 'integrity', 'text', 'crossorigin']
    
    install (app: App): void {
        let self = this
        if (self.installed) return
        app.component('script2', {
            props: self.props,
            // <slot> is important, see: http://vuejs.org/guide/components.html#Named-Slots
            // template: '<div style="display:none"><slot></slot></div>',
            // NOTE: Instead of using `template` we can use the `render` function like so:
            render () {
                return h(
                    'div',
                    {
                        style: 'display:none'
                    },
                    this.$slots.default
                )
            },
            mounted () {
                let parent = this.$el.parentElement
                if (!this.src) {
                    self.promise = self.promise
                    .then(() => {
                        let s = document.createElement('script')
                        let h = this.$el.innerHTML
                        h = h.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&')
                        s.type = 'text/javascript'
                        s.appendChild(document.createTextNode(h))
                        parent.appendChild(s)
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
                        Utils.isUndefined(this.async) || this.async === 'false'
                        ? self.promise = self.promise.then(load) // serialize execution
                        : load() // inject immediately
                    }
                }
                    see: https://vuejs.org/v2/guide/migration.html#ready-replaced
                this.$nextTick(() => {
                    // code that assumes this.$el is in-document
                    // NOTE: we could've done this.$el.remove(), but IE sucks, see:
                    //       https://github.com/taoeffect/vue-script2/pull/17
                    this.$el.parentElement.removeChild(this.$el) // remove dummy template <div>
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
    
    load (src: string, opts: Record<string, any> = { parent: document.head }) {
        if (!this.loaded[src]) {
            this.loaded[src] = new Promise((resolve, reject) => {
                let scr = document.createElement('script')

                // omit the special options that Script2 supports
                Utils.defaults(scr, Utils.omit(opts, ['unload', 'parent']), { type: 'text/javascript' })

                // according to: http://www.html5rocks.com/en/tutorials/speed/script-loading/
                // async does not like 'document.write' usage, which we & vue.js make
                // heavy use of based on the SPA style. Also, async can result
                // in code getting executed out of order from how it is inlined on the page.
                scr.async = false // therefore set this to false
                scr.src = src

                // crossorigin in HTML and crossOrigin in the DOM per HTML spec
                // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-img-crossorigin
                if (opts.crossorigin) {
                    scr.crossOrigin = opts.crossorigin
                }

                // inspiration from: https://github.com/eldargab/load-script/blob/master/index.js
                // and: https://github.com/ded/script.js/blob/master/src/script.js#L70-L82
                scr.onload = () => resolve(src)

                // IE should now support onerror and onload. If necessary, take a look
                // at this to add older IE support: http://stackoverflow.com/a/4845802/1781435
                scr.onerror = () => reject(new Error(src))
                opts.parent.appendChild(scr)
            })
        }
        return this.loaded[src]
    }

}

let VueScript2 = new Script2()

declare module '@vue/runtime-core'

export default VueScript2
