// Import necessary Three.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LaserSystem } from './LaserSystem.js'; // Import LaserSystem
import { PresetManager } from './PresetManager.js'; // Import PresetManager
import { CLI } from './CLI.js'; // Import CLI

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

// CLI Setup
const cli = new CLI();

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
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

// Directional Light Setup
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(2, .5, 3); // Position light from camera perspective
directionalLight.castShadow = false; // Disable shadows for better performance
scene.add(directionalLight);
const directionalLightTarget = new THREE.Object3D();
directionalLightTarget.position.set(0, 0, 0); // Target the model center
scene.add(directionalLightTarget);
directionalLight.target = directionalLightTarget;

// Add lighting helpers
//const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, .5);
//scene.add(directionalLightHelper);

// Spotlights (still managed in main.js as they are scene lighting, not laser effects)
const spotLightDown = new THREE.SpotLight(0xffffff, 2);
spotLightDown.distance = 1;
spotLightDown.angle = Math.PI / 8;
spotLightDown.penumbra = 0.5;
spotLightDown.decay = 2;

const spotLightFace = new THREE.SpotLight();
spotLightFace.color.set(0xffffff);
spotLightFace.intensity = 0;
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

// Spotlight Configuration - Easy to adjust positions and settings
const spotlightConfig = {
    spotLightDown: {
        position: { x: 0, y: 2, z: 0 },        // Light position
        target: { x: 0, y: 0, z: 0 },          // Target center of model
        color: 0xffffff,
        intensity: 5,                           // 2 * 2 (original * multiplier)
        distance: 2,                            // 1 * 2 (original * multiplier)
        angle: Math.PI / 8 * .75,              // Original angle * 1.4
        penumbra: 0.5,
        decay: 2,
        showHelper: false
    },
    spotLightFace: {
        position: { x: 0, y: -1.2, z: 1.0 },   // Light position
        target: { x: 0, y: 0, z: 0 },          // Target center of model
        color: 0xffffff,
        intensity: 0,                           // 0 * 2 (original * multiplier)
        distance: 1.7,                          // 0.85 * 2 (original * multiplier)
        angle: Math.PI / 11.5 * 1.4,           // Original angle * 1.4
        penumbra: 0.5,
        decay: 0.5,
        showHelper: false
    }
};

function setupSpotlights() {
    // Setup spotLightDown
    const downConfig = spotlightConfig.spotLightDown;
    spotLightDown.color.setHex(downConfig.color);
    spotLightDown.intensity = downConfig.intensity;
    spotLightDown.distance = downConfig.distance;
    spotLightDown.angle = downConfig.angle;
    spotLightDown.penumbra = downConfig.penumbra;
    spotLightDown.decay = downConfig.decay;
    spotLightDown.position.set(downConfig.position.x, downConfig.position.y, downConfig.position.z);
    
    const spotLightDownTarget = new THREE.Object3D();
    spotLightDownTarget.position.set(downConfig.target.x, downConfig.target.y, downConfig.target.z);
    scene.add(spotLightDownTarget);
    spotLightDown.target = spotLightDownTarget;
    scene.add(spotLightDown);
    
    if (downConfig.showHelper) {
        const spotLightDownHelper = new THREE.SpotLightHelper(spotLightDown);
        scene.add(spotLightDownHelper);
    }
    
    // Setup spotLightFace
    const faceConfig = spotlightConfig.spotLightFace;
    spotLightFace.color.setHex(faceConfig.color);
    spotLightFace.intensity = faceConfig.intensity;
    spotLightFace.distance = faceConfig.distance;
    spotLightFace.angle = faceConfig.angle;
    spotLightFace.penumbra = faceConfig.penumbra;
    spotLightFace.decay = faceConfig.decay;
    spotLightFace.position.set(faceConfig.position.x, faceConfig.position.y, faceConfig.position.z);
    
    const spotLightFaceTarget = new THREE.Object3D();
    spotLightFaceTarget.position.set(faceConfig.target.x, faceConfig.target.y, faceConfig.target.z);
    scene.add(spotLightFaceTarget);
    spotLightFace.target = spotLightFaceTarget;
    scene.add(spotLightFace);
    
    if (faceConfig.showHelper) {
        const spotLightFaceHelper = new THREE.SpotLightHelper(spotLightFace);
        scene.add(spotLightFaceHelper);
    }
    
    console.log("Spotlights configured and added to scene");
}

const gltfLoader = new GLTFLoader();
const modelUrl = './models/CoryHead_Planar.glb';

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
        
        // Rotate the model 48 degrees on the y-axis
        model.rotation.y = THREE.MathUtils.degToRad(48);
        
        // Target directional light at the model center
        directionalLightTarget.position.set(0, 0, 0);
        directionalLight.target = directionalLightTarget;
        directionalLight.target.updateMatrixWorld(); // Force update
        
        // Unlock controls now that model is positioned
        unlockControls();
        // ---END MODIFIED ORDER---

        // --- SPOTLIGHT SETUP ---
        setupSpotlights();
        // --- END SPOTLIGHT SETUP ---
        
        // Debug: Log directional light info
        console.log("Directional light position:", directionalLight.position);
        console.log("Directional light target position:", directionalLight.target.position);
        console.log("Directional light intensity:", directionalLight.intensity);
        
        // Ensure model materials can receive lighting
        model.traverse((child) => {
            if (child.isMesh) {
                // Ensure the material can receive lighting
                if (child.material) {
                    child.material.needsUpdate = true;
                    // If material doesn't respond to lights, log it
                    if (child.material.type === 'MeshBasicMaterial') {
                        console.warn("Model has MeshBasicMaterial which doesn't respond to lights");
                    }
                }
            }
        });
        
        // Laser System Initialization
        laserSystem = new LaserSystem(scene, model, controls, camera); // model is now scaled
        presetManager = new PresetManager(laserSystem);
        
        // Make presetManager globally accessible for console use
        window.presetManager = presetManager;
        window.laserSystem = laserSystem; // Also expose laserSystem for advanced use
        
        // Connect CLI to presetManager
        cli.setPresetManager(presetManager);
        
        console.log("✅ presetManager and laserSystem are now available in console!");
        console.log("✅ CLI is ready! Use the interface on the left side of the screen.");
        console.log("Try: presetManager.showSaved()");
        
        // Apply default bank
        try {
            presetManager.applyPreset('rave_mode'); // Applies bank1 + bank2
            console.log("main.js: Applied 'rave_mode' preset.");
        } catch (error) {
            console.error("main.js: Error applying preset:", error);
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

    // Rotate model continuously: 360 degrees (2π radians) every 45 seconds
    if (model) {
        const rotationSpeed = (Math.PI * 2) / 70; // radians per second
        model.rotation.y += rotationSpeed * deltaTime;
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
