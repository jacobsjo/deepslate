import * as b from 'benny'
import type { DensityFunction } from '../../src'
import { Climate, LegacyRandom, MultiNoiseBiomeSource } from '../../src'

const MC_META = 'https://raw.githubusercontent.com/misode/mcmeta/data/'
const biome_source_json = (await (await fetch(`${MC_META}data/minecraft/dimension/overworld.json`)).json()).generator.biome_source
const biome_source = MultiNoiseBiomeSource.fromJson(biome_source_json)

const terralith_biome_source_json = (await (await fetch('https://raw.githubusercontent.com/Stardust-Labs-MC/Terralith/main/data/minecraft/dimension/overworld.json')).json()).generator.biome_source
const terralith_biome_source = MultiNoiseBiomeSource.fromJson(terralith_biome_source_json)

const random = new LegacyRandom(BigInt(1))
const sampler = new class implements Climate.Sampler{
	public readonly temperature: DensityFunction
	public readonly humidity: DensityFunction
	public readonly continentalness: DensityFunction
	public readonly erosion: DensityFunction
	public readonly depth: DensityFunction
	public readonly weirdness: DensityFunction

	sample(x: number, y: number, z: number): Climate.TargetPoint {
		return new Climate.TargetPoint(random.nextFloat() * 2 - 1, random.nextFloat() * 2 - 1, random.nextFloat() * 2 - 1, random.nextFloat() * 2 - 1, random.nextFloat() * 2 - 1, random.nextFloat() * 2 - 1)
	}
}

b.suite('MultiNoiseBiomeSource',
	b.add('getBiome', () => {
		biome_source.getBiome(0, 0, 0, sampler)
	}),
	b.cycle(() => {
		random.setSeed(BigInt(1))
	}),
	b.add('getBiome[usePriorityQueue]', () => {
		biome_source.getBiome(0, 0, 0, sampler, true)
	}),
	b.cycle(),
	b.complete(),
)

b.suite('MultiNoiseBiomeSource[Terralith]',
	b.add('getBiome', () => {
		terralith_biome_source.getBiome(0, 0, 0, sampler)
	}),
	b.cycle(() => {
		random.setSeed(BigInt(1))
	}),
	b.add('getBiome[usePriorityQueue]', () => {
		terralith_biome_source.getBiome(0, 0, 0, sampler, true)
	}),
	b.cycle(),
	b.complete(),
)
