import { 
    AmbientLight,
    Color,
    DirectionalLight,
    EquirectangularReflectionMapping,
    Euler,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    SphereGeometry,
    SRGBColorSpace,
    TextureLoader,
    WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons';
import PickHelper from './scripts/countryPicker';
import CountryLayers from './scripts/CountryLayers';

class App {
    renderer: WebGLRenderer;
    scene: Scene;
    controls: OrbitControls;

    constructor() {

    }

    setup() {
        const scene = new Scene();
        const texLoad = new TextureLoader();
        texLoad.setPath("src/res/img/");
        const bgTex = texLoad.load("nightsky.jpg");
        bgTex.colorSpace = SRGBColorSpace;
        bgTex.mapping = EquirectangularReflectionMapping;
        scene.background = bgTex;
        scene.backgroundIntensity = 0.4;
        scene.backgroundRotation = new Euler(0, Math.PI, Math.PI/4);
    
        // lighting
        const ambient = new AmbientLight(new Color(1, 1, 1), 0.5);
        const sun = new DirectionalLight(new Color(1, 1, 1), 2);
        sun.position.set(-1,0,0);
        scene.add(ambient, sun);
    
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
    
        const renderer = new WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        const container = document.getElementById('container');
        container.appendChild(renderer.domElement);
    
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 2.5;
        controls.maxDistance = 5;
        
        // Globe setup
        const globeGeo = new SphereGeometry(2, 90, 90, -Math.PI/2);
        const globeTex = texLoad.load("world.png");
        const globeNight = texLoad.load("worldNight.jpg");
        const globeNormal = texLoad.load("worldNormal.png");
        const globeM = new MeshStandardMaterial({ map: globeTex, normalMap: globeNormal });
        const globe = new Mesh(globeGeo, globeM);
        scene.add(globe);
        
        // data
        const builder = new CountryLayers();
        globe.add(builder);
        
        const picker = new PickHelper(renderer.domElement, builder.hotspots, camera);
    
        function animate() {
            //globe.rotation.y += 0.001;
        
            controls.update();
        renderer.render( scene, camera );
        }
        
        renderer.setAnimationLoop( animate );
    }
}

const app = new App();
app.setup();