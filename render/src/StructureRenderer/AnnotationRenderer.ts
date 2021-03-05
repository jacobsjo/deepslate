import { vec3, mat4 } from "gl-matrix";
import { Renderer } from "./Renderer";

export class AnnotationRenderer extends Renderer{
    public update(chunkPositions?: vec3[]): void {
        throw new Error("Method not implemented.");
    }
    public draw(viewMatrix: mat4): void {
        throw new Error("Method not implemented.");
    }
}