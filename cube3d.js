class Cube {
    constructor(length, width, height, texture, x = 0, y = 0, z = 0) {
        this.length = length;
        this.width = width;
        this.height = height;
        this.texture = texture;
        this.x = x;
        this.y = y;
        this.z = z;
        this.children = [];
        this.holes = [];
    }

    positionAt(referenceCube, offsetLength, offsetWidth, offsetHeight) {
        this.x = referenceCube.x + offsetLength;
        this.y = referenceCube.y + offsetWidth;
        this.z = referenceCube.z + offsetHeight;
        return this;
    }

    makeHole(atX, atY, length, width, depth) {
        if (atX < 0 || atY < 0 || atX + length > this.length || atY + width > this.width) {
            throw new Error("Hole dimensions exceed cube boundaries");
        }
        
        if (depth > this.height) {
            throw new Error("Hole depth exceeds cube height");
        }

        const hole = {
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

    addChild(cube) {
        this.children.push(cube);
        return this;
    }

    getVertices() {
        const vertices = [];
        
        const baseVertices = [
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

    getFaces() {
        const faces = [];
        
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

    _getFacesWithHoles() {
        const faces = [];
        
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

    getBoundingBox() {
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

    render() {
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

function cubeWithTexture(length, width, height, texture) {
    return new Cube(length, width, height, texture);
}

module.exports = { Cube, cubeWithTexture };