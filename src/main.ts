import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons'

const scene = new THREE.Scene();


const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer( { antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls(camera, renderer.domElement);

// Night sky
const bgGeo = new THREE.SphereGeometry(500, 60, 40);
bgGeo.scale(-1, 1, 1);
bgGeo.rotateZ(45 * Math.PI/180);
const texLoad = new THREE.TextureLoader();
const bgTex = texLoad.load("src/res/img/nightsky.jpg");
bgTex.colorSpace = THREE.SRGBColorSpace;

const bgMat = new THREE.MeshBasicMaterial( { map: bgTex })
const bg = new THREE.Mesh(bgGeo, bgMat);
scene.add(bg);

// Globe setup
const globeGeo = new THREE.SphereGeometry(2, 90, 90);
const globeTex = texLoad.load("src/res/img/world.png");
const globeM = new THREE.MeshStandardMaterial( { map: globeTex } );
const globe = new THREE.Mesh( globeGeo, globeM );
scene.add( globe );

// lighting
const ambient = new THREE.AmbientLight(new THREE.Color(1, 1, 1), 1);
const sun = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 2);
sun.position.set(-1,0,0);
scene.add(ambient, sun);


camera.position.z = 5;

function animate() {
    globe.rotation.y += 0.001;

    controls.update();
renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );
