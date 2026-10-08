# FUNDORA — Firebase Notifications & Deadline Alert Infrastructure (Step 23)

This document specifies the architecture, deployment instructions, and integration steps for FUNDORA's server-side notifications, Firebase Cloud Messaging (FCM), and deadline reminder engine.

---

## 1. Notification Collection Schema (`notifications`)

All user notifications reside in the root Firestore collection:
```
notifications/{notificationId}
```

### Document Fields:
- `id`: `string` — Unique document ID (uses deterministic format `rem_${userId}_${applicationId}_${interval}_${deadline}` for deadline reminders to guarantee deduplication).
- `userId`: `string` — The recipient's Firebase Authentication UID.
- `type`: `string` — One of:
  - `Deadline Reminder`
  - `Application Update`
  - `Opportunity Update`
  - `System Notification`
- `title`: `string` — Notification headline.
- `message`: `string` — Full description and guidance.
- `opportunityId`: `string | null` — Associated opportunity ID.
- `applicationId`: `string | null` — Associated application ID.
- `read`: `boolean` — Current read status (true/false).
- `createdAt`: `timestamp | string` — Creation timestamp.
- `scheduledFor`: `timestamp | string | null` — Scheduled target delivery time.
- `deliveredAt`: `timestamp | string | null` — Actual transmission timestamp.

---

## 2. Deterministic Deadline Reminder Architecture

To prevent duplicate alerts when automated tasks or background workers run repeatedly, reminders utilize a deterministic composite ID:
```
rem_${userId}_${applicationId}_${reminderInterval}_${cleanDeadline}
```

### Supported Intervals:
1. **14 days before deadline** (`14d`)
2. **7 days before deadline** (`7d`)
3. **3 days before deadline** (`3d`)
4. **1 day before deadline** (`1d`)
5. **Deadline day** (`0d`)

### Deduplication Guarantee:
Before creating an alert, the engine verifies whether a document with the deterministic ID exists in `notifications` or in the tracking collection `reminder_records/{reminderId}`. If present, the interval alert is skipped.

---

## 3. Server-Side Scheduled Processing

### Option A: Firebase Cloud Functions (Recommended for Production)
The production scheduled function is defined in `functions/src/deadlineReminders.ts`.

#### Deployment Steps:
1. Ensure the Firebase project is upgraded to the **Blaze (pay-as-you-go)** plan to allow external scheduling.
2. Initialize Firebase Functions:
   ```bash
   firebase init functions
   ```
3. Deploy the scheduled function:
   ```bash
   firebase deploy --only functions:scheduledDeadlineReminders
   ```
4. Google Cloud Scheduler will automatically trigger the function daily at `06:00 UTC`.

### Option B: Node/Express Server Processing
FUNDORA's Express server exposes:
```http
POST /api/notifications/process-deadlines
Content-Type: application/json

{
  "userId": "optional_user_id"
}
```
This endpoint executes server-side without relying on browser timers, client loops, or open tabs.

---

## 4. Firebase Cloud Messaging (Push Notifications)

### Device Token Storage:
Tokens are securely stored under:
```
users/{userId}/fcmTokens/{tokenId}
```
Each user can register multiple devices (laptop, mobile phone, tablet).

### Firebase Console Setup for Web Push:
1. Navigate to **Project Settings** > **Cloud Messaging** in Firebase Console.
2. Under **Web configuration**, click **Generate key pair** (VAPID key).
3. Set the environment variable:
   ```env
   VITE_FIREBASE_VAPID_KEY=your_generated_vapid_key
   ```
4. Deploy `firebase-messaging-sw.js` in your web host root (`/public/firebase-messaging-sw.js`).

---

## 5. Extensible Email Delivery Channel

FUNDORA abstracts message creation from transmission via `NotificationDispatcher` in `src/services/notifications/notificationChannels.ts`.

To enable email delivery, simply connect any compliant provider (SendGrid, Postmark, AWS SES, or Firebase "Trigger Email from Firestore" extension):

```typescript
import { defaultNotificationDispatcher } from './src/services/notifications/notificationChannels';

// Attach email adapter
defaultNotificationDispatcher.setAdapter({
  async sendEmail({ to, subject, text, html }) {
    // Call your preferred email provider API
    return { success: true };
  }
});
```
