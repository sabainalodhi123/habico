import type { CapacitorConfig } from '@capacitor/cli';
// config.ts
export const ADMIN_UID = 'UgM5pL3JqPRNW6AuVbtptZRpW313';
const config: CapacitorConfig = {
  appId: 'crm.example.app',
  appName: 'CRM',
  webDir: 'www',
 plugins:{
   PushNotifications:{
     presentationOptions : ["badge","sound","alert"],
   },
   plugins: {
    "SplashScreen": {
      "launchShowDuration": 1000,
      "launchAutoHide": false,
      "launchFadeOutDuration": 3000,
      "backgroundColor": "#ffffffff",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "showSpinner": true,
      "androidSpinnerStyle": "large",
      "iosSpinnerStyle": "small",
      "spinnerColor": "#999999",
      "splashFullScreen": true,
      "splashImmersive": true,
      "layoutName": "launch_screen",
      "useDialog": true
    }
  }
 }
};

export default config;
