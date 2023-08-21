import  crc16modbus  from 'crc/crc16modbus';
import { Buffer } from 'node:buffer';


class JNGE{
    #devAddress;
    constructor(devAddress){
        this.#devAddress = devAddress;
    };
    /**
    * @description calcCRC(Buffer) calculate crc for buffer data
    * @param {Buffer} 
    * @return {Buffer} crc16modbus
    */
    calcCRC(data){
        var ccrc = Buffer.alloc(2, 0, 'hex');
        if (!Buffer.isBuffer(data)) {
            console.log('calcCRC() waits for buffer hex to calc CRC');
            return null;
        };
        if (data.length == 0) {
            console.log('calcCRC() waits for buffer lenght > 0');
            return null;
        };
        ccrc.writeUInt16LE((crc16modbus(data)));
        return ccrc;
    };
    /**
    * @description checkCRC(Buffer) check if crc is valid for buffer data (crc must be at last two bytes)
    * @param {Buffer} 
    * @return {boolean} boolean
    */
    checkCRC(data){ 
        if (!Buffer.isBuffer(data)) {
            console.log('checkCRC() waits for buffer hex to calc CRC');
            return false;
        }
        if (data.length == 0) {
            console.log('checkCRC() waits for buffer lenght > 0');
            return false;
        };
        const dataWOcrc =  data.subarray(0, data.length - 2); //read all data without crc 
        const dataCRC = data.subarray(data.length - 2, data.length); //read only CRC 2 bytes
        //console.log('data only: ', dataWOcrc.toString('hex'));
        //console.log('crc only: ', dataCRC.toString('hex'));
        if (Buffer.compare(this.calcCRC(dataWOcrc), dataCRC) != 0) {
            console.log('checkCRC() return invalid crc');
            return false; //invalid crc
        } else {
            console.log('checkCRC() return valid crc');
            return true;
        }
    };
    /**
    * @description parseData(Buffer) parsing data from device to object. Return null if any error
    * @param {Buffer} 
    * @return {object} {'devAddr', 'devFuncCode', 'devDataLen', 'devNumber', 'devData', 'devCRC'}
    */
    parseData(data){
        if (!Buffer.isBuffer(data)) {
            console.log('parseData() waits for buffer hex to parse');
            return null;
        }
        if (!this.checkCRC(data)) {
            console.log('parseData() calculate invalid crc');
            return null;
        }
        var parsedObj; //obj to return
        var addrPos=1; //standard position of bytes
        var funcPos=2;
        var dataLenPos=3;
        var devNumberPos = 7;
        var devNumberLen = 4;
        var devAddr, devDataLen, devCRC, devFuncCode, devData, devNumber; 
        devAddr = data.subarray(0, addrPos).toString('hex');
        devFuncCode = data.subarray(addrPos, funcPos).toString('hex');
        devDataLen = parseInt(data.subarray(funcPos, dataLenPos).toString('hex'), 16);
        devNumber = data.subarray(dataLenPos, devNumberPos);
        devData = data.subarray(devNumberPos, devDataLen - devNumberLen + devNumberPos);
        devCRC = data.subarray(data.length-2, data.length); //last two bytes
        parsedObj = {
            'devAddr'     : parseInt(devAddr, 16),
            'devFuncCode' : parseInt(devFuncCode, 16),
            'devDataLen'  : devDataLen,
            'devNumber'   : devNumber,
            'devData'     : devData,
            'devCRC'      : devCRC
        };
        return parsedObj;

    };
    /**
    * @description getParameter(Buffer, number, number, number) parsing data from device data value to readeble format. Return null if any error
    * @param {Buffer, number, number, number} 
    * @return object { 'hex': string, 'dec' : int }
    */
    getParameter(data, offsetAddr, paramAddr, coefficient){
        if (!Buffer.isBuffer(data)) {
            console.log('getParameter() waits for buffer hex to calc CRC');
            return null;
        };
        if (typeof offsetAddr != 'number' || typeof paramAddr != 'number' || typeof coefficient != 'number'){
            console.log('getParameter() waits for Number type of values of addresses');
            return null;
        }    
        if (paramAddr - offsetAddr < 0) {
            console.log('getParameter() address of parameter can\'t be lower than offset');
            return null;
        }
        if (paramAddr - offsetAddr >= data.length/2) {
            console.log('getParameter() address of parameter can\'t be biggest than data lenght');
            return null;
        }
        var paramIdx = paramAddr - offsetAddr;
        var paramRawData = parseInt(data.subarray(paramIdx*2, paramIdx*2+2).toString('hex'), 16);
        var paramValue = paramRawData * coefficient;
        console.log(`getParameter 0x${paramAddr.toString(16)} hex: 0x${paramRawData.toString(16)} val: ${paramValue.toFixed(2)}, coeff: ${coefficient}`);
        return {'hex': paramRawData, 'dec' : paramValue};
        //return  paramValue.toFixed(2);
        //return paramValue;
    };
};

export default JNGE;

/*
var g = new JNGE('66');
var a;
a = g.parseData(Buffer.from('06124c110003c7090108f50901138700000057011e0156000000001388000000039ff30000073000c800020001000000ef000000010c1c08fc0000000000000000000000000001035100480002082f2e92', 'hex'));
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