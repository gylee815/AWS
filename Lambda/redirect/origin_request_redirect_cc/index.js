const countries_arr = require('./countries_arr.js');

exports.handler = async (event) => {
  
    const request = event.Records[0].cf.request;
    
    const headers = request.headers;
    const req_url = request.uri;
    
    const proto = headers['cloudfront-forwarded-proto'][0].value;
    const host = headers['host'][0].value;
    const countryCode = headers['cloudfront-viewer-country'][0].value;

    console.log("uri : " + req_url);
    
    var ArrayCountry = countries_arr;
    let url = '';
    let status = '';
    let statusDescription = '';

    var splited_url = req_url.split('/');
    console.log(splited_url)
    console.log("host : " + host);
    if(ArrayCountry.includes(splited_url[1].toLowerCase())){
        if(req_url.substr(-1) === '/' && req_url.substr(4) === ''){
            var new_req_url = splited_url[1].toLowerCase()
            url = `${proto}://${host}/${new_req_url.toLowerCase()}/main.html`;
            
            status = '301';
            statusDescription = '301 Moved Permanently';
            console.log(url)
        }
        else if(splited_url[2] === '?' || splited_url[2] === '' || splited_url[2] === '#'){
            console.log(splited_url[2])
            var new_req_url = splited_url[1].toLowerCase()
            url = `${proto}://${host}/${new_req_url.toLowerCase()}/main.html`;
            status = '301';
            statusDescription = '301 Moved Permanently';
            console.log(url)
        }
        else{
            return request;   
        }
    }
    else{
        console.log('else')
        url = `${proto}://${host}/${countryCode.toLowerCase()}${req_url}`;
        status = '301';
        statusDescription = '301 Moved Permanently';   
    }

    const response = {
        status: status,
        statusDescription: statusDescription,
        headers: {
            location: [{
                key: 'Location',
                value: url,
            }],
        },
    };
    
    return response;
};
