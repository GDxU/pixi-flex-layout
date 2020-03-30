import { YogaLayout } from "./YogaLayout";
import Container = PIXI.Container;

declare module "pixi.js" {
    export interface Container {
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

export function applyContainerPolyfill() {

    Object.defineProperty(Container.prototype, "flex", {
        get(): boolean {
            return this.__flex;
        },
        set(newFlex: boolean): void {
            if (!this.flex && newFlex) {
                this.children.forEach(child => {
                    this.yoga.addChild(child.yoga);
                    if (this.flexRecursive && child instanceof PIXI.Container) {
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

    Object.defineProperty(Container.prototype, "flexRecursive", {
        get(): boolean {
            return this.__flexRecursive;
        },
        set(newFlex: boolean): void {
            this.__flexRecursive = newFlex;
            this.flex = newFlex;
        }
    });

    const addChild = Container.prototype.addChild;
    const removeChildren = Container.prototype.removeChildren;
    const addChildAt = Container.prototype.addChildAt;
    const removeChild = Container.prototype.removeChild;
    const containerUpdateTransform = Container.prototype.updateTransform;

    Container.prototype.addChild = function (...children) {
        if (children.length === 1) {
            const child = children[0];
            if (this.flex) {
                child.yoga = child.yoga || new YogaLayout(child);
                child.__hasYoga = true;
                this.yoga.addChild(child.yoga);
            }

            if (this.flexRecursive && child instanceof PIXI.Container) {
                child.flexRecursive = true;
            }
            this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
        }
        return addChild.call(this, ...children) as any;
    }


    Container.prototype.addChildAt = function (child, index) {
        if (this.flex) {
            child.yoga = child.yoga || new YogaLayout(child);
            this.__hasYoga = true;
            this.yoga.addChild(child.yoga, index);
        }

        if (this.flexRecursive && child instanceof PIXI.Container) {
            child.flexRecursive = true;
        }
        this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
        return addChildAt.call(this, child, index) as any;
    }


    Container.prototype.removeChild = function (...children) {
        if (children.length === 1) {
            const child = children[0];
            if (this.flex) {
                this.yoga.removeChild(child.yoga);
            }
            this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
        }
        return removeChild.call(this, ...children) as any;
    }

    Container.prototype.removeChildren = function (beginIndex, endIndex) {
        if (this.flex) {
            const begin = beginIndex || 0;
            const end = typeof endIndex === 'number' ? endIndex : this.children.length;
            const range = end - begin;

            if (range > 0 && range <= end) {
                const removed = this.children.slice(begin, range);
                removed.forEach(child => this.yoga.removeChild(child.yoga))
            }
            this.emit(YogaLayout.NEED_LAYOUT_UPDATE);
        }
        return removeChildren.call(this, beginIndex, endIndex) as any;
    }


    Container.prototype.updateTransform = function () {
        if ((this.flex || this.flexRecursive || this.__hasYoga) && this.yoga.isRoot) {
            this.checkIfBoundingBoxChanged();
            this.updateYogaLayout();
        }

        return containerUpdateTransform.call(this)
    }
}
