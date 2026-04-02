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
        } else {
            return [ip, T.get(token0), T.get(token1)]
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

        return [ip, it0, it1]
    }

    const index_save = ([pair, token0, token1], filename = 'dump') => {
        if (pair.length != 42 || token0.length != 42 || token1.length != 42) return
        var ip = P.get(pair)
        if (ip == undefined) {
            P.set(pair, ip = P.size)
            aP.push(pair)
            fs.appendFileSync(filename + '_pairs.bin', Buffer.from(pair.slice(2), 'hex'))
        } else {
            return [ip, T.get(token0), T.get(token1)]
        }

        var it0 = T.get(token0)
        if (it0 == undefined) {
            T.set(token0, it0 = T.size)
            aT.push(token0)
            fs.appendFileSync(filename + '_tokens.bin', Buffer.from(token0.slice(2), 'hex'))
        }

        var it1 = T.get(token1)
        if (it1 == undefined) {
            T.set(token1, it1 = T.size)
            aT.push(token1)
            fs.appendFileSync(filename + '_tokens.bin', Buffer.from(token1.slice(2), 'hex'))
        }

        p2tt[ip * 2] = it0
        p2tt[ip * 2 + 1] = it1

        const buf = Buffer.allocUnsafe(6)
        writeUInt24LE(buf, it0, 0)
        writeUInt24LE(buf, it1, 3)
        fs.appendFileSync(filename + '_p2tt.bin', buf)        
        
        if (t2pt[it0])
            t2pt[it0].push(ip, it1)
        else
            t2pt[it0] = [ip, it1]
            
        if (t2pt[it1])
            t2pt[it1].push(ip, it0)
        else
            t2pt[it1] = [ip, it0]

        return [ip, it0, it1]
    }

    const get_pair_tokens = pair => {
        const tokens = Array(2)
        const ip = P.get(pair)
        if (ip == undefined) return tokens
        tokens[0] = aT[p2tt[ip * 2]]
        tokens[1] = aT[p2tt[ip * 2 + 1]]
        return tokens
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
        fs.writeFileSync(filename + '_pairs.bin', Buffer.concat(aP.map(a => Buffer.from(a.slice(2), 'hex'))))
        fs.writeFileSync(filename + '_tokens.bin', Buffer.concat(aT.map(a => Buffer.from(a.slice(2), 'hex'))))
        const bin = fs.openSync(filename + '_p2tt.bin', 'w')
        const buf = Buffer.allocUnsafe(6)
        for (var i = 0; i < p2tt.length; i += 2) {
            writeUInt24LE(buf, p2tt[i], 0)
            writeUInt24LE(buf, p2tt[i + 1], 3)
            fs.writeSync(bin, buf)
        }
        fs.closeSync(bin)
    }

    const sort = (fT, fP) => {
        fT ??= (a, b) =>
            t2pt[T.get(b)].length - t2pt[T.get(a)].length
        fP ??= (a, b) => {
            const ipA = P.get(a)
            const ipB = P.get(b)
            const it0A = p2tt[2 * ipA]
            const it1A = p2tt[2 * ipA + 1]
            const it0B = p2tt[2 * ipB]
            const it1B = p2tt[2 * ipB + 1]
            const connectionsA = t2pt[it0A].length + t2pt[it1A].length
            const connectionsB = t2pt[it0B].length + t2pt[it1B].length
            return connectionsB - connectionsA
        }
        const aTS = [...aT].sort(fT)
        const aPS = [...aP].sort(fP)

        const TS = new Map();
        for (let i = 0; i < aTS.length; i++) TS.set(aTS[i], i)

        const PS = new Map();
        for (let i = 0; i < aPS.length; i++) PS.set(aPS[i], i)
        
        const p2ttS = []
        const t2ptS = []

        for (var ipS = 0; ipS < aPS.length; ipS++) {
            var p = aPS[ipS]
            var ip = P.get(p)
            var it0 = p2tt[ip * 2]
            var it1 = p2tt[ip * 2 + 1]
            var t0 = aT[it0]
            var t1 = aT[it1]
            var it0S = TS.get(t0)
            var it1S = TS.get(t1)
            p2ttS[ipS * 2] = it0S
            p2ttS[ipS * 2 + 1] = it1S
            
            if (t2ptS[it0S])
                t2ptS[it0S].push(ipS, it1S)
            else
                t2ptS[it0S] = [ipS, it1S]
                
            if (t2ptS[it1S])
                t2ptS[it1S].push(ipS, it0S)
            else
                t2ptS[it1S] = [ipS, it0S]
        }

        aP = aPS
        aT = aTS
        p2tt = p2ttS
        t2pt = t2ptS
    }

    const load = (filename = 'dump') => {
        aP.length = 0
        aT.length = 0
        p2tt.length = 0
        t2pt.length = 0
        T = new Map()
        P = new Map()

        var buf = fs.readFileSync(filename + '_pairs.bin')
        for (var i = 0; i < buf.length; i += 20) {
            const pair = '0x' + buf.slice(i, i + 20).toString('hex')
            aP.push(pair)
            P.set(pair, i / 20)
        }
        buf = fs.readFileSync(filename + '_tokens.bin')
        for (var i = 0; i < buf.length; i += 20) {
            const token = '0x' + buf.slice(i, i + 20).toString('hex')
            aT.push(token)
            T.set(token, i / 20)
        }

        const bin = fs.openSync(filename + '_p2tt.bin', 'r')
        const { size } = fs.fstatSync(bin)
        buf = Buffer.allocUnsafe(6)
        
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
        index_save,
        find_pairs_with_token,
        find_pairs_with_tokens,
        save,
        load,
        sort,
        get_pair_tokens,
        get_all_pairs: () => aP,
        get_all_tokens: () => aT,
    }
}

module.exports = dex_db
