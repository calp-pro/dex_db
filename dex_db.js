// DexDB
// written 13 March 2026 by Vladimir Spirin at Danang, Vietnam
const rl = require('readline')

function dex_db(pairs = []) {
    const aP = []
    const aT = []
    const P = new Map()//pairs
    const T = new Map()//tokens
    const p2tt = []// [p1.it0, p1.it1, p2.it0, p2, it1, ...]
    const t2pt = []// [ [[ip, it], [ip, it], ...], ...]

    const index = ([pair, token0, token1]) => {
        var ip = P.get(pair)
        if (ip == undefined) {
            P.set(pair, ip = P.size)
            aP.push(pair)
        }

        var it0 = T.get(token0)
        if (it0 == undefined) {
            T.set(token0, it0 = T.size)
            aT.push(token1)
        }

        var it1 = T.get(token1)
        if (it1 == undefined) {
            T.set(token1, it1 = T.size)
            aT.push(token1)
        }

        p2tt[ip * 2] = it0
        p2tt[ip * 2 + 1] = it1
        
        if (t2pt[it0])
            t2pt[it0].push(ip, it1)
        else
            t2pt[it0] = [ip, it1]
            
        if (t2pt[it1])
            t2pt[it1].push(ip, it0)
        else
            t2pt[it1] = [ip, it0]
    }

    const find_pairs_with_token = token => {
        const pairs = []
        const it = T.get(token)
        if (it == undefined) return pairs
        for (var i = 0; i < t2pt[it].length; i += 2)
            pairs.push(
                aP[t2pt[it][i]]
            )
        return pairs
    }

    const find_pairs_with_tokens = (token0, token1) => {
        const pairs = []
        const it0 = T.get(token0)
        if (it0 == undefined) return pairs
        const it1 = T.get(token1)
        if (it1 == undefined) return pairs
        for (var i = 0; i < t2pt[it0].length; i += 2)
            if (t2pt[it0][i + 1] == it1)
                pairs.push(
                    aP[t2pt[it0][i]]
                )
        return pairs
    }
    
    pairs.forEach(index)
    
    return {
        index,
        find_pairs_with_token,
        find_pairs_with_tokens,
        //save, TODO
        //load, TODO
    }
}

module.exports = dex_db
