import { Direction, Identifier } from '../core/index.js';
import { BlockDefinition } from './BlockDefinition.js';
import { BlockModel } from './BlockModel.js';
function dummy(id, uvProvider, cull, model) {
    const definition = new BlockDefinition(id, { '': { model: 'dummy' } }, undefined);
    const modelProvider = { getBlockModel: () => model };
    model.flatten(modelProvider);
    return definition.getMesh(id, {}, uvProvider, modelProvider, cull);
}
function liquidRenderer(type, level, uvProvider, cull, tintindex) {
    const y = cull['up'] ? 16 : [14.2, 12.5, 10.5, 9, 7, 5.3, 3.7, 1.9, 16, 16, 16, 16, 16, 16, 16, 16][level];
    const id = Identifier.create(type);
    return dummy(id, uvProvider, cull, new BlockModel(id, undefined, {
        still: `block/${type}_still`,
        flow: `block/${type}_flow`,
    }, [{
            from: [0, 0, 0],
            to: [16, y, 16],
            faces: {
                up: { texture: '#still', tintindex, cullface: Direction.UP },
                down: { texture: '#still', tintindex, cullface: Direction.DOWN },
                north: { texture: '#flow', tintindex, cullface: Direction.NORTH },
                east: { texture: '#flow', tintindex, cullface: Direction.EAST },
                south: { texture: '#flow', tintindex, cullface: Direction.SOUTH },
                west: { texture: '#flow', tintindex, cullface: Direction.WEST },
            },
        }]));
}
function chestRenderer(facing, type, uvProvider) {
    const id = Identifier.create('chest');
    return dummy(id, uvProvider, {}, new BlockModel(id, undefined, {
        0: 'block/chest',
    }, [{
            from: [1, 0, 1],
            to: [15, 14, 15],
            faces: {
                up: { texture: '#0' },
                down: { texture: '#0' },
                north: { texture: '#0' },
                east: { texture: '#0' },
                south: { texture: '#0' },
                west: { texture: '#0' },
            },
        }]));
}
export const SpecialRenderer = {
    'minecraft:water': (props, uvProvider, cull) => liquidRenderer('water', parseInt(props.level), uvProvider, cull, 0),
    'minecraft:lava': (props, uvProvider, cull) => liquidRenderer('lava', parseInt(props.level), uvProvider, cull),
    'minecraft:chest': (props, uvProvider) => chestRenderer(props.facing || 'south', props.type || 'single', uvProvider),
};
export const SpecialRenderers = new Set(Object.keys(SpecialRenderer));
//# sourceMappingURL=SpecialRenderer.js.map