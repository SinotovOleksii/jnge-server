import  net  from 'node:net'; 

class ConnectionImpl{
    constructor(){};
    read(){};
    write(){};
};

class TCPServer extends ConnectionImpl{
    server;
    sockets = new Map();
    readCallback;
    /**
    * Constructor
    * @param {options} object with property: host, port, readCallback
    */
    constructor(options, readCallback){ 
        super();
        this.read = readCallback;
        this.server = net.createServer({keepAlive: true, keepAliveInitialDelay: 60});
        this.server.listen({
            port: options.port,
            host: options.host
        }, () => {
            console.log(`Server starting at ${this.server._connectionKey}`);
        });
        this.server.on('listening', () => {
            console.log('Server listening event.');
        });
        this.server.on('error', (err)=>{
            console.log('Server error: ', err.toString());
            //process.exit(1);
        });
        this.server.on('close', ()=>{
            console.log('Server closed');
            //process.exit(1);
        });    
        this.server.on('connection', (socket) => {
            console.log(`New connection to server from ${socket.remoteAddress}:${socket.remotePort}`);
            this.sockets.set(`${socket.remoteAddress}:${socket.remotePort}`, socket); //add socet to Map
            //add eventhandlers for socket
            socket.on('close', ()=>{
                console.log(`Client closed ${socket.remoteAddress}:${socket.remotePort}`);
                this.sockets.delete(`${socket.remoteAddress}:${socket.remotePort}`);
            });
            socket.on('end', ()=>{
                console.log(`Client ended ${socket.remoteAddress}:${socket.remotePort}`);
                this.sockets.delete(`${socket.remoteAddress}:${socket.remotePort}`);
            });
            socket.on('error', (err)=>{
                console.log(`Connection ${socket.remoteAddress}:${socket.remotePort} has error: ${err.toString()}`);
            });
            socket.on('data', (chunk) => {
                var client = `${socket.remoteAddress}:${socket.remotePort}`;
                var data = chunk.toString('hex');
                //var tdate = new Date();
                //tdate = `${tdate.getHours()}:${tdate.getMinutes()}:${tdate.getSeconds()}.${tdate.getMilliseconds()}`;
                //console.log(`${tdate}: Data from tcp object: ${client}: ${data}`);
                return this.read(client, data);
            });
        });

    }

    write(client, data){
        if (!this.sockets.has(client)) return false;
        var socket = this.sockets.get(client);

        socket.write(data);
    }
};

class Connection{
    communicat;
    clients;
    /**
    * Constructor
    * @param {connectionType} string (tcpServer,...)
    * @param {connectionOption} object 
    */
    constructor(connectionType, connectionOption, readCallback){
        switch(connectionType){
            case 'tcpServer':
                this.read = readCallback;
                this.communicat = new TCPServer(connectionOption, this.read);
                this.clients = this.communicat.sockets;
                break;
            default:
                return null;
        };
    }
    write(...args){
        this.communicat.write(...args);
    }
    
};
/*
var srv = new Connection('tcpServer', {host: '192.168.88.254', port: 4309, readCallback: read});

function read(client, data){
    var tdate = new Date();
    tdate = `${tdate.getHours()}:${tdate.getMinutes()}:${tdate.getSeconds()}.${tdate.getMilliseconds()}`;
    console.log(`${tdate}: Data from callback: ${client}: ${data}`);
};

setInterval(()=>{
    let cmd = '061210000024BCA5';
    let rawHex = Buffer.from(cmd, 'hex');
    srv.clients.forEach((socket,addr) => {
        srv.write(addr, rawHex);
    });
    
}, 10000);

*/
export default Connection;