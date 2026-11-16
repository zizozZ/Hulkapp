/**
 * HULK - Secure Super Admin Provisioning Script (100% Free Spark Plan Compatible)
 * Run locally via: node scripts/seedAdmin.js
 * Requires serviceAccountKey.json downloaded from Firebase Console -> Project Settings -> Service Accounts
 */
const admin = require('firebase-admin');
const readline = require('readline');

let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (err) {
  console.error('❌ Error: serviceAccountKey.json not found in project root.');
  console.error('Download it from Firebase Console > Project Settings > Service Accounts > Generate new private key.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  try {
    console.log('\n=== HULK SUPER ADMIN PROVISIONING (FREE SPARK PLAN) ===');
    const fullName = await ask('Admin Full Name (e.g., Ziad Tarik): ');
    const email = await ask('Admin Email: ');
    const password = await ask('Admin Password (min 8 chars): ');

    if (!email || password.length < 8) {
      throw new Error('Valid email and password (min 8 chars) are required.');
    }

    const existingAdmins = await admin.firestore().collection('users').where('role', '==', 'admin').get();
    if (!existingAdmins.empty) {
      throw new Error('A Super Admin account already exists in Firestore. Only one primary Admin is permitted.');
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName || 'HULK Super Admin',
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

    const now = admin.firestore.FieldValue.serverTimestamp();
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      fullName: fullName || 'HULK Super Admin',
      role: 'admin',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    await admin.firestore().collection('appSettings').doc('global').set({
      appName: 'HULK',
      slogan: 'TRAIN HARD. TRACK SMART.',
      defaultLanguage: 'ar',
      englishEnabled: false,
      storageProvider: 'Cloudinary Free',
      updatedAt: now,
    }, { merge: true });

    await admin.firestore().collection('activityLogs').add({
      actorId: userRecord.uid,
      actorName: fullName || 'Super Admin',
      actorRole: 'admin',
      action: 'SUPER_ADMIN_INITIALIZED',
      details: `Super Admin account created for ${email}`,
      createdAt: now,
    });

    console.log(`\n✅ Success! Super Admin created with UID: ${userRecord.uid}`);
    console.log('You can now log into HULK using these credentials.\n');
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
})();
