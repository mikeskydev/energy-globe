import { CameraControls } from "camera-controls/dist/CameraControls";
import { BoxGeometry, Camera, Color, CylinderGeometry, Euler, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Quaternion, Vector3 } from "three";

export default class DataDisplay extends Object3D {
    sources = {
        "coal": new Object3D(),
        "gas": new Object3D(),
        "oil": new Object3D(),
        "nuclear": new Object3D(),
        "hydro": new Object3D(),
        "bioFuel": new Object3D(),
        "solar": new Object3D(),
        "wind": new Object3D(),
        "other": new Object3D()
    }

    colors = {
        "coal": new Color("black"),
        "gas": new Color("#d4631e"),
        "oil": new Color("#332603"),
        "nuclear": new Color("lightblue"),
        "hydro": new Color("blue"),
        "bioFuel": new Color("green"),
        "solar": new Color("yellow"),
        "wind": new Color("white"),
        "other": new Color("pink"),
    }
    controls: CameraControls;

    constructor(controls: CameraControls) {
        super();
        this.controls = controls;
        const scale = 0.002;
        const spacing = 0.03;

        const mat = new MeshStandardMaterial();
        const geom = new CylinderGeometry(0.01, 0.01, scale);
        const offset = new Mesh(geom);
        
        const entries = Object.entries(this.sources);
        // find midpoint and start iteration from leftmost source
        let iter = -entries.length/2 * spacing;
        
        let clone;
        // factory for each source while preserving dict lookup
        entries.forEach(([key, source]) => {
            clone = offset.clone();
            source.add(clone);
            clone.translateY(scale/2);
            clone.material = mat.clone();
            clone.material.color = this.colors[key];
            // line format
            // TODO: circle might be pretty?
            source.translateX(iter);
            iter += spacing;
            this.add(source);
        });
    }

    setData(position: Vector3, azimuth: number, polar: number, dataValues: {}) {
        const newPos = position.clone();
        // reset position to origin for lookAt to work
        this.position.set(0, 0, 0);
        this.rotation.set(0, 0, 0);

        this.lookAt(newPos);
        // tilt forwards slightly for 3D
        this.rotateX(Math.PI/3);
        
        this.position.set(newPos.x, newPos.y, newPos.z);

        // smooth camera transition to focus on data
        this.controls.dollyTo(2.5, true);
        this.controls.rotateTo((azimuth)*Math.PI/180, (90-polar)*Math.PI/180, true);

        console.log(dataValues);
        Object.keys(this.sources).forEach(key => {
            // If data present, scale each bar for %age of fuel share
            const scale = dataValues[key] ?? 0;
            this.sources[key].scale.y = scale;
        });
    }
}