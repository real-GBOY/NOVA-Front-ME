/** @format */

import { ReactNode } from "react";
import { useTheme } from "@/services/contexts/ThemeProvider";

// UAE flag colors - Red, Green, Black/White pattern
const UAE_COLORS_LIGHT = ["#C8102E", "#00A651", "#000000"]; // Red, Green, Black
const UAE_COLORS_DARK = ["#C8102E", "#00A651", "#FFFFFF"]; // Red, Green, White

/**
 * Component that renders text with UAE flag colors applied by dividing word into thirds
 * First third: Red, Second third: Green, Last third: Black (light) / White (dark)
 */
function ColoredText({ text }: { text: string }) {
   const { IsDark } = useTheme();
   const colors = IsDark ? UAE_COLORS_DARK : UAE_COLORS_LIGHT;
   const characters = text.split("");
   
   // Count total characters (excluding spaces and RTL marks)
   const totalChars = characters.filter(
      (char) => char !== " " && char !== "\u200F" && char !== "\u200E"
   ).length;
   
   // Calculate the size of each third
   const thirdSize = Math.ceil(totalChars / 3);
   
   // Calculate character indices (excluding spaces) for each position
   const getCharIndex = (index: number) => {
      let count = 0;
      for (let i = 0; i < index; i++) {
         const char = characters[i];
         if (char !== " " && char !== "\u200F" && char !== "\u200E") {
            count++;
         }
      }
      return count;
   };

   return (
      <>
         {characters.map((char, index) => {
            // Skip spaces and apply colors by thirds
            if (char === " " || char === "\u200F" || char === "\u200E") {
               return (
                  <span
                     key={index}
                     style={{
                        fontSize: "inherit",
                        lineHeight: "inherit",
                        fontFamily: "inherit",
                        fontWeight: "inherit",
                     }}>
                     {char}
                  </span>
               );
            }
            const charIndex = getCharIndex(index);
            // Divide into thirds: first third = red, second third = green, last third = black/white
            let colorIndex = 0;
            if (charIndex < thirdSize) {
               colorIndex = 0; // Red - first third
            } else if (charIndex < thirdSize * 2) {
               colorIndex = 1; // Green - second third
            } else {
               colorIndex = 2; // Black/White - last third
            }
            return (
               <span
                  key={index}
                  style={{
                     color: colors[colorIndex],
                     fontSize: "inherit",
                     lineHeight: "inherit",
                     fontFamily: "inherit",
                     fontWeight: "inherit",
                  }}>
                  {char}
               </span>
            );
         })}
      </>
   );
}

/**
 * Renders text with UAE flag colors applied by dividing word into thirds
 * First third: Red, Second third: Green, Last third: Black (light) / White (dark)
 */
export function renderColoredText(text: string): ReactNode {
   return <ColoredText text={text} />;
}
