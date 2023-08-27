/*
-tcp server
-client auth
-database connection
-hex data parser

*/
import Connection from "./connection.mjs";
//import JNGE from './jnge.mjs';
import GNFL from './gnfl.mjs';


const myServerAddr = '192.168.88.254';
const myServerPort = 4309;
const tcpServer = new Connection('tcpServer', {host:myServerAddr, port:myServerPort}, readHandler);
const j = new GNFL('06');

function readHandler(client, data){
    var tdate = new Date();
    tdate = `${tdate.getHours()}:${tdate.getMinutes()}:${tdate.getSeconds()}.${tdate.getMilliseconds()}`;
    console.log(`${tdate}: Data from main: ${client}: ${data}`);
    var buf = Buffer.from(data, 'hex');
    var parsedData = j.parseData(buf);

    if (!parsedData) return;
    if (parsedData.devFuncCode == 0x12) {
        console.log('Active power:', j.getParameter(parsedData.devData, 0x1000, 0x1010, 1).dec.toFixed(2));
        console.log('PV power:', j.getParameter(parsedData.devData, 0x1000, 0x1023, 0.1).dec.toFixed(2));
        console.log('PV panel voltage:', j.getParameter(parsedData.devData, 0x1000, 0x1020, 0.1).dec.toFixed(2));
        console.log('Battery voltage:', j.getParameter(parsedData.devData, 0x1000, 0x1006, 0.1).dec.toFixed(2));
        
        var mainsChargerState = j.getParameter(parsedData.devData, 0x1000, 0x1008, 1);
        var inverterState = j.getParameter(parsedData.devData, 0x1000, 0x100C, 1);
        var pvChargerState = j.getParameter(parsedData.devData, 0x1000, 0x1022, 1);
        var inverterWorkingMode = j.getParameter(parsedData.devData, 0x1000, 0x1004, 1);
        var batteryType = j.getParameter(parsedData.devData, 0x1000, 0x1012, 1);
        var failureCode1 = j.getParameter(parsedData.devData, 0x1000, 0x101C, 1);
        var failureCode2 = j.getParameter(parsedData.devData, 0x1000, 0x101D, 1);
        var failureCodePV = j.getParameter(parsedData.devData, 0x1000, 0x101E, 1);
        var inverterInternalState = j.getParameter(parsedData.devData, 0x1000, 0x100D, 1);
        var batteryTemperaturePoint = j.getParameter(parsedData.devData, 0x1000, 0x1013, 1);
        var batteryTemperature = j.getParameter(parsedData.devData, 0x1000, 0x1014, 0.1);
        console.log( 'Main charger state:', j.getMainsChargerState(mainsChargerState.hex) );
        console.log( 'PV charger state:', j.getPvChargerState(pvChargerState.hex) );
        console.log( 'Battery temp:', batteryTemperature.dec.toFixed(1) );
        console.log( 'Battery temp compensation point:', batteryTemperaturePoint.dec );
        console.log( 'Inverter state:', j.getInverterState(inverterState.hex) );
        console.log( 'Inverter working mode:', j.getInverterWorkingMode(inverterWorkingMode.hex) );
        console.log( 'Battery type:', j.getBatteryType(batteryType.hex) );
        console.log( 'Failure Code 1:', j.getFailureCode1(failureCode1.hex) );
        console.log( 'Failure Code 2:', j.getFailureCode2(failureCode2.hex) );
        console.log( 'Failure Code PV:', j.getFailureCodePV(failureCodePV.hex) );

        //console.log( 'inverterInternalState:', j.getInverterInternalState(inverterInternalState.hex) );
    }
    if (parsedData.devFuncCode == 0x16) {
        var mainsChargeRate = j.getParameter(parsedData.devData, 0x1024, 0x103F, 0.01);
        console.log( 'Mains Charge Rate:', mainsChargeRate.dec.toFixed(1) );
    }
}
setInterval(()=>{
    let cmd = '061210000024BCA5';
    let rawHex = Buffer.from(cmd, 'hex');
    tcpServer.clients.forEach((socket,addr) => {
        tcpServer.write(addr, rawHex);
    });
    
}, 60000);





