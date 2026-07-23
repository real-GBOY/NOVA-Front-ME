import React, { useEffect, useMemo } from "react";
import { MAIN_COLORS } from "../constants/COLORS";
import { useTheme } from "./ThemeProvider";

export const ColorsProvider = ({ children }: { children: React.ReactNode }) => {
   const { IsDark } = useTheme();

   const colors = useMemo(() => {
      return IsDark ? MAIN_COLORS.dark : MAIN_COLORS.light;
   }, [IsDark]);

   useEffect(() => {
      Object.entries(colors).forEach(([key, value]) => {
         document.documentElement.style.setProperty(`--c-${key}`, value);
      });
   }, [colors]);

   return <>{children}</>;
};
