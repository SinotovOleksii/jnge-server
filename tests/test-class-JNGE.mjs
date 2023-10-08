import { describe, it } from 'node:test';
import assert from 'node:assert';
import JNGE from '../jnge.mjs';
import { Buffer } from 'node:buffer';

describe('Tests for JNGE class', () => {
    const jn = new JNGE('06');
    describe('Test CRC funstions', () => {
        it('Test calcCRC() for correct crc calculating', () => {
            var buf = Buffer.from('061210000024', 'hex');
            var crc = Buffer.from('BCA5', 'hex');
            var ccrc = jn.calcCRC(buf);
            assert.strictEqual(ccrc.toString('hex'), crc.toString('hex'));

            buf = Buffer.from('06124c110003c7090208dc08ff13870000005601130165000000001388000000039ff30000067e00c600020001000000f6000000010c1c08fc0000000000000000000000000001035b002700030450', 'hex');
            crc = Buffer.from('bd92', 'hex');
            ccrc = jn.calcCRC(buf);
            assert.strictEqual(ccrc.toString('hex'), crc.toString('hex'));
        });
  
        it('Test calcCRC() for invalid input values', () => {
            var result = jn.calcCRC('incorrect value');
            var expectedObj = null;
            assert.deepEqual(result, expectedObj);
        });

        it('Test checkCRC() for correct check of crc', () => {
            var buf = Buffer.from('0616102400274D6F', 'hex');
            var res = jn.checkCRC(buf);
            assert.strictEqual(res, true);

            buf = Buffer.from('0626102400274D6F', 'hex');
            res = jn.checkCRC(buf);
            assert.strictEqual(res, false);
        });

        it('Check input params for checkCRC()', () => {
            var res = jn.checkCRC('incorrect value');
            assert.strictEqual(res, false);
        });
    });

    describe('Test Parse funstions', () => {
        it('Test parseData() with invalid crc data', () => {
            var parsedObj = jn.parseData(Buffer.from('06180831000067102A093C2A86', 'hex'));
            var expectedObj = null;
            assert.deepEqual(parsedObj, expectedObj);
        });
    
        it('Test parseData() with valid data', () => {
            var parsedObj = jn.parseData(Buffer.from('06124c110003c70000090b090700000000000601040105000000001388000000049ff3000006e0000000020001000000eb000000010c1c08fc00000000000004000000000000010015000000000000d6c7', 'hex'));
            var expectedObj = {
                'devAddr'     : 0x06,
                'devFuncCode' : 0x12,
                'devDataLen'  : 0x4c,
                'devNumber'   : Buffer.from('110003c7', 'hex'),
                'devData'     : Buffer.from('0000090b090700000000000601040105000000001388000000049ff3000006e0000000020001000000eb000000010c1c08fc00000000000004000000000000010015000000000000', 'hex'),
                'devCRC'      : Buffer.from('d6c7', 'hex')
            };
            assert.deepEqual(parsedObj, expectedObj);
        });

        it('Test parseData() with invalid data', () => {
            var parsedObj = jn.parseData('invalid');
            var expectedObj = null;
            assert.deepEqual(parsedObj, expectedObj);

            parsedObj = jn.parseData(Buffer.from('invalid', 'hex'));
            assert.deepEqual(parsedObj, expectedObj);
        });

        it('Test getParameter() values: last, first and any in the middle', () => {
            var parsedObj = jn.parseData(Buffer.from('06124c110003c7090108f50901138700000057011e0156000000001388000000039ff30000073000c800020001000000ef000000010c1c08fc0000000000000000000000000001035100480002082f2e92', 'hex'));
            var expectedVal = 200.00;
            var parsedValue = jn.getParameter(parsedObj.devData, 0x1000, 0x1010, 1);
            assert.deepEqual(parsedValue.dec.toFixed(2), expectedVal);

            expectedVal = 230.50;
            parsedValue = jn.getParameter(parsedObj.devData, 0x1000, 0x1000, 0.1);
            assert.deepEqual(parsedValue.dec.toFixed(2), expectedVal);

            expectedVal = 209.50;
            parsedValue = jn.getParameter(parsedObj.devData, 0x1000, 0x1023, 0.1);
            assert.deepEqual(parsedValue.dec.toFixed(2), expectedVal);
        });

        it('Test getParameter() not existed value', () => {
            var parsedObj = jn.parseData(Buffer.from('06124c110003c7090108f50901138700000057011e0156000000001388000000039ff30000073000c800020001000000ef000000010c1c08fc0000000000000000000000000001035100480002082f2e92', 'hex'));
            var expectedVal = null;
            var parsedValue = jn.getParameter(parsedObj.devData, 0x1000, 0x1024, 0.1);
            assert.deepEqual(parsedValue, expectedVal);

            parsedValue = jn.getParameter(parsedObj.devData, 0x1024, 0x1010, 0.1);
            assert.deepEqual(parsedValue, expectedVal);
        });

        it('Test getParameter() incorrect input values', () => {
            var parsedObj = jn.parseData(Buffer.from('06124c110003c7090108f50901138700000057011e0156000000001388000000039ff30000073000c800020001000000ef000000010c1c08fc0000000000000000000000000001035100480002082f2e92', 'hex'));
            var expectedVal = null;
            var parsedValue = jn.getParameter(parsedObj.devData, '1000', 0x1023, 0.1);
            assert.deepEqual(parsedValue, expectedVal);

            parsedValue = jn.getParameter(parsedObj.devData, 0x1000, '0x1023', 0.1);
            assert.deepEqual(parsedValue, expectedVal);

            parsedValue = jn.getParameter(parsedObj.devData, 0x1000, 0x1023, '0.1');
            assert.deepEqual(parsedValue, expectedVal);

            parsedValue = jn.getParameter('06124c110003c7090108f50901138700000057011e0156', 0x1000, 0x1023, 0.1);
            assert.deepEqual(parsedValue, expectedVal);
        });
    });
}); 

              

