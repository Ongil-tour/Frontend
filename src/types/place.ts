export interface AccessibilityInfo {
  wheelchair: boolean;
  elevator: boolean;
  brailleBlock: boolean;
  accessibleParking: boolean;
  accessibleRestroom: boolean;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  accessibility: AccessibilityInfo;
}
