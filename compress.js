function hexToBytes(hex) {
    if (hex.length % 2) hex = '0' + hex;

    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return out;
}

function bytesToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function trimLeadingZeros(bytes) {
    let i = 0;
    while (i < bytes.length && bytes[i] === 0) i++;
    return bytes.slice(i);
}

function bigIntToBytes(n) {
    let hex = n.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    return hexToBytes(hex);
}

function encode(addresses) {
    if (!addresses.length) return new Uint8Array();

    const sorted = [...addresses].sort();

    const chunks = [];

    // first address (20 bytes)
    const firstBytes = hexToBytes(sorted[0]);
    chunks.push(firstBytes);

    let prev = BigInt('0x' + sorted[0]);

    for (let i = 1; i < sorted.length; i++) {
        const curr = BigInt('0x' + sorted[i]);
        const delta = curr - prev;

        let deltaBytes = bigIntToBytes(delta);
        deltaBytes = trimLeadingZeros(deltaBytes);

        // length prefix (1 byte)
        const len = new Uint8Array([deltaBytes.length]);

        chunks.push(len, deltaBytes);

        prev = curr;
    }

    // concat all
    const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
    const result = new Uint8Array(totalLen);

    let offset = 0;
    for (const c of chunks) {
        result.set(c, offset);
        offset += c.length;
    }

    return result;
}

function decode(buffer) {
    if (!buffer.length) return [];

    const addresses = [];

    let offset = 0;

    // first address (20 bytes)
    const firstBytes = buffer.slice(offset, offset + 20);
    offset += 20;

    let prev = BigInt('0x' + bytesToHex(firstBytes));
    addresses.push(bytesToHex(firstBytes));

    while (offset < buffer.length) {
        const len = buffer[offset];
        offset += 1;

        const deltaBytes = buffer.slice(offset, offset + len);
        offset += len;

        const delta = BigInt('0x' + bytesToHex(deltaBytes));
        const curr = prev + delta;

        const hex = curr.toString(16).padStart(40, '0');
        addresses.push(hex);

        prev = curr;
    }

    return addresses;
}

module.exports.encode = encode
module.exports.decode = decode
