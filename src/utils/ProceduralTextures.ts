import * as THREE from 'three';

export class ProceduralTextures {
  // Generate a brick wall texture
  static createBrickTexture(width: number = 512, height: number = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Background mortar color
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(0, 0, width, height);
    
    // Brick parameters
    const brickWidth = 64;
    const brickHeight = 32;
    const mortarWidth = 4;
    
    // Draw bricks
    ctx.fillStyle = '#B87333';
    for (let y = 0; y < height; y += brickHeight + mortarWidth) {
      for (let x = 0; x < width; x += brickWidth + mortarWidth) {
        // Offset every other row
        const offsetX = (Math.floor(y / (brickHeight + mortarWidth)) % 2) * (brickWidth / 2);
        ctx.fillRect(x + offsetX, y, brickWidth, brickHeight);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
  
  // Generate a wood grain texture
  static createWoodTexture(width: number = 512, height: number = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Base wood color
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#D2691E');
    gradient.addColorStop(0.5, '#8B4513');
    gradient.addColorStop(1, '#A0522D');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add wood grain lines
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      const y = (i / 20) * height;
      ctx.moveTo(0, y + Math.sin(0) * 10);
      for (let x = 0; x < width; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.01) * 10);
      }
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
  
  // Generate a concrete texture
  static createConcreteTexture(width: number = 512, height: number = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Base concrete color
    ctx.fillStyle = '#BEBEBE';
    ctx.fillRect(0, 0, width, height);
    
    // Add noise for concrete texture
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 40;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
  
  // Generate a marble texture
  static createMarbleTexture(width: number = 512, height: number = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Base marble color
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(0, 0, width, height);
    
    // Add marble veins
    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      ctx.moveTo(startX, startY);
      
      let x = startX;
      let y = startY;
      
      for (let j = 0; j < 50; j++) {
        x += (Math.random() - 0.5) * 20;
        y += (Math.random() - 0.5) * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
  
  // Generate a tile texture
  static createTileTexture(width: number = 512, height: number = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Background grout color
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, width, height);
    
    // Tile parameters
    const tileSize = 64;
    const groutWidth = 2;
    
    // Draw tiles
    ctx.fillStyle = '#FFFFFF';
    for (let y = 0; y < height; y += tileSize + groutWidth) {
      for (let x = 0; x < width; x += tileSize + groutWidth) {
        ctx.fillRect(x, y, tileSize, tileSize);
        
        // Add slight variation to each tile
        const variation = (Math.random() - 0.5) * 20;
        ctx.fillStyle = `rgb(${255 + variation}, ${255 + variation}, ${255 + variation})`;
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = '#FFFFFF';
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}

// Export texture creation functions
export const TextureLibrary = {
  brick: ProceduralTextures.createBrickTexture,
  wood: ProceduralTextures.createWoodTexture,
  concrete: ProceduralTextures.createConcreteTexture,
  marble: ProceduralTextures.createMarbleTexture,
  tile: ProceduralTextures.createTileTexture
};