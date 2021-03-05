import { StructureProvider } from "@webmc/core";
import { mat4, vec3 } from "gl-matrix";
import { Resources } from "../StructureRenderer";
import { createBuffer, setUniform, setVertexAttr } from "../Util";
import { Renderer } from "./Renderer";

type GridBuffers = {
  position: WebGLBuffer
  color: WebGLBuffer
  length: number
}

export class BoundingBoxBlocksRenderer extends Renderer {
  protected static vs = `
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

  protected static fs = `
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
    super(gl, structure, resources, BoundingBoxBlocksRenderer.vs, BoundingBoxBlocksRenderer.fs)
  }

  private buffers: GridBuffers | undefined = undefined

  public update(chunkPositions?: vec3[]): void {
    const [X, Y, Z] = this.structure.getSize()
    const position: number[] = []
    const color: number[] = []

    position.push(0, 0, 0, X, 0, 0)
    color.push(1, 0, 0, 1, 0, 0)

    position.push(0, 0, 0, 0, 0, Z)
    color.push(0, 0, 1, 0, 0, 1)

    position.push(0, 0, 0, 0, Y, 0)
    position.push(X, 0, 0, X, Y, 0)
    position.push(0, 0, Z, 0, Y, Z)
    position.push(X, 0, Z, X, Y, Z)

    position.push(0, Y, 0, 0, Y, Z)
    position.push(X, Y, 0, X, Y, Z)
    position.push(0, Y, 0, X, Y, 0)
    position.push(0, Y, Z, X, Y, Z)

    for (let x = 1; x <= X; x += 1) position.push(x, 0, 0, x, 0, Z)
    for (let z = 1; z <= Z; z += 1) position.push(0, 0, z, X, 0, z)
    for (let i = 0; i < 8 + X + Z; i += 1) color.push(0.8, 0.8, 0.8, 0.8, 0.8, 0.8)

    this.buffers = {
      position: createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(position)),
      color: createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(color)),
      length: position.length / 3
    }
  }

  public draw(viewMatrix: mat4) {
    if (!this.buffers || !this.projMatrix){
      throw "Draw called before update"
    }

    this.gl.useProgram(this.shaderProgram)

    setVertexAttr(this.gl, this.shaderProgram, 'vertPos', 3, this.buffers.position)
    setVertexAttr(this.gl, this.shaderProgram, 'vertColor', 3, this.buffers.color)
    setUniform(this.gl, this.shaderProgram, 'mView', viewMatrix)
    setUniform(this.gl, this.shaderProgram, 'mProj', this.projMatrix)
    this.gl.drawArrays(this.gl.LINES, 0, this.buffers.length)
  }
}