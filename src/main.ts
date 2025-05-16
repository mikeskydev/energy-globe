import { 
    AmbientLight,
    Box3,
    Clock,
    Color,
    DirectionalLight,
    EquirectangularReflectionMapping,
    Euler,
    Matrix4,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Quaternion,
    Raycaster,
    Scene,
    Sphere,
    SphereGeometry,
    Spherical,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    Vector4,
    WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons';

import CountryLayers from './scripts/CountryLayers';
import CountryPicker from './scripts/countryPicker';
import DataDisplay from './scripts/DataDisplay';
import CameraControls from 'camera-controls';

class App {
    renderer: WebGLRenderer;
    scene: Scene;
    controls: OrbitControls;

    constructor() {
        const texLoad = new TextureLoader();
        texLoad.setPath("img/");

        const scene = new Scene();
        const bgTex = texLoad.load("nightsky.jpg");
        bgTex.colorSpace = SRGBColorSpace;
        bgTex.mapping = EquirectangularReflectionMapping;
        scene.background = bgTex;
        scene.backgroundIntensity = 0.4;
        scene.backgroundRotation = new Euler(0, Math.PI, Math.PI/4);
    
        // lighting
        const ambient = new AmbientLight(new Color(1, 1, 1), 1);
        const sun = new DirectionalLight(new Color(1, 1, 1), 2);
        sun.position.set(-1,0,0);
        scene.add(ambient, sun);
    
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.y = 4;
        camera.position.z = 5;
    
        const renderer = new WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        const container = document.getElementById('container');
        container.appendChild(renderer.domElement);

        const subsetOfTHREE = {
            Vector2   : Vector2,
            Vector3   : Vector3,
            Vector4   : Vector4,
            Quaternion: Quaternion,
            Matrix4   : Matrix4,
            Spherical : Spherical,
            Box3      : Box3,
            Sphere    : Sphere,
            Raycaster : Raycaster,
        };

        CameraControls.install({ THREE: subsetOfTHREE });
        const controls = new CameraControls(camera, renderer.domElement);
        const clock = new Clock();
    
        controls.minDistance = 2.5;
        controls.maxDistance = 4;
        controls.distance = 4;
        controls.azimuthRotateSpeed = 0.5;
        controls.polarRotateSpeed = 0.5;
        // controls.enableDamping = true;
        // controls.zoomSpeed = 0.5;
        //controls.dampingFactor = 2;
        
        // Globe setup
        const globeGeo = new SphereGeometry(2, 90, 90, -Math.PI/2);
        const globeTex = texLoad.load("world.png");
        const globeNight = texLoad.load("worldNight.jpg");
        const globeNormal = texLoad.load("worldNormal.png");
        const globeM = new MeshStandardMaterial({ map: globeTex, normalMap: globeNormal });
        const globe = new Mesh(globeGeo, globeM);
        scene.add(globe);
        
        // data
        const dataDisplay = new DataDisplay(controls);
        const builder = new CountryLayers(2022, dataDisplay);
        globe.add(builder);
        
        const picker = new CountryPicker(renderer.domElement, builder.hotspots, camera);
    
        function animate() {
            //globe.rotation.y += 0.001;
            const delta = clock.getDelta();
            const updated = controls.update(delta);
            renderer.render( scene, camera );
        }
        
        renderer.setAnimationLoop( animate );
    }
}

const app = new App();
