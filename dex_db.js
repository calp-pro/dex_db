// DexDB
// written 13 March 2026 by Vladimir Spirin at Danang, Vietnam
const fs = require('fs')

function writeUInt24LE(buf, value, offset) {
    value &= 0xffffff
    buf[offset] = value & 0xff
    buf[offset + 1] = (value >>> 8) & 0xff
    buf[offset + 2] = (value >>> 16) & 0xff
}

function readUInt24LE(buf, offset) {
    return buf[offset] |
           (buf[offset + 1] << 8) |
           (buf[offset + 2] << 16)
}

function dex_db(pairs = []) {
    var aP = []
    var aT = []
    var P = new Map()//pairs
    var T = new Map()//tokens
    var p2tt = []// [p1.it0, p1.it1, p2.it0, p2, it1, ...]
    var t2pt = []// [ [[ip, it], [ip, it], ...], ...]

    const index = ([pair, token0, token1]) => {
        var ip = P.get(pair)
        if (ip == undefined) {
            P.set(pair, ip = P.size)
            aP.push(pair)
        }

        var it0 = T.get(token0)
        if (it0 == undefined) {
            T.set(token0, it0 = T.size)
            aT.push(token0)
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
    
    const save = (filename = 'dump') => {
        fs.writeFileSync(filename + '_pairs.json', JSON.stringify(aP.map(a => a.slice(2))))
        fs.writeFileSync(filename + '_tokens.json', JSON.stringify(aT.map(a => a.slice(2))))
        const bin = fs.openSync(filename + '_p2tt.bin', 'w')
        const buf = Buffer.allocUnsafe(6)
        for (var i = 0; i < p2tt.length; i += 2) {
            writeUInt24LE(buf, p2tt[i], 0)
            writeUInt24LE(buf, p2tt[i + 1], 3)
            fs.writeSync(bin, buf)
        }
        fs.closeSync(bin)
    }

    const load = (filename = 'dump') => {
        aP.length = 0
        aT.length = 0
        p2tt.length = 0
        t2pt.length = 0
        T = new Map()
        P = new Map()
        aP = JSON.parse(fs.readFileSync(filename + '_pairs.json', 'utf8')).map(a => '0x' + a)
        aT = JSON.parse(fs.readFileSync(filename + '_tokens.json', 'utf8')).map(a => '0x' + a)
        aP.forEach((p, i) => P.set(p, i))
        aT.forEach((t, i) => T.set(t, i))

        const bin = fs.openSync(filename + '_p2tt.bin', 'r')
        const { size } = fs.fstatSync(bin)
        const buf = Buffer.allocUnsafe(6)
        
        for (var offset = 0, ip, it0, it1; offset < size; offset += 6) {
            fs.readSync(bin, buf, 0, 6, offset)
            ip = offset / 6
            it0 = readUInt24LE(buf, 0)
            it1 = readUInt24LE(buf, 3)
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

        fs.closeSync(bin)
    }
    
    pairs.forEach(index)
    
    return {
        index,
        find_pairs_with_token,
        find_pairs_with_tokens,
        save,
        load
    }
}

module.exports = dex_db
