const { describe, before, it } = require('node:test')
const assert = require('node:assert/strict')
const uniswap_v2_dump = require('uniswap-v2-dump')
const dex_db = require('./dex_db')

describe('Uniswap v2', () => {
    var db

    before(() =>
        uniswap_v2_dump.load({workers: 0})
        .then(pairs =>
            db = dex_db(
                pairs.map(({pair, token0, token1}) =>
                    [pair, token0, token1]
                )
            )
        )
    )

    it('Get all pairs with BAT at Uniswap v2', () => {
        const pairs = db.find_pairs_with_token(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef'/*BAT*/
        )
        assert.ok(pairs.length >= 40)
        assert.equal(pairs[0], '0xb6909b960dbbe7392d405429eb2b3649752b4838', 'BAT/WETH https://etherscan.io/address/0xaf4b3145ca0cadbd9454f5815ef5d221f828507e')
        assert.equal(pairs[1], '0x6929abd7931d0243777d3cd147fe863646a752ba', 'BAT/DAI https://etherscan.io/address/0x6929abd7931d0243777d3cd147fe863646a752ba')
    })

})



