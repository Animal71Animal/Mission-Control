# Dancer Authentication & Music Approval System

**Date:** 2026-05-08
**Status:** Spec — ready for Micah review

---

## Overview

Dancers get their own login credentials and a personalized "My Music" page. Tracks they add require manager approval before entering their folder. This gives managers complete content control while giving dancers self-service convenience.

---

## Dancer Flow

### 1. Login
- Use dancer credentials (username/password)
- System recognizes DANCER role
- Redirected to dancer-specific interface

### 2. "My Music" Page (Only Sidebar Item)

**Search & Add**
- Search Spotify for tracks
- Click "Add Song" on desired track
- Confirmation: "Track submitted for manager approval..."

**Pending Approval Section**
- Yellow cards showing submitted tracks awaiting review
- Track details: title, artist, BPM, energy, genre, explicit flag
- Album artwork thumbnail
- Submission timestamp

**My Tracks Section**
- Green cards showing approved tracks
- Ready for use in sets
- Can remove tracks (does not affect approval status)

---

## Manager Flow (Admin)

### 1. Login
- Use admin credentials
- Full sidebar access

### 2. "Pending Approvals" in Sidebar
- Badge shows count of pending submissions
- One-click access to review queue

### 3. Review Process

**Per Submission Card:**
- Dancer who requested it
- Track details: BPM, energy, genre, explicit flag
- 30-second audio preview
- Album artwork
- Submission timestamp

**Actions:**
- **Approve** → Track added to dancer's folder instantly
- **Reject** → Track removed permanently, dancer notified

---

## Security & Validation (Multi-Layer)

| Layer | Description |
|-------|-------------|
| Banned Words Filter | Checks title/artist (case-insensitive) against venue ban list |
| Explicit Content Flag | Optional auto-rejection (Settings toggle) |
| Duplicate Prevention | Can't submit same track twice |
| Manager Approval | Human review before use — final gate |
| Role-Based Access | Dancers see only their own pending/approved tracks |

---

## Benefits

### For Managers
- Complete control over content
- Easy review process (one-click approve/reject)
- No cleanup needed (tracks never reach folders until approved)
- Audio preview for informed decisions
- Clear audit trail (who submitted what)

### For Dancers
- Clear submission status visibility
- Know what's pending vs. approved
- Can't accidentally use unapproved tracks
- Helpful guidance text
- Clean, organized interface

### For the Business
- Liability protection (pre-approval prevents issues)
- Quality control (every track vetted)
- Compliance with venue standards
- Professional management
- Scalable process

---

## Technical Notes

- Dancer model has `userId` field linking to User accounts
- DANCER role is dedicated role in RBAC system
- Each dancer has personal profile + preferences
- Approval state machine: `pending` → `approved` | `rejected`
- Audit log: who submitted, who approved/rejected, timestamps
