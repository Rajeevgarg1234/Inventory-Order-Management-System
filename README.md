# Inventory & Order Management System

Full-stack assignment project with React frontend, FastAPI backend, PostgreSQL database, Docker, and Docker Compose.

## Features

- Product CRUD with unique SKU validation
- Customer create/list/delete with unique email validation
- Order create/list/detail/delete
- Inventory validation before order creation
- Automatic stock reduction when an order is created
- Backend-calculated total order amount
- Dashboard with total products, customers, orders, and low-stock products
- Responsive React UI
- Dockerized frontend, backend, and PostgreSQL

## Project Structure

inventory_order_system/
  - backend/
    app/
    -  main.py
    - models.py
    - schemas.py
    - database.py
    - config.py
    - Dockerfile
    - requirements.txt
  - frontend/
    src/
    - main.jsx
    - api.js
    - style.css
    - Dockerfile
    - package.json
  - docker-compose.yml


## Important API Endpoints

- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `DELETE /customers/{id}`
- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `DELETE /orders/{id}`
- `GET /dashboard`

### Docker Hub Backend Image


docker build -t your-dockerhub-username/inventory-backend:latest ./backend
docker login
docker push your-dockerhub-username/inventory-backend:latest