import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons'
import { CountryLines } from './scripts/countries';
import PickHelper from './scripts/countryPicker';
import formatData from './scripts/dataFormatting';

const data = formatData();
const scene = new THREE.Scene();
const texLoad = new THREE.TextureLoader();
texLoad.setPath("src/res/img/");
const bgTex = texLoad.load("nightsky.jpg");
bgTex.colorSpace = THREE.SRGBColorSpace;
bgTex.mapping = THREE.EquirectangularReflectionMapping;
scene.background = bgTex;
scene.backgroundIntensity = 0.4;
scene.backgroundRotation = new THREE.Euler(0, Math.PI, Math.PI/4);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
//controls.minDistance = 2.5;
controls.maxDistance = 5;
const picker = new PickHelper(renderer.domElement, scene, camera);

// Globe setup
const globeGeo = new THREE.SphereGeometry(2, 90, 90, -Math.PI/2);
const globeTex = texLoad.load("world.png");
const globeNight = texLoad.load("worldNight.jpg");
const globeNormal = texLoad.load("worldNormal.png");
const globeM = new THREE.MeshStandardMaterial({ map: globeTex, normalMap: globeNormal });
const globe = new THREE.Mesh(globeGeo, globeM);
scene.add(globe);
globe.add(new CountryLines());

// lighting
const ambient = new THREE.AmbientLight(new THREE.Color(1, 1, 1), 1);
const sun = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 2);
sun.position.set(-1,0,0);
scene.add(ambient, sun);

console.log(scene);

camera.position.z = 5;

function animate() {
    //globe.rotation.y += 0.001;

    controls.update();
renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );
