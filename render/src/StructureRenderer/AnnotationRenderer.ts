import { StructureProvider } from "@webmc/core";
import { vec3, mat4 } from "gl-matrix";
import { Resources } from "../StructureRenderer";
import { createBuffer, setUniform, setVertexAttr, updateBuffer } from "../Util";
import { Renderer } from "./Renderer";


export class AnnotationRenderer extends Renderer {
  private static vs = `
  attribute vec4 vertPos;
  attribute vec2 texCoord;

  uniform mat4 mView;
  uniform mat4 mProj;

  varying highp vec2 vTexCoord;

  void main(void) {
      gl_Position = mProj * mView * vertPos;
      vTexCoord = texCoord;
  }
  `;

  private static fs = `
  precision highp float;
  varying highp vec2 vTexCoord;

  uniform sampler2D sampler;

  void main(void) {
      vec4 texColor = texture2D(sampler, vTexCoord);
      if(texColor.a < 0.01) discard;
      gl_FragColor = vec4(texColor.xyz, texColor.a);
  }
  `;

  private positionBuffer: WebGLBuffer
  private indexBuffer: WebGLBuffer
  private texCoordBuffer: { [key: string]: WebGLBuffer } = {}
  private atlasTexture: WebGLTexture
  private renderedTypes: string[] | undefined = undefined

  constructor(
    gl: WebGLRenderingContext,
    structure: StructureProvider,
    resources: Resources
  ) {
    super(gl, structure, resources, AnnotationRenderer.vs, AnnotationRenderer.fs)

    const size = 0.3

    const positions: number[] = []
    positions.push(-size, -size, 0)
    positions.push(-size, size, 0)
    positions.push(size, size, 0)
    positions.push(size, -size, 0)
    this.positionBuffer = createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(positions))
    this.indexBuffer = createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 2, 1, 0, 3, 2]))
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

  public setRenderedTypes(types: string[]){
    this.renderedTypes = types
  }

  public update(chunkPositions?: vec3[]): void {

    (new Set(this.structure.getAnnotations().map(a => a.annotation))).forEach(annotation => {
      const uv = this.resources.blockAtlas.getUV("webmc:annotation/" + annotation)
      const p = this.resources.blockAtlas.part

      const texCoords: number[] = []
      texCoords.push(uv[0], uv[1] + p)
      texCoords.push(uv[0], uv[1])
      texCoords.push(uv[0] + p, uv[1])
      texCoords.push(uv[0] + p, uv[1] + p)

      if (this.texCoordBuffer[annotation]) {
        updateBuffer(this.gl, this.texCoordBuffer[annotation], this.gl.ARRAY_BUFFER, new Float32Array(texCoords))
      } else {
        this.texCoordBuffer[annotation] = createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(texCoords))
      }
    })
  }

  public draw(viewMatrix: mat4, projMatrix: mat4): void {
    this.gl.useProgram(this.shaderProgram)

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlasTexture)

    setUniform(this.gl, this.shaderProgram, 'mProj', projMatrix)
    setVertexAttr(this.gl, this.shaderProgram, 'vertPos', 3, this.positionBuffer)
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

    const types = this.renderedTypes ?? Object.keys(this.texCoordBuffer)

    types.forEach(a => {
      setVertexAttr(this.gl, this.shaderProgram, 'texCoord', 2, this.texCoordBuffer[a])
      this.structure.getAnnotations().filter(annotation => annotation.annotation === a).forEach(annotation => {
        const translatedMatrix = mat4.create()
        mat4.copy(translatedMatrix, viewMatrix)
        mat4.translate(translatedMatrix, translatedMatrix, annotation.pos)
        const translation = vec3.create()
        mat4.getTranslation(translation, translatedMatrix)
        setUniform(this.gl, this.shaderProgram, 'mView', mat4.fromTranslation(translatedMatrix, translation))
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0)
      })
    })
  }
}