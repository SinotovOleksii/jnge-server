import Connection from "../connection.mjs";
import  net  from 'node:net'; 
import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { Buffer } from 'node:buffer';

const myServerAddr = '127.0.0.1';
const myServerPort = 4310;


describe('Tests for Connection class', () => {
    describe('Test connection class init', () =>{
        it('Create a connection instanse with incorrect', () => {
            var readHandler;
            var expectedVal = null;
            const tcpServer = new Connection('tcpServerError', {host:myServerAddr, port:myServerPort}, readHandler);
            var actualVal = tcpServer.connectionType;
            tcpServer.stop();
            assert.strictEqual(actualVal, expectedVal);
        });

        it('Create a connection instanse and test read/write', async () => {
            var expectedVal = 'ffff';
            return new Promise( (resolve, reject) => {
                var readCallback = (client, data) => {
                    tcpServer.stop();
                    console.log('data from client', data);
                    assert.strictEqual(data, expectedVal);
                    resolve();
                };
                const tcpServer = new Connection('tcpServer', {host:myServerAddr, port:myServerPort}, readCallback);
                const cl = net.createConnection({host: '127.0.0.1', port: 4310 }, () => {
                    // 'connect' listener.
                    console.log('connected to test server!');
                    cl.write(Buffer.from('FFFF', 'hex'));
                    cl.destroy();
                });
            } )


        });

    })
});