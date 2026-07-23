import {
   createContext,
   useContext,
   useEffect,
   useMemo,
   useState,
   useCallback,
   type ReactNode,
} from "react";

type ThemeType = "light" | "dark" | "system";
type ThemeContextType = {
   theme: ThemeType;
   setTheme: (theme: ThemeType) => void;
   IsDark: boolean;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(
   undefined
);

const THEME_STORAGE_KEY = "amer-theme";
const SESSION_THEME_KEY = "amer-session-theme";
const DEFAULT_THEME: ThemeType = "light";

const getInitialTheme = (): ThemeType => {
   return DEFAULT_THEME;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
   const [theme, setThemeState] = useState<ThemeType>(getInitialTheme);
   const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
      typeof window !== "undefined"
         ? window.matchMedia("(prefers-color-scheme: dark)").matches
         : false
   );

   useEffect(() => {
      if (typeof window === "undefined") return;

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (event: MediaQueryListEvent) =>
         setSystemPrefersDark(event.matches);

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
   }, []);

   const IsDark = useMemo(
      () => theme === "dark" || (theme === "system" && systemPrefersDark),
      [theme, systemPrefersDark]
   );

   useEffect(() => {
      if (typeof document === "undefined") return;

      document.documentElement.classList.toggle("dark", IsDark);
      document.documentElement.style.colorScheme = IsDark ? "dark" : "light";
   }, [IsDark]);

   useEffect(() => {
      if (typeof window !== "undefined") {
         localStorage.setItem(THEME_STORAGE_KEY, theme);
         sessionStorage.setItem(SESSION_THEME_KEY, theme);
      }
   }, [theme]);

   // Force-reset stored theme to default on first mount of a session
   useEffect(() => {
      if (typeof window !== "undefined") {
         setThemeState(DEFAULT_THEME);
         localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME);
         sessionStorage.setItem(SESSION_THEME_KEY, DEFAULT_THEME);
      }
   }, []);

   const setTheme = useCallback((value: ThemeType) => {
      setThemeState(value);
   }, []);

   const value = { theme, setTheme, IsDark };
   return (
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
   );
};

export const useTheme = () => {
   const context = useContext(ThemeContext);
   if (!context) {
      throw new Error("useTheme must be used within a ThemeProvider");
   }
   return context;
};
