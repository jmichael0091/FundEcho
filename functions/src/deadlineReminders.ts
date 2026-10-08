/**
 * FUNDORA - SCHEDULED DEADLINE REMINDER CLOUD FUNCTION (STEP 23)
 * Runs daily on Google Cloud Functions via Cloud Scheduler (e.g. 06:00 UTC).
 * 
 * Deployment:
 * firebase deploy --only functions:scheduledDeadlineReminders
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin SDK if not yet initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const scheduledDeadlineReminders = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('UTC')
  .onRun(async (_context) => {
    console.log('[CloudFunction] Running scheduled deadline reminder scan...');

    try {
      // 1. Fetch active applications
      const appsSnap = await db
        .collection('applications')
        .where('status', 'in', ['Planning', 'In Progress'])
        .get();

      if (appsSnap.empty) {
        console.log('[CloudFunction] No active applications found.');
        return null;
      }

      const now = new Date();
      const midnightNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

      let remindersCreated = 0;

      for (const doc of appsSnap.docs) {
        const app = doc.data();
        if (!app.deadline || app.deadline.toLowerCase().includes('rolling')) {
          continue;
        }

        const parsedDeadline = new Date(app.deadline);
        if (isNaN(parsedDeadline.getTime())) continue;

        const midnightDeadline = Date.UTC(
          parsedDeadline.getUTCFullYear(),
          parsedDeadline.getUTCMonth(),
          parsedDeadline.getUTCDate()
        );

        const diffDays = Math.round((midnightDeadline - midnightNow) / (1000 * 60 * 60 * 24));

        // Skip past/expired deadlines (Rule 9 & 17)
        if (diffDays < 0) continue;

        // Map intervals
        let intervalKey: string | null = null;
        let title = '';
        let message = '';

        if (diffDays === 0) {
          intervalKey = '0d';
          title = `Final Day: ${app.opportunityTitle}`;
          message = `Today is the final day to submit your application for "${app.opportunityTitle}".`;
        } else if (diffDays === 1) {
          intervalKey = '1d';
          title = `1 Day Remaining: ${app.opportunityTitle}`;
          message = `Your application for "${app.opportunityTitle}" is due tomorrow.`;
        } else if (diffDays === 3) {
          intervalKey = '3d';
          title = `3 Days Remaining: ${app.opportunityTitle}`;
          message = `The deadline for "${app.opportunityTitle}" closes in 3 days.`;
        } else if (diffDays === 7) {
          intervalKey = '7d';
          title = `1 Week Remaining: ${app.opportunityTitle}`;
          message = `You have 7 days remaining to finalize your application for "${app.opportunityTitle}".`;
        } else if (diffDays === 14) {
          intervalKey = '14d';
          title = `Deadline in 2 Weeks: ${app.opportunityTitle}`;
          message = `The deadline for "${app.opportunityTitle}" is approaching in 14 days.`;
        }

        if (!intervalKey) continue;

        // Construct unique key
        const cleanDeadline = app.deadline.replace(/[^a-zA-Z0-9_-]/g, '_');
        const deterministicId = `rem_${app.userId}_${app.id}_${intervalKey}_${cleanDeadline}`;

        // Check deduplication
        const existingRecord = await db.collection('reminder_records').doc(deterministicId).get();
        if (existingRecord.exists) {
          continue;
        }

        const batch = db.batch();

        // Write to notifications collection
        const notifRef = db.collection('notifications').doc(deterministicId);
        batch.set(notifRef, {
          id: deterministicId,
          userId: app.userId,
          type: 'Deadline Reminder',
          title,
          message,
          opportunityId: app.opportunityId,
          applicationId: app.id,
          opportunityTitle: app.opportunityTitle,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
          targetPage: 'opportunity-detail',
        });

        // Write to reminder_records for permanent deduplication
        const reminderRecordRef = db.collection('reminder_records').doc(deterministicId);
        batch.set(reminderRecordRef, {
          id: deterministicId,
          userId: app.userId,
          applicationId: app.id,
          opportunityId: app.opportunityId,
          reminderInterval: intervalKey,
          deadline: app.deadline,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();
        remindersCreated++;
      }

      console.log(`[CloudFunction] Completed reminder scan. Generated ${remindersCreated} new reminders.`);
      return { success: true, remindersCreated };
    } catch (err) {
      console.error('[CloudFunction] Error running scheduled deadline reminders:', err);
      throw err;
    }
  });
