import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useUserStore } from 'stores/user';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { firebaseConfig } from 'src/secrets';
//TODO: Add secrets file - https://support.google.com/firebase/answer/7015592

const protectedRoutes = ['/dash', '/edit'];
// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
export default boot(async ({ app, urlPath, redirect, router }) => {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  const userStore = useUserStore();
  auth.onAuthStateChanged((user) => {
    userStore.$patch({ user: user });
  });
  if ((userStore.isUserSignedIn && urlPath == '/') || urlPath == '/#/') {
    redirect('/dash');
  }
  router.beforeEach((to, from, next) => {
    if (protectedRoutes.includes(to.path) && !userStore.isUserSignedIn) {
      next('/');
    } else {
      next();
    }
  });
  db = getFirestore(firebaseApp);
});

export { firebaseApp, auth, db };
