'use strict'
/**
 * @description Microservice goods management controller
 * @author Junhee Park (j.jobs1028/gmail.com, Qualcomm Institute)
 * @brief net documentation: https://nodejs.org/api/net.html
 * @since       2018. 06. 13.
 * @last update 2018. 06. 13.
 */

 const business = require("./goods.js");
 class goods extends require('../server_modules/server.js') {
     constructor() {
         super("goods"
              , process.argv[2] ? Number(process.argv[2]) : 9010
              , ["POST/goods", "GET/goods", "DELETE/goods"]
        );

        this.connectToDistributor("127.0.0.1", 9000, (data)=> {
            console.log("Distributor Notification", data);
        })
     }
 }

 new goods();