import Connection from "../connection.mjs";
import { describe, it } from 'node:test';
import assert from 'node:assert';

const myServerAddr = '0.0.0.0';
const myServerPort = 4309;


describe('Tests for Connection class', () => {
    describe('Test connection calss init', () =>{
        it('Create a connection instanse', () => {
            var readHandler;
            const tcpServer = new Connection('tcpServerError', {host:myServerAddr, port:myServerPort}, readHandler);
            assert.strictEqual(tcpServer, null);
        })
    })
});