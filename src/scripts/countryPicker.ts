import { Camera, Color, LineBasicMaterial, LineSegments, Object3D, Raycaster, Vector2 } from "three";

export default class PickHelper {
    renderer: HTMLCanvasElement;
    scene: Object3D[] = [];
    camera: Camera;
    hoveredObject: Object3D | undefined;
    selectedObject: Object3D | undefined;

    constructor(renderer: HTMLCanvasElement, scene: Object3D[], camera: Camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        //Global listener for click function
        window.addEventListener("click", this);
        window.addEventListener("touchend", this);
        window.addEventListener("mousemove", this);
    }

    handleEvent(ev: Event) {
        switch (ev.type) {
            case "click":
            {
                this.selectObject(ev);
                break;
            }
            case "touchend":
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

    #getMouseVector(event): Vector2 {
        const canvasBounds = this.renderer.getBoundingClientRect();

        const mouseVector = new Vector2();

        if (event instanceof MouseEvent) {
            mouseVector.x = ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
            mouseVector.y = - ((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
        }
        else if (event instanceof TouchEvent) {
            mouseVector.x = ((event.touches[0].clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
            mouseVector.y = - ((event.touches[0].clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
        }

        return mouseVector;
    }

    selectObject(event: Event) {
        if (this.selectedObject) {
            // Tidy up
        }

        this.selectedObject = PickHelper.pick(this.scene, this.camera, this.#getMouseVector(event));

        if (this.selectedObject) {
            console.log(this.selectedObject.parent.userData["data"]);

        }
    }

    hoverObject(event: Event) {
        if (this.hoveredObject) {
            const mat = (<LineBasicMaterial>(<LineSegments>this.hoveredObject.parent).material);
            mat.color = new Color("white");
            mat.linewidth = 1;
        }
        const pickedObject = PickHelper.pick(this.scene, this.camera, this.#getMouseVector(event));
        if (pickedObject) {
            this.hoveredObject = pickedObject;
            const mat = (<LineBasicMaterial>(<LineSegments>this.hoveredObject.parent).material);
            mat.color = new Color('red');
            mat.linewidth = 2;
            console.log
        }
    }

    static pick(objects: Object3D[], camera: Camera, mouseVector: Vector2): Object3D | undefined {
        const raycaster = new Raycaster();
        raycaster.setFromCamera(mouseVector, camera);

        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            let intersect: Object3D;

            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.userData["type"] == "hotspot") {
                    intersect = intersects[i].object;
                }
            }
            return intersect;
        }
        return;
    }
}
