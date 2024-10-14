import { Component, ViewChild , EventEmitter} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Pipe, PipeTransform } from '@angular/core';
import { getDatabase, ref ,onValue, set, get} from 'firebase/database';
import { forkJoin } from 'rxjs';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Observable, tap } from 'rxjs';
import { getAuth, signInWithEmailAndPassword ,signOut} from 'firebase/auth';
import { NavController, AlertController, LoadingController, MenuController ,ToastController,} from '@ionic/angular';
import { auth } from '../firebase';
import { FcmService } from '../services/fcm.service';
const db = getDatabase();
import { interval } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
const usersRef = ref(db, 'users');



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  
})

export class Tab1Page {
  @ViewChild('modal')
  modal!: IonModal;
  showLeadModal = false;
  selectedLead: any = {};
  select = 'surah';
  loading = true;
  leadDetails: any;
  isLeadDetailsModalOpen = false;
  totalLeadCount: any;
  isFilterModalOpen = false;
  uid:any;
  loadingLeads = true;
  firstName: any;
  email: any;
  filterForm!: FormGroup;
  filteredLead: any[] = [];
  showSearchBar = false;
  showSearchBa = false;
  storedLeadIndex: any={};
  myEvent = new EventEmitter();
  isModalOpen = false;
  isUserListModalOpen = false;
  users: any[] = [];
  private isFirstLoad = true;
  contactStatus: { [key: string]: string } = {};
  filteredData: any[] = [];
  filteredData2: any[] = [];
  sortedData:any[] = [];
  showFilter = false;
  leadCount: number = 0;
  searchQuery: string = '';
  searchQuer: string = '';
  showUserList:boolean=false;
  selectedUser: any = null;
  leads: any[] = [];
  filteringInProgress: boolean = false;
  filteredLeads: any[] = [];
  searchTerm: string = '';
  filterBy: string = 'email';
  searchValue: any;
  noteEnabled: any = {};
  note: any = {};
  lead2: any[] = [];
  currentLead: any;
  selectedActivity = 'Note';
  newActivity = '';
  activities:any = {} ;
  modalUsers:any[]=[];
  userListsOpen: boolean[] = [];
  currentLeadDetails:any= {};
  selectedIndex: any;
  isAdmin: boolean = false;
  constructor(public http:HttpClient,private loadingController: LoadingController,public navC:NavController,private cdr: ChangeDetectorRef,private formBuilder: FormBuilder,private modalController: ModalController,private leadService: FcmService,public toast:ToastController,private modalCtrl: ModalController,private popoverController: PopoverController) { this.noteEnabled = {};
  this.userListsOpen = new Array(this.leads.length).fill(false);
  
  this.note = {};
  this.filteredLeads = this.leads;
}
ngOnInit(): void {
  this.uid = localStorage.getItem('uid');
  this.isAdmin = localStorage.getItem('isAdmin') === 'true';
  this.loadingLeads = true;
  Promise.all([this.get(), this.get2()]).then(() => {
    this.loadingLeads = false;
  });
  this.getUsers();
  
  const storedActivities = localStorage.getItem('activities');
  console.log('Stored activities:', storedActivities);
  this.activities = JSON.parse(storedActivities || '{}');
  if (this.activities === null) {
    this.activities = {};
  }
  
  if (this.activities === null) {
    this.activities = {};
  }
  LocalNotifications.requestPermissions().then(result => {
    if (result.display === 'granted') {
      console.log('Permission granted');
    } else {
      console.log('Permission denied');
    }
  });
  
  this.filteredLeads = this.leads;
  this.filterForm = this.formBuilder.group({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });
  
}
toggleUserList(index: number) {
  this.userListsOpen[index] = !this.userListsOpen[index];
}
showFilterModal() {
  this.isFilterModalOpen = true;
}

closeFilterModal() {
  this.isFilterModalOpen = false;
}
showLeadData(lead: any) {
  this.selectedLead = lead;
  console.log('Selected Lead:', this.selectedLead);
  this.showLeadModal = true;
}
applyFilter() {
  const startDate = this.filterForm?.get('startDate')?.value ?? '';
  const endDate = this.filterForm?.get('endDate')?.value ?? '';
  this.filteredLeads = this.filterLeadsByDate(this.lead2, startDate, endDate);
  this.closeFilterModal();
}

filterLeadsByDate(lead2: any, startDate: string, endDate: string) {
  const filteredLead = lead2.filter((lead: any) => {
    const leadDate = new Date(lead.leads.data[0].created_time);
    const startDateTime = new Date(startDate).getTime();
    const endDateTime = new Date(endDate).getTime();
    return leadDate.getTime() >= startDateTime && leadDate.getTime() <= endDateTime;
  });
  return filteredLead;
}
showLeadDetails(data: any) {
  this.leadDetails = data;
  this.isLeadDetailsModalOpen = true;
}
updateContactStatus(event: any, data: any, index: number) {
  const leadKey = `lead_${index}_contactStatus`;
  this.contactStatus[leadKey] = event.detail.value;
  localStorage.setItem(leadKey, event.detail.value);
  console.log(`Contact status updated to ${event.detail.value} for lead ${data.created_time}`);
  // You can also update the lead data in your database or API here
}  
selectActivity(activity: string) {
  this.selectedActivity = activity;
}
addActivity(lead: any, activityText: string, activityType: string) {
  console.log('Before adding activity:', this.activities);
  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toLocaleDateString();
  const activity = {
    date: `${currentDate} ${currentTime}`,
    created_time: lead.created_time,
    type: activityType,
    text: activityText,
  };
  if (!this.activities[lead.created_time]) {
    this.activities[lead.created_time] = [];
  }
  this.activities[lead.created_time].unshift(activity);
  console.log('After adding activity:', this.activities);
  localStorage.setItem('activities', JSON.stringify(Object.fromEntries(Object.entries(this.activities))));
  console.log('Stored activities:', localStorage.getItem('activities'));
  this.newActivity = '';
}
async logout() {
  try {
    await signOut(auth);
    console.log('Logged out successfully!');
    
    // Remove the UID and isLoggedIn from local storage
    localStorage.removeItem('uid');
    localStorage.removeItem('isLoggedIn');
    
    const toast = await this.toast.create({
      message: 'Logged out successfully!',
      duration: 2000,
      color: 'success'
    });
    toast.present();
    this.navC.navigateForward('/login');
  } catch (error: any) {
    console.error(error);
    
    const toast = await this.toast.create({
      message: 'Logout failed: ' + error.message,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
}
callMyFunction() {
  
}

getUsers(){
  onValue(usersRef, (snapshot) => {
    const usersObj = snapshot.val();
    this.users = Object.values(usersObj);
    console.log(this.users,'user');
  });
  this.users = [
    {
      firstName: 'sabaina',
      email: 'sabainal@gmail.com',
      password: 'sabaina'
    }
  ];
}

async get() {
  this.loading = true;
  let nextPageCursor = '';
  
  const url = `https://graph.facebook.com/v20.0/act_188403563970090/ads?access_token=EAAFZARo2dP14BO10Jl4zugUYcL6vitslCiWwnnfUz8LyZCDdpPLwDdUoKnXYpZCbjZB1qpWGqz9ZCC9ZAhPFuAMO80SjwTMjThgGHHTxiaKAxbq7Mr3ZCbIkyC0ZBlwhYKEIAr4MJZC6ZAMGZBZCWZADPGsOwcnNOLDZArVvXZAwzmhQTbjBRxc8s2IOFXmN4Cj&pretty=0&fields=leads%7Badset_name%2Ccreated_time%2Cfield_data%2Ccampaign_name%2Cplatform%2Cad_name%2Cform_name%7D&limit=10000`;
  
  console.log('Sending HTTP request to:', url);
  let lastLeadId = ''; // Keep track of the last lead ID received
  let totalLeads = 0;
  let previousLeadCount = this.leads.length; // Store the previous lead count
  
  await this.http.get(url).subscribe(
    async (response: any) => {
      console.log('Response received:', response);
      const newData = response.data;
      
      // Flatten the leads data
      const flattenedLeads = newData.map((item: any) => {
        if (item.leads && item.leads.data) {
          return item.leads.data;
        } else {
          return [];
        }
      }).flat();
      
      // Sort the flattened leads data in descending order by created time
      flattenedLeads.sort((a: any, b: any) => {
        if (a.created_time && b.created_time) {
          return b.created_time.localeCompare(a.created_time);
        } else {
          return 0;
        }
      });
      
      // Update the leads array with the new data
      this.leads = flattenedLeads;
      console.log('flattenedLeads:', flattenedLeads);
      // Count the total number of leads
      totalLeads = this.leads.length;
      console.log(`Total leads: ${totalLeads}`);
      this.leadService.setTotalLeads(totalLeads);
      
      // Check if the new lead is not already in the lead2 array
      const newLead = this.leads.find((lead: any) => lead.lead_id > lastLeadId);
      if (response.data.paging) {
        nextPageCursor = response.data.paging.cursors.after;
      }
      if (newLead) {
        // Update the last lead ID
        lastLeadId = newLead.lead_id;
        
        // Check if the lead count has increased by 1
        if (this.leads.length > previousLeadCount) {
          // Schedule a notification for the new lead
          LocalNotifications.schedule({
            notifications: [
              {
                title: 'New Lead',
                body: 'You have a new lead!',
                sound: 'assets/test.mp3',
                id: 1,
                schedule: {
                  at: new Date(Date.now() + 1000), // show notification after 1 second
                },
              },
            ],
          });
        }
      }
      
    },
    (error: any) => {
      console.error('Error occurred:', error);
    }
    
    );
    this.loading = false;
  }
  
  get2() {
    let nextPageCursor = '';
    const url = 'https://graph.facebook.com/v20.0/act_980521646877330/ads?access_token=EAAFZARo2dP14BOzcWP4PuUgCPP2yqzpAWT380rDPIX2nrMKeXErGnJw2uTjQMZBCtAZCTdyqOy5MrZAk0oZBUqQPJDup5Lv2ASE7JDK8iR864Mx70O9bgGWfWZAA7cHvFfBfIgiklYRuvy3NRSRPXXP79kRPeyVyjZCrodgLA2sZCeZBxjxZCHEm0GObtr&fields=leads%7Badset_name%2Ccreated_time%2Cfield_data%2Ccampaign_name%2Cplatform%2Cad_name%2Cform_name%7D&limit=1000';
    
    console.log('Sending HTTP request to:', url);
    
    let lastLeadId = ''; // Keep track of the last lead ID received
    let totalLeads = 0;
    let previousLeadCount = this.lead2.length; // Store the previous lead count
    
    this.http.get(url).subscribe(
      async (response: any) => {
        console.log('Response received:', response);
        const newData = response.data;
        
        // Flatten the leads data
        const flattenedLeads = newData.map((item: any) => {
          if (item.leads && item.leads.data) {
            return item.leads.data;
          } else {
            return [];
          }
        }).flat();
        
        // Sort the flattened leads data in descending order by created time
        flattenedLeads.sort((a: any, b: any) => {
          if (a.created_time && b.created_time) {
            return b.created_time.localeCompare(a.created_time);
          } else {
            return 0;
          }
        });
        
        // Update the leads array with the new data
        this.lead2 = flattenedLeads;
        console.log('flattenedLeads:', flattenedLeads);
        totalLeads = this.lead2.length;
        console.log(`Total leads: ${totalLeads}`);
        this.leadService.setTotalLead(totalLeads);
        
        // Check if the new lead is not already in the lead2 array
        const newLead = this.lead2.find((lead: any) => lead.lead_id > lastLeadId);
        if (response.data.paging) {
          nextPageCursor = response.data.paging.cursors.after;
        }
        if (newLead) {
          // Update the last lead ID
          lastLeadId = newLead.lead_id;
          
          // Check if the lead count has increased by 1
          if (this.lead2.length > previousLeadCount) {
            // Schedule a notification for the new lead
            LocalNotifications.schedule({
              notifications: [
                {
                  title: 'New Lead',
                  body: 'You have a new lead!',
                  sound: 'assets/test.mp3',
                  id: 1,
                  schedule: {
                    at: new Date(Date.now() + 1000), // show notification after 1 second
                  },
                },
              ],
            });
          }
        }
      },
      (error: any) => {
        console.error('Error occurred:', error);
      }
      );
    }
    filterData(ngModelValue: string) {
      this.filteredData = []; // Reset the filtered data array
      
      this.leads.forEach((lead) => {
        if (lead.leads) { 
          lead.leads.data.forEach((data: { field_data: any[]; }) => {
            data.field_data.forEach((field: { values: string[]; name: any; }) => {
              if (field.values[0].toLowerCase() === ngModelValue.toLowerCase()) {
                this.filteredData.push(lead); // Store the entire lead object
              }
            });
          });
        }
      });
      
    }
    filterLeads(searchQuery: string): void {
      console.log('Filtering leads with search query:', searchQuery);
      
      const searchQueryLowercase = searchQuery.toLowerCase();
      console.log('Search query (lowercase):', searchQueryLowercase);
      
      const matchedData: any[] = [];
      
      this.leads.forEach((lead: any) => {
        if (!lead) return;
        
        const createdTime = lead.created_time.toLowerCase();
        console.log('Created time (lowercase):', createdTime);
        
        if (!lead.field_data) return;
        
        lead.field_data.forEach((field: { values: string[]; name: string; }) => {
          const fieldValue = field.values[0].toLowerCase();
          console.log('Field value (lowercase):', fieldValue);
          
          const fieldName = field.name.toLowerCase();
          console.log('Field name (lowercase):', fieldName);
          
          const fieldDataArray: any[] = lead.field_data.map((field: { name: string; values: string[] }) => {
            return {
              name: field.name,
              values: field.values,
            };
          });
          
          const adsetName = lead.adset_name.toLowerCase();
          console.log('Adset name (lowercase):', adsetName);
          
          const campaignName = lead.campaign_name.toLowerCase();
          console.log('Campaign name (lowercase):', campaignName);
          
          const platform = lead.platform.toLowerCase();
          console.log('Platform (lowercase):', platform);
          
          if (
            fieldValue.includes(searchQueryLowercase) ||
            fieldName.includes(searchQueryLowercase) ||
            createdTime.includes(searchQueryLowercase) ||
            adsetName.includes(searchQueryLowercase) ||
            campaignName.includes(searchQueryLowercase) ||
            platform.includes(searchQueryLowercase)
            ) {
              // Check if the lead object already exists in the matchedData array
              const existingLead = matchedData.find((matchedLead) => matchedLead.id === lead.id);
              if (!existingLead) {
                matchedData.push({
                  created_time: lead.created_time,
                  id: lead.id,
                  field_data: fieldDataArray,
                  adset_name: lead.adset_name,
                  campaign_name: lead.campaign_name,
                  platform: lead.platform,
                });
              }
            }
          });
        });
        
        this.filteredData = matchedData;
        console.log(this.filteredData);
      }
      
      clearSearchQuery(): void {
        
        this.filteredData = [];
        this.searchQuery='';
        
      }
      clearSearchQuer(): void {
        
        this.filteredData2 = [];
        this.searchQuer='';
        
      }
      
      filterLead(searchQuer: string): void {
        console.log('Filtering leads with search query:', searchQuer);
        
        const searchQueryLowercase = searchQuer.toLowerCase();
        console.log('Search query (lowercase):', searchQueryLowercase);
        
        const matchedData: any[] = [];
        
        this.lead2.forEach((lead: any) => {
          if (!lead) return;
          
          const createdTime = lead.created_time.toLowerCase();
          console.log('Created time (lowercase):', createdTime);
          
          if (!lead.field_data) return;
          
          lead.field_data.forEach((field: { values: string[]; name: string; }) => {
            const fieldValue = field.values[0].toLowerCase();
            console.log('Field value (lowercase):', fieldValue);
            
            const fieldName = field.name.toLowerCase();
            console.log('Field name (lowercase):', fieldName);
            
            const fieldDataArray: any[] = lead.field_data.map((field: { name: string; values: string[] }) => {
              return {
                name: field.name,
                values: field.values,
              };
            });
            
            const adsetName = lead.adset_name.toLowerCase();
            console.log('Adset name (lowercase):', adsetName);
            
            const campaignName = lead.campaign_name.toLowerCase();
            console.log('Campaign name (lowercase):', campaignName);
            
            const platform = lead.platform.toLowerCase();
            console.log('Platform (lowercase):', platform);
            
            if (
              fieldValue.includes(searchQueryLowercase) ||
              fieldName.includes(searchQueryLowercase) ||
              createdTime.includes(searchQueryLowercase) ||
              adsetName.includes(searchQueryLowercase) ||
              campaignName.includes(searchQueryLowercase) ||
              platform.includes(searchQueryLowercase)
              ) {
                // Check if the lead object already exists in the matchedData array
                const existingLead = matchedData.find((matchedLead) => matchedLead.id === lead.id);
                if (!existingLead) {
                  matchedData.push({
                    created_time: lead.created_time,
                    id: lead.id,
                    field_data: fieldDataArray,
                    adset_name: lead.adset_name,
                    campaign_name: lead.campaign_name,
                    platform: lead.platform,
                  });
                }
              }
            });
          });
          
          this.filteredData2 = matchedData;
          console.log(this.filteredData2);
        }
        
        storeLeadIndexData(index: number, data: any): void {
          const leadIndexData = {
            leadId: data.id,
            leadProperties: {
              created_time: data.created_time,
              field_data: data.field_data,
            },
            // userId: this.selectedUser.uid,
          };
          
          localStorage.setItem(`leadIndexData-${index}`, JSON.stringify(leadIndexData));
          console.log(leadIndexData);
        }
        async updateSelectedUser(event: { detail: { value: string; }; }, data: any){
          console.log('Event detail value:', event.detail.value);
          console.log('Users array:', this.users);
          
          // Store the selected user ID in localStorage
          localStorage.setItem('selectedUserId', event.detail.value);
          
          // Log the email property of each user in the users array
          console.log('Users array:');
          this.users.forEach((user) => {
            if (user.firstName) {
              console.log(`User first name: ${user.firstName}`);
              console.log(`User first name (lowercase): ${user.firstName.toLowerCase()}`);
            }
          });
          
          // Get the current user's data from Firebase
          
          
          // Find the selected user based on the event detail value (first name)
          const firstName = event.detail.value;
          console.log('First name:', firstName);
          this.selectedUser = this.users.find((user) => user.firstName && user.firstName.toLowerCase().includes(firstName.toLowerCase()));
          
          console.log('Selected user:', this.selectedUser);
          
          // Calculate the selected index
          const selectedIndex = this.users.findIndex((user) => user.firstName && user.firstName.toLowerCase().includes(firstName.toLowerCase()));
          
          if (this.selectedUser && selectedIndex >= 0 && selectedIndex < this.users.length) {
            const leadId = data.id;
            const createdTime = data.created_time;
            const fieldData = data.field_data;
            const adset = data.adset_name;
            const campaign = data.campaign_name;
            const platform = data.platform;
            
            const userData = {
              id: event.detail.value,
              created_time: createdTime,
              field_data: fieldData,
              adset: adset,
              campaign: campaign,
              platform: platform,
              leadAssignBy: this.firstName // Use the current user's first name
            };
            
            this.handleUserSelect({ selectedIndex, data: userData, users: this.users });
          } else {
            console.log('Either selectedUser or selectedIndex is undefined');
          }
        }
        async presentModal(data: any) {
          this.leadDetails = data;
          const modal = await this.modalController.create({
            component: 'ion-content',
            componentProps: {
              'id': 'my-modal'
            }
          });
          return await modal.present();
        }
        
        dismissModal() {
          this.modalController.dismiss();
        }
        handleUserSelect(options: { selectedIndex: any; data: any; users: any[] }): void {
          const { selectedIndex, data, users } = options;
          console.log('Selected index:', selectedIndex);
          console.log('Data:', data);
          console.log('Users:', users);
          
          if (selectedIndex >= 0 && selectedIndex < users.length) {
            const selectedUser = users[selectedIndex];
            console.log('Selected user:', selectedUser);
            
            if (selectedUser) {
              const leadIndexes = {
                leadId: "some_lead_id",
                leadProperties: {
                  created_time: "some_created_time",
                  field_data: "some_field_data",
                  adset: "some_adest",
                  campaign: "some_campaign",
                  platform: "some_platform"
                },
                userId: selectedUser.uid, // Use the selectedUser.uid here
                leadAssignBy: this.firstName
              };
              // Send the leadIndexes data
              // console.log('Lead index data sent to user', leadIndexes);
              this.storeLeadIndex(selectedUser, data);
            } else {
              console.log('Selected user is undefined');
            }
          } else {
            console.log('Selected index is out of bounds');
          }
        }
        
        async storeLeadIndex(selectedUser: any, data: any): Promise<void> {
          console.log('storeLeadIndex called with selectedUser:', selectedUser);
          console.log('storeLeadIndex called with data:', data);
        
          if (!data) {
            console.error('No data provided');
            return;
          }
        
          const leadId = data.id;
          const createdTime = data.created_time;
          const fieldData = data.field_data;
          const adset = data.adset;
          const campaign = data.campaign;
          const platform = data.platform;
        
          const leadAssignBy = selectedUser.firstName;
        
          const leadProperties = {
            created_time: createdTime,
            field_data: fieldData,
            adset_name: adset,
            campaign_name: campaign,
            platform: platform
          };
        
          const leadIndexData = {
            leadId,
            leadProperties,
            userId: selectedUser.uid,
            leadAssignBy
          };
        
          console.log('leadIndexData:', leadIndexData);
        
          const selectedUserId = localStorage.getItem('selectedUserId');
          console.log('selectedUserId:', selectedUserId);
        
          if (selectedUserId) {
            this.sendLeadIndexDataToUser(leadIndexData, selectedUserId);
          } else {
            console.error('Selected user ID is not defined');
          }
        }
        async getUserData(): Promise<void> {
          const db = getDatabase();
          const usersRef = ref(db, 'users');
          const snapshot = await get(usersRef);
          if (snapshot.exists()) {
            const users = snapshot.val();
            Object.keys(users).forEach((key) => {
              const user = users[key];
              if (user.uid === this.uid) {
                this.firstName = user.firstName;
                this.email = user.email;
                console.log('User data:', user);
              } else if (user.uid === 'UgM5pL3JqPRNW6AuVbtptZRpW313') {
                console.log('Admin');
                this.firstName = 'Ahsan';
                this.email = 'Ahsan@habicoproperties.com';
                console.log('Admin data:', this.firstName, this.email);
              }
            });
          } else {
            console.log('No users found');
          }
        }
        sendLeadIndexDataToUser(leadIndexData: any, userId: any) {
          console.log('*** sendLeadIndexDataToUser method called ***');
          
          console.log('sendLeadIndexDataToUser called with leadIndexData:', leadIndexData);
          console.log('sendLeadIndexDataToUser called with userId:', userId);
          
          const db = getDatabase();
          console.log('db:', db);
          
          const userRef = ref(db,`/leadIndexes/leadIndexData_${Date.now()}`);
          console.log('userRef:', userRef);
          // Get the current lead count for the user
          const leadCountRef = ref(db, `/users/${userId}/leadCount`);
          get(leadCountRef).then((snapshot) => {
            const currentLeadCount = snapshot.val() || 0;
            console.log(`Current lead count for user ${userId}: ${currentLeadCount}`);
            
            // Update the lead count
            set(leadCountRef, currentLeadCount + 1);
          });
          set(userRef, leadIndexData)
          .then(() => {
            console.log(`Lead index data sent to user ${userId}`);
          })
          .catch((error) => {
            console.error(`Error sending lead index data to user ${userId}:`, error);
            console.error('Error details:', error.details);
          });
        }
        
        enableNote(lead: any) {
          this.noteEnabled[lead.created_time] = true;
        }
        
        saveNote(lead: any) {
          this.note[lead.created_time] = this.note[lead.created_time] || '';
          this.note[lead.created_time] = this.note[lead.created_time];
          localStorage.setItem('notes', JSON.stringify(this.note));
          this.noteEnabled[lead.created_time] = false;
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
            return 'help';
          }
        }
        toggleFilter() {
          this.showFilter = !this.showFilter;
        }
        
        clearFilter() {
          this.filteredData.splice(0, this.filteredData.length);
          this.filterBy = '';
          this.searchValue = '';
          this.showFilter=!this.showFilter;
          
          
        }
        
      }
      
      
      
      function i(i: any, data: any) {
        throw new Error('Function not implemented.');
      }
      
      function data(i: any, data: any) {
        throw new Error('Function not implemented.');
      }
      