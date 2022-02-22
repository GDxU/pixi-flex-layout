/// <reference path="../global.d.ts" />
import {YogaLayout} from "./YogaLayout";
import {Container} from "@pixi/display";

interface IContainer {
    /**
     * True to enable flex for direct children. See also: flexRecursive
     */
    flex: boolean;
    /**
     * True to enable flex for ALL children. See also: flex
     */
    flexRecursive: boolean;
}

interface IDisplayObject {
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


export function applyContainerPolyfill(container_pixi: any) {
    if (!container_pixi) {
        console.log("@pixi/apply: mixin was called with empty parameter. Are you sure that?")
        return
    }
    const ContainerProto = container_pixi.prototype as (Container & Partial<IContainer> & Partial<IDisplayObject>)
    Object.defineProperty(ContainerProto, "flex", {
        get(): boolean {
            return this.__flex;
        },
        set(newFlex: boolean): void {
            if (!this.flex && newFlex) {
                this.children.forEach(child => {
                    this.yoga.addChild(child.yoga);
                    if (this.flexRecursive && child.hasOwnProperty("flex") && child.flex === true) {
                        child.flexRecursive = true;
                    }
                });
                this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
            }

            if (this.flex && !newFlex) {
                this.children.forEach(child => {
                    this.yoga.removeChild(child.yoga);
                });
            }
            this.__flex = newFlex;
        }
    });

    Object.defineProperty(ContainerProto, "flexRecursive", {
        get(): boolean {
            return this.__flexRecursive;
        },
        set(newFlex: boolean): void {
            this.__flexRecursive = newFlex;
            this.flex = newFlex;
        }
    });

    const addChild = ContainerProto.addChild;
    const removeChildren = ContainerProto.removeChildren;
    const addChildAt = ContainerProto.addChildAt;
    const removeChild = ContainerProto.removeChild;
    const containerUpdateTransform = ContainerProto.updateTransform;

    ContainerProto.addChild = function (...children) {
        if (children.length === 1) {
            const child = children[0] as Partial<IDisplayObject> & Partial<IContainer>;
            if (this.flex === true) {
                child.yoga = child.yoga || new YogaLayout(child);
                child.__hasYoga = true;
                this.yoga.addChild(child.yoga);
            }

            if (this.flexRecursive && child.hasOwnProperty("flex") && child.flex !== false) {
                child.flexRecursive = true;
            }
            this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
        }
        return addChild.call(this, ...children) as any;
    }


    ContainerProto.addChildAt = function (child: IDisplayObject | IContainer | any, index: number | any) {

        if (child.hasOwnProperty("flex") && this.flex === true) {
            child.yoga = child.yoga || new YogaLayout(child);
            this.__hasYoga = true;
            this.yoga.addChild(child.yoga, index);
        }

        if (child.hasOwnProperty("flexRecursive") && this.flexRecursive && child.hasOwnProperty("flex") && child.flex !== false) {
            child.flexRecursive = true;
        }
        this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
        return addChildAt.call(this, child, index) as any;
    }


    ContainerProto.removeChild = function (...children) {
        if (children.length === 1) {
            const child = children[0] as any | IDisplayObject | IContainer;
            if (this.flex) {
                this.yoga.removeChild(child.yoga);
            }
            this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
        }
        return removeChild.call(this, ...children) as any;
    }

    ContainerProto.removeChildren = function (beginIndex, endIndex) {
        if (this.__hasYoga) {
            const begin = beginIndex || 0;
            const end = typeof endIndex === 'number' ? endIndex : this.children.length;
            const range = end - begin;

            if (range > 0 && range <= end) {
                const removed = (this.children as any | IDisplayObject[] | IContainer[]).slice(begin, range);
                removed.forEach(child => child.__hasYoga && this.yoga.removeChild(child.yoga))
            }
            this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
        }
        return removeChildren.call(this, beginIndex, endIndex) as any;
    }


    ContainerProto.updateTransform = function () {
        if (this.__hasYoga && this.__yoga.isRoot && YogaLayout.isRendering) {
            this.checkIfBoundingBoxChanged();
            this.updateYogaLayout();
        }

        return containerUpdateTransform.call(this)
    }
}
