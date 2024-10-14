import { Component, OnInit } from '@angular/core';
import { getFirestore, collection, getDocs, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBjFH2M1NFO3Hz4Qtw63BW348kRIobqeKs',
  authDomain: '<AUTH_DOMAIN>',
  projectId: 'crm-5784d'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export const DB_PROVIDER = {
  provide: 'DB',
  useValue: db
};
@Component({
  selector: 'app-wehbook',
  templateUrl: './wehbook.page.html',
  styleUrls: ['./wehbook.page.scss'],
})
export class WehbookPage implements OnInit {
  
  constructor() { }
  
  crmData: any[] = [];
  private unsubscribe!: () => void;

  async ngOnInit() {
    console.log('ngOnInit called');
    await this.getData();
  }
  
  async getData() {
    console.log('getData called');
    const query = collection(db, 'CRM');
    this.unsubscribe = onSnapshot(query, (querySnapshot) => {
      console.log('querySnapshot:', querySnapshot);
      this.crmData = [];
      querySnapshot.forEach((doc) => {
        console.log('doc:', doc.data());
        this.crmData.push(doc.data());
      });
      console.log('crmData:', this.crmData);
    });
  }
  
  ngOnDestroy() {
    this.unsubscribe();
  }
}
