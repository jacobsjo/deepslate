import { mat4 } from 'gl-matrix';
import { Identifier } from '../core/index.js';
import { ItemStack } from '../core/ItemStack.js';
import type { Color } from '../index.js';
import type { BlockModelProvider } from './BlockModel.js';
import { Renderer } from './Renderer.js';
import type { TextureAtlasProvider } from './TextureAtlas.js';
interface ModelRendererOptions {
    /** Force the tint index of the item */
    tint?: Color;
}
interface ItemRendererResources extends BlockModelProvider, TextureAtlasProvider {
}
export declare class ItemRenderer extends Renderer {
    private readonly resources;
    private item;
    private mesh;
    private readonly tint;
    private readonly atlasTexture;
    constructor(gl: WebGLRenderingContext, item: Identifier | ItemStack, resources: ItemRendererResources, options?: ModelRendererOptions);
    setItem(item: Identifier | ItemStack): void;
    private getItemMesh;
    protected getPerspective(): mat4;
    drawItem(): void;
}
export {};
//# sourceMappingURL=ItemRenderer.d.ts.map