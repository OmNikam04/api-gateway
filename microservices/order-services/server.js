const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = "order-service";

app.use(express.json());

app.get("/orders", async (req, res) => {
  try {
    const response = await axios.get(
      "https://66a0d43e7053166bcabd025a.mockapi.io/api/v1/orders"
    );

    if (response.status >= 200 && response.status < 300) {
      res.status(200).json(response.data);
    } else {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  const authString = "johndoe:password";
  const encodedAuthString = Buffer.from(authString, "utf-8").toString("base64");
  console.log(`Encoding authstring: ${encodedAuthString}`);
  console.log(`Order service running on port ${PORT}`);
  registerService(encodedAuthString);
});

function registerService(encodedAuthString) {
  console.log("Attempting to register service with the gateway...");
  axios({
    method: "POST",
    url: "http://api-gateway:3000/register",
    headers: {
      authorization: `Basic ${encodedAuthString}`,
      "Content-Type": "application/json",
    },
    data: {
      apiName: "order-service",
      protocol: "http",
      host: HOST,
      port: PORT,
      connections: 0,
      weight: 1,
      healthCheckPaths: ["/orders"],
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
      setTimeout(() => registerService(encodedAuthString), 5000);

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
      url: "http://api-gateway:3000/unregister",
      headers: {
        authorization: `Basic ${encodedAuthString}`,
        "Content-Type": "application/json",
      },
      data: {
        apiName: "order-service", // Ensure this matches the registered name
        protocol: "http",
        host: HOST,
        port: PORT,
        connections: 0,
        weight: 1,
        healthCheckPaths: ["/orders"],
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
