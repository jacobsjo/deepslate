export interface TextureUVProvider {
  part: number
  getUV(texture: string): [number, number]
}

type UVMap = { [id: string]: [number, number] }
export type UVBlobTransform = {blob: Blob, uv_transform: {from_uv: [number, number], to_uv:[number, number], size: [number, number]}[]}

export class BlockAtlas implements TextureUVProvider {
  public readonly part: number

  constructor(
    private img: ImageData,
    private idMap: UVMap
  ) {
    this.part = 16 / img.width
  }

  public getImageData() {
    return this.img
  }

  public getUV(id: string) {
    return this.idMap[id] ?? [0, 0]
  }

  public static async fromBlobs(textures: { [id: string]: Blob | UVBlobTransform}): Promise<BlockAtlas> {   
    const initialWidth = Math.sqrt(Object.keys(textures).length + 1)
    const width = Math.pow(2, Math.ceil(Math.log(initialWidth)/Math.log(2)))
    const pixelWidth = width * 16
    const part = 1 / width

    const canvas = document.createElement('canvas')
    canvas.width = pixelWidth
    canvas.height = pixelWidth
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 16, 16)
    ctx.fillStyle = 'magenta'
    ctx.fillRect(0, 0, 8, 8)
    ctx.fillRect(8, 8, 8, 8)

    const idMap: UVMap = {}
    let index = 1
    await Promise.all(Object.keys(textures).map(async (id) => {
      const u = (index % width)
      const v = Math.floor(index / width)
      index += 1
      idMap[id] = [part * u, part * v]
      if (textures[id] instanceof Blob){
        const img = await createImageBitmap(textures[id] as Blob)
        ctx.drawImage(img, 0, 0, 16, 16, 16 * u, 16 * v, 16, 16)
      } else {
        const img = await createImageBitmap((textures[id] as UVBlobTransform).blob)
        const uv_transform = (textures[id] as UVBlobTransform).uv_transform;
        uv_transform.forEach((uv_transf) => {
          ctx.drawImage(img,
            uv_transf.from_uv[0], uv_transf.from_uv[1],
            uv_transf.size[0], uv_transf.size[1],
            16 * u + uv_transf.to_uv[0], 16 * v + uv_transf.to_uv[1], 
            uv_transf.size[0], uv_transf.size[1])
        });
      }

    }))

    return new BlockAtlas(ctx.getImageData(0, 0, pixelWidth, pixelWidth), idMap)
  }

  public static empty() {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const ctx = canvas.getContext('2d')!
    BlockAtlas.drawInvalidTexture(ctx)
    return new BlockAtlas(ctx.getImageData(0, 0, 16, 16), {})
  }

  private static drawInvalidTexture(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 16, 16)
    ctx.fillStyle = 'magenta'
    ctx.fillRect(0, 0, 8, 8)
    ctx.fillRect(8, 8, 8, 8)
  }
}
