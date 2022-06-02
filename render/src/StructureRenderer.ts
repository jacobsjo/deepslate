import { mat4, vec3 } from "gl-matrix";
import { BlockAtlas } from "./BlockAtlas";
import { BlockModelProvider } from "./BlockModel";
import { BlockDefinitionProvider } from "./BlockDefinition";
import { BlockPropertiesProvider } from "./BlockProperties";
import { StructureProvider } from "@webmc/core";
import { Renderer } from "./StructureRenderer/Renderer";

export type Resources = {
  blockDefinitions: BlockDefinitionProvider
  blockModels: BlockModelProvider
  blockAtlas: BlockAtlas
  blockProperties: BlockPropertiesProvider
}

export class StructureRenderer {
  private renderers: Renderer[] = []
  private projMatrix: mat4

  constructor(
    private gl: WebGLRenderingContext,
  ) {
    this.projMatrix = this.getPerspective()
    this.initialize()
  }

  public addRenderer(renderer: Renderer){
    this.renderers.push(renderer)
  }

  public setStructure(structure: StructureProvider) {
    this.renderers.forEach(renderer => {
      renderer.setStructure(structure)
      renderer.update()
    })
  }

  private initialize() {
    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.depthFunc(this.gl.LEQUAL)

    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

    this.gl.enable(this.gl.CULL_FACE)
    this.gl.cullFace(this.gl.BACK)
  }

  private getPerspective() {
    const fieldOfView = 70 * Math.PI / 180;
    const aspect = (this.gl.canvas as HTMLCanvasElement).clientWidth / (this.gl.canvas as HTMLCanvasElement).clientHeight;
    const projMatrix = mat4.create();
    mat4.perspective(projMatrix, fieldOfView, aspect, 0.1, 500.0);
    return projMatrix
  }

  public setViewport(x: number, y: number, width: number, height: number) {
    this.gl.viewport(x, y, width, height)
  }

  public updateAll(chunkPositions?: vec3[]){
    this.renderers.forEach(renderer => renderer.update(chunkPositions))
  }

  public drawAll(viewMatrix: mat4){
    const projMatrix = this.getPerspective()
    this.renderers.forEach(renderer => renderer.draw(viewMatrix, projMatrix))
  }
}
