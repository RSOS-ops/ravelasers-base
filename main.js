// Import necessary Three.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LaserSystem } from './LaserSystem.js'; // Import LaserSystem
import { PresetManager } from './PresetManager.js'; // Import PresetManager

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Clock for animation timing
const clock = new THREE.Clock();

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls Setup
let controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Add controls lock state
let controlsLocked = false;

// Function to lock controls
function lockControls() {
    controlsLocked = true;
    controls.enabled = false;
    console.log("Controls locked");
}

// Function to unlock controls
function unlockControls() {
    controlsLocked = false;
    controls.enabled = true;
    console.log("Controls unlocked");
}

// Lock controls immediately
lockControls(); // tradición

// Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
const directionalLightTarget = new THREE.Object3D();
directionalLightTarget.position.set(0, 0, 0);
scene.add(directionalLightTarget);
directionalLight.target = directionalLightTarget;

// Spotlights (still managed in main.js as they are scene lighting, not laser effects)
const spotLightDown = new THREE.SpotLight(0xffffff, 50);
spotLightDown.distance = 1;
spotLightDown.angle = Math.PI / 8;
spotLightDown.penumbra = 0.5;
spotLightDown.decay = 2;

const spotLightFace = new THREE.SpotLight();
spotLightFace.color.set(0xffffff);
spotLightFace.intensity = 50;
spotLightFace.distance = 0.85;
spotLightFace.angle = Math.PI / 11.5;
spotLightFace.penumbra = 0.5;
spotLightFace.decay = 0.5;

// Model Setup & Loading
let model; // This will hold the loaded GLTF scene

// NEW: LaserSystem and PresetManager instances
let laserSystem;
let presetManager;

function adjustCameraForModel() {
    if (!model) return;
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center); // Reposition model to origin
    // scene.add(model); // Model is added in GLTFLoader callback

    if (size.x === 0 && size.y === 0 && size.z === 0) return; // Avoid issues with empty models

    const modelHeight = size.y;
    const fovInRadians = THREE.MathUtils.degToRad(camera.fov);
    let cameraZ = (modelHeight / 2) / Math.tan(fovInRadians / 2);
    cameraZ *= 4; // Adjusted distance
    camera.position.set(0, 0, cameraZ);
    controls.target.set(0, 0, 0);
    controls.update();
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
}

const gltfLoader = new GLTFLoader();
const modelUrl = 'HoodedCory_PlanarFace_BigWireframe.glb';

gltfLoader.load(
    modelUrl,
    async (gltf) => { // Made this callback async to use await for preset loading
        model = gltf.scene;
        scene.add(model); // Add model to the scene here

        // ---MODIFIED ORDER---
        // 1. Adjust camera to the original model size first.
        adjustCameraForModel(); 

        // 2. Then scale the model. Camera position is now fixed.
        model.scale.set(2, 2, 2); 
        // ---END MODIFIED ORDER---

        // --- SPOTLIGHT MODIFICATIONS ---
        // Adjust spotLightDown
        spotLightDown.distance *= 2;    // Double the distance
        spotLightDown.angle *= 1.4;     // Increase angle by 40%
        spotLightDown.intensity *= 2; // Double the intensity

        // Adjust spotLightFace
        spotLightFace.distance *= 2;    // Double the distance
        spotLightFace.angle *= 1.4;     // Increase angle by 40%
        spotLightFace.intensity *= 2; // Double the intensity
        // --- END SPOTLIGHT MODIFICATIONS ---

        // Attach spotlights to the model
        // These are added to the scaled model, their local positions are relative.
        const spotLightDownTargetObject = new THREE.Object3D();
        model.add(spotLightDownTargetObject); 
        spotLightDownTargetObject.position.set(0, 0, 0);
        spotLightDown.target = spotLightDownTargetObject;
        model.add(spotLightDown);

        const spotLightFaceTargetObject = new THREE.Object3D();
        model.add(spotLightFaceTargetObject); 
        spotLightFaceTargetObject.position.set(0, 0.4, 0.0); 
        spotLightFace.target = spotLightFaceTargetObject;
        model.add(spotLightFace);
        spotLightFace.position.set(0, -0.6, 0.5);
        
        // Laser System Initialization...
        // ... (rest of the callback remains the same for now)
        laserSystem = new LaserSystem(scene, model, controls, camera); // model is now scaled
        presetManager = new PresetManager(laserSystem);        try {
            await presetManager.loadLibrary('laser-presets.json'); 
            
            if (presetManager.getPresetNames().includes('behavior.1')) {
                presetManager.applyPreset('behavior.1');
                console.log("main.js: Applied 'behavior.1' preset.");
            } else if (presetManager.getPresetNames().length > 0) {
                const firstPreset = presetManager.getPresetNames()[0];
                console.warn(`main.js: 'behavior.1' preset not found. Applying first available preset: '${firstPreset}'.`);
                presetManager.applyPreset(firstPreset);
            } else {
                console.warn("main.js: No presets loaded. Laser system will use default values from LaserSystem constructor.");
            }
        } catch (error) {
            console.error("main.js: Error during preset loading or applying:", error);
        }
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error occurred loading the GLB model:', error);
    }
);

// Animation Loop
function animate() {
    const deltaTime = clock.getDelta();
    requestAnimationFrame(animate);

    if (controls.enableDamping && !controlsLocked) {
        controls.update();
    }

    // NEW: Update LaserSystem if it exists
    if (laserSystem) {
        laserSystem.update(deltaTime, clock);
    }

    renderer.render(scene, camera);
}
animate();

// Event Listeners
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    // No need to call adjustCameraForModel directly on resize if model is static
    // camera.updateProjectionMatrix() is usually sufficient.
    // If model can change or dynamic adjustments are needed, then call adjustCameraForModel.
    camera.updateProjectionMatrix();
    // if (model) { // If model might need readjustment based on new aspect ratio
    //     adjustCameraForModel();
    // }
});
