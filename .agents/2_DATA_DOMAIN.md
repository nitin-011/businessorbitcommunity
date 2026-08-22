# Data Domain & Models

This document outlines the core entities in the MongoDB database and their relationships.

## Core Entities

### 1. `Business`
- **Purpose**: Represents a company or individual applying to join the network.
- **Lifecycle**: Starts as `pending`. An Admin must approve them. Upon approval, their status changes to `approved`, and a corresponding `CommunityMember` account is automatically generated for them.
- **Key Fields**: `name`, `company`, `role`, `stage`, `email`, `status` (pending/approved/rejected).

### 2. `CommunityMember`
- **Purpose**: Represents an active, authenticated user of the community portal.
- **Creation**: Either seeded directly or auto-generated when a `Business` application is approved.
- **Key Fields**: `username`, `email` (unique), `password` (hashed), `role`, `status` (active/suspended).

### 3. `Admin`
- **Purpose**: System operators with access to the `/admin` dashboard.
- **Capabilities**: Can approve/reject businesses, view stats, manage community members.
- **Key Fields**: `email` (unique), `password` (hashed).

### 4. `OrbitCardOrder`
- **Purpose**: Tracks e-commerce transactions for purchasing the physical Orbit Card.
- **Relationships**: Optionally links to a `CommunityMember` via `memberId`.
- **Payment State Machine**: 
  - `PENDING`: Initiated via PhonePe SDK.
  - `SUCCESS`: Webhook/S2S callback confirmed successful payment.
  - `FAILED`: Payment was declined or cancelled.
- **Key Fields**: `transactionId` (unique order ref), `amount`, `status`, `shippingAddress`.

### 5. `LoginAttempt`
- **Purpose**: Security model to track failed login attempts and prevent brute-force attacks.
- **Key Fields**: `identifier` (Combination of IP address and email). 

### 6. `Student`
- **Purpose**: A parallel user entity (currently pending full implementation/integration). Designed for student applications separate from business applications.

## Design Rules for AI Agents
- **No Foreign Keys (Soft Relations)**: Mongoose `.populate()` is rarely used. Documents reference each other loosely (e.g., `OrbitCardOrder.memberId` stores the string ID of a CommunityMember).
- **Email Normalization**: Always lowercase emails before saving or querying to prevent duplicate identity bugs.
- **Soft Deletes vs Status**: Prefer changing a document's `status` (e.g., `status: "suspended"`) over deleting it permanently from the database.
