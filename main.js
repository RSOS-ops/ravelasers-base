// Import necessary Three.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { LaserSystem } from './LaserSystem.js'; // Import LaserSystem
import { PresetManager } from './PresetManager.js'; // Import PresetManager
import { CLI } from './CLI.js'; // Import CLI
import { LaserFactory } from './LaserFactory.js'; // Import LaserFactory

// Scene Setup
const scene = new THREE.Scene();

// HDRI Environment Setup
console.log("🌅 Loading HDRI environment...");
const exrLoader = new EXRLoader();
exrLoader.load(
    './assets/satara_night_2k.exr',
    (texture) => {
        // Set up as equirectangular environment map
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        // Use HDRI for environment lighting only (invisible background)
        scene.background = new THREE.Color(0x000000); // Keep black background
        scene.environment = texture; // But use HDRI for lighting and reflections
        
        // Store texture globally for CLI access
        window.hdriTexture = texture;
        
        console.log("✅ HDRI environment loaded successfully!");
        console.log("🎭 Scene uses HDRI for lighting (invisible background)");
        console.log("💡 Use CLI commands: hdri-on, hdri-off, exposure <value>");
    },
    (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        console.log(`📦 Loading HDRI: ${percent}%`);
    },
    (error) => {
        console.error("❌ Failed to load HDRI:", error);
        // Fallback to black background
        scene.background = new THREE.Color(0x000000);
        console.log("🔙 Using fallback black background");
    }
);

// Make scene globally accessible for CLI
window.scene = scene;

// Clock for animation timing
const clock = new THREE.Clock();

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer Setup - Enhanced for HDRI
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Enable soft shadows
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better HDR tone mapping
renderer.toneMappingExposure = 0.8; // Adjust exposure for HDRI
renderer.outputColorSpace = THREE.SRGBColorSpace; // Correct color space
document.body.appendChild(renderer.domElement);

// Make renderer globally accessible for CLI
window.renderer = renderer;

// Controls Setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enablePan = false; // Disable panning
controls.maxPolarAngle = Math.PI / 2; // Lock to horizontal orbit only
controls.minPolarAngle = Math.PI / 2; // Lock to horizontal orbit only
controls.enableRotate = true;

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

// Lighting Setup - Adjusted for HDRI environment
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Slight ambient boost
scene.add(ambientLight);

// Directional Light Setup - Reduced intensity since HDRI provides main lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // Reduced from 47 to 5
directionalLight.position.set(2, .5, 3); // Position light from camera perspective
directionalLight.castShadow = true; // Enable shadows
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.right = 5;
directionalLight.shadow.camera.top = 5;
directionalLight.shadow.camera.bottom = -5;
scene.add(directionalLight);
const directionalLightTarget = new THREE.Object3D();
directionalLightTarget.position.set(0, 0, 0); // Target the model center
scene.add(directionalLightTarget);
directionalLight.target = directionalLightTarget;

// Add lighting helpers
// Check saved helper state to avoid flash
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, .5);
const savedHelperState = getSavedHelperVisibility();
if (savedHelperState !== null) {
    // Use saved state if it exists
    directionalLightHelper.visible = savedHelperState;
} else {
    // Use default visibility (true for DirectionalLightHelper)
    directionalLightHelper.visible = true;
}
scene.add(directionalLightHelper);

// Spotlights (still managed in main.js as they are scene lighting, not laser effects)
const spotLightDown = new THREE.SpotLight(0xffffff, 5);
const spotLightFace = new THREE.SpotLight(0xffffff, 5);

// Create flasher spotlight objects
const flasher1 = new THREE.SpotLight(0xffffff, 3);
const flasher2 = new THREE.SpotLight(0xffffff, 3);
const flasher3 = new THREE.SpotLight(0xffffff, 3);
const flasher4 = new THREE.SpotLight(0xffffff, 3);

// Model Setup & Loading
let model; // This will hold the loaded GLTF scene

// NEW: LaserSystem, PresetManager, and LaserFactory instances
let laserSystem;
let presetManager;
let laserFactory;

// Helper visibility function to avoid flash on startup
function getSavedHelperVisibility() {
    try {
        const helpersState = localStorage.getItem('ravelasers_scene_default_helpers');
        return helpersState !== null ? helpersState === 'true' : null; // Return null if not set
    } catch (error) {
        console.warn('Failed to read helper state:', error);
        return null; // Return null on error
    }
}

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
    cameraZ = (cameraZ * 4) - 3; // Scale then offset (more explicit)
    camera.position.set(0, 0, cameraZ);
    controls.target.set(0, 0, 0);
    controls.update();
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
}

// Spotlight Configuration - Easy to adjust positions and settings
const spotlightConfig = {
    spotLightDown: {
        position: { x: 0, y: 2, z: 0 },
        target: { x: 0, y: 0, z: 0 },
        color: 0xffffff,
        intensity: 0,
        distance: 2,
        angle: Math.PI / 8 * .75,
        penumbra: 0.5,
        decay: 2,
        showHelper: true  // Enable helper
    },
    spotLightFace: {
        position: { x: 0, y: -1.2, z: 1.0 },
        target: { x: 0, y: 0, z: 0 },
        color: 0xffffff,
        intensity: 0,
        distance: 1.7,
        angle: Math.PI / 11.5 * 1.4,
        penumbra: 0.5,
        decay: 0.5,
        showHelper: true  // Enable helper
    },
    // New "Flashers" lighting system - 4 symmetrical spotlights (adjusted for HDRI)
    flasher1: {
        position: { x: 1.5, y: 1.5, z: 1.5 },    // Closer to model
        target: { x: 0, y: 0.25, z: 0 },
        color: 0xff0000,  // Red color to make it more visible
        intensity: 3,     // Reduced from 12 to 3 for HDRI
        distance: 2.75,      // Reduced distance
        angle: THREE.MathUtils.degToRad(7),  // 7 degrees
        penumbra: 0.3,
        decay: 1,
        showHelper: true  // Enable helper
    },
    flasher2: {
        position: { x: -1.5, y: 1.5, z: 1.5 },
        target: { x: 0, y: 0.25, z: 0 },
        color: 0x00ff00,  // Green color
        intensity: 3,    // Reduced from 12 to 3 for HDRI
        distance: 2.75,
        angle: THREE.MathUtils.degToRad(7),  // 7 degrees
        penumbra: 0.3,
        decay: 1,
        showHelper: true  // Enable helper
    },
    flasher3: {
        position: { x: 1.5, y: 1.5, z: -1.5 },
        target: { x: 0, y: -0.25, z: 0 },
        color: 0xffffff,  // White color
        intensity: 6,    // Reduced from 25 to 6 for HDRI
        distance: 2.75,
        angle: THREE.MathUtils.degToRad(8),  // 8 degrees
        penumbra: 0.3,
        decay: 1,
        showHelper: true  // Enable helper
    },
    flasher4: {
        position: { x: -1.5, y: 1.5, z: -1.5 },
        target: { x: 0, y: -0.25, z: 0 },
        color: 0xffffff,  // White color
        intensity: 6,    // Reduced from 25 to 6 for HDRI
        distance: 2.75,
        angle: THREE.MathUtils.degToRad(8),  // 8 degrees
        penumbra: 0.3,
        decay: 1,
        showHelper: true  // Enable helper
    }
};

function setupSpotlights() {
    // Setup existing spotlights (spotLightDown and spotLightFace)
    Object.keys(spotlightConfig).forEach(lightKey => {
        const config = spotlightConfig[lightKey];
        let spotlight;
        
        // Get the appropriate spotlight object
        if (lightKey === 'spotLightDown') {
            spotlight = spotLightDown;
        } else if (lightKey === 'spotLightFace') {
            spotlight = spotLightFace;
        } else if (lightKey === 'flasher1') {
            spotlight = flasher1;
        } else if (lightKey === 'flasher2') {
            spotlight = flasher2;
        } else if (lightKey === 'flasher3') {
            spotlight = flasher3;
        } else if (lightKey === 'flasher4') {
            spotlight = flasher4;
        }
        
        if (spotlight) {
            // Configure spotlight properties
            spotlight.color.setHex(config.color);
            spotlight.intensity = config.intensity;
            spotlight.distance = config.distance;
            spotlight.angle = config.angle;
            spotlight.penumbra = config.penumbra;
            spotlight.decay = config.decay;
            spotlight.position.set(config.position.x, config.position.y, config.position.z);
            
            // Enable shadow casting for all spotlights
            spotlight.castShadow = true;
            spotlight.shadow.mapSize.width = 1024;
            spotlight.shadow.mapSize.height = 1024;
            spotlight.shadow.camera.near = 0.5;
            spotlight.shadow.camera.far = config.distance + 1;
            spotlight.shadow.camera.fov = THREE.MathUtils.radToDeg(config.angle) * 2;
            
            // Create and set target
            const target = new THREE.Object3D();
            target.position.set(config.target.x, config.target.y, config.target.z);
            scene.add(target);
            spotlight.target = target;
            scene.add(spotlight);
            
            // Always create helper for all spotlights (but control visibility)
            const helper = new THREE.SpotLightHelper(spotlight);
            const savedHelperState = getSavedHelperVisibility();
            if (savedHelperState !== null) {
                // Use saved state if it exists
                helper.visible = savedHelperState;
            } else {
                // Use original config.showHelper setting as default
                helper.visible = config.showHelper;
            }
            scene.add(helper);
            console.log(`✅ Helper added for ${lightKey} at position (${config.position.x}, ${config.position.y}, ${config.position.z})`);
        }
    });
    
    console.log("🔦 All spotlights configured with shadow casting enabled.");
}

const gltfLoader = new GLTFLoader();
const modelUrl = './models/cube-beveled-silver.glb';

gltfLoader.load(
    modelUrl,
    async (gltf) => {
        model = gltf.scene;
        scene.add(model);

        adjustCameraForModel(); 
        model.scale.set(.5, .5, .5); 
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
        
        // Ensure model materials can receive lighting and cast/receive shadows
        model.traverse((child) => {
            if (child.isMesh) {
                // Ensure the material can receive lighting
                if (child.material) {
                    child.material.needsUpdate = true;
                    // Enable shadow casting and receiving
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // If material doesn't respond to lights, log it
                    if (child.material.type === 'MeshBasicMaterial') {
                        console.warn("Model has MeshBasicMaterial which doesn't respond to lights");
                    }
                }
            }
        });
        
        // Laser System Initialization
        laserSystem = new LaserSystem(scene, model, controls, camera);
        
        // Re-extract vertices after scaling and rotation
        laserSystem.extractModelVertices();
        
        // NEW: PresetManager and LaserFactory initialization
        presetManager = new PresetManager(laserSystem);
        laserFactory = new LaserFactory(presetManager);
        
        // Make presetManager and laserFactory globally accessible for console use
        window.presetManager = presetManager;
        window.laserSystem = laserSystem; // Also expose laserSystem for advanced use
        window.factory = laserFactory; // Short alias for easier console use
        window.laserFactory = laserFactory; // Full name also available
        
        // Connect CLI to presetManager and laserFactory
        cli.setPresetManager(presetManager);
        cli.setLaserFactory(laserFactory);
        
        console.log("✅ presetManager, laserSystem, and laserFactory are now available in console!");
        console.log("✅ CLI is ready! Use the interface on the left side of the screen.");
        console.log("✅ LaserFactory ready! Use 'factory' in console for dynamic testing.");
        console.log("Try: factory.quickTest('fast') or factory.showColors()");
        console.log("Or: presetManager.showSaved()");
        
        // PresetManager will auto-load saved default if one exists
        // No need to apply a hardcoded preset here
        console.log("main.js: Initialization complete. PresetManager will load saved default if available.");
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
