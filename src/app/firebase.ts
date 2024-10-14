import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set,remove } from 'firebase/database';
import { signInWithEmailAndPassword } from 'firebase/auth';
import 'firebase/database';
const firebaseConfig = {
    apiKey: 'AIzaSyBjFH2M1NFO3Hz4Qtw63BW348kRIobqeKs',
    authDomain: '<AUTH_DOMAIN>',
    projectId: 'crm-5784d'
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db =  getDatabase(app);

export { auth };
export {db};