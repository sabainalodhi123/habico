import { Component, OnInit } from '@angular/core';
import { auth } from '../firebase';
import { Database, getDatabase,ref,get, update,remove,onValue, set,push } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import {db} from '../firebase';
import { NavController, AlertController, LoadingController, MenuController ,ToastController} from '@ionic/angular';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  email: any;
  password: any;
  firstName: any;
  lastName: any;
  confirmPassword: any;
  phoneNumber: any;
  constructor(public toast:ToastController,public navC:NavController,public menuCtrl:MenuController) {

   }

  ngOnInit() {
  }

  async signup(){
    const allowedDomain = 'habicoproperties.com'; // Replace with your allowed domain
    const companyDomain = allowedDomain; // Update companyDomain to match allowedDomain
    const userEmailDomain = this.email.split('@')[1]; // Extract the domain from the user's email
  
    if (userEmailDomain !== companyDomain) {
      console.error('Only ' + companyDomain + ' emails are allowed');
      const toast = await this.toast.create({
        message: 'This email domain is not allowed',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
      console.log(userCredential);
      const toast = await this.toast.create({
        message: 'Signup successful!',
        duration: 2000,
        color: 'success'
      });
      toast.present();
  
      // Create a new CRM user profile
      const userProfile = {
        firstName: this.firstName,
        email: this.email,
        password: this.password,
        uid: userCredential.user.uid
      };
  
      // Get the user's UID from the user credential
      const uid = userCredential.user.uid;
  
      // Create a reference to the 'users' node
      const db = getDatabase();
      const usersRef = ref(db, 'users');
  
      // Create a new child node for the user under the 'users' node
      const userRef = push(usersRef);
  
      // Set the user profile data to the new child node
      set(userRef, userProfile);
  
      // Save the user profile to your CRM database
      // (e.g., using a REST API or a cloud function)
      console.log('User profile created:', userProfile);
      this.navC.navigateForward('/login');
    } catch (error: any) {
      console.error(error);
      const toast = await this.toast.create({
        message: 'Signup failed: ' + error.message,
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

}
