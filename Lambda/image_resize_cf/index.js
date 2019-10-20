const request = require('request');
const Sharp = require("sharp");

function resize_image(result, response){
    return new Promise((resolve, reject) => {
        const image = Sharp(result.body);
        image
        .metadata()
        .then(info => {
            var width = 0;
            if(result.viewer == 'smarttv' || result.viewer == 'desktop'){
                return image
                    .jpeg({
                        quality: 60
                    })
                    .toFormat(result.requiredFormat)
                    .toBuffer()
            } else if(result.viewer == 'tablet' && info.width > 1080){
                width = 1080;
                return image
                    .resize(width)
                    .toFormat(result.requiredFormat)
                    .toBuffer()
            } else if(result.viewer == 'mobile'&& info.width > 720){
                width = 720;
                return image
                    .resize(width)
                    .toFormat(result.requiredFormat)
                    .toBuffer()
            } else {
                return image
                    .jpeg({
                        quality: 60
                    })
                    .toFormat(result.requiredFormat)
                    .toBuffer()
            }
        })
        .then(data => {
            response.status = 200; 
            response.body = data.toString("base64");
            response.bodyEncoding = "base64";
            response.headers["content-type"] = [
            { key: "Content-Type", value: "image/" + result.requiredFormat }
            ];
            resolve(response);
        }).catch((err)=>{
            reject(err);
        })
    })
}

function get_requst(uri, headers){
    return new Promise((resolve, reject) => {
        var rst = {};
        request({uri, encoding: null}, (error, response, body) => {
            if(error)
            {
                reject(error)
            } 
            else{      
                if (!error && response.statusCode == 200) {
                    var extension = response.headers["content-type"].split('/');
                    const requiredFormat = extension[1] == "jpg" ? "jpeg" : extension[1];// sharp에서는 jpg 대신 jpeg사용합니다
                    var viewer = '';
                    try {       
                        if (headers['cloudfront-is-desktop-viewer']
                        && headers['cloudfront-is-desktop-viewer'][0].value === 'true') {
                            viewer = 'desktop'
                        } else if (headers['cloudfront-is-mobile-viewer']
                                && headers['cloudfront-is-mobile-viewer'][0].value === 'true') {
                            viewer = 'mobile'
                        } else if (headers['cloudfront-is-tablet-viewer']
                                && headers['cloudfront-is-tablet-viewer'][0].value === 'true') {
                            viewer = 'tablet'
                        } else if (headers['cloudfront-is-smarttv-viewer']
                                && headers['cloudfront-is-smarttv-viewer'][0].value === 'true') {
                            viewer = 'smarttv'
                        }
                        rst = {
                            body: body,
                            viewer : viewer,
                            requiredFormat: requiredFormat                          
                        }
                        resolve(rst);
                    }catch (error) {
                        reject(error);
                    }
                }
                else{
                    reject(error);
                }
            } 
        })
    });
}

exports.handler = async (event) => {
    const cf_request = event.Records[0].cf.request;
    const cf_response = event.Records[0].cf.response;
    const headers = cf_request.headers;
    const domain = cf_request.origin["custom"]["domainName"];
    const protocol = cf_request.origin["custom"]["protocol"]
    const uri = `${protocol}://${domain}/${cf_request.uri}`

    var result = await get_requst(uri, headers);

    result = await resize_image(result, cf_response);

    return result;
}