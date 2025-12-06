# Genkit Examples

This directory contains example Genkit flows that demonstrate the capabilities of the Genkit framework.

## Hello World

This example is a simple "Hello World" flow that takes a name as input and returns a greeting.

### Prerequisites

-   Node.js 18+
-   npm or yarn

### Installation

1.  Navigate to the `genkit-examples` directory:
    ```bash
    cd genkit-examples
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Flow

To run the `helloWorldFlow`, you can use the `runFlow` function from the Genkit CLI or by uncommenting the `runFlow` call in `src/index.ts` and running the file with `ts-node`.

**Using the Genkit CLI:**
```bash
genkit flow:run helloWorldFlow '"Genkit User"'
```

**Using ts-node:**
1.  Uncomment the following line in `src/index.ts`:
    ```typescript
    // runFlow(helloWorldFlow, 'Genkit User').then(console.log);
    ```

2.  Run the file:
    ```bash
    npx ts-node src/index.ts
    ```
