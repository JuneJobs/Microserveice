'use strict'
/**
 * @description Monolithic goods management controller
 * @author Junhee Park (j.jobs1028/gmail.com, Qualcomm Institute)
 * @brief net documentation: https://nodejs.org/api/net.html
 * @since       2018. 06. 13.
 * @last update 2018. 06. 13.
 */

 exports.onRequest = function (res, method, pathname, params, cb) {
     switch(method) {
         case "POST":
            return "POST";
         case "GET":
            return "GET";
         case "DELETE":
            return "DELETE";
     }
 }