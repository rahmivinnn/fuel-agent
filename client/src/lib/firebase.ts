import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

let auth: any = null;
let googleProvider: any = null;

try {
  const firebaseConfig = {
    apiKey: "AIzaSyCiB32fHGkd2ZZsPq3SS5SeOtnuc1iNSgk",
    authDomain: "maviss-d4910.firebaseapp.com",
    projectId: "maviss-d4910",
    storageBucket: "maviss-d4910.firebasestorage.app",
    messagingSenderId: "1046154702406",
    appId: "1:1046154702406:android:b24dbac4652e3b3e132447"
  };

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.warn('Firebase initialization failed:', e);
}

export { auth, googleProvider };