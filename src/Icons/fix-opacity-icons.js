const fs = require("fs");
const path = require("path");

const iconsDir = __dirname;
const files = fs
   .readdirSync(iconsDir)
   .filter((f) => f.endsWith(".tsx") && f !== "create-icon.js");

let fixed = 0;

files.forEach((file) => {
   const filePath = path.join(iconsDir, file);
   let content = fs.readFileSync(filePath, "utf8");
   const original = content;

   // Remove className from paths with opacity attribute
   content = content.replace(
      /(<path[^>]*?opacity=["'{][^"']*["'}{][^>]*?fill=")([^"]*?)(".*?className=\{className \|\| \(active \? "fill-primary" : "fill-icon-sub"\)\})/g,
      (match, start, fillColor, rest) => {
         // Change fill to currentColor if it was a hardcoded color
         if (
            fillColor.startsWith("#") ||
            fillColor === "none" ||
            fillColor === "white"
         ) {
            return (
               start +
               "currentColor" +
               rest.replace(
                  /\s*className=\{className \|\| \(active \? "fill-primary" : "fill-icon-sub"\)\}/,
                  ""
               )
            );
         }
         return match;
      }
   );

   // Remove className from single-line path elements with opacity (simplified)
   content = content.replace(
      /opacity=["'{][^"']*["'}{][^>]*?className=\{className \|\| \(active \? "fill-primary" : "fill-icon-sub"\)\}/g,
      (match) => {
         return match.replace(
            /\s*className=\{className \|\| \(active \? "fill-primary" : "fill-icon-sub"\)\}/,
            ""
         );
      }
   );

   if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      fixed++;
   }
});
