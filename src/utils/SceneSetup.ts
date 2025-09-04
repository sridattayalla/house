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
      precision: 'highp'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x87CEEB, 1); // Sky blue background
    
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
    
    // Position camera rotated 180 degrees + 10 degrees to the right
    const angle = Math.PI - Math.PI / 18; // 180 degrees - 10 degrees
    const distance = 60;
    const x = 22 + Math.sin(angle) * distance;
    const z = Math.cos(angle) * distance;
    
    this.camera.position.set(x, 15, z); // Lifted camera up to y=15
    this.camera.lookAt(22, 35, 0); // Tilt up camera much more by looking at very high point
  }

  private initializeLights(): void {
    // Ambient light for overall illumination
    this.lights.ambient = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(this.lights.ambient);

    // Main directional light (sun)
    this.lights.directional = new THREE.DirectionalLight(0xffffff, 1.0);
    this.lights.directional.position.set(50, 50, 25);
    this.lights.directional.castShadow = true;
    
    // Shadow camera settings
    const directionalLight = this.lights.directional as THREE.DirectionalLight;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -75;
    directionalLight.shadow.camera.right = 75;
    directionalLight.shadow.camera.top = 75;
    directionalLight.shadow.camera.bottom = -75;
    
    this.scene.add(directionalLight);

    // Fill light from opposite side
    this.lights.fill = new THREE.DirectionalLight(0xffffff, 0.3);
    this.lights.fill.position.set(-30, 20, -30);
    this.scene.add(this.lights.fill);
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
