import { Component, OnInit } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { ToastController,NavController } from '@ionic/angular';
import { auth } from '../firebase';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set ,push} from 'firebase/database';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-add-contacts',
  templateUrl: './add-contacts.page.html',
  styleUrls: ['./add-contacts.page.scss'],
})
export class AddContactsPage implements OnInit {
   firebaseConfig = {
    apiKey: 'AIzaSyBjFH2M1NFO3Hz4Qtw63BW348kRIobqeKs',
    authDomain: '<AUTH_DOMAIN>',
    projectId: 'crm-5784d'
  };
 app = initializeApp(this.firebaseConfig);
 db = getDatabase(this.app);
  router: any;

  constructor(private toastController: ToastController,private navC:NavController,private modalController: ModalController) { }
  firstName: any;
  lastName: any;
  mobileNumber: any;
  altNumber: any;
  description: any;
  designation: any;
  address: any;
  email: any;
  website: any;
  ngOnInit() {
  }
  saveUserInfo() {
    const uid = localStorage.getItem('uid');
  
    const userInfo: any = {
      firstName: this.firstName,
      lastName: this.lastName,
      mobileNumber: this.mobileNumber,
      altNumber: this.altNumber,
      description: this.description,
      designation: this.designation,
      address: this.address,
      email: this.email,
      website: this.website
    };
  
    const newContactRef = push(ref(this.db, `contacts/${uid}/`));
    set(newContactRef, userInfo)
    .then(async () => {
      console.log(`User info saved successfully with key ${newContactRef.key}!`);
      
      const toast = await this.toastController.create({
        message: 'User info saved successfully!',
        duration: 2000
      });
      toast.present();
     
      this.navC.navigateRoot('/tab2');
    })
    .catch(async (error) => {
      console.log(error);
      const toast = await this.toastController.create({
        message: 'Error saving user info: ' + error,
        duration: 2000
      });
      toast.present();
    });
  }
  backButtonClick() {
    this.modalController.dismiss();
  }
  
}
