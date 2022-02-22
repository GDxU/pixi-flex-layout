// import {YogaLayout} from "./src";
import {YogaLayout} from "pixi-flex-layout-v6"

declare namespace GlobalMixins {
    /* interface Rectangle {
         fitY(rectangle: import('@pixi/math').Rectangle, width: number, height: number): import('@pixi/math').Rectangle;
     }*/
    interface DisplayObject {
        _yogaLayoutHash: number;
        _prevYogaLayoutHash: number;
        __yoga: YogaLayout;

        yoga: YogaLayout;

        /**
         * Internal property for fast checking if object has yoga
         */
        __hasYoga: boolean;

        /**
         * Applies yoga layout to DisplayObject
         */
        updateYogaLayout(): void;

        /**
         * Checks boundaries of DisplayObject and emits NEED_LAYOUT_UPDATE if needed
         */
        checkIfBoundingBoxChanged(): void;
    }

    /*interface DisplayObject {
        _yogaLayoutHash: number;
        _prevYogaLayoutHash: number;
        __yoga: YogaLayout;
    }*/

    interface Container {
        /**
         * True to enable flex for direct children. See also: flexRecursive
         */
        flex: boolean;
        /**
         * True to enable flex for ALL children. See also: flex
         */
        flexRecursive: boolean;
    }
}
