import * as THREE from 'three';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';


let change = false;

const inGameScene = new THREE.Scene();
inGameScene.background = new THREE.Color(0xffffff)

const cubeGeometry = new THREE.BoxGeometry(100, 100, 100);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

// Add the cube to the scene
inGameScene.add(cube);

let scene = new THREE.Scene();
scene.background = new THREE.Color(0x393633)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.add(new THREE.AxesHelper(5))

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

camera.position.z = 40;
camera.position.y = 80;
camera.position.x = 40;

//Lights ///////////////////////////////////////

const light = new THREE.PointLight(0xffffff, 200)
light.position.set(0, 110, -30)
scene.add(light)

const light1 = new THREE.PointLight(0xffffff, 200)
light1.position.set(30, 110, -30)
scene.add(light1)

const light2 = new THREE.PointLight(0xffffff, 200)
light2.position.set(-30, 110, -30)
scene.add(light2)

const light3 = new THREE.PointLight(0xffffff, 200)
light3.position.set(-30, 110, -30)
scene.add(light3)

const light5 = new THREE.PointLight(0xffffff, 200)
light5.position.set(-30, 110, 0)
scene.add(light5)

const light6 = new THREE.PointLight(0xffffff, 200)
light6.position.set(-30, 110, 20)
scene.add(light6)

const light7 = new THREE.PointLight(0xffffff, 200)
light7.position.set(0, 110, 0)
scene.add(light7)


const lightOnGame = new THREE.DirectionalLight(0xFCF3DA, 0.8)
lightOnGame.position.set(38, 30, 10)
scene.add(lightOnGame)

// /////////////////////////////////////////

const fbxLoader = new FBXLoader()
const objloader = new OBJLoader()
const textureLoader = new THREE.TextureLoader();
const texture1 = textureLoader.load('models/office/texture/texture.png')


const material =
  new THREE.MeshPhongMaterial({map: texture1 });

console.log(material)

objloader.load(
  'models/office/newoffice.obj',
  (object) => {
    console.log(object)
    object.scale.multiplyScalar(0.25); 
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material = material
      }
    } )

      scene.add(object)
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
      console.log(error)
  }
)


let board;
fbxLoader.load(
  'models/connectFour/board.fbx',
  (object) => {
    console.log(object)
    object.scale.multiplyScalar(0.001); 
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
      }
  
    } )
      scene.add(object)
      object.position.y = 38
      object.position.x = 38
      object.position.z = 10
      board = object
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
      console.log(error)
  }
)
let arrow; 

fbxLoader.load(
  'models/arrow/arrow1.fbx',
  (object) => {
    console.log(object)
    object.scale.multiplyScalar(0.0003); 
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
      }
    } )
      scene.add(object)
      object.position.y = 55
      object.position.x = 38
      object.position.z = 6
      arrow = object;
      animate();
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
      console.log(error)
  }
)

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
orbitControls.dampingFactor = 0.25;
orbitControls.screenSpacePanning = false;
orbitControls.maxPolarAngle = Math.PI / 2;

const amplitude = 5;  // Adjust the amplitude based on the desired height of oscillation
const frequency = 1;  // Adjust the frequency based on how quickly you want it to move

////////////////////////////////////
let composer = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

let outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
composer.addPass( outlinePass );

const outputPass = new OutputPass();
composer.addPass( outputPass );

let effectFXAA = new ShaderPass( FXAAShader );
effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
composer.addPass( effectFXAA );

window.addEventListener( 'resize', onWindowResize );

renderer.domElement.style.touchAction = 'none';
renderer.domElement.addEventListener( 'pointermove', onPointerMove );
renderer.domElement.addEventListener( 'click', onClick );

let selectedObjects = [];

function onClick(event){
  raycaster.setFromCamera( mouse, camera );

  const intersects = raycaster.intersectObject( scene, true );

  if ( intersects.length > 0  && intersects[0].object.name == '4gewinnt') {
    change = true;
  }
}

function onPointerMove( event ) {

  if ( event.isPrimary === false ) return;

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  checkIntersection();
}

function addSelectedObject( object ) {

  selectedObjects = [];
  selectedObjects.push( object );

}

function checkIntersection() {

  raycaster.setFromCamera( mouse, camera );

  const intersects = raycaster.intersectObject( scene, true );

  if ( intersects.length > 0  && intersects[0].object.name == '4gewinnt') {
    const selectedObject = intersects[ 0 ].object;
    addSelectedObject( selectedObject );
    outlinePass.selectedObjects = selectedObjects;

  }else {

    outlinePass.selectedObjects = [];

  }

}

function onWindowResize() {

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );
  composer.setSize( width, height );

  effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );

}



/////////////////
// Render loop
function animate() {
  // if (change == true){
  //   scene = inGameScene
  //   console.log(scene)
  // }
  requestAnimationFrame(animate);
  orbitControls.update()
  if (arrow) {
    // Update arrow position based on sine function
    arrow.position.y = 55 + amplitude * Math.sin(frequency * performance.now() * 0.003);
  }
  renderer.render(scene, camera);
  composer.render();
}

animate();


