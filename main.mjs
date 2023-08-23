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
        //console.log('Active power:');
        //j.getParameter(parsedData.devData, 0x1000, 0x1010, 1);
        //console.log('PV power:');
        //j.getParameter(parsedData.devData, 0x1000, 0x1023, 0.1);
        var mainsChargerState = j.getParameter(parsedData.devData, 0x1000, 0x1008, 1);
        var inverterState = j.getParameter(parsedData.devData, 0x1000, 0x100C, 1);
        var pvChargerState = j.getParameter(parsedData.devData, 0x1000, 0x1022, 1);
        var inverterWorkingMode = j.getParameter(parsedData.devData, 0x1000, 0x1004, 1);
        var batteryType = j.getParameter(parsedData.devData, 0x1000, 0x1012, 1);
        var failureCode1 = j.getParameter(parsedData.devData, 0x1000, 0x101C, 1);
        var failureCode2 = j.getParameter(parsedData.devData, 0x1000, 0x101D, 1);
        console.log( 'Main charger state:', j.getMainsChargerState(mainsChargerState.hex) );
        console.log( 'PV charger state:', j.getPvChargerState(pvChargerState.hex) );
        console.log( 'Inverter state:', j.getInverterState(inverterState.hex) );
        console.log( 'Inverter working mode:', j.getInverterWorkingMode(inverterWorkingMode.hex) );
        console.log( 'Battery type:', j.getBatteryType(batteryType.hex) );
        console.log( 'Failure Code 1:', j.getFailureCode1(failureCode1.hex) );
        console.log( 'Failure Code 2:', j.getFailureCode2(failureCode2.hex) );
    }
}






