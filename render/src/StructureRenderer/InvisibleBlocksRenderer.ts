import { StructureProvider } from "@webmc/core";
import { mat4, vec3 } from "gl-matrix";
import { Resources } from "../StructureRenderer";
import { addCube, createBuffer, setUniform, setVertexAttr } from "../Util";
import { Renderer } from "./Renderer";

type GridBuffers = {
  position: WebGLBuffer
  color: WebGLBuffer
  length: number
}

export class InvisibleBlocksRenderer extends Renderer {
  private static vs = `
    attribute vec4 vertPos;
    attribute vec3 vertColor;

    uniform mat4 mView;
    uniform mat4 mProj;

    varying highp vec3 vColor;

    void main(void) {
      gl_Position = mProj * mView * vertPos;
      vColor = vertColor;
    }
  `;

  private static fs = `
    precision highp float;
    varying highp vec3 vColor;

    void main(void) {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  constructor(
    gl: WebGLRenderingContext,
    structure: StructureProvider,
    resources: Resources,
  ){
    super(gl, structure, resources, InvisibleBlocksRenderer.vs, InvisibleBlocksRenderer.fs)
  }

  private buffers: GridBuffers | undefined = undefined

  public update(chunkPositions?: vec3[]): void {
    const size = this.structure.getSize()
    const position: number[] = []
    const color: number[] = []

    for (let x = 0; x < size[0]; x += 1) {
      for (let y = 0; y < size[1]; y += 1) {
        for (let z = 0; z < size[2]; z += 1) {
          const block = this.structure.getBlock([x, y, z])
          if (block === undefined)
            continue;
          if (block === null) {
            addCube(position, color, [1, 0.25, 0.25], [x + 0.4375, y + 0.4375, z + 0.4375], [x + 0.5625, y + 0.5625, z + 0.5625])
          } else if (block.state.getName() === 'minecraft:air') {
            addCube(position, color, [0.5, 0.5, 1], [x + 0.375, y + 0.375, z + 0.375], [x + 0.625, y + 0.625, z + 0.625])
          }
        }
      }
    }

    this.buffers = {
      position: createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(position)),
      color: createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(color)),
      length: position.length / 3
    }
  }


  public draw(viewMatrix: mat4, projMatrix: mat4) {
    if (!this.buffers){
      throw "Draw called before update"
    }

    this.gl.useProgram(this.shaderProgram)

    setVertexAttr(this.gl, this.shaderProgram, 'vertPos', 3, this.buffers.position)
    setVertexAttr(this.gl, this.shaderProgram, 'vertColor', 3, this.buffers.color)
    setUniform(this.gl, this.shaderProgram, 'mView', viewMatrix)
    setUniform(this.gl, this.shaderProgram, 'mProj', projMatrix)

    this.gl.drawArrays(this.gl.LINES, 0, this.buffers.length)
  }

}