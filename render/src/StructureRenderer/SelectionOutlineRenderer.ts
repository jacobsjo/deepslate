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

export class SelectionOutlineRenderer extends Renderer {
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
    super(gl, structure, resources, SelectionOutlineRenderer.vs, SelectionOutlineRenderer.fs)
  }

  private buffers: GridBuffers | undefined = undefined
  private selection: vec3 = [0, 0, 0]

  public setSelection(selection: vec3){
    this.selection = selection
  }

  public update(chunkPositions?: vec3[]): void {
    const position: number[] = []
    const color: number[] = []

    addCube(position, color, [1, 1, 1], [0, 0, 0], [1, 1, 1])

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

    const translatedMatrix = mat4.create()
    mat4.copy(translatedMatrix, viewMatrix)
    mat4.translate(translatedMatrix, translatedMatrix, this.selection)
    setUniform(this.gl, this.shaderProgram, 'mView', translatedMatrix)
    setUniform(this.gl, this.shaderProgram, 'mProj', projMatrix)
    this.gl.drawArrays(this.gl.LINES, 0, this.buffers.length)
  }
}