import dex_db from './index.mjs'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('DEX DB', () => {
    it('Find pairs with USDC token', () => {
        const db = dex_db(
            [
                ['0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
                ['0x12ede161c702d1494612d19f05992f43aa6a26fb', '0x06af07097c9eeb7fd685c692751d5c66db49c215', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
                ['0xa478c2975ab1ea89e8196811f51a7b7ade33eb11', '0x6b175474e89094c44da98b954eedeac495271d0f', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
                ['0x07f068ca326a469fc1d87d85d448990c8cba7df9', '0x408e41876cccdc0f92210600ef50372656052a38', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
                ['0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5', '0x6b175474e89094c44da98b954eedeac495271d0f', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
                ['0xce407cd7b95b39d3b4d53065e711e713dd5c5999', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xfa3e941d1f6b7b10ed84a0c211bfa8aee907965e']
            ]
        )

        const pairs = db.find_pairs_with_token('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'/*USDC*/)

        assert.equal(pairs[0], '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc')
        assert.equal(pairs[1], '0x07f068ca326a469fc1d87d85d448990c8cba7df9')
        assert.equal(pairs[2], '0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5')
    })
})
