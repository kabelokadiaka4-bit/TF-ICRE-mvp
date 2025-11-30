# TF-ICRE™ Frontend Master Plan

This document outlines the comprehensive roadmap for the **TF-ICRE™ Frontend**, transforming it into a production-grade, government-level "Financial Operating System" for Africa. It aligns with the backend microservices architecture.

---

## 1. User Auth & Access Control Module 🔐
*Secure, role-based access to the platform.*

- [x] **Authentication Flow Upgrade:**
    - [x] Enhance `AuthContext` to handle session persistence and token refreshing.
    - [x] Implement `RoleBasedRoute` component to protect specific pages (e.g., Admin vs. Analyst).
- [ ] **User Profile Management:**
    - [ ] Create `/settings/profile` page.
    - [ ] Allow avatar upload and preference settings (Dark/Light mode, Notification preferences).
- [ ] **Multi-Tenancy (Consortium Support):**
    - [ ] Update UI to handle "Organization/DFI" context switching (if a user belongs to multiple).
- [ ] **"Forgot Password" and "Reset Password" flows via Firebase.**

## 2. Real-Time Dashboard (Executive & Analyst) 📊
*High-performance visualization of risk and operations.*

- [x] **Executive Dashboard (`/executive`):**
    - [x] **Interactive Risk Map:** Implement a functional geospatial map (using `react-leaflet`) showing exposure by country.
    - [x] **Live Ticker:** Add a scrolling ticker for real-time FX rates and commodity prices.
    - [x] **Trend Analysis:** Upgrade charts to allow "Zoom/Pan" and date range filtering.
- [ ] **Analyst Console (`/analyst`):**
    - [ ] **WebSocket Integration:** Connect to `scoring-engine` for real-time status updates on pending loan applications.
    - [ ] **Task Queue:** A Kanban-style board for managing loan applications (New, In Review, Approved, Rejected).

## 3. Data Management UI 🗄️
*Interface for the Data Ingestion pipeline.*

- [ ] **Data Ingestion Hub (`/data/ingestion`):**
    - [ ] **Drag-and-Drop Upload:** Area for uploading bulk CSV/Excel files to Cloud Storage.
    - [ ] **Pipeline Status Monitor:** Visual view of Airflow DAGs statuses (Success/Fail/Running) fetched via API.
    - [ ] **Data Catalog Browser:** A searchable table of available datasets (BigQuery tables) with metadata details.
- [ ] **Quality Dashboard (`/data/quality`):**
    - [ ] Visual report of Data Quality scores (Completeness, Accuracy, Timeliness) from the `data_quality_check` pipeline.

## 4. API Integration Layer 🔌
*Robust connection between UI and Microservices.*

- [x] **Advanced API Client:**
    - [x] Implement request retries and exponential backoff in `api.ts`.
    - [x] Global Error Boundary to catch 401/403/500 errors and display user-friendly toasts.
- [x] **Service Gateways:**
    - [x] `ScoringService`: For scoring and explanation endpoints.
    - [x] `TbmlService`: For transaction checks and graph network data.
    - [x] `GovernanceService`: For model registry and policy updates.
    - [ ] `AdminService`: For user management and system config.

## 5. Reporting Engine 📑
*Generate and export regulatory and operational reports.*

- [ ] **Report Builder UI (`/reporting`):**
    - [ ] Form builder to select parameters (Date Range, Jurisdiction, Risk Level).
    - [ ] "Generate PDF/CSV" buttons triggering backend generation.
- [ ] **Scheduled Reports:**
    - [ ] UI to schedule recurring reports (e.g., "Send Weekly NPL Report to Risk Committee").
- [ ] **Report Archive:**
    - [ ] Table view of previously generated reports for download.

## 6. Governance & Compliance Console ⚖️
*Manage AI models and Regulations-as-Code.*

- [ ] **Model Registry UI (`/governance/models`):**
    - [ ] Detailed "Model Card" view (Performance metrics, Training data lineage, Bias audit results).
    - [ ] "Promote to Production" approval workflow buttons.
- [ ] **Policy Editor (`/governance/policies`):**
    - [ ] Code editor (Monaco Editor) for viewing/editing OPA (`.rego`) policies with syntax highlighting.
    - [ ] Version history view for policies.
- [ ] **Audit Log Explorer (`/governance/audit`):**
    - [ ] Advanced filterable table for querying the immutable audit trail (Who did what, when?).

## 7. Admin Control Panel ⚙️
*System configuration and user management.*

- [ ] **User Management (`/admin/users`):**
    - [ ] Table to List, Invite, Suspend users.
    - [ ] Role assignment (Assign 'Analyst', 'Manager', 'Admin' roles).
- [ ] **System Configuration (`/admin/settings`):**
    - [ ] UI to toggle Feature Flags.
    - [ ] Configuration for Risk Thresholds (e.g., "Auto-Approval Threshold").
- [ ] **AI Agent Config:**
    - [ ] Settings to configure the LLM prompts and "Temperature" for the Explainability engine.

## 8. UI/UX Polish (The "Million Dollar" Look) ✨
- [ ] **Global Search:** `Cmd+K` command palette to navigate anywhere in the app.
- [ ] **Theme Customization:** Advanced theme provider allowing Font size scaling and High Contrast mode (Accessibility).
- [ ] **Micro-interactions:**
    - [ ] Loading skeletons for all data fetching states.
    - [ ] Smooth page transitions (Framer Motion).
    - [ ] Success/Error Toast notifications (using `sonner`).