import * as THREE from 'three';

interface Hole {
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  depth: number;
}

interface CubeRenderData {
  type: 'cube';
  dimensions: [number, number, number];
  position: [number, number, number];
  texture: string;
  vertices: number[][];
  faces: number[][];
  holes: Hole[];
  children: CubeRenderData[];
}

export class Cube {
  public length: number;
  public width: number;
  public height: number;
  public texture: string;
  public x: number;
  public y: number;
  public z: number;
  public rotationX: number;
  public rotationY: number;
  public rotationZ: number;
  public children: Cube[];
  public holes: Hole[];
  public parent: Cube | null;
  public relativePosition: { x: number; y: number; z: number };
  public positionedChildren: Cube[];

  constructor(length: number, width: number, height: number, texture: string, x: number = 0, y: number = 0, z: number = 0) {
    this.length = length;
    this.width = width;
    this.height = height;
    this.texture = texture;
    this.x = x;
    this.y = y;
    this.z = z;
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.children = [];
    this.holes = [];
    this.parent = null;
    this.relativePosition = { x: 0, y: 0, z: 0 };
    this.positionedChildren = [];
  }

  positionAt(referenceCube: Cube, offsetLength: number, offsetWidth: number, offsetHeight: number): Cube {
    // Remove from previous parent if exists
    if (this.parent) {
      const index = this.parent.positionedChildren.indexOf(this);
      if (index > -1) {
        this.parent.positionedChildren.splice(index, 1);
      }
    }
    
    // Set new parent relationship
    this.parent = referenceCube;
    this.relativePosition = { x: offsetLength, y: offsetWidth, z: offsetHeight };
    referenceCube.positionedChildren.push(this);
    
    // Calculate and update position
    this.updatePosition();
    return this;
  }

  positionAtStart(referenceCube: Cube, offsetLength: number, offsetWidth: number, offsetHeight: number): Cube {
    return this.positionAt(referenceCube, offsetLength, offsetWidth, offsetHeight);
  }

  positionAtRelative(referenceCube: Cube, lengthMultiplier: number, widthMultiplier: number, heightMultiplier: number): Cube {
    const offsetLength = lengthMultiplier * referenceCube.length;
    const offsetWidth = widthMultiplier * referenceCube.width;
    const offsetHeight = heightMultiplier * referenceCube.height;
    return this.positionAt(referenceCube, offsetLength, offsetWidth, offsetHeight);
  }

  setRotation(rotationX: number, rotationY: number, rotationZ: number): Cube {
    this.rotationX = rotationX;
    this.rotationY = rotationY;
    this.rotationZ = rotationZ;
    return this;
  }

  rotateX(angle: number): Cube {
    this.rotationX += angle;
    return this;
  }

  rotateY(angle: number): Cube {
    this.rotationY += angle;
    return this;
  }

  rotateZ(angle: number): Cube {
    this.rotationZ += angle;
    return this;
  }

  updatePosition(): void {
    if (this.parent) {
      this.x = this.parent.x + this.relativePosition.x;
      this.y = this.parent.y + this.relativePosition.y;
      this.z = this.parent.z + this.relativePosition.z;
    }
    
    // Recursively update all positioned children
    for (const child of this.positionedChildren) {
      child.updatePosition();
    }
  }

  setPosition(x: number, y: number, z: number): Cube {
    this.x = x;
    this.y = y;
    this.z = z;
    
    // Update all positioned children when this cube moves
    for (const child of this.positionedChildren) {
      child.updatePosition();
    }
    
    return this;
  }

  makeHole(atX: number, atY: number, length: number, width: number, depth: number): Hole {
    if (atX < 0 || atY < 0 || atX + length > this.length || atY + width > this.width) {
      throw new Error("Hole dimensions exceed cube boundaries");
    }
    
    if (depth > this.height) {
      throw new Error("Hole depth exceeds cube height");
    }

    const hole: Hole = {
      x: atX,
      y: atY,
      z: 0,
      length: length,
      width: width,
      depth: depth
    };

    this.holes.push(hole);
    
    return hole;
  }

  addChild(cube: Cube): Cube {
    this.children.push(cube);
    return this;
  }

  getVertices(): number[][] {
    const vertices: number[][] = [];
    
    const baseVertices: number[][] = [
      [this.x, this.y, this.z],
      [this.x + this.length, this.y, this.z],
      [this.x + this.length, this.y + this.width, this.z],
      [this.x, this.y + this.width, this.z],
      [this.x, this.y, this.z + this.height],
      [this.x + this.length, this.y, this.z + this.height],
      [this.x + this.length, this.y + this.width, this.z + this.height],
      [this.x, this.y + this.width, this.z + this.height]
    ];

    vertices.push(...baseVertices);

    for (const child of this.children) {
      vertices.push(...child.getVertices());
    }

    return vertices;
  }

  getFaces(): number[][] {
    const faces: number[][] = [];
    
    if (this.holes.length === 0) {
      faces.push(
        [0, 1, 2, 3],
        [4, 7, 6, 5],
        [0, 4, 5, 1],
        [2, 6, 7, 3],
        [0, 3, 7, 4],
        [1, 5, 6, 2]
      );
    } else {
      faces.push(...this._getFacesWithHoles());
    }

    for (const child of this.children) {
      const childFaces = child.getFaces();
      const vertexOffset = 8;
      faces.push(...childFaces.map(face => 
        face.map(vertexIndex => vertexIndex + vertexOffset)
      ));
    }

    return faces;
  }

  private _getFacesWithHoles(): number[][] {
    const faces: number[][] = [];
    
    for (const hole of this.holes) {
      const holeMinX = hole.x;
      const holeMaxX = hole.x + hole.length;
      const holeMinY = hole.y;
      const holeMaxY = hole.y + hole.width;

      if (holeMinX > 0) {
        faces.push([0, 4, 7, 3]);
      }
      if (holeMaxX < this.length) {
        faces.push([1, 2, 6, 5]);
      }
      if (holeMinY > 0) {
        faces.push([0, 1, 5, 4]);
      }
      if (holeMaxY < this.width) {
        faces.push([2, 3, 7, 6]);
      }
      
      faces.push([4, 7, 6, 5]);
    }

    return faces;
  }

  getBoundingBox(): { min: number[]; max: number[]; dimensions: number[] } | null {
    const allVertices = this.getVertices();
    if (allVertices.length === 0) return null;

    const minX = Math.min(...allVertices.map(v => v[0]));
    const maxX = Math.max(...allVertices.map(v => v[0]));
    const minY = Math.min(...allVertices.map(v => v[1]));
    const maxY = Math.max(...allVertices.map(v => v[1]));
    const minZ = Math.min(...allVertices.map(v => v[2]));
    const maxZ = Math.max(...allVertices.map(v => v[2]));

    return {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      dimensions: [maxX - minX, maxY - minY, maxZ - minZ]
    };
  }

  render(): CubeRenderData {
    return {
      type: 'cube',
      dimensions: [this.length, this.width, this.height],
      position: [this.x, this.y, this.z],
      texture: this.texture,
      vertices: this.getVertices(),
      faces: this.getFaces(),
      holes: this.holes,
      children: this.children.map(child => child.render())
    };
  }
}

export function cubeWithTexture(length: number, width: number, height: number, texture: string): Cube {
  return new Cube(length, width, height, texture);
}

export function createThreeJSMesh(cube: Cube): THREE.Group {
  const group = new THREE.Group();
  
  if (cube.holes.length === 0) {
    // Simple cube without holes
    const geometry = new THREE.BoxGeometry(cube.length, cube.width, cube.height);
    geometry.translate(cube.length / 2, cube.width / 2, cube.height / 2);
    const material = getTextureMaterial(cube.texture);
    
    // Adjust texture repeat for grass lines pavement to maintain consistent pattern
    if (cube.texture === 'grass lines pavement' && material instanceof THREE.MeshLambertMaterial && material.map) {
      material.map.repeat.set(cube.length / 8, cube.height / 8);
      material.map.needsUpdate = true;
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cube.x, cube.y, cube.z);
    mesh.rotation.set(cube.rotationX, cube.rotationY, cube.rotationZ);
    group.add(mesh);
  } else {
    // Cube with holes - create walls around each hole
    for (const hole of cube.holes) {
      createWallsAroundHole(group, cube, hole);
    }
  }
  
  // Add children (existing children system)
  for (const child of cube.children) {
    const childMesh = createThreeJSMesh(child);
    group.add(childMesh);
  }
  
  // Add positioned children (new dependency system)
  for (const positionedChild of cube.positionedChildren) {
    const childMesh = createThreeJSMesh(positionedChild);
    group.add(childMesh);
  }
  
  return group;
}

function getTextureMaterial(texture: string): THREE.Material {
  const colorMap: { [key: string]: number } = {
    'wood': 0x8B4513,
    'metal': 0xC0C0C0,
    'stone': 0x696969,
    'brick': 0xB22222,
    'glass': 0x87CEEB,
    'white painted wall': 0xFFFFFF,
    'white iron': 0xE8E8E8,
    'grass': 0x228B22,
    'pavement': 0x708090,
    'grass pavement': 0x556B2F
  };
  
  if (texture === 'grass lines pavement') {
    // Create a material with alternating concrete and grass stripes
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    
    // Fill with washed concrete color
    context.fillStyle = '#F0F0F0';
    context.fillRect(0, 0, 128, 128);
    
    // Add grass lines every 16 pixels
    context.fillStyle = '#228B22';
    for (let i = 0; i < 128; i += 64) {
      context.fillRect(0, i, 128, 2);
      context.fillRect(i, 0, 2, 128);
    }
    
    const texture2D = new THREE.CanvasTexture(canvas);
    texture2D.wrapS = THREE.RepeatWrapping;
    texture2D.wrapT = THREE.RepeatWrapping;
    texture2D.repeat.set(4, 4);
    
    return new THREE.MeshLambertMaterial({ map: texture2D });
  }
  
  const color = colorMap[texture] || 0x00ff00;
  
  if (texture === 'white painted wall') {
    // Create a subtle painted wall texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // Base white color
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 256, 256);
    
    // Add very subtle texture variations
    context.globalAlpha = 0.03;
    for (let i = 0; i < 256; i += 8) {
      context.fillStyle = '#F8F8F8';
      context.fillRect(i, 0, 1, 256);
    }
    
    // Add very subtle horizontal texture lines
    context.globalAlpha = 0.02;
    for (let j = 0; j < 256; j += 16) {
      context.fillStyle = '#F9F9F9';
      context.fillRect(0, j, 256, 1);
    }
    
    const wallTexture = new THREE.CanvasTexture(canvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);
    
    return new THREE.MeshLambertMaterial({ map: wallTexture });
  }
  
  return new THREE.MeshLambertMaterial({ color });
}

function createWallsAroundHole(group: THREE.Group, cube: Cube, hole: Hole): void {
  const material = getTextureMaterial(cube.texture);
  
  // Bottom face (if hole doesn't go through completely)
  if (hole.depth < cube.height) {
    const bottomGeometry = new THREE.BoxGeometry(cube.length, cube.width, cube.height - hole.depth);
    const bottomMesh = new THREE.Mesh(bottomGeometry, material);
    bottomMesh.position.set(
      cube.x + cube.length / 2,
      cube.y + cube.width / 2,
      cube.z + (cube.height - hole.depth) / 2
    );
    group.add(bottomMesh);
  }
  
  // Left wall
  if (hole.x > 0) {
    const leftGeometry = new THREE.BoxGeometry(hole.x, cube.width, hole.depth);
    const leftMesh = new THREE.Mesh(leftGeometry, material);
    leftMesh.position.set(
      cube.x + hole.x / 2,
      cube.y + cube.width / 2,
      cube.z + cube.height - hole.depth / 2
    );
    group.add(leftMesh);
  }
  
  // Right wall
  if (hole.x + hole.length < cube.length) {
    const rightWidth = cube.length - (hole.x + hole.length);
    const rightGeometry = new THREE.BoxGeometry(rightWidth, cube.width, hole.depth);
    const rightMesh = new THREE.Mesh(rightGeometry, material);
    rightMesh.position.set(
      cube.x + hole.x + hole.length + rightWidth / 2,
      cube.y + cube.width / 2,
      cube.z + cube.height - hole.depth / 2
    );
    group.add(rightMesh);
  }
  
  // Front wall
  if (hole.y > 0) {
    const frontGeometry = new THREE.BoxGeometry(hole.length, hole.y, hole.depth);
    const frontMesh = new THREE.Mesh(frontGeometry, material);
    frontMesh.position.set(
      cube.x + hole.x + hole.length / 2,
      cube.y + hole.y / 2,
      cube.z + cube.height - hole.depth / 2
    );
    group.add(frontMesh);
  }
  
  // Back wall
  if (hole.y + hole.width < cube.width) {
    const backHeight = cube.width - (hole.y + hole.width);
    const backGeometry = new THREE.BoxGeometry(hole.length, backHeight, hole.depth);
    const backMesh = new THREE.Mesh(backGeometry, material);
    backMesh.position.set(
      cube.x + hole.x + hole.length / 2,
      cube.y + hole.y + hole.width + backHeight / 2,
      cube.z + cube.height - hole.depth / 2
    );
    group.add(backMesh);
  }
}
