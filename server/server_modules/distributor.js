'use strict'
/**
 * @description Tcp Server Object distributor
 * @author Junhee Park (j.jobs1028/gmail.com, Qualcomm Institute)
 * @since       2018. 06. 12.
 * @last update 2018. 06. 13.
 */

 var map = {};
 /**
  * Extends tcpServer class to distributor class
  * 
  * Extends tcpServer class to distrbutor class. distributor exist for share each clients address.
  * When create a socket, the address and port information stored in the map object. 
  * 
  */

/**
 * Define protocol
 * 
 * [
 *    {
 *        "port": "port of the first node",
 *        "name": "name of the first node",
 *        "urls": [
 *            "first url of the first node",
 *            "second url of the first node"
 *            ...
 *        ],
 *        "host": "host of the first node"
 *    },
 *  {
 *        "port": "port of the second node",
 *        "name": "name of the second node",
 *        "urls": [
 *            "first url of the second node",
 *            "second url of the sencond node"
 *            ...
 *        ],
 *        "host": "host of the sencond node"
 *    },
 *    ...
 * ]
 */
 class distributor extends require('./server.js') {
     constructor() {
        super("distributor", 9000, ["POST/distributor", "GET/distributor"]); // (?) super
     }

     onCreate(socket) {
         console.log("onCreate", socket.remoteAddess, socket.remotePort);
         this.sendInfo(socket);
     }

     onClose(socket) {
         var key = socket.remoteAddess + ":" + socket.remotePort;
         console.log("onClose", socket.remoteAddess, socket.remotePort);
         delete map[key];
         this.sendInfo();
     }

     onRead(socket, json) {
         var key = socket.remoteAddess + ":" + socket.remotePort;
         console.log("OnRead", socket.remoteAddess, socket.remotePort, json);

         if(json.uri == "distributes" && json.method == "POST") {
             map[key] = {
                 socket: socket
             };
             map[key].info = jsonParam;
             map[key].info.host = socket.remoteAddess;
             this.sendInfo();
         }
     }

     write(socket, packet) {
         socket.write(JSON.stringify(packet) + '	');
     }

     sendInfo(socket) {
         var packet = {
             uri: "/distributes",
             method: "GET",
             key: 0,
             params: []
         };
         for (var n in map) {
             packet.params.push(map[n].info);
         }

         if (socket) {
             this.write(socket, packet);
         } else {
             for (var n in map) {
                 this.write(map[n].socket, packet);
             }
         }
     }
 }

 new distributor();