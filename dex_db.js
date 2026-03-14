// DexDB
// written 13 March 2026 by Vladimir Spirin at Danang, Vietnam
const rl = require('readline')

function dex_db(pairs = []) {
    const trie = {
        pairs: {},
        tokens: {}
    }
    const P = []//pairs
    const T = []//tokens
    const p2tt = []// [[it0, it1], ...]
    const t2pt = []// [ [[ip, it], [ip, it], ...], ...]

    const set = (address, index, trie) =>
        address.split('').reduce(
            (node, letter, i, a, last = i == a.length - 1) => {
                if (last)
                    node[letter] = index
                else
                    node[letter] ??= {}
                return node[letter]
            },
            trie
        )

    const get = (address, trie) => {
        const letters = address.split('')
        let node = trie
        for (let i = 0, letter; i < letters.length; i++) {
            letter = letters[i]
            if (node[letter] == undefined) return -1
            node = node[letter]
        }
        return node
    }

    const index = ([pair, token0, token1]) => {
        var ip = get(pair, trie.pairs)
        if (ip == -1) {
            ip = P.length
            P[ip] = pair
            set(pair, ip, trie.pairs)
        }
        var it0 = get(token0, trie.tokens)
        if (it0 == -1) {
            it0 = T.length
            T[it0] = token0
            set(token0, it0, trie.tokens)
        }
        var it1 = get(token1, trie.tokens)
        if (it1 == -1) {
            it1 = T.length
            T[it1] = token1
            set(token1, it1, trie.tokens)
        }
        p2tt[ip] ??= []
        p2tt[ip][0] = it0
        p2tt[ip][1] = it1
        
        if (t2pt[it0])
            t2pt[it0].push([ip, it1])
        else
            t2pt[it0] = [[ip, it1]]
            
        if (t2pt[it1])
            t2pt[it1].push([ip, it0])
        else
            t2pt[it1] = [[ip, it0]]
    }

    const find_pairs_with_token = token => {
        const it = get(token, trie.tokens)
        if (it == -1) return []
        return t2pt[it].map(pt => P[pt[0]])
    }

    const find_pairs_with_tokens = (token0, token1) => {
        const it0 = get(token0, trie.tokens)
        if (it0 == -1) return []
        const it1 = get(token1, trie.tokens)
        if (it1 == -1) return []
        return t2pt[it0].filter(pt => pt[1] == it1).map(pt => P[pt[0]])
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
