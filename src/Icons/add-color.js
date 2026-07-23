#!/usr/bin/env node
/** @format */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout,
});

const question = (prompt) =>
   new Promise((resolve) => {
      rl.question(prompt, resolve);
   });

async function main() {
   try {
      // Get color name from user
      const colorName = await question(
         "✔ Color name (kebab-case, e.g., my-custom-color): "
      );

      if (!colorName.trim()) {
         console.error("❌ Color name is required");
         rl.close();
         return;
      }

      // Get color value from user
      const colorValue = await question(
         "✔ Color value (hex code, e.g., #FF0000): "
      );

      if (!colorValue.trim()) {
         console.error("❌ Color value is required");
         rl.close();
         return;
      }

      // Validate hex code
      if (!/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(colorValue.trim())) {
         console.error(
            "❌ Invalid hex code. Please use format: #RRGGBB or #RRGGBBAA"
         );
         rl.close();
         return;
      }

      rl.close();

      // Update COLORS.ts
      const colorsPath = path.join(
         __dirname,
         "../services/constants/COLORS.ts"
      );
      let colorsContent = fs.readFileSync(colorsPath, "utf8");

      // Check if color already exists in light theme and update it
      const lightColorPattern = new RegExp(
         `(light:\\s*\\{[\\s\\S]*?)"${colorName}":\\s*"#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?"`,
         "i"
      );
      if (lightColorPattern.test(colorsContent)) {
         colorsContent = colorsContent.replace(
            lightColorPattern,
            `$1"${colorName}": "${colorValue}"`
         );
      } else {
         // Add to light theme - insert before overlay
         colorsContent = colorsContent.replace(
            /(light:\s*\{[\s\S]*?\s+)(overlay:\s*"rgba\(0,\s*0,\s*0,\s*0\.4\)",)/,
            `$1"${colorName}": "${colorValue}",\n      $2`
         );
      }

      // Check if color already exists in dark theme and update it
      const darkColorPattern = new RegExp(
         `(dark:\\s*\\{[\\s\\S]*?)"${colorName}":\\s*"#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?"`,
         "i"
      );
      if (darkColorPattern.test(colorsContent)) {
         colorsContent = colorsContent.replace(
            darkColorPattern,
            `$1"${colorName}": "${colorValue}"`
         );
      } else {
         // Also add to dark theme - insert before overlay
         colorsContent = colorsContent.replace(
            /(dark:\s*\{[\s\S]*?\s+)(overlay:\s*"rgba\(0,\s*0,\s*0,\s*0\.4\)",)/,
            `$1"${colorName}": "${colorValue}",\n      $2`
         );
      }

      fs.writeFileSync(colorsPath, colorsContent);

      // Update index.css
      const cssPath = path.join(__dirname, "../index.css");
      let cssContent = fs.readFileSync(cssPath, "utf8");

      // Add to theme colors - check if it already exists
      const colorThemeName = `--color-${colorName}`;
      const colorThemeVar = `var(--c-${colorName})`;

      if (cssContent.includes(colorThemeName)) {
      } else {
         cssContent = cssContent.replace(
            /(--color-bg-weak:.*?\n)/,
            `$1   ${colorThemeName}: ${colorThemeVar};\n`
         );
         fs.writeFileSync(cssPath, cssContent);
      }

      // Also add CSS variable to body styles (optional step)
      const bodyVarName = `--c-${colorName}`;
      if (!cssContent.includes(bodyVarName)) {
      }
   } catch (error) {
      console.error("❌ Error:", error.message);
      rl.close();
      process.exit(1);
   }
}

main();
