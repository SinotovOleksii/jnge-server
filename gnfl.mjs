import JNGE from './jnge.mjs';

class GNFL extends JNGE {
    //currentInverterState = 0;
    //currentChargerState = 0;
    //currentMPPTstate = 0;
    static #inverterWorkingMode = new Map();
    static {
        this.#inverterWorkingMode.set(0, 'Smart mode');
        this.#inverterWorkingMode.set(1, 'Battery priority mode');
        this.#inverterWorkingMode.set(2, 'Municipal power priority mode' );
        this.#inverterWorkingMode.set(3, 'Energy-saving mode');
    }
    static #batteryType = new Map();
    static {
        this.#batteryType.set(0, 'Lead-acid battery');
        this.#batteryType.set(1, 'Colloidal battery');
        this.#batteryType.set(2, 'Ternary lithium battery');
        this.#batteryType.set(3, 'Lithium iron phosphate');
        this.#batteryType.set(4, 'Customized');
    }
    static #inverterInternalState;
    static {
        this.#inverterInternalState = [
            { desc: 'Manual failure ', 0: 'Disabled', 1: 'Enabled'},
            { desc: 'Reserved', 0: '', 1: '' },
            { desc: 'Reserved', 0: '', 1: '' },
            { desc: 'Overload to bypass', 0: 'Enabled', 1: 'Disabled' },
            { desc: 'Failure clearing', 0: 'No', 1: 'Clear' },
            { desc: 'Alarm is turned off', 0: 'No', 1: 'Yes' },
            { desc: 'Single-machine or parallel', 0: 'Single', 1: 'Parallel' },
            { desc: 'Power on automatically', 0: 'Disabled', 1: 'Enabled' },
            { desc: 'EPO functionality ', 0: 'Disabled', 1: 'Enabled' },
            { desc: 'AC mains frequency detection', 0: 'Disabled', 1: 'Enabled' },
            { desc: 'Automatic battery detection', 0: 'Disabled', 1: 'Enabled' },
            { desc: 'Bypass relay status', 0: 'Open', 1: 'Close' },
            { desc: 'Energy-saving mode allows', 0: 'Not allowed', 1: 'Allow'},
            { desc: 'AC mains charging is allowed', 0: 'Not allowed', 1: 'Allow' },
            { desc: 'AC mains charging switch status', 0: 'AC mains is charging', 1: 'AC mains is not charging' },
            { desc: 'Command to diesel engine', 0: 'Stop', 1: 'Start' }
        ];
    }
    static #failureCode1;
    static {
        this.#failureCode1 =  [
            'Battery overvoltage',
            'Battery overheated',
            'Charging overcurrent',
            'Charging soft start failed',
            'Inverse charge soft overcurrent',
            'Inverter overheated',
            'Inverter short circuit',
            'Output overload',
            'Memory read/write error',
            'Inverse soft start failed',
            'Battery overvoltage',
            'Inverter overvoltage',
            'Serial port communication failure',
            'Inverter hard overcurrent',
            'Inverter radiator temperature sensor fails',
            'Transformer overheated'
        ];
    }
    static #failureCode2;
    static {
        this.#failureCode2 = [
            'AC input overvoltage',
            'AC input undervoltage',
            'Battery micro under voltage',
            'Inverter relay fault',
            'Bypass relay failt',
            'Battery temperature sensor fails',
            'CAN communication failure',
            'Bus overvoltage',
            'Bus undervoltage',
            'Inverter Current zero point is abnormal',
            'Inverter Voltage zero point is abnormal',
            'Load voltage zero point is abnormal',
            'Mains grid zero point is abnormal',
            'Reserved',
            'Reserved',
            'Manual failure'
        ];
    }
    static #failureCodePV;
    static {
        this.#failureCodePV = [
            'Battery overvoltage',
            'Battery is not connected',
            'PV array overvoltage',
            'Controller short-circuit',
            'Charging overcurrent',
            'Controller overheated',
            'Battery is overheated',
            'Output overload',
            'Memory error',
            'Reserved',
            'Reserved',
            'Battery undervoltage',
            'Controller temperature sensor fails',
            'Battery temperature sensor fails',
            'PV array undervoltage',
            'Reserved',
        ];
    }
    static #inverterState = new Map();
    static {
        this.#inverterState.set(0, 'Standby');
        this.#inverterState.set(1, 'Municipal electric charging soft start');
        this.#inverterState.set(2, 'The inverter has a soft start');
        this.#inverterState.set(3, 'Inverse runs normally');
        this.#inverterState.set(4, 'Municipal power bypass');
        this.#inverterState.set(5, 'Charging of municipal power bypass');
        this.#inverterState.set(6, 'Failure mode');
        this.#inverterState.set(7, 'Commissioning mode');
    }

    static #pvChargerState = new Map();
    static {
        this.#pvChargerState.set(0, 'Does not charge');
        this.#pvChargerState.set(1, 'MPPT charging');
        this.#pvChargerState.set(2, 'Boost charging');
        this.#pvChargerState.set(3, 'Floating charging');
        this.#pvChargerState.set(4, 'Balanced charging');
    }
    static #mainsChargerState = new Map();
    static {
        this.#mainsChargerState.set(0, 'Standby');
        this.#mainsChargerState.set(1, 'Constant charge');
        this.#mainsChargerState.set(2, 'Raise the charging');
        this.#mainsChargerState.set(3, 'Full of it');
    }
    constructor(devAddress) {
        super(devAddress);
    }
    /**
  * @description getMainsChargerState(data) Return string with status. Return null if any error
  * @param number
  * @return string
  **/
    getMainsChargerState(data){
    //0x1008 
        if (isNaN( parseInt(data) )) return 'invalid data';
        if (!GNFL.#mainsChargerState.has( data )) return 'unknown';

        return GNFL.#mainsChargerState.get(data);
    }
    /**
  * @description getInverterState(data) Return string with status. Return null if any error
  * @param number
  * @return string
  **/
    getInverterState(data){
    //0x100C
        if (isNaN( parseInt(data) )) return 'invalid data';
        if (!GNFL.#inverterState.has( data )) return 'unknown';

        return GNFL.#inverterState.get(data);

    }
    /**
  * @description getPvChargerState(data) Return string with status. Return null if any error
  * @param number
  * @return string
  **/
    getPvChargerState(data){
    //0x1022 
        if (isNaN( parseInt(data) )) return 'invalid data';
        if (!GNFL.#pvChargerState.has( data )) return 'unknown';

        return GNFL.#pvChargerState.get(data);
    }
    /**
  * @description getInverterWorkingMode(data) Return string with status. Return null if any error
  * @param number
  * @return string
  **/
    getInverterWorkingMode(data){
    //0x1004
        if (isNaN( parseInt(data) )) return 'invalid data';
        if (!GNFL.#inverterWorkingMode.has( data )) return 'unknown';

        return GNFL.#inverterWorkingMode.get(data);
    }
    /**
  * @description getBatteryType(data) Return string with status.
  * @param number
  * @return string
  **/
    getBatteryType(data){
    //batteryType 0x1012
        if (isNaN( parseInt(data) )) return 'invalid data';
        if (!GNFL.#batteryType.has( data )) return 'unknown';

        return GNFL.#batteryType.get(data);
    }
    /**
  * @description getFailureCode1(data) Return string with status.
  * @param number
  * @return string
  **/
    getFailureCode1(mask){
    //failureCode1 0x101C
        if (isNaN( parseInt(mask) )) return 'invalid data';
        if (mask > 0xFFFF) return 'invalid data';

        var i = 0;
        var failerCodes = [];
        while (mask > 0 || i < GNFL.#failureCode1.length) {
            //console.log(msk);
            if (mask & 1) failerCodes.push(GNFL.#failureCode1[i]);
            mask  >>= 1;
            i += 1;
        }
        if (failerCodes.length == 0) failerCodes.push('no errors');
        return failerCodes.toString();

    }
    /**
    * @description getFailureCode2(data) Return string with status.
    * @param number
    * @return string
    **/
    getFailureCode2(mask){
    //failureCode1 0x101C
        if (isNaN( parseInt(mask) )) return 'invalid data';
        if (mask > 0xFFFF) return 'invalid data';

        var i = GNFL.#failureCode2.length-1;
        var failerCodes = [];
        while ( mask > 0 ) {
            if (mask & 1) failerCodes.push(GNFL.#failureCode2[i]);
            mask >>= 1;
            i -= 1;
        }
        if (failerCodes.length == 0) failerCodes.push('no errors');
        return failerCodes.toString();
    }
    /**
  * @description getInverterInternalState(data) Return string with status.
  * @param number
  * @return string
  **/
    getInverterInternalState(mask){
    //0x100D
        if (isNaN( parseInt(mask) )) return 'invalid data';
        if (mask > 0xFFFF) return 'invalid data';

        var i = 0;
        var internalState = [];
        while ( mask > 0 || i < GNFL.#inverterInternalState.length) {
            internalState.push(`${GNFL.#inverterInternalState[i].desc}: ${GNFL.#inverterInternalState[i][mask & 1]}`);
            mask >>= 1;
            i += 1;
        }
        if (internalState.length == 0) internalState.push('unknown');
        return internalState.toString();
    }
    /**
  * @description getFailureCodePV(data) Return string with status.
  * @param number
  * @return string
  **/
    getFailureCodePV(mask){
    //0x101E
        if (isNaN( parseInt(mask) )) return 'invalid data';
        if (mask > 0xFFFF) return 'invalid data';
    
        var i = GNFL.#failureCodePV.length-1;
        var failerCodes = [];
        while ( mask > 0 ) {
            if (mask & 1) failerCodes.push(GNFL.#failureCodePV[i]);
            mask >>= 1;
            i -= 1;
        }
        if (failerCodes.length == 0) failerCodes.push('no errors');
        return failerCodes.toString();
    }
}

export default GNFL;




/*
Did not realize
Inverter switch machine  status 0x1016
0 Shutdown
1 Start-on

PV fan 0x100B
0: The PV controller does not start the fan
1: PV controller start fan


PV controller switch machine status 0x101F
0 Shutdown
1 Start-on
*/

