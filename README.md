# AI-Powered TODO Application

A command-line TODO application powered by OpenAI that enables users to manage tasks using natural language conversations. The application uses an AI agent to interpret user requests and perform task operations directly on a PostgreSQL database through Drizzle ORM.

## Features

- Conversational task management using OpenAI SDK
- Create, view, update, and delete TODO items using natural language
- AI agent capable of interacting with PostgreSQL database
- Command-line chat interface using readline-sync
- PostgreSQL database containerized with Docker Compose
- Type-safe database access with Drizzle ORM

## Demo

Watch the application in action:

https://github.com/anushashettyj/ai-todo/assets/demo.mp4

The demo showcases:

- Natural language interaction with the AI agent
- Creating TODO items
- Viewing TODO items
- Updating task status
- Deleting tasks
- Database verification through Drizzle Studio

The AI agent interprets the request and performs the corresponding database operation.

## Tech Stack

- Node.js
- OpenAI SDK
- PostgreSQL
- Drizzle ORM
- Docker Compose
- readline-sync

## Getting Started

### Prerequisites

- Node.js
- Docker Desktop
- OpenAI API Key

### Installation

Clone the repository:

```bash
git clone https://github.com/anushashettyj/ai-todo.git
cd ai-todo
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file using the `.env.example` template.

```bash
cp .env.example .env
```

```env
OPENAI_API_KEY=your_key_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/todo_db
```

Update the values in `.env` with your credentials.

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

Run database migrations:

```bash
npm run migrate
```

Start the application:

```bash
node index.js
```
