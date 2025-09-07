// Utility functions for project management

export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const iconMap = {
    js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️',
    css: '🎨', scss: '🎨', less: '🎨', sass: '🎨',
    html: '🌐', htm: '🌐',
    json: '📋', xml: '📋', yaml: '📋', yml: '📋',
    md: '📝', txt: '📝', doc: '📝', docx: '📝',
    py: '🐍', pyc: '🐍',
    java: '☕', class: '☕', jar: '☕',
    php: '🐘', phtml: '🐘',
    c: '⚙️', cpp: '⚙️', cc: '⚙️', cxx: '⚙️',
    h: '⚙️', hpp: '⚙️', hxx: '⚙️',
    go: '🔷', rs: '🦀', swift: '🔶',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️',
    svg: '🖼️', webp: '🖼️', ico: '🖼️',
    pdf: '📄', ps: '📄', eps: '📄',
    zip: '📦', rar: '📦', '7z': '📦', tar: '📦',
    mp4: '🎬', avi: '🎬', mov: '🎬', mkv: '🎬',
    mp3: '🎵', wav: '🎵', flac: '🎵', ogg: '🎵',
    sql: '🗄️', db: '🗄️', sqlite: '🗄️',
    dockerfile: '🐳', 'docker-compose': '🐳'
  };
  return iconMap[extension] || '📄';
};

export const getLanguageFromExtension = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || "";
  const languageMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript", 
    tsx: "typescript",
    css: "css",
    scss: "scss",
    less: "less",
    sass: "sass",
    html: "html",
    htm: "html",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    py: "python",
    java: "java",
    php: "php",
    c: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    h: "c",
    hpp: "cpp",
    go: "go",
    rs: "rust",
    swift: "swift",
    sql: "sql",
    dockerfile: "dockerfile"
  };
  return languageMap[extension] || "text";
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const countFiles = (fileSystem) => {
  let count = 0;
  const traverse = (obj) => {
    for (const key in obj) {
      if (obj[key].type === 'file') {
        count++;
      } else if (obj[key].type === 'folder') {
        traverse(obj[key].children);
      }
    }
  };
  traverse(fileSystem);
  return count;
};

export const getAllFiles = (fileSystem, basePath = "") => {
  const files = [];
  const traverse = (obj, path) => {
    for (const key in obj) {
      const fullPath = path ? `${path}/${key}` : key;
      if (obj[key].type === 'file') {
        files.push({
          name: key,
          path: fullPath,
          size: new Blob([obj[key].content || ""]).size,
          content: obj[key].content || "",
          language: obj[key].language || "text"
        });
      } else if (obj[key].type === 'folder') {
        traverse(obj[key].children, fullPath);
      }
    }
  };
  traverse(fileSystem, basePath);
  return files;
};

export const calculateProjectSize = (fileSystem) => {
  return new Blob([JSON.stringify(fileSystem)]).size;
};

export const validateProjectData = (projectForm) => {
  const errors = [];
  
  if (!projectForm.title?.trim()) {
    errors.push("Project title is required");
  }
  
  if (!projectForm.description?.trim()) {
    errors.push("Project description is required");
  }
  
  if (projectForm.demo_url && !isValidUrl(projectForm.demo_url)) {
    errors.push("Demo URL is not valid");
  }
  
  if (projectForm.github_url && !isValidUrl(projectForm.github_url)) {
    errors.push("GitHub URL is not valid");
  }
  
  if (projectForm.payment_amount && parseFloat(projectForm.payment_amount) < 0) {
    errors.push("Payment amount cannot be negative");
  }
  
  return errors;
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  // eslint-disable-next-line no-unused-vars
  } catch (_) {
    return false;
  }
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  // Handle Firebase Timestamp
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  
  // Handle regular Date object
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString();
  }
  
  // Handle timestamp string
  return new Date(timestamp).toLocaleDateString();
};

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  let date;
  if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export const parseSkills = (skills) => {
  if (typeof skills === 'string') {
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  }
  if (Array.isArray(skills)) {
    return skills;
  }
  return [];
};

export const parseTags = (tags) => {
  if (typeof tags === 'string') {
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
  if (Array.isArray(tags)) {
    return tags;
  }
  return [];
};

export const createDefaultFileSystem = () => {
  return {
    "README.md": {
      type: "file",
      content: "# My Project\n\nProject description here...\n\n## Features\n- Feature 1\n- Feature 2\n\n## Installation\n```bash\nnpm install\nnpm start\n```\n\n## Usage\nDescribe how to use your project here.\n\n## Contributing\nContributions are welcome! Please feel free to submit a Pull Request.",
      language: "markdown"
    },
    "src": {
      type: "folder",
      children: {
        "index.js": {
          type: "file",
          content: "// Main entry point\nconsole.log('Hello World!');\n\n// Add your code here",
          language: "javascript"
        }
      }
    },
    "package.json": {
      type: "file",
      content: JSON.stringify({
        name: "my-project",
        version: "1.0.0",
        description: "A sample project",
        main: "src/index.js",
        scripts: {
          start: "node src/index.js",
          test: "echo \"Error: no test specified\" && exit 1"
        },
        dependencies: {},
        devDependencies: {}
      }, null, 2),
      language: "json"
    }
  };
};

export const createReactFileSystem = () => {
  return {
    "README.md": {
      type: "file",
      content: "# React Project\n\nThis is a React application.\n\n## Getting Started\n\n```bash\nnpm install\nnpm start\n```\n\n## Available Scripts\n\n- `npm start` - Runs the app in development mode\n- `npm test` - Launches the test runner\n- `npm run build` - Builds the app for production",
      language: "markdown"
    },
    "src": {
      type: "folder",
      children: {
        "App.js": {
          type: "file",
          content: "import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      <header className=\"App-header\">\n        <h1>Welcome to React</h1>\n        <p>Edit src/App.js and save to reload.</p>\n      </header>\n    </div>\n  );\n}\n\nexport default App;",
          language: "javascript"
        },
        "App.css": {
          type: "file",
          content: ".App {\n  text-align: center;\n}\n\n.App-header {\n  background-color: #282c34;\n  padding: 20px;\n  color: white;\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  font-size: calc(10px + 2vmin);\n}",
          language: "css"
        },
        "index.js": {
          type: "file",
          content: "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport './index.css';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);",
          language: "javascript"
        },
        "index.css": {
          type: "file",
          content: "body {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',\n    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',\n    sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\ncode {\n  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',\n    monospace;\n}",
          language: "css"
        }
      }
    },
    "public": {
      type: "folder",
      children: {
        "index.html": {
          type: "file",
          content: "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>React App</title>\n  </head>\n  <body>\n    <noscript>You need to enable JavaScript to run this app.</noscript>\n    <div id=\"root\"></div>\n  </body>\n</html>",
          language: "html"
        }
      }
    },
    "package.json": {
      type: "file",
      content: JSON.stringify({
        name: "react-project",
        version: "0.1.0",
        private: true,
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-scripts": "5.0.1"
        },
        scripts: {
          start: "react-scripts start",
          build: "react-scripts build",
          test: "react-scripts test",
          eject: "react-scripts eject"
        },
        eslintConfig: {
          extends: ["react-app", "react-app/jest"]
        },
        browserslist: {
          production: [">0.2%", "not dead", "not op_mini all"],
          development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
        }
      }, null, 2),
      language: "json"
    }
  };
};

export const projectTemplates = {
  blank: createDefaultFileSystem,
  react: createReactFileSystem
};