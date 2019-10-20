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
    let status = '301';
    let statusDescription = 'Found';
    
    
    if(req_url === '/'){
        var country = countryCode.toLowerCase();
        console.log(country);
        console.log("host : " + host);
        url = `${proto}://${host}/${country}/main.html`;
    }
    else{
        var splited_url = req_url.split('/');
        console.log(splited_url)
        console.log("host : " + host);
        if(ArrayCountry.includes(splited_url[1].toLowerCase())){
            var sub_uri = req_url.substr(4);
            if(sub_uri === ''){
                sub_uri = "main.html";
            }
            else if(sub_uri.substr(-1) === '/'){
                sub_uri = sub_uri.slice(0,-1)
            }
            console.log('sub_uri : ' + sub_uri)
            var country = splited_url[1].toLowerCase();
            url = `${proto}://${host}/${country}/${sub_uri}`;
        }
        else{
            console.log('else')
            url = `${proto}://${host}/${countryCode.toLowerCase()}${req_url}`;
            status = '301';
            statusDescription = '301 Moved Permanently';
        }
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
