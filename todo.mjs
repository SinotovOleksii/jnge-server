var a = {};
var b = {};
//console.log(a.devCRC);

var expectedObj = {
    'devAddr'     : 0x06,
    'devFuncCode' : 0x12,
    'devDataLen'  : 0x4c,
    'devNumber'   : Buffer.from('110003c7', 'hex'),
    'devData'     : Buffer.from('0000090b090700000000000601040105000000001388000000049ff3000006e0000000020001000000eb000000010c1c08fc00000000000004000000000000010015000000000000', 'hex'),
    'devCRC'      : Buffer.from('d6c7', 'hex')
};

for  (const [key, val] of Object.entries(expectedObj)){
    if (Buffer.isBuffer(val)){
        b[key] = val.toString('hex');
    } else {
        b[key] = val.toString();
    }
}

console.log('a:', JSON.stringify(b));

//create new class to extend connection with serialize deserialize
//write read methods