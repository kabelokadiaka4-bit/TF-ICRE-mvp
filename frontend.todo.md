# TF-ICRE™ Frontend Redesign & Implementation Plan - TODO

This document outlines the detailed plan for redesigning and implementing the TF-ICRE™ frontend application to align with the "TF-ICRE™ — Full Frontend User Experience Flow.pdf" document.

---

## Phase 4: Frontend UI/UX Development - Detailed Plan

### Sub-Phase 4.1: Foundational Setup & Integration
*   [x] **4.1.1. State Management:**
    *   [ ] Choose and implement a state management library (e.g., Zustand, React Query, or Redux Toolkit).
    *   [ ] Define global and local state structures for user data, dashboard data, loan cases, etc.
*   [x] **4.1.2. API Client Setup:**
    *   [ ] Develop a robust API client (e.g., using `axios` or `fetch` with wrappers) for secure communication with all backend microservices (`Scoring Engine`, `TBML Engine`, `Governance Engine`).
    *   [ ] Implement centralized error handling and request/response interceptors.
*   [x] **4.1.3. UI Component Library Integration:**
    *   [ ] Integrate `shadcn/ui` (as per modernization plan) to ensure a consistent, modern, and accessible design system.
    *   [ ] Develop or adapt base components (buttons, inputs, cards, tables, modals) using `shadcn/ui`.
*   [x] **4.1.4. Authentication Setup:**
    *   [ ] Integrate Firebase Authentication or Google Identity Platform as the primary authentication mechanism.
    *   [ ] Implement user session management and protected routes.

### Sub-Phase 4.2: Implementing User Flows (Based on UX Document)

#### 1. The Arrival: Login → Org Selection → Dashboard
*   [x] **4.2.1. Login Screen:**
    *   [x] Design and implement a clean login screen ("GCP meets African fintech vibes").
    *   [x] Integrate multi-factor authentication (MFA) flow.
    *   [x] Develop "Select Organisation" UI.
    *   [x] Ensure secure handling of credentials.
*   [x] **4.2.2. Initial Dashboard Load:**
    *   [x] Implement fast data loading mechanisms for the personalized dashboard (target: 2 seconds).
    *   [x] Display loading indicators/skeletons during data fetch.

#### 2. Dashboard: The Command Center
*   [x] **4.2.3. Dashboard Layout & Widgets:**
    *   [x] Design the high-level panoramic view, supporting a modular widget-based layout.
    *   [x] Develop specific widgets for:
        *   [x] Heatmaps: Visualizing risk across portfolios/regions.
        *   [x] Alerts: Displaying critical notifications (e.g., TBML, credit events).
        *   [x] Portfolio Trends: Graphing key performance indicators.
        *   [x] TBML Warnings: Summarizing potential money laundering flags.
        *   [x] Compliance Notes: Highlighting regulatory adherence status.
*   [x] **4.2.4. Quick Action Navigation:**
    *   [x] Implement clickable elements to "Start a loan," "Investigate an alert," "View portfolio," "Open a report."

#### 3. Start a Loan Case: The Core Workflow
*   [x] **4.2.5. Loan Funnel Container:**
    *   [x] Implement a 3-step funnel structure.
*   [x] **4.2.6. Step 1: Input Customer & Loan Data:**
    *   [x] Develop forms for: Customer details, Loan amount & terms, Sector, Country.
    *   [x] Implement file upload component for financials/statements.
    *   [ ] Integrate autosave functionality.
    *   [x] Ensure "super logical, zero clutter" UI.
*   [x] **4.2.7. Step 2: Document Verification (AI Extraction):**
    *   [x] Implement a dual-panel UI: document preview (left) and extracted fields (right).
    *   [x] Develop functionality to display yellow highlights for mismatched values and red highlights for risk items.
    *   [x] Integrate with the TBML Engine backend for extraction.
    *   [x] Implement "User verifies → approves → clicks 'Continue to Risk Scoring'".
*   [x] **4.2.8. Step 3: Run the Score (The Magic Moment):**
    *   [x] Design a sleek scoring page.
    *   [x] Integrate with the Scoring Engine backend to display:
        *   [x] Composite rating.
        *   [x] PD / LGD / EAD.
        *   [x] ECL.
        *   [x] Red flags.
        *   [x] Explainability (from Gemini).
    *   [x] Implement animations, charts, and color-coded indicators.
    *   [x] Develop UI elements for "Approve," "Decline," "Refer to Credit Committee," "Override (with justification)."

#### 4. Trade-Based Money Laundering Check (TBML Engine)
*   [x] **4.2.9. TBML Module UI:**
    *   [x] Develop interactive components for:
        *   [x] Network graph visualization.
        *   [x] Highlighting suspicious links.
        *   [x] Displaying invoice mispricing.
        *   [x] Visualizing shipment routes.
    *   [x] Integrate with the TBML Engine backend.

#### 5. Final Decision Flow
*   [x] **4.2.10. Decision Logging UI:**
    *   [x] Implement UI elements for final actions: Approve, Decline, Refer Upwards, Send to Compliance, Schedule Review.
    *   [x] Ensure the UI logs decision details (decision, time, overrides, reason, supporting documents) with backend integration (Governance Engine).

#### 6. Portfolio Monitoring (After Approval)
*   [x] **4.2.11. Portfolio Monitoring Dashboard:**
    *   [x] Develop UI to display: Daily PD changes, Alerts, Deteriorating accounts, High-risk transactions, Cash flow projections.
    *   [x] Implement drill-down functionality into customer timelines.
    *   [x] Add controls to trigger re-scoring.

#### 7. Governance & Audit Flow
*   [x] **4.2.12. Compliance Officer Console:**
    *   [x] Develop UI for compliance officers to:
        *   [x] Investigate overrides (integrating with Governance Engine audit trails).
        *   [x] Adjust rules (integrating with Governance Engine policy update).
        *   [x] Monitor model drift.
        *   [x] Approve policy changes.

#### 8. Reporting Flow
*   [x] **4.2.13. Reporting Interface:**
    *   [x] Develop UI for executives/analysts to generate:
        *   [x] Portfolio reports.
        *   [x] TBML reports.
        *   [x] Compliance audits.
        *   [x] Basel/ECL outputs.
    *   [x] Implement a "Generate" button that produces PDF/dashboard output instantly.

### Sub-Phase 4.3: Cross-Cutting Concerns
*   [x] **4.3.1. Routing & Navigation:** Implement `go_router` (or similar) for smooth and intuitive navigation between all the new screens and flows.
*   [x] **4.3.2. Error Boundaries & Fallbacks:** Implement React error boundaries for graceful error handling.
*   [x] **4.3.3. Accessibility (A11Y):** Ensure all new UI components meet WCAG guidelines.
*   [x] **4.3.4. Testing:** Develop comprehensive unit, integration, and end-to-end tests for all new frontend features.
