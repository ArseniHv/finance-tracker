# Finance Tracker

A full-stack personal finance web application for tracking income and expenses, managing budgets, and visualising spending through charts.

Built with **Spring Boot 3.5**, **React 18 + TypeScript**, **PostgreSQL 16**, and **Docker Compose**.

---

## Features

- JWT-based registration and login
- Add, edit, and delete income and expense transactions
- Categorise transactions with custom colours and icons
- Set monthly budgets per category with live progress bars
- Dashboard with income vs. expense bar chart and spending pie chart
- CSV export of all transactions
- Dark mode toggle
- Fully containerised with Docker Compose

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA |
| Database  | PostgreSQL 16, Flyway migrations        |
| Frontend  | React 18, TypeScript, Vite, Recharts, Tailwind CSS |
| Auth      | JWT (jjwt 0.12)                         |
| DevOps    | Docker, Docker Compose, GitHub Actions  |

---

## Getting Started

### Prerequisites

- Docker Desktop 26+
- Docker Compose v2+

### Run with Docker Compose
```bash
git clone https://github.com/ArseniHv/finance-tracker.git
cd finance-tracker
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:8080       |
| Database | localhost:5432              |

### Run locally (development)

**Backend:**
```bash
docker compose up postgres -d
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure
```
finance-tracker/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/financetracker/backend/
│   │   ├── controller/       # REST controllers
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── entity/           # JPA entities
│   │   ├── dto/              # Request/response records
│   │   ├── security/         # JWT filter and Spring Security config
│   │   └── exception/        # Global exception handling
│   └── src/main/resources/
│       └── db/migration/     # Flyway SQL migrations
├── frontend/                 # React + Vite application
│   └── src/
│       ├── api/              # Axios instance and dashboard helpers
│       ├── components/       # Shared UI components
│       ├── context/          # Auth and theme context
│       ├── pages/            # Dashboard, Transactions, Categories, Budgets
│       └── types/            # TypeScript interfaces
├── .github/workflows/ci.yml  # GitHub Actions CI pipeline
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

| Method | Endpoint                          | Description              | Auth |
|--------|-----------------------------------|--------------------------|------|
| POST   | /api/auth/register                | Register new user        | No   |
| POST   | /api/auth/login                   | Login                    | No   |
| GET    | /api/transactions                 | List all transactions    | Yes  |
| POST   | /api/transactions                 | Create transaction       | Yes  |
| PUT    | /api/transactions/{id}            | Update transaction       | Yes  |
| DELETE | /api/transactions/{id}            | Delete transaction       | Yes  |
| GET    | /api/transactions/export/csv      | Export CSV               | Yes  |
| GET    | /api/categories                   | List categories          | Yes  |
| POST   | /api/categories                   | Create category          | Yes  |
| PUT    | /api/categories/{id}              | Update category          | Yes  |
| DELETE | /api/categories/{id}              | Delete category          | Yes  |
| GET    | /api/budgets?month=&year=         | List budgets             | Yes  |
| POST   | /api/budgets                      | Create budget            | Yes  |
| PUT    | /api/budgets/{id}                 | Update budget            | Yes  |
| DELETE | /api/budgets/{id}                 | Delete budget            | Yes  |

---

## Deploying to AWS EC2 (Free Tier)

### 1. Launch an EC2 instance

- Go to AWS Console → EC2 → Launch Instance
- AMI: **Ubuntu 24.04 LTS**
- Instance type: **t2.micro** (free tier)
- Create or select a key pair (save the `.pem` file)
- Security group — open inbound ports:
  - 22 (SSH)
  - 80 (HTTP)
  - 5173 (Frontend, or map to 80 via Nginx)
  - 8080 (Backend, optional — can keep internal)

### 2. Connect to your instance
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 3. Install Docker on the instance
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker
```

### 4. Clone and run the project
```bash
git clone https://github.com/YOUR_USERNAME/finance-tracker.git
cd finance-tracker

# Set a strong JWT secret
export JWT_SECRET=YourLongRandomProductionSecretHere

docker compose up --build -d
```

### 5. Access the app

Open `http://YOUR_EC2_PUBLIC_IP:5173` in your browser.

### 6. Keep it running after reboot
```bash
sudo systemctl enable docker
```

Add `restart: unless-stopped` to each service in `docker-compose.yml` to auto-restart containers on reboot.

---

## Environment Variables

| Variable     | Default                          | Description              |
|--------------|----------------------------------|--------------------------|
| DB_HOST      | localhost                        | PostgreSQL host          |
| DB_PORT      | 5432                             | PostgreSQL port          |
| DB_NAME      | financetracker                   | Database name            |
| DB_USER      | financetracker                   | Database user            |
| DB_PASS      | financetracker                   | Database password        |
| JWT_SECRET   | (dev default in application.yml) | JWT signing secret       |

---

## CI Pipeline

GitHub Actions runs on every push and pull request to `main`:

1. Spins up a PostgreSQL service container
2. Runs all backend unit tests with Maven
3. Builds the backend JAR
4. Builds the backend Docker image
5. Type-checks the frontend with TypeScript
6. Builds the frontend with Vite
7. Builds the frontend Docker image

---

## License

MIT