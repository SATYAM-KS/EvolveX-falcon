// Main exports for the Developer Platform modules

export { default as Developer } from "./Developer.jsx";
export { default as CodeEditor } from "./CodeEditor.jsx";
export { default as CommitPage } from "./CommitPage.jsx";
export { default as ProjectsPage } from "./ProjectsPage.jsx";

export {
  getFileIcon,
  getLanguageFromExtension,
  formatFileSize,
  countFiles,
  getAllFiles,
  calculateProjectSize,
  validateProjectData,
  isValidUrl,
  formatDate,
  formatRelativeTime,
  parseSkills,
  parseTags,
  createDefaultFileSystem,
  createReactFileSystem,
  projectTemplates,
} from "./projectUtils.js";

// CSS import for styling
import "./devstyle.css";
