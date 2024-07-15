const loadbalancer = {}

loadbalancer.ROUND_ROBIN = (service) =>{
    // Suppose below is our registry the services is the testapi 
    // and now we will apply round robin on this service
    // "testapi": {
    //         "index" : 0,
    //         "instances" : [
    //             {
    //                 "apiName": "testapi",
    //                 "protocol": "http",
    //                 "host": "localhost",
    //                 "port": 3002,
    //                 "url": "http://localhost:3002/"
    //             }
    //         ]
    //     }

    // if index is longer then start again from 0
    const newIndex = ++service.index >= service.instances.length ? 0 : service.index;
    service.index = newIndex
    // we will return newIndex only if that api is enabled
    return loadbalancer.isEnabled(service, newIndex, loadbalancer.ROUND_ROBIN)
}


// Write algorithm for least used service
// we can do that using below
// loadbalancer.LEAST_USED = (service) =>{

// }


// health check mechanism to mark instances as down.
const checkHealth = async (url) => {
    try {
        await axios.get(url);
        return true;
    } catch (error) {
        return false;
    }
};

loadbalancer.isEnabled = async (service, index, loadbalancerStrategy) => {
    if (await checkHealth(service.instances[index].url)) {
        return index;
    } else {
        service.instances[index].enabled = false;
        return loadbalancerStrategy(service);
    }
};

module.exports = loadbalancer