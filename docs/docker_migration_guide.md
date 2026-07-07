# 🐳 Docker Migration Guide for Local Development

Welcome to the Dockerized setup for the **Praktis-Group-Project**! 

By migrating to Docker, we no longer need to manually install Node.js, MongoDB, or MySQL on our local machines. Docker will spin up the entire environment consistently for us.

---

## 1. Prerequisites

Before we begin, ensure we have the following installed:
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Download and install it.
  - **Note:** If anyone is new to Docker, we don't need to do any special configuration in Docker Desktop. Just make sure the application is open and running (we should see the little whale icon in the system tray/menu bar). 
  - On Windows, Docker Desktop usually enables WSL 2 (Windows Subsystem for Linux) by default, which is recommended for better performance.
- **Git** (to pull the latest changes).

---

## 2. Environment Variables

The `docker-compose.yml` file handles the connections between the containers automatically. However, if our application requires `.env` files for other secrets, ensure they are present.

For this Docker setup, the environment variables are heavily injected via the `docker-compose.yml` directly (like `MYSQL_HOST=mysql`, `MONGO_URI`, etc.), meaning we **do not** need to manually configure `.env` files just to get the databases to connect locally! 

---

## 3. Starting the Environment

To start the entire application (Frontend, Backend, MySQL, and MongoDB), open a terminal at the root of the project (where the `docker-compose.yml` file is located) and run:

```bash
docker-compose up --build
```

### What this command does:
1. **`--build`**: Tells Docker to build the images for the `client` and `server` using their respective `Dockerfile`s. (We only strictly need `--build` when changing dependencies in `package.json` or updating the Dockerfiles, but it's safe to use initially).
2. It pulls the official images for **MongoDB** and **MariaDB (MySQL)**.
3. It starts all 4 services and links them together.

*Wait a moment for the databases to initialize and the Node.js servers to start.*

### Accessing the App:
- **Frontend (Vite)**: [http://localhost:5173](http://localhost:5173)
- **Backend (Express)**: [http://localhost:5001](http://localhost:5001)
- **MongoDB**: `localhost:27017` (If we want to connect using MongoDB Compass)
- **MySQL**: `localhost:3306` (If we want to connect using DBeaver/TablePlus with User: `root`, Password: `password`, DB: `praktis_db`)

---

## 4. Hot-Reloading / Live Editing

This setup is configured for **Development**. 

We have mapped our local `./client` and `./server` folders into the containers. This means:
- When we edit a React component in `client/src/...`, Vite will instantly hot-reload in the browser.
- When we edit an Express route in `server/...`, Nodemon will instantly restart the backend server.

We can code exactly as we did before, using VS Code locally!

---

## 5. Stopping the Environment

To stop the servers, we can either:
1. Press `Ctrl + C` in the terminal where `docker-compose up` is running.
2. OR, open a new terminal in the project root and run:

```bash
docker-compose down
```

> [!NOTE]
> **Data Persistence:** Our database data (MySQL tables and MongoDB collections) **will be saved** even when we stop or remove the containers. This is because we configured Docker Volumes (`mysql_data` and `mongodb_data`) to store the data safely on our machines.

---

## 6. Common Commands & Troubleshooting

### Viewing Logs
If we started the containers in detached mode (`docker-compose up -d`) or want to see logs for a specific service:
```bash
# View backend logs
docker-compose logs -f server

# View frontend logs
docker-compose logs -f client
```

### Installing New Dependencies
If we need to `npm install` a new package, we can do it locally in our terminal, but we **must rebuild the container** for it to take effect inside Docker:

1. Install locally (e.g., `cd client && npm install axios`)
2. Rebuild the containers:
```bash
docker-compose up --build
```

### Re-seeding the Database
If we need to run our `seed.js` script inside the running server container:
```bash
docker-compose exec server npm run seed
```

### Completely Wiping the Database (Reset)
If we want to start fresh and delete all data from MySQL and MongoDB:
```bash
docker-compose down -v
```
*(The `-v` flag deletes the volumes attached to the containers).*
