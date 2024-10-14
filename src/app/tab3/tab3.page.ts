import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { ChangeDetectorRef } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { LocalNotifications } from '@capacitor/local-notifications';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, limitToLast, get, set, update, push } from "firebase/database";
const db = getDatabase();
import { Router } from '@angular/router';
import { FcmService } from '../services/fcm.service';
const firebaseConfig = {
  apiKey: 'AIzaSyBjFH2M1NFO3Hz4Qtw63BW348kRIobqeKs',
  authDomain: '<AUTH_DOMAIN>',
  projectId: 'crm-5784d'
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
interface LeadIndex {
  notes: {
    activities: any[];
  };
  tags: {
    tags: any[];
  };
  leadId: string;
  leadAssignBy: string;
  leadProperties: any;
  value: {
    leadProperties: {
      [key: string]: {
        created_time: string;
        field_data: {
          name: string;
          values: string[];
        }[];
      };
      
    };
  };
  status?: string;
}

const leadIndexesRef = ref(db, 'leadIndexes');
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  leadIndexes: LeadIndex[] = [];
  adminLeadIndexes: LeadIndex[]=[];
  noteEnabled: any = {};
  selectedActivity = 'Note';
  newActivity = '';
  activities:any = {} 
  note: any = {};
  user: any;
  completedLeads:any[]=[];
  uncontactedLeads:any[]=[];
  followUps: any[] = [];
  tags:any={}
  selectedTag: string='';
  customTag: string='';
  showFollowUpSelect: { [key: string]: boolean } = {};
  showLeadModal = false;
  selectedLead: any = {};
  followUpOptions = [
    '1 hour',
    '2 hour',
    '3 hour',
    '7 hour',
    '1 day',
    '2 days',
    '3 days',
    '1 week'
  ];
  selectedFollowUps: { [leadId: string]: string } = {};
  searchTerm = '';
  searchTer = '';
  
  isAdmin: boolean = false;
  searchResults: LeadIndex[] = [];
  showSearchBar = false;
  uid: any;
  constructor( public alertController: AlertController,private cdr: ChangeDetectorRef,private toastController: ToastController,private router: Router,private leadService: FcmService){
    
    this.noteEnabled ={};
    this.note = {};
    this.note = JSON.parse(localStorage.getItem('notes') || '{}');
    this.noteEnabled = JSON.parse(localStorage.getItem('noteEnabled') || '{}');
  }
  ngAfterViewInit() {
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';
  }
  async ngOnInit() {
    this.uid = localStorage.getItem('uid');
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';
    const storedActivities = localStorage.getItem('activities');
    console.log('Stored activities:', storedActivities);
    this.activities = JSON.parse(storedActivities || '{}');
    if (this.activities === null) {
      this.activities = {};
    }
    const storedTags = localStorage.getItem('tags');
    console.log('Stored tags:', storedTags);
    this.tags = JSON.parse(storedTags || '{}');
    if (this.tags === null) {
      this.tags = {};
    }
  }
  selectActivity(activity: string) {
    this.selectedActivity = activity;
  }
  selectTag(tag: string) {
    this.addTag(this.selectedLead, tag);
  }
  addTag(lead: any, tag: string) {
    console.log('Before adding tag:', this.tags);
    const tagData = {
      created_time: lead.leadProperties.created_time,
      tag: tag,
    };
    
    if (!lead.leadProperties.created_time) {
      console.error('Lead created time is undefined');
      return;
    }
    
    if (!this.tags[lead.leadProperties.created_time]) {
      this.tags[lead.leadProperties.created_time] = [];
    }
    this.tags[lead.leadProperties.created_time].unshift(tagData);
    console.log('After adding tag:', this.tags);
    localStorage.setItem('tags', JSON.stringify(Object.fromEntries(Object.entries(this.tags))));
    console.log('Stored tags:', localStorage.getItem('tags'));
    
    // Set the Firebase Realtime Database
    const leadIndexData = {
      leadAssignBy: lead.leadAssignBy,
      leadId: lead.leadId,
      leadProperties: lead.leadProperties,
      tags: {
        tags: [...(this.tags[lead.leadProperties.created_time] || [])]
      },
      userId: lead.userId
    };
    
    // Get the existing leadIndexData node ID
    const db = getDatabase();
    const leadIndexesRef = ref(db, 'leadIndexes');
    get(leadIndexesRef).then((snapshot) => {
      const leadIndexes = snapshot.val();
      const leadIndexDataId = Object.keys(leadIndexes).find((key) => leadIndexes[key].userId === lead.userId);
      if (leadIndexDataId) {
        const userRef = ref(db, `/leadIndexes/${leadIndexDataId}`);
        set(userRef, leadIndexData)
        .then(() => {
          console.log(`Lead index data sent to user ${lead.userId}`);
        })
        .catch((error) => {
          console.error(`Error sending lead index data to user ${lead.userId}:`, error);
          console.error('Error details:', error.details);
        });
      }
    })
  }
  
  addActivity(lead: any, activityText: string, activityType: string) {
    console.log('Before adding activity:', this.activities);
    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();
    const activity = {
      date: `${currentDate} ${currentTime}`,
      created_time: lead.leadProperties.created_time,
      type: activityType,
      text: activityText,
    };
    
    if (!lead.leadProperties.created_time) {
      console.error('Lead created time is undefined');
      return;
    }
    
    if (!this.activities[lead.leadProperties.created_time]) {
      this.activities[lead.leadProperties.created_time] = [];
    }
    this.activities[lead.leadProperties.created_time].unshift(activity);
    console.log('After adding activity:', this.activities);
    localStorage.setItem('activities', JSON.stringify(Object.fromEntries(Object.entries(this.activities))));
    console.log('Stored activities:', localStorage.getItem('activities'));
    this.newActivity = '';
    
    // Set the Firebase Realtime Database
    const leadIndexData = {
      leadAssignBy: lead.leadAssignBy,
      leadId: lead.leadId,
      leadProperties: lead.leadProperties,
      notes: {
        activities: [...(this.activities[lead.leadProperties.created_time] || [])]
      },
      userId: lead.userId
    };
    
    // Get the existing leadIndexData node ID
    const db = getDatabase();
    const leadIndexesRef = ref(db, 'leadIndexes');
    get(leadIndexesRef).then((snapshot) => {
      const leadIndexes = snapshot.val();
      const leadIndexDataId = Object.keys(leadIndexes).find((key) => leadIndexes[key].userId === lead.userId);
      if (leadIndexDataId) {
        const userRef = ref(db, `/leadIndexes/${leadIndexDataId}`);
        set(userRef, leadIndexData)
        .then(() => {
          console.log(`Lead index data sent to user ${lead.userId}`);
        })
        .catch((error) => {
          console.error(`Error sending lead index data to user ${lead.userId}:`, error);
          console.error('Error details:', error.details);
        });
      }
    })
  }
  // Modified sendLeadIndexDataToUser function
  sendLeadIndexDataToUser(leadIndexData: any, userId: any, leadIndexDataId: any) {
    console.log('*** sendLeadIndexDataToUser method called ***');
    
    console.log('sendLeadIndexDataToUser called with leadIndexData:', leadIndexData);
    console.log('sendLeadIndexDataToUser called with userId:', userId);
    console.log('sendLeadIndexDataToUser called with leadIndexDataId:', leadIndexDataId);
    
    const db = getDatabase();
    console.log('db:', db);
    
    const userRef = ref(db, `/leadIndexes/${leadIndexDataId}`);
    console.log('userRef:', userRef);
    // Get the current lead count for the user
    const leadCountRef = ref(db, `/users/${userId}/leadCount`);
    get(leadCountRef).then((snapshot) => {
      const currentLeadCount = snapshot.val() || 0;
      console.log(`Current lead count for user ${userId}: ${currentLeadCount}`);
      
      // Update the lead count
      set(leadCountRef, currentLeadCount + 1);
    });
    update(userRef, leadIndexData)
    .then(() => {
      console.log(`Lead index data sent to user ${userId}`);
    })
    .catch((error) => {
      console.error(`Error sending lead index data to user ${userId}:`, error);
      console.error('Error details:', error.details);
    });
  }
  getFieldValue(leadIndex: LeadIndex, fieldName: string): string {
    const fieldData = leadIndex.leadProperties.field_data.find((fd: { name: string; }) => fd.name === fieldName);
    return fieldData ? fieldData.values[0] : '';
  }
  async ionViewWillEnter(){
    if (this.isAdmin) {
      this.adminLeadIndexes = await this.getAdminLeadIndexData();
      this.leadIndexes = this.adminLeadIndexes;
    } else {
      this.leadIndexes = await this.getLeadIndexData();
    }
    console.log('Admin Lead Indexes Length:', this.adminLeadIndexes.length);
    console.log('Lead Indexes Length:', this.leadIndexes.length);
    this.goToLeadStatsPage();
  }
  openFollowUpSelect(leadIndex: any) {
    this.showFollowUpSelect[leadIndex.leadId] = !this.showFollowUpSelect[leadIndex.leadId];
  }
  saveFollowUp(event: any) {
    console.log('Selected follow-up time:', event);
    const followUpData = {
      leadId: event.leadId,
      followUp: event.followUp || 'Unknown',
      leadSource: event.leadProperties.platform,
      campaignName: event.leadProperties.campaign_name,
      createdTime: new Date(Date.parse(event.leadProperties.created_time)),
      uid: localStorage.getItem('uid'),
      fullname: event.leadProperties.field_data.reduce((acc: any, field: { name: string; values: any[]; }) => {
        if (field.name === 'full_name' || field.name === 'full name') {
          return field.values[0];
        }
        return acc;
      }, ''),
      scheduledDate: new Date(Date.now() + this.getFollowUpIntervalInMilliseconds(this.selectedFollowUps[event.leadId])).toISOString(),
    };
    
    // Check if followUp is undefined
    if (followUpData.followUp === undefined) {
      console.error('followUp is undefined');
      return;
    }
    
    console.log('Scheduled time:', this.selectedFollowUps[event.leadId]);
    
    const db = getDatabase();
    const followUpsRef = ref(db, `followUps/${localStorage.getItem('uid')}`);
    
    // Append the new follow-up data to the array
    push(followUpsRef, followUpData).then((data) => {
      const key = data.key;
      console.log('Follow-up key:', key);
      // Store the key of the follow-up record in your local data structure
      this.followUps.push({ ...followUpData, key });
      // Call the followUp function to update the upcomingFollowUps array
      // Send the getLeadIndexData promise
      this.getLeadIndexData().then((leadIndexes: LeadIndex[]) => {
        console.log('Lead indexes:', leadIndexes);
        // Do something with the lead indexes data
      });
    });
    
    console.log('Follow-ups array:', followUpData);
    this.presentToast('Follow-up saved successfully!');
    this.showFollowUpSelect = {};
    this.selectedFollowUps={};
  }

  formatDate(date: string): string {
    const dateObject = new Date(date);
    const day = dateObject.getDate();
    const month = dateObject.getMonth() + 1;
    const year = dateObject.getFullYear();
    const hour = dateObject.getHours();
    const minute = dateObject.getMinutes();
    const second = dateObject.getSeconds();
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  }
  
  
  getFollowUpIntervalInMilliseconds(followUpInterval: string): number {
    switch (followUpInterval) {
      // case '1 min':
      // return 60000;
      case '1 hour':
      return 3600000; // 1 hour in milliseconds
      case '2 hours':
      return 7200000; // 2 hours in milliseconds
      case '3 hours':
      return 10800000; // 3 hours in milliseconds
      case '7 hours':
      return 25200000; // 7 hours in milliseconds
      case '1 day':
      return 86400000; // 1 day in milliseconds
      case '2 days':
      return 172800000; // 2 days in milliseconds
      case '3 days':
      return 259200000; // 3 days in milliseconds
      case '1 week':
      return 604800000; // 1 week in milliseconds
      default:
      return 0;
    }
  }
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color:'success'
    });
    toast.present();
  }
  showLeadData(lead: any) {
    this.selectedLead = lead;
    console.log('Selected Lead:', this.selectedLead);
    if (!this.selectedLead?.leadProperties?.created_time) {
      console.error('Lead created time is undefined');
      return;
    }
    this.showLeadModal = true;
  }
  getIcon(type: string): string {
    switch (type) {
      case 'Note':
      return 'document';
      case 'Email':
      return 'mail';
      case 'Text':
      return 'chatbubble';
      case 'Call Log':
      return 'call';
      // Add more cases for other activity types
      default:
      return 'checkmark-done';
    }
  }
  async searchLeadIndexDat(searchTerm: string): Promise<void> {
    const leadIndexes = await this.getAdminLeadIndexData();
    
    const searchResults = leadIndexes.filter((leadIndex) => {
      const leadProperties = leadIndex.leadProperties;
      const notes = leadIndex.notes;
      const tags = leadIndex.tags;
      
      const searchInObject: (obj: any) => boolean = (obj: any) => {
        if (obj === null || obj === undefined) {
          return false;
        }
        
        if (Array.isArray(obj)) {
          return obj.some((item) => searchInObject(item));
        }
        
        return Object.values(obj).some((value) => {
          if (typeof value === 'string') {
            return value.includes(searchTerm);
          } else if (Array.isArray(value)) {
            return value.some((item) => searchInObject(item));
          } else if (typeof value === 'object') {
            return searchInObject(value);
          }
          return false;
        });
      };
      
      return (
        leadIndex.leadId.includes(searchTerm) ||
        leadIndex.leadAssignBy.includes(searchTerm) ||
        searchInObject(leadProperties) ||
        searchInObject(notes) ||
        searchInObject(tags)
        );
      });
      
      this.searchResults = searchResults;
      console.log(searchResults);
    }
    async searchLeadIndexData(searchTerm: string): Promise<void> {
      const leadIndexes = await this.getLeadIndexData();
      
      const searchResults = leadIndexes.filter((leadIndex) => {
        const leadProperties = leadIndex.leadProperties;
        const notes = leadIndex.notes;
        const tags = leadIndex.tags;
        
        const searchInObject: (obj: any) => boolean = (obj: any) => {
          if (obj === null || obj === undefined) {
            return false;
          }
          
          if (Array.isArray(obj)) {
            return obj.some((item) => searchInObject(item));
          }
          
          return Object.values(obj).some((value) => {
            if (typeof value === 'string') {
              return value.includes(searchTerm);
            } else if (Array.isArray(value)) {
              return value.some((item) => searchInObject(item));
            } else if (typeof value === 'object') {
              return searchInObject(value);
            }
            return false;
          });
        };
        
        return (
          leadIndex.leadId.includes(searchTerm) ||
          leadIndex.leadAssignBy.includes(searchTerm) ||
          searchInObject(leadProperties) ||
          searchInObject(notes) ||
          searchInObject(tags)
          );
        });
        
        this.searchResults = searchResults;
        console.log(searchResults);
      }
      
      clearSearchQuery() {
        this.searchTerm = '';
        this.searchResults = [];
      }
      async getLeadIndexData(): Promise<LeadIndex[]> {
        return new Promise((resolve, reject) => {
          onAuthStateChanged(auth, (userAuth) => {
            this.user = userAuth;
            if (this.user) {
              console.log('User is authenticated:', this.user.uid);
              const uid = this.user.uid;
              
              if (uid !== null) {
                const leadIndexesRef = ref(database, 'leadIndexes');
                const queryRef = query(leadIndexesRef, orderByChild('userId'), equalTo(uid), limitToLast(100000)); // Retrieve the last 100 records
                
                // Listen for changes to the leadIndexes node
                onValue(queryRef, (snapshot) => {
                  const leadIndexesData = snapshot.val();
                  if (leadIndexesData !== null) {
                    const leadIndexesArray: LeadIndex[] = Object.values(leadIndexesData);
                    leadIndexesArray.reverse(); // Reverse the array to get the data in descending order
                    console.log(leadIndexesData);
                    leadIndexesArray.forEach((leadIndex) => {
                      if (leadIndex.notes) {
                        leadIndex.notes.activities = Object.values(leadIndex.notes.activities);
                      } else {
                        leadIndex.notes = { activities: [] };
                      }
                    });
                    // Store the previous lead index count
                    const previousLeadIndexCount = this.leadIndexes.length;
                    // Update the lead indexes array
                    this.leadIndexes = leadIndexesArray;
                    // Check if the lead index count has increased by 1
                    if (this.leadIndexes.length > previousLeadIndexCount) {
                      // Trigger local notification when a new lead is added
                      const newLead = this.leadIndexes[0];
                      LocalNotifications.schedule({
                        notifications: [{
                          title: 'New Lead Added',
                          body: `Lead ID: ${newLead.leadId}`,
                          id: 1,
                          sound: 'assets/test.mp3',
                        }]
                      });
                    }
                    resolve(leadIndexesArray); // Resolve the Promise with an array of LeadIndex objects
                  } else {
                    resolve([]); // Resolve the Promise with an empty array if leadIndexes node does not exist
                  }
                }, (error) => {
                  reject(error); // Reject the Promise with error
                });
              } else {
                resolve([]); // Resolve the Promise with an empty array if user is not logged in
              }
            } else {
              resolve([]); // Resolve the Promise with an empty array if user is not logged in
            }
          });
        });
      }
      enableNote(lead: any) {
        this.noteEnabled[lead.leadProperties.created_time] = true;
      }
      
      saveNote(lead: any) {
        this.note[lead.leadProperties.created_time] = this.note[lead.leadProperties.created_time] || '';
        this.note[lead.leadProperties.created_time] = this.note[lead.leadProperties.created_time];
        localStorage.setItem('notes', JSON.stringify(this.note));
        this.noteEnabled[lead.leadProperties.created_time] = false;
      }
      async getAdminLeadIndexData(): Promise<LeadIndex[]> {
        return new Promise((resolve, reject) => {
          onAuthStateChanged(auth, (user) => {
            if (user) {
              console.log('User is authenticated:', user.uid);
              const uid = user.uid;
              
              if (uid !== null) {
                const isAdmin = localStorage.getItem('isAdmin') === 'true';
                if (isAdmin) {
                  const leadIndexesRef = ref(database, 'leadIndexes');
                  const queryRef = query(leadIndexesRef, limitToLast(100000)); // Retrieve all records
                  onValue(queryRef, (snapshot) => {
                    const leadIndexesData = snapshot.val();
                    if (leadIndexesData !== null) {
                      const leadIndexesArray: LeadIndex[] = Object.values(leadIndexesData);
                      leadIndexesArray.reverse(); // Reverse the array to get the data in descending order
                      console.log(leadIndexesData);
                      leadIndexesArray.length;
                      resolve(leadIndexesArray); // Resolve the Promise with an array of LeadIndex objects
                    } else {
                      resolve([]); // Resolve the Promise with an empty array if leadIndexes node does not exist
                    }
                  }, (error) => {
                    reject(error); // Reject the Promise with error
                  });
                } else {
                  this.getLeadIndexData().then((leadIndexes) => {
                    resolve(leadIndexes); // Resolve the Promise with an array of LeadIndex objects
                  });
                }
              } else {
                resolve([]); // Resolve the Promise with an empty array if user is not logged in
              }
            } else {
              resolve([]); // Resolve the Promise with an empty array if user is not logged in
            }
          });
        });
      }
      goToLeadStatsPage() {
        const uncontactedLeadsLength = this.uncontactedLeads.length;
        const completedLeadsLength = this.completedLeads.length;
        this.leadService.setLeadIndexLengths(this.adminLeadIndexes.length, this.leadIndexes.length, this.uncontactedLeads.length, this.completedLeads.length);
        console.log(this.uncontactedLeads.length);
      }
      go(){
        this.adminLeadIndexes.length;
      }
      trackLeadIndex(index: number, leadIndex: any) {
        return leadIndex.leadId;
      }
      completeLead(lead: any) {
        console.log('Completing lead:', lead);
        
        // Update the lead index data in Firebase
        const leadIndexData = {
          leadAssignBy: lead.leadAssignBy,
          leadId: lead.leadId,
          leadProperties: lead.leadProperties,
          status: 'Complete',
          userId: lead.userId
        };
        
        // Get the existing leadIndexData node ID
        const db = getDatabase();
        const leadIndexesRef = ref(db, 'leadIndexes');
        get(leadIndexesRef).then((snapshot) => {
          const leadIndexes = snapshot.val();
          const leadIndexKey = Object.keys(leadIndexes).find((key) => leadIndexes[key].leadProperties.created_time === lead.leadProperties.created_time);
          if (leadIndexKey) {
            const userRef = ref(db, `/leadIndexes/${leadIndexKey}`);
            set(userRef, leadIndexData)
            .then(() => {
              console.log(`Lead index data updated for user ${lead.userId}`);
            })
            .catch((error) => {
              console.error(`Error updating lead index data for user ${lead.userId}:`, error);
              console.error('Error details:', error.details);
            });
          }
        });
        
        // Update the local lead indexes array
        this.leadIndexes = this.leadIndexes.map((leadIndex) => {
          if (leadIndex.leadProperties.created_time === lead.leadProperties.created_time) {
            leadIndex.status = 'Complete';
          }
          return leadIndex;
        });
        
        // Update the local admin lead indexes array
        this.adminLeadIndexes = this.adminLeadIndexes.map((leadIndex) => {
          if (leadIndex.leadProperties.created_time === lead.leadProperties.created_time) {
            leadIndex.status = 'Complete';
          }
          return leadIndex;
        });
        
        // Update the completed leads array
        this.completedLeads.push(lead);
        
        // Update the lead stats
        this.goToLeadStatsPage();
      }
      uncontactLead(lead: any) {
        console.log('Uncontacting lead:', lead);
        
        // Update the lead index data in Firebase
        const leadIndexData = {
          leadAssignBy: lead.leadAssignBy,
          leadId: lead.leadId,
          leadProperties: lead.leadProperties,
          status: 'Uncontacted',
          userId: lead.userId
        };
        
        // Get the existing leadIndexData node ID
        const db = getDatabase();
        const leadIndexesRef = ref(db, 'leadIndexes');
        get(leadIndexesRef).then((snapshot) => {
          const leadIndexes = snapshot.val();
          const leadIndexKey = Object.keys(leadIndexes).find((key) => leadIndexes[key].leadProperties.created_time === lead.leadProperties.created_time);
          if (leadIndexKey) {
            const userRef = ref(db, `/leadIndexes/${leadIndexKey}`);
            set(userRef, leadIndexData)
            .then(() => {
              console.log(`Lead index data updated for user ${lead.userId}`);
            })
            .catch((error) => {
              console.error(`Error updating lead index data for user ${lead.userId}:`, error);
              console.error('Error details:', error.details);
            });
          }
        });
        
        // Update the local lead indexes array
        this.leadIndexes = this.leadIndexes.map((leadIndex) => {
          if (leadIndex.leadProperties.created_time === lead.leadProperties.created_time) {
            leadIndex.status = 'Uncontacted';
          }
          return leadIndex;
        });
        
        // Update the local admin lead indexes array
        this.adminLeadIndexes = this.adminLeadIndexes.map((leadIndex) => {
          if (leadIndex.leadProperties.created_time === lead.leadProperties.created_time) {
            leadIndex.status = 'Uncontacted';
          }
          return leadIndex;
        });
        
        // Update the uncontacted leads array
        this.uncontactedLeads.push(lead);
        
        // Update the lead stats
        this.goToLeadStatsPage();
      }
    }
    
    
    
    
    