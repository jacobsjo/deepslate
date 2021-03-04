import { UVBlobTransform } from "../BlockAtlas"
import { BlockDefinition } from "../BlockDefinition"
import { BlockModel } from "../BlockModel"

export class ChestResourceManagerHelper {
  public static convertTextures(id: string, data: Blob) {
    const textures: { [id: string]: Blob | UVBlobTransform } = {}
    if (id.endsWith("_right")) {
      return
    } else if (id.endsWith("_left")) {
      textures['minecraft:block/chest_' + id + "_top"] = { blob: data, uv_transform: [{ from_uv: [29, 0], to_uv: [0, 1], size: [15, 14] }] }
      textures['minecraft:block/chest_' + id + "_front"] = {
        blob: data, uv_transform: [
          { from_uv: [43, 33], to_uv: [0, 1], size: [15, 10] },
          { from_uv: [43, 15], to_uv: [0, 11], size: [15, 4] }
        ]
      }
      textures['minecraft:block/chest_' + id + "_back"] = {
        blob: data, uv_transform: [
          { from_uv: [14, 33], to_uv: [0, 1], size: [15, 10] },
          { from_uv: [14, 15], to_uv: [0, 11], size: [15, 4] }
        ]
      }
      textures['minecraft:block/chest_' + id + "_side"] = {
        blob: data, uv_transform: [
          { from_uv: [29, 33], to_uv: [1, 1], size: [14, 10] },
          { from_uv: [29, 15], to_uv: [1, 11], size: [14, 4] }
        ]
      }
      textures['minecraft:block/chest_' + id + "_notch"] = {
        blob: data, uv_transform: [
          { from_uv: [0, 0], to_uv: [0, 0], size: [6, 5] },
        ]
      }
    } else {
      textures['minecraft:block/chest_' + id + "_top"] = { blob: data, uv_transform: [{ from_uv: [28, 0], to_uv: [1, 1], size: [14, 14] }] }
      textures['minecraft:block/chest_' + id + "_front"] = {
        blob: data, uv_transform: [
          { from_uv: [42, 33], to_uv: [1, 1], size: [14, 10] },
          { from_uv: [42, 15], to_uv: [1, 11], size: [14, 4] }
        ]
      }
      textures['minecraft:block/chest_' + id + "_side"] = {
        blob: data, uv_transform: [
          { from_uv: [14, 33], to_uv: [1, 1], size: [14, 10] },
          { from_uv: [14, 15], to_uv: [1, 11], size: [14, 4] }
        ]
      }
      textures['minecraft:block/chest_' + id + "_notch"] = {
        blob: data, uv_transform: [
          { from_uv: [0, 0], to_uv: [0, 0], size: [6, 5] },
        ]
      }
    }
    return textures
  }

  public static getBlockDefinitions() {
    const blockDefinitions: { [id: string]: BlockDefinition } = {}
    blockDefinitions['minecraft:chest'] = new BlockDefinition('minecraft:chest', this.getChestVariants("chest"), undefined)
    blockDefinitions['minecraft:trapped_chest'] = new BlockDefinition('minecraft:trapped_chest', this.getChestVariants("trapped_chest"), undefined)
    blockDefinitions['minecraft:ender_chest'] = new BlockDefinition('minecraft:ender_chest', this.getEnderChestVariants("ender_chest"), undefined)
    return blockDefinitions
  }

  public static getBlockModels() {
    const blockModels: { [id: string]: BlockModel } = {}
    blockModels['minecraft:block/template_chest_single'] = new BlockModel('minecraft:block/template_chest_single', undefined, undefined, [
      {
        "from": [1, 0, 1],
        "to": [15, 14, 15],
        "faces": {
          "down": { "uv": [1, 1, 15, 15], "texture": "#top" },
          "up": { "uv": [1, 1, 15, 15], "texture": "#top" },
          "north": { "uv": [15, 15, 1, 1], "texture": "#front" },
          "south": { "uv": [15, 15, 1, 1], "texture": "#side" },
          "west": { "uv": [15, 15, 1, 1], "texture": "#side" },
          "east": { "uv": [15, 15, 1, 1], "texture": "#side" }
        }
      },
      {
        "from": [7, 7, 0],
        "to": [9, 11, 1],
        "faces": {
          "down": { "uv": [3, 1, 1, 0], "texture": "#notch" },
          "up": { "uv": [5, 1, 3, 0], "texture": "#notch" },
          "north": { "uv": [6, 5, 4, 1], "texture": "#notch" },
          "west": { "uv": [4, 5, 3, 1], "texture": "#notch" },
          "east": { "uv": [4, 5, 3, 1], "texture": "#notch" }
        }
      },
    ])

    blockModels['minecraft:block/template_chest_left'] = new BlockModel('minecraft:block/template_chest_left', undefined, undefined, [
      {
        "from": [1, 0, 1],
        "to": [16, 14, 15],
        "faces": {
          "down": { "uv": [15, 1, 0, 15], "texture": "#top" },
          "up": { "uv": [15, 1, 0, 15], "texture": "#top" },
          "north": { "uv": [15, 15, 0, 1], "texture": "#front" },
          "south": { "uv": [15, 15, 0, 1], "texture": "#back" },
          "west": { "uv": [15, 15, 1, 1], "texture": "#side" }
        }
      },
      {
        "from": [15, 7, 0],
        "to": [16, 11, 1],
        "faces": {
          "down": { "uv": [1, 0, 2, 1], "texture": "#notch" },
          "up": { "uv": [2, 0, 3, 1], "texture": "#notch" },
          "north": { "uv": [4, 5, 3, 1], "texture": "#notch" },
          "west": { "uv": [4, 5, 3, 1], "texture": "#notch" }
        }
      },
    ])


    blockModels['minecraft:block/template_chest_right'] = new BlockModel('minecraft:block/template_chest_right', undefined, undefined, [
      {
        "from": [0, 0, 1],
        "to": [15, 14, 15],
        "faces": {
          "down": { "uv": [0, 1, 15, 15], "texture": "#top" },
          "up": { "uv": [0, 1, 15, 15], "texture": "#top" },
          "north": { "uv": [0, 15, 15, 1], "texture": "#front" },
          "south": { "uv": [0, 15, 15, 1], "texture": "#back" },
          "east": { "uv": [1, 15, 15, 1], "texture": "#side" }
        }
      },
      {
        "from": [0, 7, 0],
        "to": [1, 11, 1],
        "faces": {
          "down": { "uv": [1, 0, 2, 1], "texture": "#notch" },
          "up": { "uv": [2, 0, 3, 1], "texture": "#notch" },
          "east": { "uv": [4, 5, 3, 1], "texture": "#notch" },
          "north": { "uv": [2, 5, 1, 1], "texture": "#notch" }
        }
      },
    ])


    blockModels['minecraft:block/chest_single'] = new BlockModel('minecraft:block/chest_single', 'minecraft:block/template_chest_single', this.getChestTextures("normal"), undefined)
    blockModels['minecraft:block/chest_left'] = new BlockModel('minecraft:block/chest_left', 'minecraft:block/template_chest_left', this.getChestTextures("normal_left"), undefined)
    blockModels['minecraft:block/chest_right'] = new BlockModel('minecraft:block/chest_right', 'minecraft:block/template_chest_right', this.getChestTextures("normal_left"), undefined)

    blockModels['minecraft:block/trapped_chest_single'] = new BlockModel('minecraft:block/trapped_chest_single', 'minecraft:block/template_chest_single', this.getChestTextures("trapped"), undefined)
    blockModels['minecraft:block/trapped_chest_left'] = new BlockModel('minecraft:block/trapped_chest_left', 'minecraft:block/template_chest_left', this.getChestTextures("trapped_left"), undefined)
    blockModels['minecraft:block/trapped_chest_right'] = new BlockModel('minecraft:block/trapped_chest_right', 'minecraft:block/template_chest_right', this.getChestTextures("trapped_left"), undefined)

    blockModels['minecraft:block/ender_chest_single'] = new BlockModel('minecraft:block/ender_chest_single', 'minecraft:block/template_chest_single', this.getChestTextures("ender"), undefined)

    return blockModels
  }

  private static getEnderChestVariants(chest: string) {
    return {
      "facing=east": {
        "model": "minecraft:block/" + chest + "_single",
        "y": 90
      },
      "facing=north": {
        "model": "minecraft:block/" + chest + "_single"
      },
      "facing=south": {
        "model": "minecraft:block/" + chest + "_single",
        "y": 180
      },
      "facing=west": {
        "model": "minecraft:block/" + chest + "_single",
        "y": 270
      }
    }
  }

  private static getChestVariants(chest: string) {
    return {
      "facing=east,type=single": {
        "model": "minecraft:block/" + chest + "_single",
        "y": 90
      },
      "facing=north,type=single": {
        "model": "minecraft:block/" + chest + "_single"
      },
      "facing=south,type=single": {
        "model": "minecraft:block/" + chest + "_single",
        "y": 180
      },
      "facing=west,type=single": {
        "model": "minecraft:block/" + chest + "_single",
        "y": 270
      },

      "facing=east,type=left": {
        "model": "minecraft:block/" + chest + "_left",
        "y": 90
      },
      "facing=north,type=left": {
        "model": "minecraft:block/" + chest + "_left"
      },
      "facing=south,type=left": {
        "model": "minecraft:block/" + chest + "_left",
        "y": 180
      },
      "facing=west,type=left": {
        "model": "minecraft:block/" + chest + "_left",
        "y": 270
      },

      "facing=east,type=right": {
        "model": "minecraft:block/" + chest + "_right",
        "y": 90
      },
      "facing=north,type=right": {
        "model": "minecraft:block/" + chest + "_right"
      },
      "facing=south,type=right": {
        "model": "minecraft:block/" + chest + "_right",
        "y": 180
      },
      "facing=west,type=right": {
        "model": "minecraft:block/" + chest + "_right",
        "y": 270
      }
    }
  }

  private static getChestTextures(type: string) {
    return {
      "top": "block/chest_" + type + "_top",
      "front": "block/chest_" + type + "_front",
      "side": "block/chest_" + type + "_side",
      "back": "block/chest_" + type + "_back",
      "notch": "block/chest_" + type + "_notch",
    }
  }
}