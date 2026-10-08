/**
 * FUNDORA - FIREBASE CLOUD FUNCTIONS ARCHITECTURE (STEP 17)
 * Server-authoritative operations, transactional credit ledger processing,
 * automated user provisioning, and deadline notifications.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Admin SDK with service-level privileges
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * 1. AUTH TRIGGER: onUserCreated
 * Runs whenever a new account is registered in Firebase Authentication.
 * Provisions user profile, initializes credit wallet with 50 complimentary credits,
 * and sends an initial welcome notification.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const userId = user.uid;
  const email = user.email || '';
  const displayName = user.displayName || email.split('@')[0] || 'User';
  const now = admin.firestore.FieldValue.serverTimestamp();

  const batch = db.batch();

  // 1. users/{userId}
  const userRef = db.collection('users').doc(userId);
  batch.set(userRef, {
    id: userId,
    email,
    displayName,
    photoURL: user.photoURL || null,
    role: 'user',
    accountStatus: 'active',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  }, { merge: true });

  // 2. userProfiles/{userId}
  const profileRef = db.collection('userProfiles').doc(userId);
  batch.set(profileRef, {
    userId,
    country: '',
    region: 'Global',
    interests: [],
    fundingTypes: [],
    opportunityCategories: [],
    userType: 'Individual',
    businessStage: 'Early Stage',
    industry: 'General',
    organizationName: '',
    profileCompletion: 20,
    preferences: {
      emailAlerts: true,
      weeklyDigest: true,
      deadlineReminders: true,
      matchThreshold: 70,
    },
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  // 3. creditWallets/{userId}
  const walletRef = db.collection('creditWallets').doc(userId);
  batch.set(walletRef, {
    userId,
    balance: 50, // 50 welcome credits
    lifetimeEarned: 50,
    lifetimeUsed: 0,
    updatedAt: now,
  }, { merge: true });

  // 4. creditTransactions/{transactionId}
  const txRef = db.collection('creditTransactions').doc();
  batch.set(txRef, {
    id: txRef.id,
    userId,
    type: 'bonus',
    amount: 50,
    feature: 'Welcome Bonus',
    description: 'Complimentary credits granted for registering on FUNDORA.',
    createdAt: now,
  });

  // 5. users/{userId}/notifications/{notificationId}
  const notifRef = db.collection('users').doc(userId).collection('notifications').doc();
  batch.set(notifRef, {
    id: notifRef.id,
    type: 'system',
    title: 'Welcome to FUNDORA!',
    message: 'Your account is ready. You have received 50 complimentary discovery credits.',
    relatedOpportunityId: null,
    read: false,
    createdAt: now,
  });

  await batch.commit();
  console.log(`[Cloud Functions] Successfully provisioned new user: ${userId}`);
});

/**
 * 2. TRANSACTIONAL CREDIT OPERATION: processCreditTransaction
 * Server-authoritative credit ledger handling.
 * Enforces atomic balance verification and ledger integrity.
 */
export const processCreditTransaction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to execute credit transactions.'
    );
  }

  const userId = context.auth.uid;
  const { amount, feature, description, reference } = data;

  if (typeof amount !== 'number' || amount === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Amount must be a non-zero number.'
    );
  }

  const walletRef = db.collection('creditWallets').doc(userId);
  const txRef = db.collection('creditTransactions').doc();

  return await db.runTransaction(async (transaction) => {
    const walletSnap = await transaction.get(walletRef);

    if (!walletSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Credit wallet not found.');
    }

    const currentWallet = walletSnap.data()!;
    const newBalance = currentWallet.balance + amount;

    // Reject deduction if insufficient funds
    if (newBalance < 0) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Insufficient credits. Required: ${Math.abs(amount)}, Available: ${currentWallet.balance}`
      );
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    // 1. Update wallet balance atomically
    transaction.update(walletRef, {
      balance: newBalance,
      lifetimeEarned: amount > 0 ? (currentWallet.lifetimeEarned || 0) + amount : currentWallet.lifetimeEarned,
      lifetimeUsed: amount < 0 ? (currentWallet.lifetimeUsed || 0) + Math.abs(amount) : currentWallet.lifetimeUsed,
      updatedAt: now,
    });

    // 2. Insert immutable transaction log entry
    transaction.set(txRef, {
      id: txRef.id,
      userId,
      type: amount > 0 ? 'purchase' : 'usage',
      amount,
      feature: feature || 'Standard Feature',
      description: description || 'Credit operation',
      reference: reference || null,
      createdAt: now,
    });

    return {
      success: true,
      transactionId: txRef.id,
      newBalance,
    };
  });
});

/**
 * 3. CRON JOB: scheduledDeadlineCheck
 * Runs daily to check for upcoming deadlines on published opportunities
 * and dispatches reminder notifications to users who have saved them.
 */
export const scheduledDeadlineCheck = functions.pubsub
  .schedule('0 6 * * *') // 6:00 AM UTC daily
  .timeZone('UTC')
  .onRun(async () => {
    const now = new Date();
    const threeDaysOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const urgentOppsSnap = await db
      .collection('opportunities')
      .where('status', '==', 'published')
      .where('deadline', '==', threeDaysOut)
      .get();

    if (urgentOppsSnap.empty) {
      return null;
    }

    console.log(`[Deadline Checker] Found ${urgentOppsSnap.size} opportunities closing in 3 days.`);

    for (const oppDoc of urgentOppsSnap.docs) {
      const opp = oppDoc.data();

      // Find users who have saved this opportunity via collectionGroup query
      const savedGroupSnap = await db
        .collectionGroup('savedOpportunities')
        .where('opportunityId', '==', opp.id)
        .get();

      for (const savedDoc of savedGroupSnap.docs) {
        // Parent document is users/{userId}
        const userRef = savedDoc.ref.parent.parent;
        if (!userRef) continue;

        const notifRef = userRef.collection('notifications').doc();
        await notifRef.set({
          id: notifRef.id,
          type: 'deadline',
          title: `3 Days Left: ${opp.title}`,
          message: `The application deadline for ${opp.title} (${opp.providerName}) closes on ${opp.deadline}.`,
          relatedOpportunityId: opp.id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    return null;
  });
