import fs from "fs";
import path from "path";

const pagesDir = path.resolve("src/pages");
const appFile = path.resolve("src/App.tsx");

function getPageName(fileName) {
  return fileName.replace(/\.tsx$/, "");
}

function toRoutePath(name) {
  if (name.toLowerCase() === "dashboardpage") return "/dashboard";
  if (name.toLowerCase() === "profilepage") return "/profile";
  if (name.toLowerCase() === "taxscenariospage") return "/tax-scenarios";
  if (name.toLowerCase() === "notfoundpage") return "*";
  return `/${name.replace(/page$/i, "").toLowerCase()}`;
}

function generateRoutes(pages) {
  return pages
    .map((page) => {
      const importName = getPageName(page);
      const routePath = toRoutePath(importName);
      return `        <Route path="${routePath}" element={<${importName} />} />`;
    })
    .join("\n");
}

function generateImports(pages) {
  return pages
    .map((page) => {
      const name = getPageName(page);
      return `import ${name} from "./pages/${name}";`;
    })
    .join("\n");
}

try {
  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".tsx"));
  console.log("✅ Found pages:", files);

  const imports = generateImports(files);
  const routes = generateRoutes(files);

  const newRoutesBlock = `
${imports}

function App() {
  return (
    <BrowserRouter>
      <Routes>
${routes}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`;

  // Read App.tsx
  let appContent = fs.readFileSync(appFile, "utf8");

  // Remove old Routes section
  appContent = appContent.replace(
    /function App[\s\S]*export default App;/m,
    ""
  );

  // Add new clean section
  const finalContent = `${appContent}\n${newRoutesBlock}`;

  fs.writeFileSync(appFile, finalContent);

  console.log("🚀 App.tsx updated successfully with clean route definitions.");
} catch (err) {
  console.error("❌ Error fixing routes:", err.message);
}


