const { describe, it, before, after } = require('node:test')
const fs = require('fs')
const assert = require('node:assert/strict')
const uniswap_v2_dump = require('uniswap-v2-dump')
const dex_db = require('./dex_db')

describe('Uniswap v2', () => {
    var db1
    var db2

    before(() =>
        uniswap_v2_dump.load({workers: 0})
        .then(pairs =>
            db1 = dex_db(
                pairs.map(({pair, token0, token1}) =>
                    [pair, token0, token1]
                )
            )
        )
    )

    it('Get all pairs with BAT at Uniswap v2', () => {
        const pairs = db1.find_pairs_with_token(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef'/*BAT*/
        )
        assert.ok(pairs.length >= 40)
        assert.equal(pairs[0], '0xb6909b960dbbe7392d405429eb2b3649752b4838', 'BAT/WETH https://etherscan.io/address/0xaf4b3145ca0cadbd9454f5815ef5d221f828507e')
        assert.equal(pairs[1], '0x6929abd7931d0243777d3cd147fe863646a752ba', 'BAT/DAI https://etherscan.io/address/0x6929abd7931d0243777d3cd147fe863646a752ba')
    })
    
    it('Save', () => {
        db1.save()
    })
    
    it('Load', () => {
        db2 = dex_db()
        db2.load()
    })

    it('Get all pairs with BAT at Uniswap v2 (repeat same test with load data)', () => {
        const pairs1 = db1.find_pairs_with_token(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef'/*BAT*/
        )
        const pairs2 = db2.find_pairs_with_token(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef'/*BAT*/
        )
        assert.deepEqual(pairs1, pairs2)
    })
    
    after(() => {
        fs.unlinkSync('dump_p2tt.bin')
        fs.unlinkSync('dump_pairs.json')
        fs.unlinkSync('dump_tokens.json')
    })

})



