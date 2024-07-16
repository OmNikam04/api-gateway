const axios = require('axios');

const loadbalancer = {};

// Maximum retry attempts for health checks
const MAX_RETRIES = 3;

loadbalancer.ROUND_ROBIN = async (service) => {
    const newIndex = ++service.index >= service.instances.length ? 0 : service.index;
    service.index = newIndex;

    console.log(`Checking if instance ${service.instances[newIndex].url} is enabled`);
    const enabledIndex = await loadbalancer.isEnabled(service, newIndex, loadbalancer.ROUND_ROBIN);
    return enabledIndex;
}

// Health check mechanism to mark instances as down.
const checkHealth = async (instance) => {
    let attempts = 0;

    for (let path of instance.healthCheckPaths) {
        try {
            const response = await axios.get(`${instance.url}${path}`);
            if (response.status === 200) {
                return true; // Instance is healthy
            }
        } catch (error) {
            attempts++;
            console.error(`Health check failed for ${instance.url + path}:`, error.message);
            if (attempts >= MAX_RETRIES) {
                console.error(`Max retries reached for ${instance.url}. Marking as down.`);
                return false; // Mark as down after maximum retries
            }
        }
    }
    return false; // None of the health checks passed
};

loadbalancer.isEnabled = async (service, index, loadbalancerStrategy) => {
    const instance = service.instances[index];
    if (await checkHealth(instance)) {
        return index; // Instance is enabled
    } else {
        instance.enabled = false; // Mark instance as down
        // Find the next enabled instance
        for (let i = 0; i < service.instances.length; i++) {
            const nextIndex = (index + i + 1) % service.instances.length; // Circular check
            if (await checkHealth(service.instances[nextIndex])) {
                return nextIndex; // Return the next healthy instance
            }
        }
    }
    return -1; // No healthy instances found
};

module.exports = loadbalancer;
