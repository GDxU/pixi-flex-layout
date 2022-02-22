import * as PIXI from "pixi.js";
export { YogaLayout, IYogaAnimationConfig } from "./YogaLayout";
export { YogaLayoutConfig } from "./YogaLayoutConfig";
export * from "./YogaContants";
export interface IFlexLayoutOptions {
    usePixiSharedTicker: boolean;
}
export declare function initializeYogaLayout(options?: IFlexLayoutOptions): void;
export declare function yogaSetRenderer(renderer: PIXI.AbstractRenderer): void;
