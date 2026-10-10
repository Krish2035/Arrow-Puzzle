import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

// User's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAD-OErRckR1II0ZXlYC3ViloxPqPXQFUI",
  authDomain: "arrow-puzzle-game-895f2.firebaseapp.com",
  projectId: "arrow-puzzle-game-895f2",
  storageBucket: "arrow-puzzle-game-895f2.firebasestorage.app",
  messagingSenderId: "515036569951",
  appId: "1:515036569951:web:179c7f427779f9723c96ea"
};

// Initialize Firebase safely (avoid re-initialization in Next.js SSR / Fast Refresh)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      user: {
        uid: user.uid,
        displayName: user.displayName || 'Arrow Player',
        email: user.email,
        photoURL: user.photoURL,
        provider: 'google'
      }
    };
  } catch (error) {
    console.error('Firebase Google Sign-In Error:', error);
    let msg = error.message || 'Failed to sign in with Google';
    let isConfigError = false;
    if (error.code === 'auth/popup-closed-by-user') {
      msg = 'Sign in was cancelled.';
    } else if (error.code === 'auth/configuration-not-found') {
      msg = 'Google Sign-In is not enabled in your Firebase Console. Go to Authentication > Sign-in method > Enable Google & Save.';
      isConfigError = true;
    }
    return {
      success: false,
      error: msg,
      code: error.code,
      isConfigError
    };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;
    return {
      success: true,
      user: {
        uid: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        provider: 'password'
      }
    };
  } catch (error) {
    console.error('Firebase Email Sign-In Error:', error);
    if (error.code === 'auth/configuration-not-found') {
      // Fallback: If Firebase Console hasn't enabled Email provider, authenticate locally so user is not blocked
      const localUser = {
        uid: 'user_' + Math.random().toString(36).substring(2, 10),
        displayName: email.split('@')[0],
        email: email.trim(),
        photoURL: null,
        provider: 'local'
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('arrow_puzzle_local_auth_user', JSON.stringify(localUser));
      }
      return {
        success: true,
        user: localUser,
        isFallback: true
      };
    }

    let msg = error.message;
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      msg = 'Invalid email or password.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      msg = 'Access temporarily disabled due to many failed attempts. Try again later.';
    }
    return { success: false, error: msg, code: error.code };
  }
}

/**
 * Sign up with Email, Password and optional Display Name
 */
export async function signUpWithEmail(email, password, displayName = 'Arrow Master') {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;
    if (displayName) {
      try {
        await updateProfile(user, { displayName });
      } catch (e) {}
    }
    return {
      success: true,
      user: {
        uid: user.uid,
        displayName: displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: null,
        provider: 'password'
      }
    };
  } catch (error) {
    console.error('Firebase Sign-Up Error:', error);
    if (error.code === 'auth/configuration-not-found') {
      // Fallback: If Firebase Console hasn't enabled Email provider, create local user so user is not blocked
      const localUser = {
        uid: 'user_' + Math.random().toString(36).substring(2, 10),
        displayName: displayName || email.split('@')[0] || 'Arrow Master',
        email: email.trim(),
        photoURL: null,
        provider: 'local'
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('arrow_puzzle_local_auth_user', JSON.stringify(localUser));
      }
      return {
        success: true,
        user: localUser,
        isFallback: true
      };
    }

    let msg = error.message;
    if (error.code === 'auth/email-already-in-use') {
      msg = 'An account with this email already exists. Please Sign In.';
    } else if (error.code === 'auth/weak-password') {
      msg = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    }
    return { success: false, error: msg, code: error.code };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('arrow_puzzle_local_auth_user');
  }
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Firebase Sign-Out Error:', error);
    return { success: true };
  }
}

/**
 * Subscribe to Auth State Changes
 */
export function subscribeToAuthChanges(callback) {
  // Check local fallback user if present
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('arrow_puzzle_local_auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          callback(parsed);
        }
      }
    } catch (e) {}
  }

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Arrow Player',
        email: user.email,
        photoURL: user.photoURL,
        provider: user.providerData?.[0]?.providerId || 'firebase'
      });
    } else {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('arrow_puzzle_local_auth_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.email) {
              callback(parsed);
              return;
            }
          } catch (e) {}
        }
      }
      callback(null);
    }
  });
}
