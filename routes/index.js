const express = require("express")
const router = express.Router() 
const axios = require('axios')
const registry = require('./registry.json')
const fs = require('fs')
const loadbalancer = require("../util/loadbalancer")
const Joi = require('joi'); // validate incoming requests

const registerSchema = Joi.object({
    apiName: Joi.string().required(),
    protocol: Joi.string().valid('http', 'https').required(),
    host: Joi.string().hostname().required(),
    port: Joi.number().port().required()
});

// Enabling/Disabling api instances
// need to write this at top 
// Same route will disable the api instance
router.post('/enable/:apiName', (req, res)=>{
    const apiName = req.params.apiName
    const reqBody = req.body
    const instances  = registry.services[apiName].instances

    // get the instance of apiname
    const index = instances.findIndex((srv)=>{
        return srv.url === reqBody.url
    })

    if(index == -1){
        res.send({ status: 'error', message: `Could not find [${reqBody.url}] for service ${apiName}`})
    }
    else{
        instances[index].enabled = reqBody.enabled
        fs.writeFile('./routes/registry.json', JSON.stringify(registry, null, 2), (err) => {
            if (err) {
                res.status(500).send(`Could not enable/disable ${reqBody.url} for service ${apiName}\n${err}`);
            } else {
                res.send(`Successfully enabled/disabled '${apiName}'`);
            }
        });
    }
})


// all means all http methods
router.all("/:apiName/:path(*)?", (req, res) => {
    const service = registry.services[req.params.apiName];
    if (service) {
        const newIndex = loadbalancer[service.loadBalancerStrategy](service);
        const url = service.instances[newIndex].url + (req.params.path || "");
        axios({
            method: req.method,
            url: url,
            headers: req.headers,
            data: req.body
        }).then(response => {
            res.send(response.data);
        }).catch(err => {
            if (err.response) {
                res.status(err.response.status).send(err.response.data);
            } else if (err.request) {
                res.status(500).send('Service unavailable');
            } else {
                res.status(500).send('Internal server error');
            }
        });
    } else {
        res.status(404).send('API Name does not exist');
    }
});


// router.post('/register', (req, res) => {
//     console.log("Received registration request:", req.body);
//     const registrationInfo = req.body;
//     registrationInfo.url = `${registrationInfo.protocol}://${registrationInfo.host}:${registrationInfo.port}/`;

//     if (apiAlreadyExists(registrationInfo)) {
//         res.send(`Configuration already exists for '${registrationInfo.apiName}' at '${registrationInfo.url}'`);
//     } else {
//         if (!registry.services[registrationInfo.apiName]) {
//             registry.services[registrationInfo.apiName] = {
//                 loadBalanceStrategy: "ROUND_ROBIN",
//                 index: 0,
//                 instances: []
//             };
//         }
//         registry.services[registrationInfo.apiName].instances.push({ ...registrationInfo });

//         fs.writeFile('./routes/registry.json', JSON.stringify(registry, null, 2), (err) => {
//             if (err) {
//                 res.status(500).send(`Could not register ${registrationInfo.apiName}\n${err}`);
//             } else {
//                 res.send(`Successfully registered '${registrationInfo.apiName}'`);
//             }
//         });
//     }
// });

router.post('/register', (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const registrationInfo = req.body;
    registrationInfo.url = `${registrationInfo.protocol}://${registrationInfo.host}:${registrationInfo.port}/`;

    if (apiAlreadyExists(registrationInfo)) {
        res.send(`Configuration already exists for '${registrationInfo.apiName}' at '${registrationInfo.url}'`);
    } else {
        if (!registry.services[registrationInfo.apiName]) {
            registry.services[registrationInfo.apiName] = {
                loadBalanceStrategy: "ROUND_ROBIN",
                index: 0,
                instances: []
            };
        }
        registry.services[registrationInfo.apiName].instances.push({ ...registrationInfo });

        fs.writeFile('./routes/registry.json', JSON.stringify(registry, null, 2), (err) => {
            if (err) {
                res.status(500).send(`Could not register ${registrationInfo.apiName}\n${err}`);
            } else {
                res.send(`Successfully registered '${registrationInfo.apiName}'`);
            }
        });
    }
});

router.post('/unregister', (req, res)=>{
    const registrationInfo = req.body
    // we will take apiname and url from registrationinfo and check if they exists in our registry
    // if exists then remove it
    if(apiAlreadyExists(registrationInfo)){
        const index = registry.services[registrationInfo.apiName].instances.findIndex((instance)=>{
            return registrationInfo.url === instance.url
        })

        if(index > -1){
            registry.services[registrationInfo.apiName].instances.splice(index, 1)
            fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err)=>{
                if(err){
                    res.send("Could not unregister" + registrationInfo.apiName +"\n" + err)
                }
                else{
                    res.send("Successfully unregistered '" + registrationInfo.apiName + "'")
                }
            })
        }
        else {
            res.status(404).send(`Service not found for '${registrationInfo.apiName}' at '${registrationInfo.url}'`);
        }
    } else {
        res.status(404).send(`Service not found for '${registrationInfo.apiName}' at '${registrationInfo.url}'`);
    }

})

const apiAlreadyExists = (registrationInfo)=>{
    // In future we can use map here to make check for instance already exists or not
    // let exist = false;
    // registry.services[registrationInfo.apiName].forEach(instance =>{
    //     if(instance.url === registrationInfo.url){
    //         exist = true
    //         return
    //     }
    // })

    // return exist
    const services = registry.services[registrationInfo.apiName].instances || [];
    return services.some(instance => instance.url === registrationInfo.url);
}
module.exports = router
