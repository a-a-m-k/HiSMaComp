import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      colors: {
        focus: string;
        focusHover: string;
        focusShadow: string;
        focusShadowInset: string;
        textBlack: string;
        tooltipBackground: string;
        tooltipText: string;
        buttonBackground: string;
        buttonHover: string;
        buttonActive: string;
        focusBlue: string;
        controlBorder: string;
      };
      shadows: {
        light: string;
        medium: string;
        heavy: string;
        tooltip: string;
        buttonHover: string;
        buttonDefault: string;
        buttonActive: string;
        controlOutline: string;
      };
      transitions: {
        fast: string;
        normal: string;
        slow: string;
        layoutWidth: string;
        overlayFade: string;
        color: string;
        opacity: string;
        transform: string;
        tooltip: string;
        border: string;
      };
      zIndex: {
        map: number;
        mapContainerFocus: number;
        mapContainerFocusOverlay: number;
        legend: number;
        timeline: number;
        floatingButton: number;
        modal: number;
        tooltip: number;
        tooltipArrow: number;
        performanceMonitor: number;
        focusedMarker: number;
        focusedMarkerLabel: number;
        error: number;
      };
      tooltip: {
        padding: string;
        borderRadius: string;
        fontSize: string;
        arrowSize: number;
        offset: number;
        arrowOffset: number;
      };
    };
  }

  interface ThemeOptions {
    custom?: {
      colors?: {
        focus?: string;
        focusHover?: string;
        focusShadow?: string;
        focusShadowInset?: string;
        textBlack?: string;
        tooltipBackground?: string;
        tooltipText?: string;
        buttonBackground?: string;
        buttonHover?: string;
        buttonActive?: string;
        focusBlue?: string;
        controlBorder?: string;
      };
      shadows?: {
        light?: string;
        medium?: string;
        heavy?: string;
        tooltip?: string;
        buttonHover?: string;
        buttonDefault?: string;
        buttonActive?: string;
        controlOutline?: string;
      };
      transitions?: {
        fast?: string;
        normal?: string;
        slow?: string;
        layoutWidth?: string;
        overlayFade?: string;
        color?: string;
        opacity?: string;
        transform?: string;
        tooltip?: string;
        border?: string;
      };
      zIndex?: {
        map?: number;
        mapContainerFocus?: number;
        mapContainerFocusOverlay?: number;
        legend?: number;
        timeline?: number;
        floatingButton?: number;
        modal?: number;
        tooltip?: number;
        tooltipArrow?: number;
        performanceMonitor?: number;
        focusedMarker?: number;
        focusedMarkerLabel?: number;
        error?: number;
      };
      tooltip?: {
        padding?: string;
        borderRadius?: string;
        fontSize?: string;
        arrowSize?: number;
        offset?: number;
        arrowOffset?: number;
      };
    };
  }
}
