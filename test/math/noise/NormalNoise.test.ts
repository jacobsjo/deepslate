import { expect } from 'chai'
import { LegacyRandom, NormalNoise } from '../../../src/math'

describe('NormalNoise', () => {
	const DELTA = 1e-5
	const setup = () => {
		const random = new LegacyRandom(BigInt(82))
		const noise = new NormalNoise(random, { firstOctave: -6, amplitudes: [1.0, 1.0] })
		return { random, noise }
	}

	it('valueFactor', () => {
		const { noise } = setup()

		expect(noise.valueFactor).equal(1.111111111111111)
	})

	it('sample', () => {
		const { noise } = setup()

		expect(noise.sample(0, 0, 0)).closeTo(-0.11173738673691287, DELTA)
		expect(noise.sample(0.5, 4, -2)).closeTo(-0.12418270136523879, DELTA)
		expect(noise.sample(-204, 28, 12)).closeTo(-0.593348747968403, DELTA)
	})
})
