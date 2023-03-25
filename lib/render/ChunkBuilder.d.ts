import { vec3 } from 'gl-matrix';
import type { Resources, StructureProvider } from '../index.js';
import { Mesh } from './Mesh.js';
export declare class ChunkBuilder {
    private readonly gl;
    private structure;
    private readonly resources;
    private readonly chunkSize;
    private chunks;
    constructor(gl: WebGLRenderingContext, structure: StructureProvider, resources: Resources, chunkSize?: number);
    setStructure(structure: StructureProvider): void;
    updateStructureBuffers(chunkPositions?: vec3[]): void;
    getMeshes(): Mesh[];
    private needsCull;
    private finishChunkMesh;
    private getChunk;
}
//# sourceMappingURL=ChunkBuilder.d.ts.map