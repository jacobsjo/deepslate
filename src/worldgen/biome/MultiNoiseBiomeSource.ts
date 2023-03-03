import { Identifier } from '../../core/index.js'
import { Json } from '../../util/index.js'
import type { BiomeSource } from './BiomeSource.js'
import { Climate } from './Climate.js'

export class MultiNoiseBiomeSource implements BiomeSource {
	private readonly parameters: Climate.Parameters<Identifier>

	constructor(entries: Array<[Climate.ParamPoint, () => Identifier]>) {
		this.parameters = new Climate.Parameters(entries)
	}

	public getBiome(x: number, y: number, z: number, climate: Climate.Sampler | Climate.TargetPoint) {
		const target = (climate instanceof Climate.Sampler)
			? climate.sample(x, y, z)
			: climate
			
		return this.parameters.find(target) ?? Identifier.create('void')
	}

	public static fromJson(obj: unknown) {
		const root = Json.readObject(obj) ?? {}
		const biomes = Json.readArray(root.biomes, b => (b => ({
			biome: Identifier.parse(Json.readString(b.biome) ?? 'plains'),
			parameters: Climate.ParamPoint.fromJson(b.parameters),
		}))(Json.readObject(b) ?? {})) ?? []
		const entries = biomes.map<[Climate.ParamPoint, () => Identifier]>(b => [b.parameters, () => b.biome])
		return new MultiNoiseBiomeSource(entries)
	}
}
