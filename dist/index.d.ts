import { App } from 'vue';
declare class Script2 {
    installed: boolean;
    promise: Promise<void>;
    loaded: Record<string, Promise<any>>;
    attrs: Array<string>;
    props: Array<string>;
    install(app: App): void;
    load(src: string, opts?: Record<string, any>): Promise<any>;
}
declare let VueScript2: Script2;
declare module '@vue/runtime-core';
export default VueScript2;
