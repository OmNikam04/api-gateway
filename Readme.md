
# API Gateway with Microservices
I tried to build an API Gateway from scratch to gain a deeper understanding of how standard gateways operate in environments with **high scale** and a **large user base**. 
My goal was to explore the intricacies of **load balancing**, service registration, **rate limiting** functionality and dynamic routing. By implementing this from the ground up, I aimed to bridge the gap between theoretical knowledge and practical application, fueling my curiosity about the internal workings and optimizations that make modern API Gateways robust and efficient.

## Table of contents
1. [Project Overview](#overview)
2. [Architecture](#architecture)
3. [Feature](#feature)
4. [Technology-used](#tech-used)
5. [Setup-and-installation](#setup-installation)
6. [Usage](#usage)
7. [Contribution](#contro)

## Project overview <a id="overview"></a>
This project implements an API Gateway that manages requests to multiple microservices. The API Gateway acts as a **reverse proxy**, handling requests from clients and routing them to the appropriate microservice. 
The key components include:

- API Gateway: Manages routing, load balancing, and security for microservices.
- Product Service: Handles product-related operations.
- Order Service: Manages order-related operations

## Architecture <a id="architecture"></a>
The architecture consists of:

- **API Gateway**: Routes requests to the appropriate microservice and provides load balancing.
- **Microservices**: Independent services (Product and Order) each handling specific domains.
- **Docker**: Containerization of services for easy deployment and scaling.
- **Network**: All services are connected via a Docker bridge network.


## Feature <a id="feature"></a>
- **Centralized Routing**: Routes client requests to the correct microservice.
- **Rate Limiting**: To avoid potential DDoS(Denial of service) and other attacks on servers rate limiter is used in api gateway.
- **Load Balancing**: Distributes incoming requests across multiple instances of a service.
- **Health Checks**: Monitors the health of microservices to ensure availability.
- **Scalability**: Easily scalable due to independent microservice architecture.



## Technologies Used <a id="tech-used"></a>
1. **Node.js**: Backend development.
2. **Express.js**: Web framework for building the API Gateway and microservices.
3. **Docker**: Containerization platform for managing microservices.
4. **Axios**: HTTP client for making API requests.
5. **Redis**: To cache the response 

## Setup and installation <a id="setup-installation"></a>
### Prerequisites
- Docker installed on your machine.
- Node.js installed on your machine.

### Installation
1. Clone the repository
```
git clone https://github.com/OmNikam04/api-gateway.git
cd api-gateway-microservices
```
2. Build and run the services using Docker Compose
```
docker-compose up --build
```
3. Access the services
- API gateway: `http://localhost:3000` 
- Product-services: `http://localhost:3000/product-service/products`
- Order-services: `http://localhost:3000/order-service/orders`


## Usage <a id="usage"></a>
### Registering Microservices
Microservices are registered with the API Gateway using a /register endpoint. Each service sends its configuration details (name, URL, health check path) to the gateway.

### Making API Requests
Use tools like Postman or Thunder Client to interact with the API Gateway. The gateway will route the requests to the appropriate microservice based on the URL path.

- Example: To fetch products, send a GET request to http://localhost:3000/product-service/products.

### Health Checks and Load Balancing
The API Gateway performs periodic health checks on each microservice and uses a round-robin strategy for load balancing.

## Contributing <a id="contro"></a>
Contributions are welcome! Please open an issue or submit a pull request if you have any suggestions or improvements.

