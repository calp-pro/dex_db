const { describe, before, it } = require('node:test')
const assert = require('node:assert/strict')
const pancakeswap_dump = require('pancakeswap-dump')
const sushiswap_dump = require('sushiswap-dump')
const dex_db = require('./dex_db')

describe('DEX DB', () => {
    var db

    before(() =>
        Promise.all(
            [
                pancakeswap_dump,
                sushiswap_dump
            ].map(_ => _.load({workers: 0}))
        )
        .then(all_pairs =>
            db = dex_db(
                all_pairs.flatMap(pairs =>
                    pairs.map(({pair, token0, token1}) =>
                        [pair, token0, token1]
                    )
                )
            )
        )
    )

    it('Find arbitrage pairs addresses between WBTC/WETH tokens at PancakeSwap and SushiSwap', () => {
        debugger
        const pairs = db.find_pairs_with_tokens(
            '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'/*WBTC*/,
            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'/*WETH*/
        )
        assert.equal(pairs[0], '0x4ab6702b3ed3877e9b1f203f90cbef13d663b0e8', 'WBTC/WETH (Pancake) https://etherscan.io/address/0x4ab6702b3ed3877e9b1f203f90cbef13d663b0e8')
        assert.equal(pairs[1], '0xceff51756c56ceffca006cd410b03ffc46dd3a58', 'WBTC/WETH (Sushi) https://etherscan.io/address/0xceff51756c56ceffca006cd410b03ffc46dd3a58')
    })

    it('Get all pairs with BAT at PancakeSwap and SushiSwap', () => {
        const pairs = db.find_pairs_with_token(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef'/*BAT*/
        )
        assert.equal(pairs[0], '0xaf4b3145ca0cadbd9454f5815ef5d221f828507e', 'BAT/4TH (Pancake) https://etherscan.io/address/0xaf4b3145ca0cadbd9454f5815ef5d221f828507e')
        assert.equal(pairs[1], '0x998bf04788c1c631c0e02bd1eed3d945308bf0a3', 'BAT/WETH (Sushi) https://etherscan.io/address/0x998bf04788c1c631c0e02bd1eed3d945308bf0a3')
        assert.equal(pairs[2], '0x343036d87c813879b24076bb932187a845ea0989', 'BAT/MATIC (Sushi) https://etherscan.io/address/0x343036d87c813879b24076bb932187a845ea0989')
    })

    it('If address of token not indexed at DB then -1 (find_pairs_with_token)', () => {
        const pairs = db.find_pairs_with_token(
            '0x_some_address_which_have_not_loaded'
        )
        assert.equal(pairs.length, 0)
    })

    it('If address of first token not indexed at DB then -1 (find_pairs_with_tokens)', () => {
        const pairs = db.find_pairs_with_tokens(
            '0x_some_address_which_have_not_loaded',
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
        )
        assert.equal(pairs.length, 0)
    })

    it('If address of second token not indexed at DB then -1 (find_pairs_with_tokens)', () => {
        const pairs = db.find_pairs_with_tokens(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
            '0x_some_address_which_have_not_loaded'
        )
        assert.equal(pairs.length, 0)
    })
})



