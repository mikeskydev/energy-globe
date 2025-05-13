import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer( { antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls(camera, renderer.domElement);

// Globe setup
const geometry = new THREE.SphereGeometry(2, 90, 90);
const material = new THREE.MeshPhongMaterial( { color: 0x0000ff,  } );
const globe = new THREE.Mesh( geometry, material );
scene.add( globe );

// lighting
const ambient = new THREE.AmbientLight("0xFFFFFF", 1);
const sun = new THREE.DirectionalLight("0xFFFFFF", 1);
sun.position.set(1,0,0);
scene.add(ambient, sun);


camera.position.z = 5;

function animate() {
    globe.rotation.x += 0.01;
    globe.rotation.y += 0.01;

    controls.update();
renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );
