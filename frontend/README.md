# Frontend

This directory contains the source code for the TF-ICRE™ web user interfaces.

## Projects

-   **/web-app**: A Next.js application that serves as the primary interface for all users, including the Analyst Console, Governance Console, and Executive Dashboards. It is designed to be hosted on Firebase.

## Getting Started with the Web App

### Prerequisites

-   Node.js 18+
-   npm or yarn

### Installation

1.  Navigate to the `web-app` directory:
    ```bash
    cd frontend/web-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

1.  Create a `.env.local` file in the `web-app` directory and add the necessary environment variables. See `.env.example` for a template.

2.  Run the development server:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Project Structure

-   **`src/app`**: Contains the pages and layouts for the application.
    -   **`src/app/(dashboards)`**: Contains the different dashboards for the various user roles.
-   **`src/components`**: Contains the reusable components used throughout the application.
-   **`src/context`**: Contains the React contexts for managing global state.
-   **`src/lib`**: Contains the utility functions and libraries.
-   **`src/services`**: Contains the functions for interacting with the backend APIs.
