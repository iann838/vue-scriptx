import { App } from 'vue';
declare class VueScriptX {
    installed: boolean;
    promise: Promise<void>;
    loaded: Record<string, Promise<any>>;
    props: Array<string>;
    install(app: App): void;
    load(src: string, opts?: Record<string, any>): Promise<any>;
}
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $scriptx: VueScriptX;
    }
}
declare const _default: VueScriptX;
export default _default;
