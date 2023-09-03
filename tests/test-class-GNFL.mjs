import GNFL from '../gnfl.mjs';
import  assert  from 'node:assert';
import { describe, it } from 'node:test';

const gnfl = new GNFL('06');
const validData = Buffer.from('06124c110003c708f7090008ee13870000007400ff0155000000001378000000039ff300000900010a00020004000000ff000000010c1c08fc000000000000000000000000000102e2001e000103000e2e', 'hex');
const parsedData = gnfl.parseData(validData);
const invalidData = Buffer.from('084c1100031111FFFF', 'hex')

describe('Test for class GNFL', ()=>{
    describe('Test getters', () => {
        it('Test getMainsChargerState with valid', () => {
            var expectedVal = 'Standby';
            var actualVal = gnfl.getMainsChargerState(0x0);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getMainsChargerState with unknown', () => {
            var expectedVal = 'unknown';
            var actualVal = gnfl.getMainsChargerState(0xFF);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getMainsChargerState with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getMainsChargerState('V4');
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Test getInverterState with valid', () => {
            var expectedVal = 'Inverse runs normally';
            var actualVal = gnfl.getInverterState(0x3);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getInverterState with unknown', () => {
            var expectedVal = 'unknown';
            var actualVal = gnfl.getInverterState(0xFF);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getInverterState with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getInverterState('V4');
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Test getPvChargerState with valid', () => {
            var expectedVal = 'Floating charging';
            var actualVal = gnfl.getPvChargerState(0x3);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getPvChargerState with unknown', () => {
            var expectedVal = 'unknown';
            var actualVal = gnfl.getPvChargerState(0xFF);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getPvChargerState with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getPvChargerState('V4');
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Test getInverterWorkingMode with valid', () => {
            var expectedVal = 'Smart mode';
            var actualVal = gnfl.getInverterWorkingMode(0x0);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getInverterWorkingMode with unknown', () => {
            var expectedVal = 'unknown';
            var actualVal = gnfl.getInverterWorkingMode(0xFF);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getInverterWorkingMode with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getInverterWorkingMode('V4');
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Test getBatteryType with valid', () => {
            var expectedVal = 'Lead-acid battery';
            var actualVal = gnfl.getBatteryType(0x0);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getBatteryType with unknown', () => {
            var expectedVal = 'unknown';
            var actualVal = gnfl.getBatteryType(0xFF);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getBatteryType with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getBatteryType('V4');
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Test getFailureCode1 with valid', () => {
            var expectedVal = 'Battery overheated,Inverter radiator temperature sensor fails';
            var actualVal = gnfl.getFailureCode1(0x4002);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getFailureCode1 with valid', () => {
            var expectedVal = 'no errors';
            var actualVal = gnfl.getFailureCode1(0x0);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getFailureCode1 with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getFailureCode1(0xFFFFFFFF);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getFailureCode1 with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getFailureCode1('V4');
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Test getFailureCode2 with valid', () => {
            var expectedVal = 'Reserved,AC input undervoltage';
            var actualVal = gnfl.getFailureCode2(0x4002);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getFailureCode2 with valid', () => {
            var expectedVal = 'no errors';
            var actualVal = gnfl.getFailureCode2(0x0);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getFailureCode2 with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getFailureCode2(0xFFFFFFFF);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getFailureCode2 with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getFailureCode2('V4');
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Test getInverterInternalState with valid', () => {
            var expectedVal = 'Manual failure : Disabled,Reserved: ,Reserved: ,Overload to bypass: Enabled,Failure clearing: No,Alarm is turned off: No,Single-machine or parallel: Single,Power on automatically: Disabled,EPO functionality : Disabled,AC mains frequency detection: Disabled,Automatic battery detection: Disabled,Bypass relay status: Open,Energy-saving mode allows: Not allowed,AC mains charging is allowed: Not allowed,AC mains charging switch status: AC mains is not charging,Command to diesel engine: Stop';
            var actualVal = gnfl.getInverterInternalState(0x4002);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getInverterInternalState with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getInverterInternalState(0xFFFFFFFF);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getInverterInternalState with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getInverterInternalState('V4');
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Test getFailureCodePV with valid', () => {
            var expectedVal = 'PV array undervoltage,Battery is not connected';
            var actualVal = gnfl.getFailureCodePV(0x4002);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getFailureCodePV with valid', () => {
            var expectedVal = 'no errors';
            var actualVal = gnfl.getFailureCodePV(0x0);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getFailureCodePV with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getFailureCodePV(0xFFFFFFFF);
            assert.strictEqual(actualVal, expectedVal);
        });
        it('Test getFailureCodePV with invalid', () => {
            var expectedVal = 'invalid data';
            var actualVal = gnfl.getFailureCodePV('V4');
            assert.strictEqual(actualVal, expectedVal);
        });

    });
});