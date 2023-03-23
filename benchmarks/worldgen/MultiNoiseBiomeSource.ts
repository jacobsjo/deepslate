import * as b from 'benny'
import type { DensityFunction } from '../../src'
import { Climate, MultiNoiseBiomeSource } from '../../src'

const MC_META = 'https://raw.githubusercontent.com/misode/mcmeta/data/'
const biome_source_json = (await (await fetch(`${MC_META}data/minecraft/dimension/overworld.json`)).json()).generator.biome_source
const biome_source = MultiNoiseBiomeSource.fromJson(biome_source_json)

const sampler = new class implements Climate.Sampler{
	public readonly temperature: DensityFunction
	public readonly humidity: DensityFunction
	public readonly continentalness: DensityFunction
	public readonly erosion: DensityFunction
	public readonly depth: DensityFunction
	public readonly weirdness: DensityFunction

	sample(x: number, y: number, z: number): Climate.TargetPoint {
		return new Climate.TargetPoint(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
	}
}

b.suite('MultiNoiseBiomeSource',
	b.add('getBiome', () => {
		biome_source.getBiome(0, 0, 0, sampler)
	}),
	b.cycle(),
	b.complete(),
)
