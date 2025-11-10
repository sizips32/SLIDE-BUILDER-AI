
export interface ValidationStatus {
  isValid: boolean;
  message: string;
  isWarning?: boolean;
  details?: string;
}

// Fix: Define and export the Settings interface used across multiple components.
export interface Settings {
  primaryColor: string;
  fontFamily: string;
  footerText: string;
  driveFolderUrl: string;
  showTitleUnderline: boolean;
  showBottomBar: boolean;
  showDateColumn: boolean;
  enableGradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  headerLogoUrl: string;
  closingLogoUrl: string;
  titleBgUrl: string;
  sectionBgUrl: string;
  mainBgUrl: string;
  closingBgUrl: string;
}

// Fix: Add gdocs to the global Window interface to resolve type errors in SettingsSection.tsx.
declare global {
  interface Window {
    gdocs?: {
      createPresentation: (options: {
        slideData: any[];
        settings: Settings;
      }) => Promise<{ presentationUrl: string }>;
    };
  }
}
