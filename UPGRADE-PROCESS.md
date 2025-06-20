# Subscription Upgrade Process

This document outlines the improved subscription upgrade process implemented to fix issues with old subscriptions not being properly marked as canceled during plan upgrades.

## Problem

When a user upgrades from one plan to another (e.g., Gold to Diamond), both subscriptions were sometimes showing as "active" in the database. This occurred because:

1. The new subscription was created and set to "active"
2. The system attempted to cancel the old subscription but:
   - If the PayPal API call failed, the database wasn't properly updated
   - If there was a timing issue between creating the new subscription and canceling the old one, the user could be left with both active

## Solution: Two-Phase Commit Pattern

The new implementation uses a two-phase commit pattern to ensure robust handling of subscription upgrades:

### Phase 1: Preparation
1. When a user initiates an upgrade, existing active subscriptions are marked as "pending_upgrade" (not canceled yet)
2. The new subscription is created in PayPal and our database

### Phase 2: Confirmation
1. Only when PayPal confirms the new subscription is active (via webhook or API check):
   - All subscriptions in "pending_upgrade" status are properly canceled in both the database and PayPal
   - The profile is updated to reflect the new plan

### Failure Handling
If the payment for the new subscription fails:
1. Any subscriptions in "pending_upgrade" status are automatically restored to "active"
2. The failed subscription is marked as "payment_failed"
3. The user's profile is restored to its previous state

## Technical Implementation

The implementation spans several components:

1. **Database Migration**: Added `pending_upgrade` and `payment_failed` status values to the `subscriptions` table

2. **PayPal Webhook Handler**:
   - Detects payments that are part of an upgrade process
   - Handles failure scenarios and restores previous subscriptions if needed
   - Properly cancels old subscriptions once upgrades are confirmed

3. **Client-Side Logic**:
   - Enhanced `PaymentDialog` to detect and handle the two-phase process
   - Improved feedback to users during the upgrade process

## Expected Behavior

- **Successful Upgrade**: 
  - Old subscription transitions from "active" to "pending_upgrade" to "canceled"
  - New subscription becomes "active"
  - Profile is updated to the new plan

- **Failed Upgrade**:
  - Old subscription transitions from "active" to "pending_upgrade" then back to "active"
  - Failed new subscription is marked as "payment_failed"
  - Profile retains the original plan

## Deployment Notes

1. The `supabase/migrations/add-pending-upgrade-status.sql` script must be run to add the new status values to the database.

2. The changes are backward compatible with existing subscriptions:
   - Existing "active" subscriptions continue to work without interruption
   - The new process is only applied to new upgrades

## Troubleshooting

If a user has multiple "active" subscriptions after these changes:

1. Use the sync feature in the admin panel to force a refresh from PayPal
2. Check for any subscriptions stuck in "pending_upgrade" status
3. Manually run the `restorePendingUpgradeSubscriptions` or `cancelExistingActiveSubscriptions` functions as appropriate 