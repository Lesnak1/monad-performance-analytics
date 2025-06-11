# 🗺️ MPAS - Project Roadmap & Task Board

This document outlines the development phases and specific tasks for the Monad Performance Analytics Suite. Contributors can pick tasks from the board below.

## Phase 1: Foundation & Scaffolding (Pre-Testnet / Initial Testnet)

**Goal:** Build the core components of the suite: the benchmark contracts and the command-line testing scripts.

### ✅ Task Board - Phase 1

**[Solidity Team]**
- [ ] **Contract:** Implement `ERC20Benchmark.sol` with a standard ERC20 and an efficient `airdrop(address[] calldata recipients, uint256 amount)` function.
- [ ] **Contract:** Implement `NFTBenchmark.sol` (ERC721) with a `batchMint(address to, uint256 quantity)` function.
- [ ] **Contract:** Implement `ComputeBenchmark.sol` with functions that perform heavy on-chain computations (e.g., sorting an array, complex mathematical calculations) to measure raw gas-per-second performance.
- [ ] **Testing:** Write basic unit tests for all benchmark contracts using Foundry.

**[Scripting/Tooling Team]**
- [ ] **Script:** Create the main benchmark script `Benchmark.s.sol` using Foundry Scripts.
- [ ] **Script Feature:** The script must be able to target a specific contract and function.
- [ ] **Script Feature:** The script should accept parameters from the command line (e.g., number of transactions, delay between transactions).
- [ ] **Script Feature:** Implement logic to measure and log `start time`, `end time`, `total transactions sent`, `total gas used`, and calculate average TPS.
- [ ] **Documentation:** Write a guide on how to configure and run the benchmark scripts.

## Phase 2: Data Collection & Visualization (Testnet Active)

**Goal:** Deploy the contracts, run the benchmarks consistently, and build the frontend dashboard to display the results.

### ✅ Task Board - Phase 2

**[DevOps/Backend Team]**
- [ ] **Deployment:** Create deployment scripts for all benchmark contracts.
- [ ] **Automation:** Set up a GitHub Action to run the benchmark suite automatically on a schedule (e.g., daily).
- [ ] **Data Storage:** Define a simple JSON structure for storing benchmark results. Initially, results can be committed to the repo. Later, we can use a simple DB.

**[Frontend Team]**
- [ ] **Setup:** Initialize the Next.js application in the `/frontend` directory with TypeScript and TailwindCSS.
- [ ] **Component:** Create a `StatCard` component to display a single metric (e.g., "Max TPS", "Avg. Gas Fee").
- [ ] **Component:** Create a `ResultsTable` component to show a detailed log of benchmark runs.
- [ ] **Component:** Create a `LineChart` component to visualize a metric (e.g., TPS) over time.
- [ ] **Page:** Build the main Dashboard page that fetches the benchmark result JSON and displays it using the components.

## Phase 3: Polish & Community Outreach

**Goal:** Refine the suite, add advanced features, and promote its use within the Monad community.

### ✅ Task Board - Phase 3

- [ ] **Feature:** Add comparison functionality to the dashboard (e.g., compare results before and after a network upgrade).
- [ ] **Content:** Write blog posts and tutorials explaining the benchmark results and what they mean for developers.
- [ ] **Community:** Host a live demo session in the Monad Discord, showcasing how to use MPAS.
- [ ] **Feedback:** Gather feedback from the community to plan the next set of features and benchmark scenarios. 