import * as PIXI from "pixi.js";
import {applyContainerPolyfill} from "./containerPolyfill";
import {applyDisplayObjectPolyfill} from "./displayObjectPolyfill";
import {yogaAnimationManager} from "./YogaAnimationManager";
import {YogaLayout} from "./YogaLayout";

if (!(<any>window).PIXI) {
    (<any>window).PIXI = PIXI;
}

export {YogaLayout, IYogaAnimationConfig} from "./YogaLayout";
export {YogaLayoutConfig} from "./YogaLayoutConfig";
export * from "./YogaContants";

export interface IFlexLayoutOptions {
    usePixiSharedTicker: boolean;
}


/**
 * Polyfills PIXI.DisplayObject and PIXI.Container
 *
 * @param options
 */
export function initializeYogaLayout(options: IFlexLayoutOptions = {usePixiSharedTicker: true}) {
    applyDisplayObjectPolyfill(PIXI.DisplayObject);
    applyContainerPolyfill(PIXI.Container);
    if (options.usePixiSharedTicker) {
        PIXI.Ticker.shared.add(delta => yogaAnimationManager.update(delta));
    }
}


/**
 * Can be used to optimize Yoga update calls.
 * If renderer is set yoga boundBoxCheck/layotutUpdate in updateTransform will be called ONLY when rendering.
 * @param renderer
 */
export function yogaSetRenderer(renderer: PIXI.AbstractRenderer) {
    renderer.on("prerender", () => YogaLayout.isRendering = true)
    renderer.on("postrender", () => YogaLayout.isRendering = false)
}
