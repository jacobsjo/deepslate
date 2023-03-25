import * as b from 'benny'
import type { DensityFunction } from '../../src'
import { Climate, LegacyRandom, MultiNoiseBiomeSource } from '../../src'

const MC_META = 'https://raw.githubusercontent.com/misode/mcmeta/data/'
const vanilla_biome_source_json = (await (await fetch(`${MC_META}data/minecraft/dimension/overworld.json`)).json()).generator.biome_source
const vanilla_biome_source = MultiNoiseBiomeSource.fromJson(vanilla_biome_source_json)

const terralith_biome_source_json = (await (await fetch('https://raw.githubusercontent.com/Stardust-Labs-MC/Terralith/main/data/minecraft/dimension/overworld.json')).json()).generator.biome_source
const terralith_biome_source = MultiNoiseBiomeSource.fromJson(terralith_biome_source_json)

class DemoSampler implements Climate.Sampler{
	public readonly temperature: DensityFunction
	public readonly humidity: DensityFunction
	public readonly continentalness: DensityFunction
	public readonly erosion: DensityFunction
	public readonly depth: DensityFunction
	public readonly weirdness: DensityFunction

	public random = new LegacyRandom(BigInt(1))

	public last_temperature: number = 0
	public last_humidity: number = 0
	public last_continentalness: number = 0
	public last_erosion: number = 0
	public last_depth: number = 0
	public last_weirdness: number = 0

	sample(x: number, y: number, z: number): Climate.TargetPoint {
		this.last_temperature += this.random.nextFloat() * 0.04 - 0.02
		this.last_humidity += this.random.nextFloat() * 0.04 - 0.02
		this.last_continentalness += this.random.nextFloat() * 0.04 - 0.02
		this.last_erosion += this.random.nextFloat() * 0.04 - 0.02
		this.last_depth += this.random.nextFloat() * 0.04 - 0.02
		this.last_weirdness += this.random.nextFloat() * 0.04 - 0.02
		return new Climate.TargetPoint(this.last_temperature, this.last_humidity, this.last_continentalness, this.last_erosion, this.last_depth, this.last_weirdness)
	}
}

var vanilla_sampler = new DemoSampler()
vanilla_biome_source.getBiome(0,0,0, vanilla_sampler)

var terralith_sampler = new DemoSampler()
terralith_biome_source.getBiome(0,0,0, terralith_sampler)

b.suite('MultiNoiseBiomeSource',
	b.add('getBiome Vanilla', () => {
		vanilla_biome_source.getBiome(0, 0, 0, vanilla_sampler)
	}),
	b.add('getBiome Terralith', () => {
		terralith_biome_source.getBiome(0, 0, 0, vanilla_sampler)
	}),
	b.cycle(),
	b.complete()
)
