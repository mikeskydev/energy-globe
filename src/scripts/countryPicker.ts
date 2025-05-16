import { AlwaysDepth, Camera, Color, Layers, LessEqualDepth, LineBasicMaterial, LineSegments, Object3D, Raycaster, Vector2 } from "three";

export default class CountryPicker {
    renderer: HTMLCanvasElement;
    scene: Object3D[] = [];
    camera: Camera;
    hoveredObject: Object3D | undefined;

    constructor(renderer: HTMLCanvasElement, scene: Object3D[], camera: Camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        //Global listener for click function
        window.addEventListener("mousedown", this);
        window.addEventListener("mousemove", this);
    }

    handleEvent(e: Event) {
        switch (e.type) {
            case "mousedown":
                const selectedObject = CountryPicker.pick(this.scene, this.camera, this.#getMouseVector(e));
                if (selectedObject) {
                    window.dispatchEvent(new CustomEvent("hotspotselect", { detail: selectedObject }))
                }
                else {
                    window.dispatchEvent(new CustomEvent("hotspotdeselect"));
                }
                break;
            case "mousemove":
                if (this.hoveredObject) {
                    const mat = (<LineBasicMaterial>(<LineSegments>this.hoveredObject.parent).material);
                    mat.color = new Color("white");
                    this.hoveredObject.parent.renderOrder = 0;
                }
                this.hoveredObject = undefined;
                const pickedObject = CountryPicker.pick(this.scene, this.camera, this.#getMouseVector(e));
                if (pickedObject) {
                    this.hoveredObject = pickedObject;
                    const mat = (<LineBasicMaterial>(<LineSegments>this.hoveredObject.parent).material);
                    mat.color = new Color('red');
                    this.hoveredObject.parent.renderOrder = 1;
                    this.renderer.parentElement.style.cursor = "pointer";
                } else {
                    this.renderer.parentElement.style.cursor = "";
                }
                break;
        }
    }

    #getMouseVector(event: Event): Vector2 {
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

    static pick(objects: Object3D[], camera: Camera, mouseVector: Vector2): Object3D | undefined {
        const raycaster = new Raycaster();
        raycaster.setFromCamera(mouseVector, camera);

        // Objects subset is just the pin sprites, so small lookup
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            let intersect: Object3D;

            // Objects ordered by distance, so should pick the one on the near side of the globe :)
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.userData["type"] == "hotspot") {
                    intersect = intersects[i].object;
                    return intersect;
                }
            }
        }
        return;
    }
}
