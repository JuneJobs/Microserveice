
/**
 * @description Interface for the client request
 * @author Junhee Park (j.jobs1028/gmail.com, Qualcomm Institute)
 * @brief Microservice should work with other API nodes using same interface and packet format
 *        +--------+    +-----------+    +-----------+
 *        | Client | <- |***HTTP****| <- |   Micro   |
 *        |        | -> |**Gateway**| -> |  Service  |
 *        +--------+    +-----------+    +-----------+
 *        Http server as a http gateway
 * 
 * @since       2018. 06. 13.
 * @last update 2018. 06. 13.
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');
const tcpClient = require('./client');

var mapClients = {};
var mapUrls = {}
var mapResponse = {};
var mapRR = {};
var index = 0;


var server = http.createServer((req, res) => {
    var method = req.method;
    var uri = url.parse(req.url, true);
    var pathname = uri.pathname;
    //if not "GET" method
    if(method === "POST" || method === "PUT") {
        var body = "";

        req.on('data', function (data) { //Add strings from first and next data chunks
            body += data;
        });

        req.on('end', function () {     //Add the last chunks
            var params;
            //change the strings format to request
            if (req.headers['content-type'] == "application/json") {
                params = JSON.parse(body);
            } else {
                params = querystring.parse(body);
            }
            onRequest(res, method, pathname, params);
        });
    //if "GET" method
    } else {
        onRequest(res, method, pathname, uri.query);
    }
 }).listen(8000, () => {    //Start running the  web server and receive the requets on port 8080
    console.log('listen', server.address());

    var packet = {  //Packet for delivering distributor information 
        uri: "/distributes",
        method: "POST",
        key: 0,
        params: {
            port: 8000,
            name: "gate",
        urls: []
        }
    };
    var isConnectedDistributor = false;

    this.clientDistributor = new tcpClient (
        "127.0.0.1"
        , 9000
        , (options) => {    //Event for the distributor connected successful
            isConnectedDistributor = true;
            this.clientDistributor.write(packet);
        }
        , (options, data) => { onDistribute(data); }
        , (options) => { isConnectedDistributor = false }
        , (options) => { isConnectedDistributor = false }
    );
    
    setInterval(() => {     //Update distributor on connection by every interval 
        if (isConnectedDistributor != true) {
            this.clientDistributor.connect();
        }
    }, 3000);
});

function onRequest(res, method, pathname, params) {
    var key = method + pathname;
    var client = mapUrls[key];
    if (client == null) {       //If received API is not registered in the distributors 
        res.writeHead(404);
        res.end();
        return;
    } else {
        params.key = index;     //Allocate a new key for the API service
        var packet = {      
            uri: pathname,
            method: method,
            params: params
        };

        mapResponse[index] = res;   //Store response object in mapResponse (why?)
        index++;                    //Increase index number for the next API registration request

        if (mapRR[key] == null)     //Key round robin 
            mapRR[key] = 0;
        mapRR[key]++;
        client[mapRR[key] % client.length].write(packet);   //Request to the microservice
    }
}

function onDistribute (data) {      //Reveive the distributors data
    for (var n in data.params) {
        var node = data.params[n];
        var key = node.host + ":" + node.port;
        if (mapClients[key] == null && node.name != "gate") {
            var client = new tcpClient(node.host, node.port, onCreateClient, onReadClient, onEndClient, onErrorClient);
            mapClients[key] = {     //Store microservice configuration information
            client: client,
            info: node
        };
        for (var m in node.urls) {
            var key = node.urls[m];
            if (mapUrls[key] == null) { 
                mapUrls[key] = [];
            }
            mapUrls[key].push(client);
        }
        client.connect();
        }
    }
}

function onCreateClient(options){
    console.log("onCreateClient");
}

function onReadClient (options, packet) {       //Response from the microservice
    console.log("onReadClient", packet);
    mapResponse[packet.key].writeHead(200, { 'content-Type': 'application/json' });
    mapResponse[packet.key].end(JSON.stringify(packet));
    delete mapResponse[packet.key];             //Delete response object from the microservice
}

function onEndClient (options) {        //Delete information of the ended microservice
    var key = options.host + ":" + options.port;
    console.log("onEndClient", mapClients[key]);
    for (var n in mapClients[key].info.urls) {
        var node = mapClients[key].info.urls[n];
        delete mapUrls[node];
    }
    delete mapClients[key];
}

function onErrorClient(options) {
    console.log("onErrorClient");
}