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
        console.log( 'Main charger state:', j.getMainsChargerState(mainsChargerState.hex) );
    }
}






