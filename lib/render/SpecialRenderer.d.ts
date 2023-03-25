import type { Cull } from './Cull.js';
import type { TextureAtlasProvider } from './TextureAtlas.js';
export declare const SpecialRenderer: {
    [key: string]: (props: {
        [key: string]: string;
    }, uvProvider: TextureAtlasProvider, cull: Cull) => any;
};
export declare const SpecialRenderers: Set<string>;
//# sourceMappingURL=SpecialRenderer.d.ts.map