import * as THREE from 'three';
import { CSG } from 'three-csg-ts';

// Texture cache to avoid loading the same texture multiple times
const textureCache = new Map<string, THREE.Texture>();
const materialCache = new Map<string, THREE.Material>();
const textureLoader = new THREE.TextureLoader();

function loadExternalTexture(texturePath: string, repeat: [number, number] = [1, 1], isColorTexture: boolean = true): THREE.Texture {
  if (textureCache.has(texturePath)) {
    return textureCache.get(texturePath)!;
  }
  
  const texture = textureLoader.load(
    texturePath,
    // onLoad
    (texture) => {
      console.log('Texture loaded successfully:', texturePath);
      
      if (isColorTexture) {
        texture.colorSpace = THREE.SRGBColorSpace;
      } else {
        texture.colorSpace = THREE.LinearSRGBColorSpace;
      }
      
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(repeat[0], repeat[1]);
      texture.flipY = false;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
    },
    // onProgress
    (progress) => {
      if (progress.lengthComputable) {
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`Loading ${texturePath}: ${percentComplete.toFixed(2)}%`);
      }
    },
    // onError
    (error) => {
      console.error('Failed to load texture:', texturePath, error);
    }
  );
  
  // Set initial properties
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.flipY = false;
  
  if (isColorTexture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  } else {
    texture.colorSpace = THREE.LinearSRGBColorSpace;
  }
  
  textureCache.set(texturePath, texture);
  return texture;
}

function getTextureMaterial(texture: string): THREE.Material {
  if (materialCache.has(texture)) {
    return materialCache.get(texture)!;
  }

  let material: THREE.Material;

  // Check if it's an external texture path
  if (texture.startsWith('./textures/') || texture.startsWith('/textures/') || texture.includes('.jpg') || texture.includes('.png')) {
    try {
      const diffuseTexture = loadExternalTexture(texture, [2, 2]);
      material = new THREE.MeshLambertMaterial({ map: diffuseTexture });
    } catch (error) {
      console.warn('Failed to load external texture:', texture, 'falling back to color');
      material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    }
  } else {
    const colorMap: { [key: string]: number } = {
      'wood': 0x8B4513,
      'metal': 0xC0C0C0,
      'stone': 0x696969,
      'brick': 0xB22222,
      'glass': 0x87CEEB,
      'white painted wall': 0xFFFFFF,
      'white iron': 0xE8E8E8,
      'black iron': 0x2C2C2C,
      'grass': 0x228B22,
      'pavement': 0x708090,
      'grass pavement': 0x556B2F,
      'concrete': 0xD0D0D0,
      'brownish red clay tiles': 0xA0522D
    };

    const color = colorMap[texture] || 0x00ff00;

    // Special materials
    if (texture === 'white painted wall') {
      material = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        roughness: 0.8,
        metalness: 0.0 
      });
    } else if (texture === 'black iron') {
      material = new THREE.MeshStandardMaterial({
        color: 0x1A1A1A,
        roughness: 0.4,
        metalness: 0.8,
        envMapIntensity: 0.6,
      });
    } else if (texture === 'glass') {
      material = new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        opacity: 0.3,
        transparent: true,
        roughness: 0.1,
        metalness: 0.0,
        envMapIntensity: 1.0,
      });
    } else if (texture === 'concrete') {
      material = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.8,
        metalness: 0.0,
        envMapIntensity: 0.2,
      });
    } else if (texture === 'ground clay') {
      // Load ground clay textures
      const diffuseMap = textureLoader.load('textures/brownmud/brown_mud_leaves_01_diff_4k.jpg', 
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(2, 2);
          texture.flipY = false;
        }
      );

      material = new THREE.MeshStandardMaterial({
        map: diffuseMap,
        roughness: 0.8,
        metalness: 0.1,
        envMapIntensity: 0.3,
      });
    } else {
      material = new THREE.MeshStandardMaterial({ color });
    }
  }

  materialCache.set(texture, material);
  return material;
}

export class BoxElement extends THREE.Group {
  public length: number;
  public width: number;
  public height: number;
  public texture: string;
  private mesh: THREE.Mesh;

  constructor(length: number, width: number, height: number, texture: string) {
    super();
    
    this.length = length;
    this.width = width;
    this.height = height;
    this.texture = texture;

    // Create the box geometry and mesh
    const geometry = new THREE.BoxGeometry(length, width, height);
    geometry.translate(length / 2, width / 2, height / 2);
    
    const material = getTextureMaterial(texture);
    this.mesh = new THREE.Mesh(geometry, material);
    
    this.add(this.mesh);
  }

  // Add a child element with relative positioning
  addChild(child: BoxElement, offsetX: number = 0, offsetY: number = 0, offsetZ: number = 0): BoxElement {
    child.position.set(offsetX, offsetY, offsetZ);
    this.add(child);
    return child;
  }

  // Position this element relative to a parent
  positionRelativeTo(parent: BoxElement, offsetX: number, offsetY: number, offsetZ: number): BoxElement {
    parent.addChild(this, offsetX, offsetY, offsetZ);
    return this;
  }

  // Create a real hole in this box using CSG operations
  makeHole(x: number, y: number, z: number, length: number, width: number, depth: number): BoxElement {
    try {
      // Create hole geometry positioned correctly
      const holeGeometry = new THREE.BoxGeometry(length, width, depth);

      // Create a temporary mesh for the hole positioned correctly
      const holeMesh = new THREE.Mesh(holeGeometry);
      holeMesh.position.set(
        x + length / 2,
        y + width / 2,
        z + depth / 2
      );

      // Update the hole mesh matrix
      holeMesh.updateMatrix();

      // Convert meshes to CSG
      const wallCSG = CSG.fromMesh(this.mesh);
      const holeCSG = CSG.fromMesh(holeMesh);

      // Subtract hole from wall
      const resultCSG = wallCSG.subtract(holeCSG);

      // Convert back to mesh
      const resultMesh = CSG.toMesh(resultCSG, this.mesh.matrix);

      // Replace the current mesh geometry and material
      this.mesh.geometry.dispose(); // Clean up old geometry
      this.mesh.geometry = resultMesh.geometry;

      // Update matrix to ensure proper positioning
      this.mesh.updateMatrix();

    } catch (error) {
      console.warn('CSG operation failed, falling back to visual hole indicator:', error);

      // Fallback to visual indicator if CSG fails
      const holeGeometry = new THREE.BoxGeometry(length, width, depth);
      const holeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.8
      });

      const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial);
      holeMesh.position.set(
        x + length / 2,
        y + width / 2,
        z + depth / 2
      );

      this.add(holeMesh);
    }

    return this;
  }

  // Create a semi-circular hole in this box using CSG operations
  makeSemiCircularHole(x: number, y: number, z: number, radius: number, depth: number, plane: 'xy' | 'xz' | 'yz'): BoxElement {
    try {
      // Create semi-circular hole geometry using a combination of shapes
      let holeGeometry: THREE.BufferGeometry;

      // Create a solid semicircle by combining a cylinder with a box to cut the bottom half
      const fullCylinder = new THREE.CylinderGeometry(radius, radius, depth, 32);
      const cutBox = new THREE.BoxGeometry(radius * 2, radius, depth * 1.1);

      if (plane === 'xy') {
        // Semi-circle in XY plane (vertical arch)
        // Rotate cylinder to be vertical in XY plane
        fullCylinder.rotateZ(Math.PI / 2);
        // Position cut box to remove bottom half
        cutBox.translate(0, -radius / 2, 0);

        // Create meshes for CSG
        const cylinderMesh = new THREE.Mesh(fullCylinder);
        const cutMesh = new THREE.Mesh(cutBox);

        // Subtract bottom half from cylinder to create semicircle
        const cylinderCSG = CSG.fromMesh(cylinderMesh);
        const cutCSG = CSG.fromMesh(cutMesh);
        const semicircleCSG = cylinderCSG.subtract(cutCSG);

        const semicircleMesh = CSG.toMesh(semicircleCSG, cylinderMesh.matrix);
        holeGeometry = semicircleMesh.geometry;

      } else if (plane === 'xz') {
        // Semi-circle in XZ plane
        fullCylinder.rotateX(Math.PI / 2);
        cutBox.translate(0, 0, -radius / 2);

        const cylinderMesh = new THREE.Mesh(fullCylinder);
        const cutMesh = new THREE.Mesh(cutBox);

        const cylinderCSG = CSG.fromMesh(cylinderMesh);
        const cutCSG = CSG.fromMesh(cutMesh);
        const semicircleCSG = cylinderCSG.subtract(cutCSG);

        const semicircleMesh = CSG.toMesh(semicircleCSG, cylinderMesh.matrix);
        holeGeometry = semicircleMesh.geometry;

      } else if (plane === 'yz') {
        // Semi-circle in YZ plane
        cutBox.translate(0, -radius / 2, 0);

        const cylinderMesh = new THREE.Mesh(fullCylinder);
        const cutMesh = new THREE.Mesh(cutBox);

        const cylinderCSG = CSG.fromMesh(cylinderMesh);
        const cutCSG = CSG.fromMesh(cutMesh);
        const semicircleCSG = cylinderCSG.subtract(cutCSG);

        const semicircleMesh = CSG.toMesh(semicircleCSG, cylinderMesh.matrix);
        holeGeometry = semicircleMesh.geometry;

      } else {
        throw new Error(`Invalid plane "${plane}". Must be 'xy', 'xz', or 'yz'.`);
      }

      // Create a temporary mesh for the hole positioned correctly
      const holeMesh = new THREE.Mesh(holeGeometry);
      holeMesh.position.set(x, y, z);

      // Update the hole mesh matrix
      holeMesh.updateMatrix();

      // Convert meshes to CSG
      const wallCSG = CSG.fromMesh(this.mesh);
      const holeCSG = CSG.fromMesh(holeMesh);

      // Subtract hole from wall
      const resultCSG = wallCSG.subtract(holeCSG);

      // Convert back to mesh
      const resultMesh = CSG.toMesh(resultCSG, this.mesh.matrix);

      // Replace the current mesh geometry and material
      this.mesh.geometry.dispose(); // Clean up old geometry
      this.mesh.geometry = resultMesh.geometry;

      // Update matrix to ensure proper positioning
      this.mesh.updateMatrix();

    } catch (error) {
      console.warn('CSG operation failed for semi-circular hole, falling back to visual indicator:', error);

      // Fallback to visual indicator if CSG fails - create a simple semicircle
      const shape = new THREE.Shape();
      shape.absarc(0, 0, radius, 0, Math.PI, false);
      shape.lineTo(-radius, 0);
      shape.lineTo(radius, 0);

      const extrudeSettings = { depth: depth, bevelEnabled: false };
      let fallbackGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      if (plane === 'xy') {
        fallbackGeometry.rotateZ(Math.PI / 2);
        fallbackGeometry.rotateY(Math.PI / 2);
      } else if (plane === 'xz') {
        fallbackGeometry.rotateX(Math.PI / 2);
      } else if (plane === 'yz') {
        fallbackGeometry.rotateY(Math.PI / 2);
      }

      const holeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.8
      });

      const holeMesh = new THREE.Mesh(fallbackGeometry, holeMaterial);
      holeMesh.position.set(x, y, z);

      this.add(holeMesh);
    }

    return this;
  }

  // Add glass to a hole
  addGlass(x: number, y: number, z: number, length: number, width: number, depth: number): BoxElement {
    const glassGeometry = new THREE.BoxGeometry(length, width, 0.05);
    const glassMaterial = getTextureMaterial('glass');
    
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.position.set(
      x + length / 2,
      y + width / 2,
      z + depth / 2
    );
    
    this.add(glassMesh);
    return this;
  }

  // Set rotation
  setRotation(x: number, y: number, z: number): BoxElement {
    this.rotation.set(x, y, z);
    return this;
  }

  // Rotate around X axis
  rotateX(angle: number): BoxElement {
    this.rotation.x += angle;
    return this;
  }

  // Rotate around Y axis
  rotateY(angle: number): BoxElement {
    this.rotation.y += angle;
    return this;
  }

  // Rotate around Z axis
  rotateZ(angle: number): BoxElement {
    this.rotation.z += angle;
    return this;
  }

  // Get bounding box
  getBoundingBox(): THREE.Box3 {
    const box = new THREE.Box3();
    box.setFromObject(this);
    return box;
  }

  // Get total volume (including children)
  getTotalVolume(): number {
    let volume = this.length * this.width * this.height;
    
    this.children.forEach(child => {
      if (child instanceof BoxElement) {
        volume += child.getTotalVolume();
      }
    });
    
    return volume;
  }

  // Clone this element
  clone(recursive: boolean = true): BoxElement {
    const cloned = new BoxElement(this.length, this.width, this.height, this.texture);
    cloned.position.copy(this.position);
    cloned.rotation.copy(this.rotation);
    cloned.scale.copy(this.scale);
    
    if (recursive) {
      this.children.forEach(child => {
        if (child instanceof BoxElement) {
          cloned.add(child.clone(true));
        }
      });
    }
    
    return cloned;
  }
}

// Convenience functions
export function createBox(length: number, width: number, height: number, texture: string): BoxElement {
  return new BoxElement(length, width, height, texture);
}

export function createWall(length: number, height: number, thickness: number = 1, texture: string = 'white painted wall'): BoxElement {
  return new BoxElement(length, thickness, height, texture);
}

export function createFloor(length: number, width: number, thickness: number = 0.5, texture: string = 'concrete'): BoxElement {
  return new BoxElement(length, width, thickness, texture);
}

export function createWindow(width: number, height: number, depth: number = 0.2): BoxElement {
  const frame = new BoxElement(width, depth, height, 'white painted wall');
  
  // Create window frame with hole
  frame.makeHole(0.1, 0, 0.1, width - 0.2, depth, height - 0.2);
  frame.addGlass(0.1, 0, 0.1, width - 0.2, depth, height - 0.2);
  
  return frame;
}

export function createDoor(width: number, height: number, depth: number = 0.2): BoxElement {
  const frame = new BoxElement(width, depth, height, 'wood');
  
  // Create door frame with hole
  frame.makeHole(0.1, 0, 0, width - 0.2, depth, height - 0.1);
  
  // Add door panel
  const doorPanel = new BoxElement(0.05, depth, height - 0.2, 'wood');
  frame.addChild(doorPanel, 0.1, 0, 0.1);
  
  return frame;
}

// House building helpers
export function createRoom(length: number, width: number, height: number, wallThickness: number = 1): BoxElement {
  const room = new BoxElement(0.1, 0.1, 0.1, 'transparent'); // Invisible container
  
  // Create walls
  const frontWall = createWall(length, height, wallThickness);
  const backWall = createWall(length, height, wallThickness);
  const leftWall = createWall(wallThickness, height, width);
  const rightWall = createWall(wallThickness, height, width);
  
  // Position walls
  room.addChild(frontWall, 0, 0, 0);
  room.addChild(backWall, 0, width - wallThickness, 0);
  room.addChild(leftWall, 0, 0, 0);
  room.addChild(rightWall, length - wallThickness, 0, 0);
  
  return room;
}

export { getTextureMaterial };
