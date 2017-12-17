var okToLoadBalance = false;

var proxy = new Array(

// Add more proxies to load-balance!

__PROXY__,
"SOCKS5 127.0.0.1:1081; SOCKS 127.0.0.1:1081;",
"SOCKS5 127.0.0.1:1081; SOCKS 127.0.0.1:1082;",
"SOCKS5 127.0.0.1:1082; SOCKS 127.0.0.1:1083;"

);

var direct = "DIRECT;";
var ip_proxy = proxy[0];

/*
 * Copyright (C) 2015 - 2017 R0uter
 * https://github.com/R0uter/gfw_domain_whitelist
 */

var white_domains = __DOMAINS__;
white_domains['npls.io'] = 1;
white_domains['nextplus-inc.com'] = 1;

var subnetIpRangeList = [
    0, 1,
    167772160, 184549376,    // 10.0.0.0/8
    2886729728, 2887778304,  // 172.16.0.0/12
    3232235520, 3232301056,  // 192.168.0.0/16
    2130706432, 2130706688   // 127.0.0.0/24
];

var hasOwnProperty = Object.hasOwnProperty;

function check_ipv4(host) {
    // (TODO: ipv6)
    // http://home.deds.nl/~aeron/regex/

    var re_ipv4 = /^\d+\.\d+\.\d+\.\d+$/g;
    if (re_ipv4.test(host)) {
        // in theory, we can add chnroutes test here.
        // but that is probably too much an overkill.
        return true;
    }
}

function convertAddress (ipchars) {
    var bytes = ipchars.split('.');
    var result = (bytes[0] << 24) |
    (bytes[1] << 16) |
    (bytes[2] << 8) |
    (bytes[3]);

    return result >>> 0;
}

function isInSubnetRange (ipRange, intIp) {
    for (var i = 0; i < 10; i += 2) {
        if (ipRange[i] <= intIp && intIp < ipRange[i+1])
            return true;
    }
}

function getProxyFromDirectIP (strIp) {
    var intIp = convertAddress(strIp);

    if (isInSubnetRange(subnetIpRangeList, intIp)) {
        return direct;
    }

    return ip_proxy;
}

function FindProxyForURL (url, host) {
    var suffix;
    var pos = host.lastIndexOf('.');
}

function isInDomains (domain_dict, host) {
    var pos = host.lastIndexOf('.');
    var suffix = host.substring(pos + 1);

    if (suffix == "cn") {
        return true;
    }

    pos = host.lastIndexOf('.', pos - 1);

    while (true) {
        if (pos == -1) {
            if (hasOwnProperty.call(domain_dict, host)) {
                return true;
            } else {
                return false;
            }
        }

        suffix = host.substring(pos + 1);
        if (hasOwnProperty.call(domain_dict, suffix)) {
            return true;
        }

        pos = host.lastIndexOf('.', pos - 1);
    }
}

function loadBalance () {
    var random = 0;

    while (true) {
        random = Math.round((Math.random() * 10) - 1);
        if (random < proxy.length) {
            return proxy[random];
        }
    }
}

function FindProxyForURL (url, host) {
    if (isPlainHostName(host) === true) {
        return direct;
    }
    
    if (check_ipv4(host) === true) {
        return getProxyFromDirectIP(host);
    }

    if (isInDomains(white_domains, host) === true) {
        return direct;
    }
    
    if (okToLoadBalance) {
        return loadBalance();
    }
    return proxy[0];
}
