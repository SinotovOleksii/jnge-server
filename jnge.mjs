import  crc16modbus  from 'crc/crc16modbus';
import { Buffer } from 'node:buffer';
import process from 'node:process';

class JNGE{
    #devAddress;
    #minPacketLength = 8;
    constructor(devAddress){
        this.#devAddress = devAddress;
    }
    /**
    * @description calcCRC(Buffer) calculate crc for buffer data
    * @param {Buffer} 
    * @return {Buffer} crc16modbus
    */
    calcCRC(data){
        var ccrc = Buffer.alloc(2, 0, 'hex');
        if (!Buffer.isBuffer(data)) {
            process.stderr.write('calcCRC() waits for buffer hex to calc CRC\n');
            return null;
        }
        if (data.length < 2) {
            process.stderr.write('calcCRC() waits for buffer lenght > 1\n');
            return null;
        }
        ccrc.writeUInt16LE((crc16modbus(data)));
        return ccrc;
    }
    /**
    * @description checkCRC(Buffer) check if crc is valid for buffer data (crc must be at last two bytes)
    * @param {Buffer} 
    * @return {boolean} boolean
    */
    checkCRC(data){ 
        if (!Buffer.isBuffer(data)) {
            process.stderr.write('checkCRC() waits for buffer hex to calc CRC\n');
            return false;
        }
        if (data.length < 4) {
            process.stderr.write('checkCRC() waits for buffer lenght > 3\n');
            return false;
        }
        const dataWOcrc =  data.subarray(0, data.length - 2); //read all data without crc 
        const dataCRC = data.subarray(data.length - 2, data.length); //read only CRC 2 bytes
        //console.log('data only: ', dataWOcrc.toString('hex'));
        //console.log('crc only: ', dataCRC.toString('hex'));
        if (Buffer.compare(this.calcCRC(dataWOcrc), dataCRC) != 0) {
            process.stderr.write('checkCRC() return invalid crc\n');
            return false; //invalid crc
        } else {
            //process.stderr.write('checkCRC() return valid crc');
            return true;
        }
    }
    /**
    * @description parseData(Buffer) parsing data from device to object. Return null if any error
    * @param {Buffer} 
    * @return {object} {'devAddr', 'devFuncCode', 'devDataLen', 'devNumber', 'devData', 'devCRC'}
    */
    parseData(data){
        if (!Buffer.isBuffer(data)) {
            process.stderr.write('parseData() waits for buffer hex to parse\n');
            return null;
        }
        if (!this.checkCRC(data)) {
            process.stderr.write('parseData() calculate invalid crc\n');
            return null;
        }
        if (data.length < this.#minPacketLength) {
            process.stderr.write(`parseData() waits for buffer lenght >= ${this.#minPacketLength}\n`);
            return null;
        }
        var addrPos=0; //standard positions of bytes
        var addrLen = 1;
        var funcPos=1;
        var funcLen = 1;
        var dataLenPos = 2;
        var dataLenLen = 1;
        var devNumberPos = 3;
        var devNumberLen = 4;
        var msgCRCLen = 2;
        var devAddr = data.subarray(addrPos, addrLen).toString('hex');
        var devFuncCode = data.subarray(funcPos, funcPos + funcLen).toString('hex');
        var devDataLen = parseInt(data.subarray(dataLenPos, dataLenPos+dataLenLen).toString('hex'), 16);
        if (devDataLen > data.length - devNumberPos - msgCRCLen) {
            process.stderr.write(`parseData() devDataLen ${devDataLen.toString()} is over limit msg length`);
            return null;
        }
        var devNumber = data.subarray(devNumberPos, devNumberPos + devNumberLen);
        var devData = data.subarray(devNumberPos + devNumberLen, devDataLen + devNumberPos);
        var devCRC = data.subarray(data.length-msgCRCLen, data.length); //last two bytes
        var parsedObj = {
            'devAddr'     : parseInt(devAddr, 16),
            'devFuncCode' : parseInt(devFuncCode, 16),
            'devDataLen'  : devDataLen,
            'devNumber'   : devNumber,
            'devData'     : devData,
            'devCRC'      : devCRC
        };
        return parsedObj;

    }
    /**
    * @description getParameter(Buffer, number, number, number) parsing data from device data value to readeble format. Return null if any error
    * @param {Buffer, number, number, number} 
    * @return object { 'hex': string, 'dec' : int }
    */
    getParameter(data, offsetAddr, paramAddr, coefficient){
        if (!Buffer.isBuffer(data)) {
            process.stderr.write('getParameter() waits for buffer hex to calc CRC\n');
            return null;
        }
        if (typeof offsetAddr != 'number' || typeof paramAddr != 'number' || typeof coefficient != 'number'){
            process.stderr.write('getParameter() waits for Number type of values of addresses\n');
            return null;
        }    
        if (paramAddr - offsetAddr < 0) {
            process.stderr.write('getParameter() address of parameter can\'t be lower than offset\n');
            return null;
        }
        if (paramAddr - offsetAddr >= data.length/2) {
            process.stderr.write('getParameter() address of parameter can\'t be biggest than data lenght\n');
            return null;
        }
        var paramIdx = paramAddr - offsetAddr;
        var paramRawData = parseInt(data.subarray(paramIdx*2, paramIdx*2+2).toString('hex'), 16);
        var paramValue = paramRawData * coefficient;
        //console.log(`getParameter 0x${paramAddr.toString(16)} hex: 0x${paramRawData.toString(16)} val: ${paramValue.toFixed(2)}, coeff: ${coefficient}`);
        return {'hex': paramRawData, 'dec' : paramValue};
    //return  paramValue.toFixed(2);
    //return paramValue;
    }
}

export default JNGE;

/*
var g = new JNGE('66');
var a;
//a = g.parseData(Buffer.from('06124c110003c7090108f50901138700000057011e0156000000001388000000039ff30000073000c800020001000000ef000000010c1c08fc0000000000000000000000000001035100480002082f2e92', 'hex'));
a = g.parseData(Buffer.from('061808110003c7103801040faf', 'hex'));
g.calcCRC(Buffer.from('', 'hex'));
console.log('a:', a);
console.log(a.devAddr.toString(16));
console.log(a.devFuncCode.toString(16));
console.log(a.devDataLen.toString(16));
console.log(a.devNumber.toString('hex'));
console.log(a.devData.toString('hex'));
console.log(a.devCRC.toString('hex'));
console.log('------------------------');

g.getParameter(a.devData, 0x1000, 0x1011, 1);
*/




//06124c110003c7090108f50901138700000057011e0156000000001388000000039ff30000073000c800020001000000ef000000010c1c08fc0000000000000000000000000001035100480002082f2e92
//06124c110003c70000090d090a00000000000701040105000000001388000000049ff3000006e0000000020001000000eb000000010c1c08fc00000000000004000000000000010015000000000000efcd
//061652110003c70136012a012c01200108011400cc010600d8000100030002000100069ff30439064a0b690a3e012c010400010000000001f400c80001177000fa0000000000000000000000000000000000000000b451
//06124c110003c70000090b090700000000000601040105000000001388000000049ff3000006e0000000020001000000eb000000010c1c08fc00000000000004000000000000010015000000000000d6c7
//06180831000067102A093C2A86

//06 18 08 4c 11 00 03 11 11 FF FF EA 3E - correct response
//06 18 01 4c 11 00 03 11 11 FF FF 80 6E  -set data len to 1
//06 18 00 4c 11 00 03 CF FC 76 44 - set data len to 0
//06 18 43 4c 11 00 03 11 11 FF FF A8 CD - over limit data len