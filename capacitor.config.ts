import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'La comandita FKS',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: false,
      // launchFadeOutDuration: 1000,
      backgroundColor: "#e4dfda",
    //  androidSplashResourceName: "splash",
     androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small",
      // spinnerColor: "#000000",
      splashFullScreen: true,
      splashImmersive: true,
      // layoutName: "launch_screen",
      // useDialog: true,
    }
  }
};

export default config;
