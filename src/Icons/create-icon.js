import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { input, editor } from "@inquirer/prompts";

function toPascalCase(s) {
   return s
      .replace(/\.[^/.]+$/, "")
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
   const nameArg = await input({
      message: "Icon filename (kebab or snake-case, without extension):",
   });
   if (!nameArg) {
      console.error("A name is required.");
      process.exit(1);
   }

   const svg = await editor({
      message:
         "Paste the full SVG content in the editor, save and close to continue:",
   });

   try {
      const outDir = __dirname; // src/Icons
      const baseName = path.basename(nameArg, path.extname(nameArg));
      const outFile = path.join(outDir, baseName + ".tsx");

      const svgMatch = svg.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/i);
      if (!svgMatch) {
         console.error(
            "Could not find <svg> ... </svg> in the pasted content."
         );
         process.exit(1);
      }

      let svgAttrs = svgMatch[1] || "";
      let inner = (svgMatch[2] || "").trim();

      // Replace fill attributes in common shape tags with className
      inner = inner.replace(
         /(<(?:path|rect|circle|ellipse|polygon|polyline|line)\b[^>]*?)\sfill=("|')(.*?)\2/gi,
         '$1 className={className || (active ? "fill-primary" : "fill-icon-sub")}'
      );

      // Also replace basic inline style fill:... inside style attributes with className
      inner = inner.replace(
         /(<[^>]*?)style=("|')(.*?)(fill:\s*[^;"']+;?)(.*?|)\2/gi,
         '$1style="$3$5" className={className || (active ? "fill-primary" : "fill-icon-sub")}'
      );

      // Strip class/className from svg root attrs so we can set our own className
      svgAttrs = svgAttrs.replace(/\sclass(Name)?=("|')(.*?)\2/gi, "");
      // Remove fill on svg root if present
      svgAttrs = svgAttrs.replace(/\sfill=("|')(.*?)\1/gi, "");

      svgAttrs = svgAttrs.trim();

      const compName = toPascalCase(baseName) || "Icon";

      // Check if this is a directional icon that should support RTL
      const directionalKeywords = [
         "arrow",
         "chevron",
         "caret",
         "angle",
         "left",
         "right",
         "next",
         "prev",
         "back",
         "forward",
         "rotate",
         "sort",
      ];
      const isDirectional = directionalKeywords.some((keyword) =>
         baseName.toLowerCase().includes(keyword)
      );

      // Parse svg attributes into a map
      const attrMap = {};
      const attrRegex = /(\S+)=("[^"]*"|'[^']*'|[^\s>]+)/g;
      let m;
      while ((m = attrRegex.exec(svgAttrs))) {
         const key = m[1];
         let val = m[2];
         if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
         ) {
            val = val.slice(1, -1);
         }
         attrMap[key] = val;
      }

      function renderAttr(key) {
         const v = attrMap[key];
         if (v == null) return null;
         // For width/height, use the size variable instead of hardcoded value
         if (key === "width" || key === "height") return `${key}={size}`;
         if (/^-?\d+(?:\.\d+)?$/.test(v)) return `${key}={${v}}`;
         return `${key}="${v}"`;
      }

      const svgLines = [];
      const w = renderAttr("width");
      const h = renderAttr("height");
      const vb = renderAttr("viewBox");
      const fillAttr = renderAttr("fill");
      const xmlns = renderAttr("xmlns") || 'xmlns="http://www.w3.org/2000/svg"';
      if (w) svgLines.push(w);
      if (h) svgLines.push(h);
      if (vb) svgLines.push(vb);
      if (fillAttr) svgLines.push(fillAttr);
      if (xmlns) svgLines.push(xmlns);

      for (const [k, v] of Object.entries(attrMap)) {
         if (
            ![
               "width",
               "height",
               "viewBox",
               "fill",
               "xmlns",
               "class",
               "className",
            ].includes(k)
         ) {
            if (/^-?\d+(?:\.\d+)?$/.test(v)) svgLines.push(`${k}={${v}}`);
            else svgLines.push(`${k}="${v}"`);
         }
      }

      svgLines.push(
         `className={\`\${isRTL ? "rotate-180" : ""} \${className || (active ? "fill-primary" : "fill-icon-sub")}\`}`
      );

      const svgOpen = ["<svg", ...svgLines.map((l) => `   ${l}`), ">"].join(
         "\n"
      );

      // Component props signature
      const propsSignature = `{ className, active = false, size = 20, isRTL }: { className?: string; active?: boolean; size?: number; isRTL?: boolean }`;

      const component = `const ${compName} = (${propsSignature}) => (
${svgOpen}
    ${inner
       .split("\n")
       .map((l) => l.trim())
       .join("\n    ")}
   </svg>
);
export default ${compName};
`;

      fs.writeFileSync(outFile, component, "utf8");

      // Update src/Icons/index.ts to export the new icon
      const indexFile = path.join(outDir, "index.ts");
      try {
         let indexContent = "";
         if (fs.existsSync(indexFile)) {
            indexContent = fs.readFileSync(indexFile, "utf8");
         }

         const exportLine = `export { default as ${compName} } from './${baseName}';`;

         // Check if export already exists at the end of the file (with optional whitespace)
         const lastLineMatch = indexContent.trim().split("\n").pop();
         const exportLineAlreadyExists = lastLineMatch === exportLine.trim();

         if (!indexContent.includes(exportLine) || !exportLineAlreadyExists) {
            // Remove old export for this component if it exists (for overwriting case)
            const oldExportRegex = new RegExp(
               `export\\s+{\\s+default\\s+as\\s+${compName}\\s+}\\s+from\\s+[^;]+;`,
               "i"
            );
            indexContent = indexContent.replace(oldExportRegex, "");

            // Ensure trailing newline before adding new export
            if (indexContent.length && !indexContent.endsWith("\n"))
               indexContent += "\n";
            indexContent += exportLine + "\n";
            fs.writeFileSync(indexFile, indexContent, "utf8");
         } else {
         }
      } catch (ex) {
         console.warn("Failed to update index.ts:", ex.message || ex);
      }
   } catch (err) {
      console.error("Error:", err.message || err);
      process.exit(1);
   }
}

run();
