import { StructureProvider } from "@webmc/core";
import { mat4, vec3 } from "gl-matrix";
import { ShaderProgram } from "../ShaderProgram";
import { Resources } from "../StructureRenderer";

export abstract class Renderer{
    protected shaderProgram: WebGLProgram

    constructor(
        protected gl: WebGLRenderingContext,
        protected structure: StructureProvider,
        protected resources: Resources,
        vs: string, 
        fs: string
    ){
        this.shaderProgram = new ShaderProgram(this.gl, vs, fs).getProgram()
    }

    public setStructure(structure: StructureProvider) {
        this.structure = structure
    }
        
    public abstract update(chunkPositions?: vec3[]): void
    public abstract draw(viewMatrix: mat4, projMatrix: mat4): void
}