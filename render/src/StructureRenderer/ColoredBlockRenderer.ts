import { StructureProvider } from "@webmc/core";
import { ShaderProgram } from "../ShaderProgram";
import { Resources } from "../StructureRenderer";
import { BlocksRenderer } from "./BlocksRenderer";
import { Renderer } from "./Renderer";

export class ColoredBlocksRenderer extends BlocksRenderer {
  protected static vs = `
    attribute vec4 vertPos;
    attribute vec3 blockPos;

    uniform mat4 mView;
    uniform mat4 mProj;

    varying highp vec3 vColor;

    void main(void) {
        gl_Position = mProj * mView * vertPos;
        vColor = blockPos / 256.0;
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
      chunkSize: number
    ){
      super(gl, structure, resources, chunkSize, ColoredBlocksRenderer.vs, ColoredBlocksRenderer.fs)
    }
}