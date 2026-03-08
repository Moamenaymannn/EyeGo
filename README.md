# Activity Tracker — Event-Driven Microservice

A scalable microservice for processing user activity logs in real time. Built with **Node.js**, **Express**, **Apache Kafka**, and **MongoDB**, following Domain-Driven Design (DDD) principles. Fully containerised with Docker and orchestrated via Kubernetes.

**Flow:**

1. A client sends a `POST` request with user activity data.
2. The Express API validates the payload and publishes it to a Kafka topic.
3. A Kafka consumer picks up the message, transforms it into a domain entity, marks it as processed, and stores it in MongoDB.
4. Clients can query processed logs via `GET` endpoints with pagination, filtering, and sorting.

## Project Structure

The codebase follows **Domain-Driven Design (DDD)** with four clear layers:

[View Architecture Diagram](https://cacoo.com/diagrams/1SyT7HNVElisHo7P/view)

## Getting Started

### Prerequisites

 Tool            | Version  
 Docker          | 20+      
 Docker Compose  | 2.x      
 Node.js         | 18+      
 npm             | 9+       

### Run with Docker Compose

This is the recommended way to run the entire stack locally.

```bash
# Clone the repo
git clone https://github.com/Moamenaymannn/EyeGo.git
cd EyeGo

# Start all services (app, MongoDB, Kafka, Zookeeper)
docker-compose up --build -d

# Check that everything is healthy
docker-compose ps

# View application logs
docker-compose logs -f app
```
The API will be available at **http://localhost:3000**.

### Run Locally (without Docker)

If you already have MongoDB and Kafka running on your machine:

```bash
# Install dependencies
npm install

# Copy and edit environment variables
cp .env.example .env
# (edit .env with your local Mongo and Kafka connection strings)

# Start the service
npm run dev
```
## API Reference

## Live Deployment (GKE)

The service is currently deployed on **Google Kubernetes Engine** and accessible at:

**Base URL:** `http://34.30.197.197`

### Quick Test Commands

No installation required just use `curl` or any API tool (Postman, browser, etc.):

```bash
# 1. Health check
curl http://34.30.197.197/health

# 2. Ingest a new activity log
curl -X POST http://34.30.197.197/api/activities \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_42", "action": "page_view"}'

# 3. Ingest more logs (different users/actions)
curl -X POST http://34.30.197.197/api/activities \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_99", "action": "button_click"}'

# 4. Fetch all processed logs (with pagination)
curl "http://34.30.197.197/api/activities?page=1&limit=10"

# 5. Filter by userId
curl "http://34.30.197.197/api/activities?userId=user_42"

# 6. Filter by action
curl "http://34.30.197.197/api/activities?action=page_view"

# 7. Combine filters + sorting
curl "http://34.30.197.197/api/activities?userId=user_42&action=page_view&sortBy=processedAt&sortOrder=desc"

# 8. Fetch a single log by ID (replace <id> with an actual _id from step 4)
curl http://34.30.197.197/api/activities/<id>

# 9. Validation test (missing userId → returns 422)
curl -X POST http://34.30.197.197/api/activities \
  -H "Content-Type: application/json" \
  -d '{"action": "page_view"}'
```
---
### GKE Deployment Steps (How It Was Deployed)

```bash
# Authenticate
gcloud auth login

# Create a cluster (free trial gives $300 credits)
gcloud container clusters create activity-tracker-cluster \
  --zone us-central1-a \
  --num-nodes 2 \
  --machine-type e2-small

# Build and push Docker image to GCR
docker tag activity-tracker-service:latest gcr.io/<PROJECT_ID>/activity-tracker-service:latest
docker push gcr.io/<PROJECT_ID>/activity-tracker-service:latest

# Deploy all K8s manifests
kubectl apply -f k8s/

# Get the external IP
kubectl get service app-service -n activity-tracker
```

## Architecture Decisions

### Why Kafka?

We need to decouple log ingestion from processing. When a burst of activity hits the REST API, messages queue up in Kafka rather than overwhelming the database. The consumer processes them at its own pace, giving us natural back-pressure handling. Kafka also provides durable storage of events, so if the consumer crashes, it picks up right where it left off after restart.

### Why DDD?

Domain-Driven Design separates business rules from infrastructure concerns. The `ActivityLog` entity knows how to mark itself as processed or failed, but it has absolutely no idea that MongoDB or Kafka exist. This means we can swap out the database or message broker without touching business logic. It also makes the codebase easier to navigate: if you want to understand what the system *does*, look at `domain/` and `application/`. If you want to understand *how* it does it, look at `infrastructure/`.

### Why MongoDB?

Activity logs are semi-structured (the `metadata` field varies by action type) and write-heavy. MongoDB handles flexible schemas and high write throughput well. We added compound indexes on `(userId, action, processedAt)` to keep read queries fast even as the collection grows.

### Why Express?

Express is minimal, battle-tested, and has the largest middleware ecosystem in Node.js. For a microservice that only exposes a handful of endpoints, a full framework like NestJS would be overkill. We layered on `helmet` for security headers, `cors` for cross-origin access, `express-validator` for input validation, and `morgan` for request logging.

### Error Resilience

The Kafka consumer wraps each message handler in a try/catch so a single malformed record never blocks the pipeline. Failed logs are still persisted with a `status: "failed"` marker and a `failureReason` field, giving the operations team full visibility without losing data.

### Graceful Shutdown

On `SIGTERM` or `SIGINT`, the service stops accepting new HTTP requests, disconnects the Kafka consumer and producer, and closes the MongoDB connection. A 10-second hard timeout prevents the process from hanging indefinitely if a connection is stuck.

---

## Tech Stack

 Component     | Technology                    

Runtime        | Node.js 18                    
HTTP Framework | Express 4                     
Message Broker | Apache Kafka (via KafkaJS)    
Database       | MongoDB 7 (via Mongoose 8)    
Logging        | Winston                       
Containerisation| Docker, Docker Compose        
Orchestration  | Kubernetes                    
Security       | Helmet, CORS                  
Validation     | express-validator             

---
