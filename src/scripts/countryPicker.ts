import { Camera, Object3D, Object3DEventMap, Raycaster, Scene, Vector2 } from "three";

export default class PickHelper {
    private raycaster: Raycaster;
    private mouseVector: Vector2;

    private renderer: HTMLCanvasElement;
    private scene: Scene;
    private camera: Camera;
    private hoveredHotspot: Object3D<Object3DEventMap> | undefined;

    constructor(renderer: HTMLCanvasElement, scene: Scene, camera: Camera) {
        this.raycaster = new Raycaster();
        this.mouseVector = new Vector2(0, 0);

        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        //Global listener for click function
        window.addEventListener("mousedown", this);
        window.addEventListener("touchstart", this);
        window.addEventListener("mousemove", this);
    }

    handleEvent(ev: Event) {
        switch (ev.type) {
        case "mousedown":
        {
            this.selectObject(ev);
            break;
        }
        case "touchstart":
        {
            this.selectObject(ev);
            break;
        }
        case "mousemove":
        {
            this.hoverObject(ev);
            break;
        }
        }
    }

    selectObject(event: Event) {
        const canvasBounds = this.renderer.getBoundingClientRect();

        if (event instanceof MouseEvent) {
            const ev = <MouseEvent>event;
            this.mouseVector.x = ((ev.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
            this.mouseVector.y = - ((ev.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
        }
        else if (event instanceof TouchEvent) {
            const ev = <TouchEvent>event;
            this.mouseVector.x = ((ev.touches[0].clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
            this.mouseVector.y = - ((ev.touches[0].clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
        }

        const pickedObject = this.pick(this.scene, this.camera);

        if (pickedObject) {
            const pickObject = pickedObject.object;
            if (pickedObject) {
                //const hotspot: HotSpot = <HotSpot>pickObject;
                //hotspot.clicked();
            }
        }
    }

    hoverObject(event: Event) {
        return;

        if (event instanceof MouseEvent) {
            const canvasBounds = this.renderer.getBoundingClientRect();
            const ev = <MouseEvent>event;
            this.mouseVector.x = ((ev.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
            this.mouseVector.y = - ((ev.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
        }

        const pickedObject = this.pick(this.scene, this.camera);
        if (pickedObject) {
            // Hotspot representation is a sprite object, whose parent is of type HotSpot
            const pickParent = pickedObject.object.parent;
            if (pickParent) {
                switch (pickParent.userData["type"] ) {
                case "HotSpot":
                {
                    const hotspot: HotSpot = <HotSpot>pickParent;
                    if (hotspot.selected) {
                        break;
                    }
                    this.hoverMouse(true);
                    this.hoverHotspot(hotspot, true);
                    if (this.hoveredHotspot && !(this.hoveredHotspot as HotSpot).selected && this.hoveredHotspot != hotspot) {
                        this.hoverHotspot(this.hoveredHotspot as HotSpot, false);
                    }
                    this.hoveredHotspot = pickParent;
                    break;
                }
                case "GUIHotSpot":
                {
                    this.hoverMouse(true);
                    break;
                }
                default:
                {
                    this.resetHoveredHotspot();
                    break;
                }
                }
            }
        } else {
            this.resetHoveredHotspot();
        }
    }

    pick(scene: Scene, camera: Camera) {
        this.raycaster.setFromCamera(this.mouseVector, camera);

        const intersects = this.raycaster.intersectObjects(scene.children, true);

        
        if (intersects.length > 0) {
            let intersect = intersects[0];

            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.userData["type"] == "hotspot") {
                    console.log("picked!");
                    return intersects[i];
                }
                else if (intersects[i].object.parent?.visible) {
                    //intersect = intersects[i];
                }
            }
            return intersect;
        }
        return false;
        return false;
    }
}
