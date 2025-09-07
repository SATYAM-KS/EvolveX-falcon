/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useWallet } from "../App.jsx";
import CodeEditor from "./CodeEditor.jsx";
import CommitPage from "./CommitPage.jsx";
import ProjectsPage from "./ProjectsPage.jsx";
import "./devstyle.css";

const Developer = () => {
  const { walletAddr, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState("editor");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // File system state
  const [fileSystem, setFileSystem] = useState({
    "README.md": {
      type: "file",
      content:
        "# My Project\n\nProject description here...\n\n## Features\n- Feature 1\n- Feature 2\n\n## Installation\n```bash\nnpm install\nnpm start\n```",
      language: "markdown",
    },
    src: {
      type: "folder",
      children: {
        "index.js": {
          type: "file",
          content: "// Start coding here...\nconsole.log('Hello World!');",
          language: "javascript",
        },
        "App.js": {
          type: "file",
          content:
            'import React from \'react\';\n\nfunction App() {\n  return (\n    <div className="App">\n      <header className="App-header">\n        <h1>Welcome to My App</h1>\n      </header>\n    </div>\n  );\n}\n\nexport default App;',
          language: "javascript",
        },
      },
    },
    "package.json": {
      type: "file",
      content:
        '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "description": "A sample project",\n  "main": "src/index.js",\n  "scripts": {\n    "start": "node src/index.js",\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  },\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  }\n}',
      language: "json",
    },
  });

  const [activeFile, setActiveFile] = useState("README.md");

  // Load projects from Firestore
  const loadProjects = async () => {
    if (!walletAddr) return;

    try {
      const q = query(
        collection(db, "projects"),
        where("ownerAddress", "==", walletAddr)
      );
      const snap = await getDocs(q);
      const userProjects = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Sort projects by creation date (newest first)
      userProjects.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  useEffect(() => {
    if (walletAddr) {
      loadProjects();
    } else {
      setProjects([]);
    }
  }, [walletAddr]);

  const countFiles = (fs = fileSystem) => {
    let count = 0;
    const traverse = (obj) => {
      for (const key in obj) {
        if (obj[key].type === "file") {
          count++;
        } else if (obj[key].type === "folder") {
          traverse(obj[key].children);
        }
      }
    };
    traverse(fs);
    return count;
  };

  const handleCommit = async (projectForm) => {
    if (!walletAddr) {
      return;
    }

    setLoading(true);
    try {
      const codebase = JSON.stringify(fileSystem, null, 2);
      const skillsArray = projectForm.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const tagsArray = projectForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const projectData = {
        ...projectForm,
        skillsArray,
        tagsArray,
        codebase,
        ownerAddress: walletAddr,
        status: "approved", // Since we're storing directly, mark as approved
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        filesCount: countFiles(),
        codebaseSize: new Blob([codebase]).size,
        version: "1.0.0",
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "projects"), projectData);

      const newProject = {
        id: docRef.id,
        ...projectData,
        createdAt: new Date(), // For immediate display
        updatedAt: new Date(),
      };

      setProjects([newProject, ...projects]);
      setActiveTab("projects");

    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = () => {
    // Reset file system to template
    setFileSystem({
      "README.md": {
        type: "file",
        content:
          "# My New Project\n\nProject description here...\n\n## Features\n- Feature 1\n- Feature 2\n\n## Installation\n```bash\nnpm install\nnpm start\n```",
        language: "markdown",
      },
      src: {
        type: "folder",
        children: {
          "index.js": {
            type: "file",
            content: "// Start coding here...\nconsole.log('Hello World!');",
            language: "javascript",
          },
        },
      },
    });
    setActiveFile("README.md");
    setActiveTab("editor");
  };

  return (
    <div className="dev-container">
      <div className="dev-header">
        <h1 className="dev-title">Aptivate Developer</h1>
        <div className="dev-header-buttons">
          <button
            className={`dev-button ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            Projects ({projects.length})
          </button>
          <button
            className={`dev-button ${activeTab === "editor" ? "active" : ""}`}
            onClick={() => setActiveTab("editor")}
          >
            Code Editor
          </button>
          <button
            className={`dev-button ${activeTab === "commit" ? "active" : ""}`}
            onClick={() => setActiveTab("commit")}
          >
            Save Project
          </button>
          <button className="dev-button wallet" onClick={connectWallet}>
            {walletAddr
              ? `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>
      </div>

      <div className="dev-main-content">
        {activeTab === "editor" && (
          <CodeEditor
            fileSystem={fileSystem}
            setFileSystem={setFileSystem}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
          />
        )}

        {activeTab === "commit" && (
          <CommitPage
            fileSystem={fileSystem}
            onCommit={handleCommit}
            loading={loading}
          />
        )}

        {activeTab === "projects" && (
          <ProjectsPage
            projects={projects}
            onCreateProject={createNewProject}
          />
        )}
      </div>
    </div>
  );
};

export default Developer;
