import JNGE from "./jnge.mjs";

class GNFL extends JNGE {
  currentInverterState = 0;
  currentChargerState = 0;
  currentMPPTstate = 0;
  #inverterWorkingMode = new Map();
  #batteryType = new Map();
  #inverterInternalState;
  #failureCode1;
  #failureCode2;
  #failureCodePV;
  #inverterState = new Map();
  #pvChargerState = new Map();
  #mainsChargerState = new Map();
  constructor(devAddress) {
    super(devAddress);
    this.#inverterWorkingMode.set((0).toString(16), "Smart mode");
    this.#inverterWorkingMode.set((0).toString(16), "Battery priority mode");
    this.#inverterWorkingMode.set((0).toString(16), "Municipal power priority mode" );
    this.#inverterWorkingMode.set((0).toString(16), "Energy-saving mode");

    this.#inverterState.set((0).toString(16), "Standby");
    this.#inverterState.set((1).toString(16), "Municipal electric charging soft start");
    this.#inverterState.set((2).toString(16), "The inverter has a soft start");
    this.#inverterState.set((3).toString(16), "Inverse runs normally");
    this.#inverterState.set((4).toString(16), "Municipal power bypass");
    this.#inverterState.set((5).toString(16), "Charging of municipal power bypass");
    this.#inverterState.set((6).toString(16), "Failure mode");
    this.#inverterState.set((7).toString(16), "Commissioning mode");

    this.#mainsChargerState.set(0, "Standby");
    this.#mainsChargerState.set(1, "Constant charge");
    this.#mainsChargerState.set(2, "Raise the charging");
    this.#mainsChargerState.set(3, "Full of it");

    this.#pvChargerState.set((0).toString(16), "Does not charge");
    this.#pvChargerState.set((1).toString(16), "MPPT charging");
    this.#pvChargerState.set((2).toString(16), "Boost charging");
    this.#pvChargerState.set((3).toString(16), "Floating charging");
    this.#pvChargerState.set((4).toString(16), "Balanced charging");

    this.#batteryType.set((0).toString(16), "Lead-acid battery");
    this.#batteryType.set((1).toString(16), "Colloidal battery");
    this.#batteryType.set((2).toString(16), "Ternary lithium battery");
    this.#batteryType.set((3).toString(16), "Lithium iron phosphate");
    this.#batteryType.set((4).toString(16), "Customized");

    this.#inverterInternalState = {
      mask: [
        { pos: 15, desc: "Reserved", 0: "", 1: "" },
        { pos: 14, desc: "Reserved", 0: "", 1: "" },
        { pos: 13, desc: "AC input slow start relay status", 0: "Open", 1: "Close"},
        { pos: 12, desc: "Fan running status", 0: "Stop", 1: "Run" },
        { pos: 11, desc: "EPO status", 0: "Invalid", 1: "Effective" },
        { pos: 10, desc: "Inverter phase-locked state", 0: "Unlocked in phase", 1: "Phase-locking" },
        { pos: 9, desc: "Bypass static switch", 0: "Open", 1: "Close" },
        { pos: 8, desc: "DC input delay relay status", 0: "Open", 1: "Close" },
        { pos: 7, desc: "DC Input relay status ", 0: "Open", 1: "Close" },
        { pos: 6, desc: "Inverter relay status", 0: "Open", 1: "Close" },
        { pos: 5, desc: "Bypass relay status", 0: "Open", 1: "Close" },
        { pos: 4, desc: "AC Input power supply status", 0: "Stop", 1: "Run" },
        { pos: 3, desc: "Energy-saving mode allows", 0: "Not allowed", 1: "Allow"},
        { pos: 2, desc: "AC mains charging is allowed", 0: "Not allowed", 1: "Allow" },
        { pos: 1, desc: "AC mains charging switch status", 0: "AC mains is charging", 1: "AC mains is not charging" },
        { pos: 0, desc: "Command to diesel engine", 0: "Stop", 1: "Start" },
      ],
    };
    this.#failureCode1 = {
      mask: [
        { pos: 0, desc: "Battery overvoltage" },
        { pos: 1, desc: "Battery overheated" },
        { pos: 2, desc: "Charging overcurrent" },
        { pos: 3, desc: "Charging soft start failed" },
        { pos: 4, desc: "Inverse charge soft overcurrent" },
        { pos: 5, desc: "Inverter overheated" },
        { pos: 6, desc: "Inverter short circuit" },
        { pos: 7, desc: "Output overload" },
        { pos: 8, desc: "Memory read/write error" },
        { pos: 9, desc: "Inverse soft start failed" },
        { pos: 10, desc: "Battery overvoltage" },
        { pos: 11, desc: "Inverter overvoltage" },
        { pos: 12, desc: "Serial port communication failure" },
        { pos: 13, desc: "Inverter hard overcurrent" },
        { pos: 14, desc: "Inverter radiator temperature sensor fails" },
        { pos: 15, desc: "Transformer overheated" },
      ],
    };
    this.#failureCode2 = {
      mask: [
        { pos: 0, desc: "AC input overvoltage" },
        { pos: 1, desc: "AC input undervoltage" },
        { pos: 2, desc: "Battery micro under voltage" },
        { pos: 3, desc: "Inverter relay fault" },
        { pos: 4, desc: "Bypass relay failt" },
        { pos: 5, desc: "Battery temperature sensor fails" },
        { pos: 6, desc: "CAN communication failure" },
        { pos: 7, desc: "Bus overvoltage" },
        { pos: 8, desc: "Bus undervoltage" },
        { pos: 9, desc: "Inverter Current zero point is abnormal" },
        { pos: 10, desc: "Inverter Voltage zero point is abnormal" },
        { pos: 11, desc: "Load voltage zero point is abnormal" },
        { pos: 12, desc: "Mains grid zero point is abnormal" },
        { pos: 13, desc: "Reserved" },
        { pos: 14, desc: "Reserved" },
        { pos: 15, desc: "Manual failure" },
      ],
    };
    this.#failureCodePV = {
      mask: [
        { pos: 0, desc: "Battery overvoltage" },
        { pos: 1, desc: "Battery not connected" },
        { pos: 2, desc: "PV array overvoltage" },
        { pos: 3, desc: "Controller short-circuit" },
        { pos: 4, desc: "Charging overcurrent" },
        { pos: 5, desc: "Controller overheated" },
        { pos: 6, desc: "Battery is overheated" },
        { pos: 7, desc: "Output overload" },
        { pos: 8, desc: "Memory error" },
        { pos: 9, desc: "Reserved" },
        { pos: 10, desc: "Reserved" },
        { pos: 11, desc: "Battery undervoltage" },
        { pos: 12, desc: "Controller temperature sensor fails" },
        { pos: 13, desc: "Battery temperature sensor fails" },
        { pos: 14, desc: "PV array undervoltage" },
        { pos: 15, desc: "Reserved" },
      ],
    };
  }
  //prepareCommand
  //readParamsSet
  //mainsChargerState
  getMainsChargerState(data){
    //0x1008 
    console.log('getMainsChargerState work with:', data);
    if (isNaN( parseInt(data) )) return null;
    if (!this.#mainsChargerState.has( data )) return null;

    return this.#mainsChargerState.get(data);
  }
  //inverterState
  //mpptState
  //getParam
  //printData
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
