import process from 'node:process';
import Connection from './connection.mjs';
import GNFL from './gnfl.mjs';
import datasaver from './datasaver.mjs';
import { Buffer } from 'node:buffer';
import { inspect } from 'node:util';

const myServerAddr = '192.168.88.254';
const myServerPort = 4309;
const tcpServer = new Connection('tcpServer', {host:myServerAddr, port:myServerPort}, readHandler);
const j = new GNFL('06');
const databaseParams = {
    schemaName: 'jnge_test',
    dataTable: 'device_messages',
    usersTable: 'users'
};
const database = new datasaver('jnge_test', databaseParams);
if (!database.createTables()) { process.exit(1); }
else { process.stdout.write('Database created success.\n'); }

function readHandler(client, data){
    var tdate = new Date();
    tdate = `${tdate.getHours()}:${tdate.getMinutes()}:${tdate.getSeconds()}.${tdate.getMilliseconds()}`;
    process.stdout.write(`${tdate}: Data from main: ${client}: ${data}\n`);
    var buf = Buffer.from(data, 'hex');
    var parsedData = j.parseData(buf);
    if (!parsedData) return;

    database.saveDevData(parsedData)
        .then((result) => {
            result ?. rowCount ? true : process.stdout.write(`Do you have any problem with the query?: ${inspect(result)}`);
        })
        .catch(error => process.stderr.write(`Database error occured: ${error}`));


    if (parsedData.devFuncCode == 0x12) {
        var mainsChargerState = j.getParameter(parsedData.devData, 0x1000, 0x1008, 1);
        var inverterState = j.getParameter(parsedData.devData, 0x1000, 0x100C, 1);
        var pvChargerState = j.getParameter(parsedData.devData, 0x1000, 0x1022, 1);
        var inverterWorkingMode = j.getParameter(parsedData.devData, 0x1000, 0x1004, 1);
        var failureCode1 = j.getParameter(parsedData.devData, 0x1000, 0x101C, 1);
        var failureCode2 = j.getParameter(parsedData.devData, 0x1000, 0x101D, 1);
        var failureCodePV = j.getParameter(parsedData.devData, 0x1000, 0x101E, 1);
        // var inverterInternalState = j.getParameter(parsedData.devData, 0x1000, 0x100D, 1);
        var batteryTemperature = j.getParameter(parsedData.devData, 0x1000, 0x1014, 0.1);

        process.stdout.write('--------------------------------------------------\n');
        process.stdout.write(`Load voltage: ${j.getParameter(parsedData.devData, 0x1000, 0x1002, 0.1).dec.toFixed(0)}\n`);
        process.stdout.write(`Municipal electric voltage: ${j.getParameter(parsedData.devData, 0x1000, 0x1001, 0.1).dec.toFixed(0)}\n`);
        process.stdout.write(`Inverse voltage: ${j.getParameter(parsedData.devData, 0x1000, 0x1000, 0.1).dec.toFixed(0)}\n`);
        process.stdout.write('--------------------------------------------------\n');
        process.stdout.write(`Voltage level: ${j.getParameter(parsedData.devData, 0x1000, 0x1019, 0.1).dec.toFixed(0)}\n`);
        process.stdout.write(`Current level: ${j.getParameter(parsedData.devData, 0x1000, 0x101A, 0.01).dec.toFixed(0)}\n`);
        process.stdout.write(`Inverse voltage setting: ${j.getParameter(parsedData.devData, 0x1000, 0x1018, 0.1).dec.toFixed(0)}\n`);
        process.stdout.write('--------------------------------------------------\n');
        process.stdout.write(`Active power: ${j.getParameter(parsedData.devData, 0x1000, 0x1010, 1).dec.toFixed(2)}\n`);
        process.stdout.write(`PV power: ${j.getParameter(parsedData.devData, 0x1000, 0x1023, 0.1).dec.toFixed(2)}\n`);
        process.stdout.write('--------------------------------------------------\n');
        process.stdout.write(`PV panel voltage: ${j.getParameter(parsedData.devData, 0x1000, 0x1020, 0.1).dec.toFixed(2)}\n`);
        process.stdout.write(`Battery voltage: ${j.getParameter(parsedData.devData, 0x1000, 0x1006, 0.1).dec.toFixed(2)}\n`);
        process.stdout.write( `Battery temp: ${batteryTemperature.dec.toFixed(1)}\n` );
        process.stdout.write('--------------------------------------------------\n');
        process.stdout.write(`Total discharge: ${j.getParameter(parsedData.devData, 0x1000, 0x100F, 0.1).dec.toFixed(2)}\n`);

        process.stdout.write('--------------------------------------------------\n');
        process.stdout.write( `Main charger state: ${j.getMainsChargerState(mainsChargerState.hex)}\n` );
        process.stdout.write( `PV charger state: ${j.getPvChargerState(pvChargerState.hex)}\n` );
        process.stdout.write( `Inverter state: ${j.getInverterState(inverterState.hex)}\n` );
        process.stdout.write( `Inverter working mode: ${j.getInverterWorkingMode(inverterWorkingMode.hex)}\n` );
        process.stdout.write( `Failure Code 1: ${j.getFailureCode1(failureCode1.hex)}\n` );
        process.stdout.write( `Failure Code 2: ${j.getFailureCode2(failureCode2.hex)}\n` );
        process.stdout.write( `Failure Code PV: ${j.getFailureCodePV(failureCodePV.hex)}\n` );
    //process.stdout.write( 'inverterInternalState:', j.getInverterInternalState(inverterInternalState.hex) );
    }
    if (parsedData.devFuncCode == 0x16) {
        var mainsChargeRate = j.getParameter(parsedData.devData, 0x1024, 0x103F, 0.01);
        process.stdout.write( `Mains Charge Rate: ${mainsChargeRate.dec.toFixed(1)}\n` );
        var fullRestartV = j.getParameter(parsedData.devData, 0x1024, 0x1040, 0.1);
        process.stdout.write( `Full of the restart V: ${fullRestartV.dec.toFixed(1)}\n` );
    }
}
setInterval(()=>{
    let cmd = '061210000024BCA5';
    let rawHex = Buffer.from(cmd, 'hex');
    tcpServer.clients.forEach((socket,addr) => {
        tcpServer.write(addr, rawHex);
    });
    
}, 600000);





