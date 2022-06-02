import { StructureProvider } from "@webmc/core";
import { mat4, vec3 } from "gl-matrix";
import { Cull } from "../BlockModel";
import { ShaderProgram } from "../ShaderProgram";
import { SpecialRenderer, SpecialRenderers } from "../SpecialRenderer";
import { Resources } from "../StructureRenderer";
import { createBuffer, mergeFloat32Arrays, setUniform, setVertexAttr, transformVectors, updateBuffer } from "../Util";
import { Renderer } from "./Renderer";

type StructureBuffers = {
  position: WebGLBuffer
  texCoord: WebGLBuffer
  tintColor: WebGLBuffer
  blockPos: WebGLBuffer
  index: WebGLBuffer
  length: number
}

type Chunk = {
  positions: Float32Array[],
  textureCoordinates: number[],
  tintColors: number[],
  blockPositions: number[],
  indices: number[],
  indexOffset: number,
  buffer?: StructureBuffers
}

export class BlocksRenderer extends Renderer {
  protected static vs = `
    attribute vec4 vertPos;
    attribute vec2 texCoord;
    attribute vec3 tintColor;

    uniform mat4 mView;
    uniform mat4 mProj;

    varying highp vec2 vTexCoord;
    varying highp vec3 vTintColor;

    void main(void) {
        gl_Position = mProj * mView * vertPos;
        vTexCoord = texCoord;
        vTintColor = tintColor;
    }
    `;

  protected static fs = `
    precision highp float;
    varying highp vec2 vTexCoord;
    varying highp vec3 vTintColor;

    uniform sampler2D sampler;

    void main(void) {
        vec4 texColor = texture2D(sampler, vTexCoord);
        if(texColor.a < 0.01) discard;
        gl_FragColor = vec4(texColor.xyz * vTintColor, texColor.a);
    }
    `;

  private chunks: Chunk[][][] = []
  private atlasTexture: WebGLTexture


  constructor(
    gl: WebGLRenderingContext,
    structure: StructureProvider,
    resources: Resources,
    private chunkSize: number,
    vs: string = BlocksRenderer.vs,
    fs: string = BlocksRenderer.fs
  ){
    super(gl, structure, resources, vs, fs)
    this.atlasTexture = this.getBlockTexture()
  }

  private getBlockTexture() {
    const texture = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.resources.blockAtlas.getImageData());
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    return texture
  }

  private getChunk(chunkPos: vec3): Chunk{
    const x = Math.abs(chunkPos[0]) * 2 + (chunkPos[0] < 0 ? 1 : 0)
    const y = Math.abs(chunkPos[1]) * 2 + (chunkPos[1] < 0 ? 1 : 0)
    const z = Math.abs(chunkPos[2]) * 2 + (chunkPos[2] < 0 ? 1 : 0)

    if (!this.chunks[x])
      this.chunks[x] = []
    if (!this.chunks[x][y])
      this.chunks[x][y] = []
    if (!this.chunks[x][y][z])
      this.chunks[x][y][z] = {
        positions: [],
        textureCoordinates: [],
        tintColors: [],
        blockPositions: [],
        indices: [],
        indexOffset: 0,
      }

    return this.chunks[x][y][z]
  }  

  public update(chunkPositions?: vec3[]): void {

    const pushBuffers = (buffers: any, pos: vec3, chunk: Chunk) => {
      const t = mat4.create()
      mat4.translate(t, t, pos)
      transformVectors(buffers.position, t)

      chunk.positions.push(buffers.position)
      chunk.textureCoordinates.push(...buffers.texCoord)
      chunk.tintColors.push(...buffers.tintColor)
      for (let i = 0; i < buffers.texCoord.length / 2; i += 1) chunk.blockPositions.push(...pos)
      chunk.indices.push(...buffers.index)
      chunk.indexOffset += buffers.texCoord.length / 2
    }

    const resetChunk = (chunk: Chunk) => {
      chunk.positions = []
      chunk.textureCoordinates = []
      chunk.tintColors = []
      chunk.blockPositions = []
      chunk.indices = []
      chunk.indexOffset = 0
    }

    const refreshBuffer = (chunk: Chunk) => {
      if (chunk.buffer){
        updateBuffer(this.gl, chunk.buffer.position, this.gl.ARRAY_BUFFER, mergeFloat32Arrays(...chunk.positions))
        updateBuffer(this.gl, chunk.buffer.texCoord, this.gl.ARRAY_BUFFER, new Float32Array(chunk.textureCoordinates)),
        updateBuffer(this.gl, chunk.buffer.tintColor, this.gl.ARRAY_BUFFER, new Float32Array(chunk.tintColors)),
        updateBuffer(this.gl, chunk.buffer.blockPos, this.gl.ARRAY_BUFFER, new Float32Array(chunk.blockPositions)),
        updateBuffer(this.gl, chunk.buffer.index, this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(chunk.indices)),
        chunk.buffer.length = chunk.indices.length
      } else {
        chunk.buffer = {
          position: createBuffer(this.gl, this.gl.ARRAY_BUFFER, mergeFloat32Arrays(...chunk.positions)),
          texCoord: createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(chunk.textureCoordinates)),
          tintColor: createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(chunk.tintColors)),
          blockPos: createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(chunk.blockPositions)),
          index: createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(chunk.indices)),
          length: chunk.indices.length
        }
      }
    }

    if (!chunkPositions){
      this.chunks.forEach(x => x.forEach(y => y.forEach(chunk => {
        resetChunk(chunk)
      })))
    } else { 
      chunkPositions.forEach(chunkPos => {
        const chunk = this.getChunk(chunkPos)
        resetChunk(chunk)
      });
    }

    let buffers
    for (const b of this.structure.getBlocks()) {
      const blockName = b.state.getName()
      const blockProps = b.state.getProperties()

      const chunkPos:vec3 = [Math.floor(b.pos[0]/this.chunkSize), Math.floor(b.pos[1]/this.chunkSize), Math.floor(b.pos[2]/this.chunkSize)]

      if (chunkPositions && !chunkPositions.some(pos => vec3.equals(pos, chunkPos)))
        continue

      const chunk = this.getChunk(chunkPos)

      try {
        const cull: Cull = {
          up: this.resources.blockProperties.getBlockProperties(this.structure.getBlock([b.pos[0], b.pos[1]+1, b.pos[2]])?.state.getName())?.opaque,
          down: this.resources.blockProperties.getBlockProperties(this.structure.getBlock([b.pos[0], b.pos[1]-1, b.pos[2]])?.state.getName())?.opaque,
          west: this.resources.blockProperties.getBlockProperties(this.structure.getBlock([b.pos[0]-1, b.pos[1], b.pos[2]])?.state.getName())?.opaque,
          east: this.resources.blockProperties.getBlockProperties(this.structure.getBlock([b.pos[0]+1, b.pos[1], b.pos[2]])?.state.getName())?.opaque,
          north: this.resources.blockProperties.getBlockProperties(this.structure.getBlock([b.pos[0], b.pos[1], b.pos[2]-1])?.state.getName())?.opaque,
          south: this.resources.blockProperties.getBlockProperties(this.structure.getBlock([b.pos[0], b.pos[1], b.pos[2]+1])?.state.getName())?.opaque
        }

        const blockDefinition = this.resources.blockDefinitions.getBlockDefinition(blockName)
        if (blockDefinition) {
          buffers = blockDefinition.getBuffers(blockName, blockProps, this.resources.blockAtlas, this.resources.blockModels, chunk.indexOffset, cull)
        }
        if (SpecialRenderers.has(blockName)) {
          if (blockDefinition) {
            pushBuffers(buffers, b.pos, chunk)
          }
          buffers = SpecialRenderer[blockName](chunk.indexOffset, blockProps, this.resources.blockAtlas)
          pushBuffers(buffers, b.pos, chunk)
        } else if(blockDefinition) {
          pushBuffers(buffers, b.pos, chunk)
        }
      } catch(e) {
        console.error(`Error rendering block ${blockName}`, e)
      }
    }

    if (!chunkPositions){
      this.chunks.forEach(x => x.forEach(y => y.forEach(chunk => {
        refreshBuffer(chunk)
      })))
    } else {
      chunkPositions.forEach(chunkPos => {
        const chunk = this.getChunk(chunkPos)
        refreshBuffer(chunk)
      })
    }
  }  

  public draw(viewMatrix: mat4, projMatrix: mat4) {
    this.gl.useProgram(this.shaderProgram)

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlasTexture)

    setUniform(this.gl, this.shaderProgram, 'mView', viewMatrix)
    setUniform(this.gl, this.shaderProgram, 'mProj', projMatrix)

    this.chunks.forEach(x => {
      x.forEach(y => {
        y.forEach(chunk => {
          if (!chunk.buffer) return
          setVertexAttr(this.gl, this.shaderProgram, 'vertPos', 3, chunk.buffer.position)
          setVertexAttr(this.gl, this.shaderProgram, 'texCoord', 2, chunk.buffer.texCoord)
          setVertexAttr(this.gl, this.shaderProgram, 'tintColor', 3, chunk.buffer.tintColor)
          this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, chunk.buffer.index)

          this.gl.drawElements(this.gl.TRIANGLES, chunk.buffer.length, this.gl.UNSIGNED_SHORT, 0)
        });
      })
    })
  }

    

}
