import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class SceneSetup {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private lights: { [key: string]: THREE.Light };

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null!;
    this.renderer = null!;
    this.lights = {};
    
    this.initializeRenderer();
    this.initializeCamera();
    this.initializeLights();
    this.setupEnvironment();
  }

  private initializeRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      precision: 'highp',
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x87CEEB, 1); // Sky blue background
    
    // Enhanced renderer settings for better material display
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2; // Slightly brighter exposure
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.physicallyCorrectLights = true; // More realistic lighting
    this.renderer.shadowMap.autoUpdate = true;
    
    // Enable HDR rendering for better material representation
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const container = document.getElementById('canvas-container');
    if (container) {
      container.appendChild(this.renderer.domElement);
    }
  }

  private initializeCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    
    // Position camera rotated 10 degrees to the right
    const angle = -Math.PI / 18; // -10 degrees (right turn)
    const distance = 100;
    const x = 22 + Math.sin(angle) * distance;
    const z = Math.cos(angle) * distance;
    
    this.camera.position.set(15, 7.7, 15);
    this.camera.lookAt(15, 7.7, 50); // Look forward (positive Z direction)
  }

  private initializeLights(): void {
    // Brighter ambient light for better texture visibility
    this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.6); // Increased from 0.4, changed to white
    this.scene.add(this.lights.ambient);

    // Main directional light (sun) - positioned for natural daylight
    this.lights.directional = new THREE.DirectionalLight(0xffffff, 0.8); // Reduced intensity
    this.lights.directional.position.set(100, 80, 50); // Higher position for better coverage
    this.lights.directional.castShadow = true;
    
    // Shadow camera settings
    const directionalLight = this.lights.directional as THREE.DirectionalLight;
    directionalLight.shadow.mapSize.width = 4096; // Higher resolution shadows
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 300; // Increased range
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.bias = -0.0001; // Reduce shadow acne
    
    this.scene.add(directionalLight);

    // Warmer fill light from opposite side
    this.lights.fill = new THREE.DirectionalLight(0xffd7a6, 0.4); // Warm orange fill light
    this.lights.fill.position.set(-50, 40, -50);
    this.scene.add(this.lights.fill);

    // Additional lights for better texture illumination
    
    // Ground bounce light (simulates light reflecting off ground)
    this.lights.ground = new THREE.DirectionalLight(0xffe4b5, 0.2); // Warm ground reflection
    this.lights.ground.position.set(0, -20, 0);
    this.scene.add(this.lights.ground);
    
    // Sky light (top-down soft illumination)
    this.lights.sky = new THREE.HemisphereLight(0x87CEEB, 0xffffff, 0.3); // Sky to ground gradient
    this.scene.add(this.lights.sky);
  }

  private setupEnvironment(): void {
    // Load HDR environment map
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('./textures/sunny_country_road_4k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
//       this.scene.background = texture;
      this.scene.environment = texture;
    });
    
    // Add subtle fog for atmosphere
    this.scene.fog = new THREE.Fog(0x87CEEB, 200, 300);
  }  

  addToScene(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
}
