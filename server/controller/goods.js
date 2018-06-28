'use strict'
/**
 * @description Monolithic goods management controller
 * @author Junhee Park (j.jobs1028/gmail.com, Qualcomm Institute)
 * @brief net documentation: https://nodejs.org/api/net.html
 * @since       2018. 06. 13.
 * @last update 2018. 06. 14.
 */

/**
 * @method Call the micro service goods
 * @param method    method
 * @param pathname  URL
 * @param params    input parameters
 * @param cb        callback
 */
 exports.onRequest = function (res, method, pathname, params, cb) {
    switch(method) {
        case "POST":
        return "POST"
        case "GET":
            return inquery(method, pathname, params, (response)=> {
                process.nextTick(cb, res, response);
            });
        default :
            return "DELETE"
    }
 }
/**
 * @method goods inquery
 * @param method    method
 * @param pathname  URL
 * @param params    input parameters
 * @param cb        callback
 */
function inquery(method, pathname, params, cb) {
    var response = {
        key: params.key,
        errorcode: 0,
        errormessage: "success"
    };
    response.results = "success";
    cb(response);
}