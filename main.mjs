/*
-tcp server
-client auth
-database connection
-hex data parser

*/
import Connection from "./connection.mjs";
//import JNGE from './jnge.mjs';
import GNFL from './gnfl.mjs';
import datasaver from './datasaver.mjs'


const myServerAddr = '192.168.88.254';
const myServerPort = 4309;
const tcpServer = new Connection('tcpServer', {host:myServerAddr, port:myServerPort}, readHandler);
const j = new GNFL('06');
const databaseParams = {
    schemaName: 'jnge_test',
    dataTable: 'device_messages',
    usersTable: 'users'
};
const database = new datasaver('jnge_test',databaseParams);
if (!database.createTables()) { process.exit(1) }
    else { process.stdout.write(`Database created success.\n`) };

function readHandler(client, data){
    var tdate = new Date();
    tdate = `${tdate.getHours()}:${tdate.getMinutes()}:${tdate.getSeconds()}.${tdate.getMilliseconds()}`;
    process.stdout.write(`${tdate}: Data from main: ${client}: ${data}\n`);
    var buf = Buffer.from(data, 'hex');
    var parsedData = j.parseData(buf);
    if (!parsedData) return;

    database.saveDevData(parsedData);

    if (parsedData.devFuncCode == 0x12) {
        process.stdout.write(`Active power: ${j.getParameter(parsedData.devData, 0x1000, 0x1010, 1).dec.toFixed(2)}\n`);
        process.stdout.write(`PV power: ${j.getParameter(parsedData.devData, 0x1000, 0x1023, 0.1).dec.toFixed(2)}\n`);
        process.stdout.write(`PV panel voltage: ${j.getParameter(parsedData.devData, 0x1000, 0x1020, 0.1).dec.toFixed(2)}\n`);
        process.stdout.write(`Battery voltage: ${j.getParameter(parsedData.devData, 0x1000, 0x1006, 0.1).dec.toFixed(2)}\n`);
        
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
        process.stdout.write( `Main charger state: ${j.getMainsChargerState(mainsChargerState.hex)}\n` );
        process.stdout.write( `PV charger state: ${j.getPvChargerState(pvChargerState.hex)}\n` );
        process.stdout.write( `Battery temp: ${batteryTemperature.dec.toFixed(1)}\n` );
        process.stdout.write( `Battery temp compensation point: ${batteryTemperaturePoint.dec}\n` );
        process.stdout.write( `Inverter state: ${j.getInverterState(inverterState.hex)}\n` );
        process.stdout.write( `Inverter working mode: ${j.getInverterWorkingMode(inverterWorkingMode.hex)}\n` );
        process.stdout.write( `Battery type: ${j.getBatteryType(batteryType.hex)}\n` );
        process.stdout.write( `Failure Code 1: ${j.getFailureCode1(failureCode1.hex)}\n` );
        process.stdout.write( `Failure Code 2: ${j.getFailureCode2(failureCode2.hex)}\n` );
        process.stdout.write( `Failure Code PV: ${j.getFailureCodePV(failureCodePV.hex)}\n` );

        //process.stdout.write( 'inverterInternalState:', j.getInverterInternalState(inverterInternalState.hex) );
    }
    if (parsedData.devFuncCode == 0x16) {
        var mainsChargeRate = j.getParameter(parsedData.devData, 0x1024, 0x103F, 0.01);
        process.stdout.write( `Mains Charge Rate: ${mainsChargeRate.dec.toFixed(1)}\n` );
    }
}
setInterval(()=>{
    let cmd = '061210000024BCA5';
    let rawHex = Buffer.from(cmd, 'hex');
    tcpServer.clients.forEach((socket,addr) => {
        tcpServer.write(addr, rawHex);
    });
    
}, 600000);





