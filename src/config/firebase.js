/**
 * @fileoverview Firebase configuration for ElectionGuide AI.
 * Integrates Firebase Authentication (Google OAuth) and Firestore database.
 * All sensitive config values are loaded from environment variables via Vite.
 * @module config/firebase
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';

/**
 * Firebase configuration object.
 * Values are sourced from environment variables (VITE_ prefix for Vite compatibility).
 * @constant {Object}
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/** @type {boolean} Whether Firebase is properly configured */
const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

/** Firebase app instance (null if not configured) */
let app = null;
/** Firebase Auth instance (null if not configured) */
let auth = null;
/** Firestore database instance (null if not configured) */
let db = null;
/** Google OAuth provider instance */
const googleProvider = new GoogleAuthProvider();

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Firebase not configured. Set VITE_FIREBASE_* env vars to enable auth & database.');
}

/**
 * Signs in the user with Google OAuth popup.
 * @returns {Promise<import('firebase/auth').UserCredential|null>} The user credential or null if Firebase is not configured.
 */
export const signInWithGoogle = async () => {
  if (!auth) {
    console.warn('Firebase Auth not available');
    return null;
  }
  return signInWithPopup(auth, googleProvider);
};

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export const logOut = async () => {
  if (!auth) return;
  return signOut(auth);
};

/**
 * Subscribes to authentication state changes.
 * @param {Function} callback - Called with the user object (or null) on auth state change.
 * @returns {Function} Unsubscribe function.
 */
export const onAuthChange = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

/**
 * Saves a chat message to Firestore for persistence.
 * @param {string} userId - The authenticated user's UID.
 * @param {string} sessionId - The chat session identifier.
 * @param {string} role - Message role ('user' or 'bot').
 * @param {string} text - The message content.
 * @returns {Promise<import('firebase/firestore').DocumentReference|null>}
 */
export const saveChatMessage = async (userId, sessionId, role, text) => {
  if (!db) return null;
  return addDoc(collection(db, 'chatMessages'), {
    userId,
    sessionId,
    role,
    text,
    createdAt: serverTimestamp(),
  });
};

/**
 * Retrieves chat history from Firestore for a specific session.
 * @param {string} userId - The authenticated user's UID.
 * @param {string} sessionId - The chat session identifier.
 * @param {number} [maxMessages=50] - Maximum number of messages to retrieve.
 * @returns {Promise<Array<Object>>} Array of message objects.
 */
export const getChatHistory = async (userId, sessionId, maxMessages = 50) => {
  if (!db) return [];
  const q = query(
    collection(db, 'chatMessages'),
    where('userId', '==', userId),
    where('sessionId', '==', sessionId),
    orderBy('createdAt', 'asc'),
    limit(maxMessages)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Saves a quiz result to Firestore.
 * @param {string} userId - The authenticated user's UID.
 * @param {Object} result - The quiz result object containing score, difficulty, etc.
 * @returns {Promise<import('firebase/firestore').DocumentReference|null>}
 */
export const saveQuizResult = async (userId, result) => {
  if (!db) return null;
  return addDoc(collection(db, 'quizResults'), {
    userId,
    ...result,
    createdAt: serverTimestamp(),
  });
};

export { app, auth, db, isFirebaseConfigured };
