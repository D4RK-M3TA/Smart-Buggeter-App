# Sequence Diagrams

## Transaction Upload and Processing Flow

```
User                    Frontend              Backend API          Celery Worker        ML Engine        Database
 |                          |                      |                     |                  |                |
 |-- Upload CSV ---------->|                      |                     |                  |                |
 |                          |-- POST /upload ----->|                     |                  |                |
 |                          |                      |-- Create Upload --->|                  |                |
 |                          |                      |    Record           |                  |                |
 |                          |<-- Upload ID --------|                     |                  |                |
 |                          |                      |-- Queue Task ------->|                  |                |
 |                          |                      |                     |                  |                |
 |                          |                      |                     |-- Parse CSV ----->|                |
 |                          |                      |                     |                  |                |
 |                          |                      |                     |-- Load Model ----->|                |
 |                          |                      |                     |                  |                |
 |                          |                      |                     |-- For each tx:    |                |
 |                          |                      |                     |  - Predict cat --->|                |
 |                          |                      |                     |  - Create tx ----->|                |
 |                          |                      |                     |                  |                |
 |                          |                      |                     |-- Detect recurring|                |
 |                          |                      |                     |  patterns ------->|                |
 |                          |                      |                     |                  |                |
 |                          |                      |<-- Task Complete ---|                  |                |
 |                          |                      |                     |                  |                |
 |<-- Notification ---------|                      |                     |                  |                |
```

## Authentication Flow with MFA

```
User                    Frontend              Backend API          Database
 |                          |                      |                   |
 |-- Login Request -------->|                      |                   |
 |                          |-- POST /login ------->|                   |
 |                          |                      |-- Verify User ---->|
 |                          |                      |<-- User Data -----|  (MFA enabled)
 |                          |<-- MFA Required -----|                   |
 |                          |                      |                   |
 |-- Enter OTP ------------>|                      |                   |
 |                          |-- POST /login ------->|                   |
 |                          |  (with OTP)          |                   |
 |                          |                      |-- Verify OTP ----->|
 |                          |                      |<-- Valid ---------|                   |
 |                          |                      |                   |
 |                          |                      |-- Create Session ->|
 |                          |                      |-- Generate Tokens |                   |
 |                          |<-- Tokens + Session -|                   |
 |<-- Store Tokens ---------|                      |                   |
```

## Budget Alert Flow

```
Celery Beat          Celery Worker        Database          Notification Service      User
 |                        |                   |                      |                  |
 |-- Schedule ----------->|                   |                      |                  |
 |                        |-- Check Budgets ->|                      |                  |
 |                        |<-- Budget Data ---|                      |                  |
 |                        |                   |                      |                  |
 |                        |-- For each budget:|                      |                  |
 |                        |  - Check % used   |                      |                  |
 |                        |  - If > threshold:|                      |                  |
 |                        |    Create Alert ->|                      |                  |
 |                        |                   |                      |                  |
 |                        |-- Send Email ----->|                      |                  |
 |                        |                   |                      |-- Email -------->|
 |                        |                   |                      |                  |
 |                        |-- Send Webhook --->|                      |                  |
 |                        |                   |                      |-- Webhook ------->|
```

## Bill Splitting Flow

```
User A               Frontend              Backend API          Database
 |                      |                      |                   |
 |-- Create Group ----->|                      |                   |
 |                      |-- POST /groups ----->|                   |
 |                      |                      |-- Create Group --->|
 |                      |                      |-- Add Members ---->|
 |                      |<-- Group Created ----|                   |
 |                      |                      |                   |
 |-- Add Expense ------->|                      |                   |
 |                      |-- POST /expenses --->|                   |
 |                      |                      |-- Create Expense ->|
 |                      |                      |-- Create Shares -->|
 |                      |<-- Expense Created -|                   |
 |                      |                      |                   |
 |-- View Balance ------>|                      |                   |
 |                      |-- GET /balance ----->|                   |
 |                      |                      |-- Calculate ------->|
 |                      |<-- Balance Data -----|                   |
 |                      |                      |                   |
 |-- Mark Paid --------->|                      |                   |
 |                      |-- PATCH /share ----->|                   |
 |                      |                      |-- Update Share ---->|
 |                      |<-- Updated ----------|                   |
```

## ML Model Training Flow

```
Admin                Backend API          ML Engine          File System
 |                      |                      |                  |
 |-- Train Request ---->|                      |                  |
 |                      |-- Load Training Data |                  |
 |                      |                      |                  |
 |                      |-- Build Pipeline ---->|                  |
 |                      |                      |                  |
 |                      |-- Train Model ------>|                  |
 |                      |                      |                  |
 |                      |-- Evaluate ---------|                  |
 |                      |                      |                  |
 |                      |-- Save Model ------->|                  |
 |                      |                      |-- Save to disk -->|
 |                      |<-- Model Saved ------|                  |
 |<-- Training Results -|                      |                  |
```

## Export Flow

```
User                    Frontend              Backend API          Database          File System
 |                          |                      |                   |                  |
 |-- Request Export ------->|                      |                   |                  |
 |                          |-- GET /export ------->|                   |                  |
 |                          |                      |-- Query Data ---->|                  |
 |                          |                      |<-- Transactions --|                  |
 |                          |                      |                   |                  |
 |                          |                      |-- Generate CSV/Excel/PDF |                  |
 |                          |                      |                   |                  |
 |                          |<-- File Download ----|                   |                  |
 |<-- Download File --------|                      |                   |                  |
```

