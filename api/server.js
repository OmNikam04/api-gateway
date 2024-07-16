const express = require("express");
const app = express();
const axios = require("axios");
const PORT = 3002;
const HOST = "localhost";

app.use(express.json());

app.get("/fakeapi", (req, res, next) => {
  console.log(`hello from fakeapi`);
  res.send("Hello from fakeapi");
});

app.post("/bogusapi", (req, res, next) => {
  console.log(`hello from bogusapi`);
  res.send("Hello from bogusapi");
});

app.listen(PORT, () => {
  const authString = "johndoe:password";
  const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");
  console.log(`Encoding authstring: ${encodedAuthString}`);
  console.log("Fake API server started on port " + PORT);

  // Registering this API to our gateway dynamically
  registerService(encodedAuthString);
});

function registerService(encodedAuthString) {
  console.log("Attempting to register service with the gateway...");
  axios({
    method: "POST",
    url: "http://localhost:3000/register",
    headers: {
      authorization: `Basic ${encodedAuthString}`,
      "Content-Type": "application/json",
    },
    data: {
      apiName: "testapi",
      protocol: "http",
      host: HOST,
      port: PORT,
      connections: 0, // Initializing connections for load balancing
      weight: 1, // Setting default weight for weighted round robin
      healthCheckPaths: ["/fakeapi", "/bogusapi"]
    },
  })
    .then((response) => {
      console.log("Service registered successfully:", response.data);
    })
    .catch((err) => {
      console.error("Error during service registration:", err.message);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
      }
    });
}

// Graceful shutdown to unregister the service
process.on("SIGINT", () => {
  console.log("Received SIGINT. Unregistering service...");
  unregisterService().then(() => {
    process.exit();
  });
});

async function unregisterService() {
  const authString = "johndoe:password";
  const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");

  console.log("Attempting to unregister service from the gateway...");
  try {
    const response = await axios({
      method: "POST",
      url: "http://localhost:3000/unregister",
      headers: {
        authorization: `Basic ${encodedAuthString}`,
        "Content-Type": "application/json",
      },
      data: {
        apiName: "testapi",
        protocol: "http",
        host: HOST,
        port: PORT,
        connections: 0, // Initializing connections for load balancing
        weight: 1, // Setting default weight for weighted round robin
        healthCheckPaths: ["/fakeapi", "/bogusapi"], // List of health check endpoints
      },
    });
    console.log("Service unregistered successfully:", response.data);
  } catch (err) {
    console.error("Error during service unregistration:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
      console.error("Response headers:", err.response.headers);
    }
  }
}
