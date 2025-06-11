# MPAS Frontend

This directory contains the Next.js application for the Monad Performance Analytics Suite dashboard.

## 🎯 Purpose

The frontend's primary goal is to provide a clean, accessible, and real-time visualization of the benchmark data collected by our scripts. It should be the public face of our project, making Monad's performance easy to understand for everyone.

## 🏗️ Structure

-   **/pages**: Main application routes.
    -   `index.tsx`: The main dashboard page.
-   **/components**: Reusable UI elements.
    -   `Header.tsx`: Navigation bar.
    -   `StatCard.tsx`: Displays a single, key metric.
    -   `ResultsTable.tsx`: A detailed table of all benchmark runs.
    -   `LineChart.tsx`: A chart for visualizing trends over time.
-   **/lib**: Helper functions, data fetching logic.
-   **/public**: Static assets like images and fonts.
-   **/styles**: Global CSS and Tailwind configuration.

## 📊 Data to Display

The dashboard should clearly display the following metrics for each benchmark run:

-   **Test Scenario Name:** (e.g., "ERC20 Airdrop - 100 recipients")
-   **Transactions Per Second (TPS):** The primary performance metric.
-   **Average Gas Price:** The average gas price paid during the test.
-   **Average Transaction Cost:** The average cost in both MONAD and USD.
-   **Run Duration:** Total time the test took to complete.
-   **Block Numbers:** Start and end blocks of the test.
-   **Timestamp:** When the test was executed. 