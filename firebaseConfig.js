import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-6lDE7V3OhA0Vdw3lVMN7BonuFdsc_eM",
  authDomain: "kidneymate-fd9e5.firebaseapp.com",
  projectId: "kidneymate-fd9e5",
  storageBucket: "kidneymate-fd9e5.appspot.com",
  messagingSenderId: "328231567625",
  appId: "1:328231567625:web:c2109a925cf29ba4b313d8"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

export { firebaseConfig, auth, firestore };
