# Klaro

A minimalist family hub to manage shared shopping lists, track bills, and visualize expenses, keeping your home life organized and clear.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/codeviloria/MV-listas-Familair)

Klaro is a minimalist, family-centric web application designed to bring clarity and simplicity to household management. It provides a unified hub for shared shopping lists, bill tracking, and expense visualization. The application is built with a focus on a clean, intuitive user experience and stunning visual design, ensuring that managing family tasks is a delightful and effortless process.

## Key Features

-   **Shared Shopping Lists**: Create and manage multiple shopping lists in real-time. When one person checks an item off, it updates for everyone instantly. A 'Pantry' feature allows for quick addition of frequently purchased items.
-   **Bill Tracking**: A dedicated section to list and track recurring household bills like electricity, water, and internet. Users can mark bills as paid and record the amount, ensuring nothing is missed.
-   **Expense Dashboard**: A simple, elegant dashboard that provides a visual summary of household spending, categorized by groceries and utilities, helping families stay on top of their budget.

## Technology Stack

-   **Frontend**: React, Vite, React Router, TypeScript
-   **Backend**: Hono on Cloudflare Workers
-   **State Management**: Zustand
-   **Styling**: Tailwind CSS, shadcn/ui
-   **Animation**: Framer Motion
-   **Data Visualization**: Recharts
-   **Storage**: Cloudflare Durable Objects

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   Wrangler CLI installed and configured: `bun install -g wrangler`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd klaro
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

### Running Locally

To start the development server for both the frontend and the backend worker, run:

```bash
bun dev
```

This will start the Vite development server for the React application and a local Wrangler server for the Hono backend, typically available at `http://localhost:3000`.

## Project Structure

The project is organized into three main directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the Hono backend application that runs on Cloudflare Workers, including API routes and Durable Object entity definitions.
-   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and backend to ensure type safety.

## Development

### Backend

API endpoints are defined in `worker/user-routes.ts`. Business logic is encapsulated within "Entities" in `worker/entities.ts`, which interact with a global Durable Object for data persistence.

### Frontend

The frontend is a standard React application built with Vite. Components are located in `src/components`, with UI primitives from `shadcn/ui` available in `src/components/ui`. Pages are located in `src/pages`.

### Shared Types

To maintain type safety across the full stack, define shared data structures in `shared/types.ts`. These types can be imported and used in both the `src` and `worker` directories.

## Deployment

This application is designed to be deployed to Cloudflare's global network.

1.  **Build the project:**
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    ```bash
    bun run deploy
    ```

This command will build the frontend application and deploy both the static assets and the worker to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/codeviloria/MV-listas-Familair)