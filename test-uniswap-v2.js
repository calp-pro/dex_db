const { describe, it, before, after } = require('node:test')
const fs = require('fs')
const assert = require('node:assert/strict')
const uniswap_v2_dump = require('uniswap-v2-dump')
const dex_db = require('./dex_db')

describe('Uniswap v2', () => {
    var db1
    var db2
    var db3
    var db4

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

    it('Save one by one using "index_save"', () => {
        db3 = dex_db()
    })

    it('Get all pairs with BAT at Uniswap v2 (resaved using "index_save")', () => {
        db1.get_all_pairs().forEach(pair => {
            const [token0, token1] = db1.get_tokens(pair)
            db3.index_save([pair, token0, token1], 'one_by_one')
        })

        const pairs1 = db1.find_pairs_with_token(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef'/*BAT*/
        )
        const pairs3 = db3.find_pairs_with_token(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef'/*BAT*/
        )
        assert.deepEqual(pairs1, pairs3)
    })
    
    it('Load', () => {
        db4 = dex_db()
        db4.load('one_by_one')
        const pairs1 = db1.find_pairs_with_token(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef'/*BAT*/
        )
        const pairs4 = db4.find_pairs_with_token(
            '0x0d8775f648430679a709e98d2b0cb6250d2887ef'/*BAT*/
        )
        assert.deepEqual(pairs1, pairs4)
    })
    
    after(() => {
        fs.unlinkSync('dump_p2tt.bin')
        fs.unlinkSync('dump_pairs.bin')
        fs.unlinkSync('dump_tokens.bin')
        fs.unlinkSync('one_by_one_p2tt.bin')
        fs.unlinkSync('one_by_one_pairs.bin')
        fs.unlinkSync('one_by_one_tokens.bin')
    })

})



