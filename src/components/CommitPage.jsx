import React, { useState } from "react";
import "./devstyle.css";

const CommitPage = ({ fileSystem, onCommit, loading }) => {
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    readme: "",
    demo_url: "",
    github_url: "",
    skills: "",
    category: "web-development",
    payment_amount: "",
    payment_token: "APT",
    license: "MIT",
    tags: ""
  });

  const countFiles = (fs = fileSystem) => {
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
    traverse(fs);
    return count;
  };

  const getFileSize = () => {
    return Math.round(new Blob([JSON.stringify(fileSystem)]).size / 1024);
  };

  const getAllFiles = (fs = fileSystem, basePath = "") => {
    const files = [];
    const traverse = (obj, path) => {
      for (const key in obj) {
        const fullPath = path ? `${path}/${key}` : key;
        if (obj[key].type === 'file') {
          files.push({
            name: key,
            path: fullPath,
            size: new Blob([obj[key].content || ""]).size
          });
        } else if (obj[key].type === 'folder') {
          traverse(obj[key].children, fullPath);
        }
      }
    };
    traverse(fs, basePath);
    return files;
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap = {
      js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️',
      css: '🎨', scss: '🎨', html: '🌐', json: '📋',
      md: '📝', py: '🐍', java: '☕', php: '🐘',
      png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️',
      svg: '🖼️', pdf: '📄', txt: '📄'
    };
    return iconMap[extension] || '📄';
  };

  const handleCommit = () => {
    if (!projectForm.title.trim() || !projectForm.description.trim()) {
      alert("Please fill in the required fields");
      return;
    }
    onCommit(projectForm);
  };

  const allFiles = getAllFiles();

  return (
    <div className="commit-container fade-in">
      <div className="commit-header">
        <h1 className="commit-title">Commit your project</h1>
        <p className="commit-subtitle">Submit your project to Firestore database</p>
      </div>

      <div className="commit-content">
        <div className="commit-main-section">
          {/* Project Details */}
          <div className="commit-section">
            <h3 className="section-title">Project Information</h3>
            
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input
                className="form-input"
                type="text"
                value={projectForm.title}
                onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                placeholder="Enter your project title"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                value={projectForm.description}
                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                placeholder="Describe what your project does and why it's useful"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label className="form-label">README Content</label>
              <textarea
                className="form-textarea"
                value={projectForm.readme}
                onChange={(e) => setProjectForm({...projectForm, readme: e.target.value})}
                placeholder="Detailed project documentation, installation instructions, usage examples..."
                rows="6"
              />
            </div>
          </div>

          {/* Links & URLs */}
          <div className="commit-section">
            <h3 className="section-title">Project Links</h3>
            
            <div className="form-grid-row">
              <div className="form-group">
                <label className="form-label">Demo URL</label>
                <input
                  className="form-input"
                  type="url"
                  value={projectForm.demo_url}
                  onChange={(e) => setProjectForm({...projectForm, demo_url: e.target.value})}
                  placeholder="https://your-demo.vercel.app"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Repository</label>
                <input
                  className="form-input"
                  type="url"
                  value={projectForm.github_url}
                  onChange={(e) => setProjectForm({...projectForm, github_url: e.target.value})}
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>
          </div>

          {/* Tags & Skills */}
          <div className="commit-section">
            <h3 className="section-title">Technologies & Tags</h3>
            
            <div className="form-group">
              <label className="form-label">Skills & Technologies</label>
              <input
                className="form-input"
                type="text"
                value={projectForm.skills}
                onChange={(e) => setProjectForm({...projectForm, skills: e.target.value})}
                placeholder="React, Node.js, MongoDB, TypeScript (comma-separated)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <input
                className="form-input"
                type="text"
                value={projectForm.tags}
                onChange={(e) => setProjectForm({...projectForm, tags: e.target.value})}
                placeholder="frontend, fullstack, api, mobile (comma-separated)"
              />
            </div>

            <div className="form-grid-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={projectForm.category}
                  onChange={(e) => setProjectForm({...projectForm, category: e.target.value})}
                >
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="ai-ml">AI/Machine Learning</option>
                  <option value="game-development">Game Development</option>
                  <option value="desktop-application">Desktop Application</option>
                  <option value="devtools">Developer Tools</option>
                  <option value="data-science">Data Science</option>
                  <option value="iot">Internet of Things</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">License</label>
                <select
                  className="form-select"
                  value={projectForm.license}
                  onChange={(e) => setProjectForm({...projectForm, license: e.target.value})}
                >
                  <option value="MIT">MIT License</option>
                  <option value="Apache-2.0">Apache 2.0</option>
                  <option value="GPL-3.0">GPL 3.0</option>
                  <option value="BSD-3-Clause">BSD 3-Clause</option>
                  <option value="ISC">ISC License</option>
                  <option value="Proprietary">Proprietary</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="commit-section">
            <h3 className="section-title">Payment Settings (Optional)</h3>
            
            <div className="form-grid-row">
              <div className="form-group">
                <label className="form-label">Payment Amount</label>
                <input
                  className="form-input"
                  type="number"
                  value={projectForm.payment_amount}
                  onChange={(e) => setProjectForm({...projectForm, payment_amount: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Token</label>
                <select
                  className="form-select"
                  value={projectForm.payment_token}
                  onChange={(e) => setProjectForm({...projectForm, payment_token: e.target.value})}
                >
                  <option value="APT">APT</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="commit-sidebar">
          {/* Commit Summary */}
          <div className="commit-section">
            <h3 className="section-title">Commit Summary</h3>
            <div className="info-box">
              <div className="info-row">
                <span>📁 Files:</span>
                <strong>{countFiles()}</strong>
              </div>
              <div className="info-row">
                <span>💾 Size:</span>
                <strong>{getFileSize()} KB</strong>
              </div>
              <div className="info-row">
                <span>🏷️ Category:</span>
                <strong>{projectForm.category}</strong>
              </div>
              <div className="info-row">
                <span>📄 License:</span>
                <strong>{projectForm.license}</strong>
              </div>
              {projectForm.payment_amount && (
                <div className="info-row">
                  <span>💰 Payment:</span>
                  <strong>{projectForm.payment_amount} {projectForm.payment_token}</strong>
                </div>
              )}
            </div>

            <button
              className={`commit-button ${loading || !projectForm.title.trim() || !projectForm.description.trim() ? 'disabled' : ''}`}
              onClick={handleCommit}
              disabled={loading || !projectForm.title.trim() || !projectForm.description.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Saving to Database...
                </>
              ) : (
                "Save to Database"
              )}
            </button>
          </div>

          {/* Files Changed */}
          <div className="commit-section">
            <h3 className="section-title">Files to be committed</h3>
            <div className="file-list">
              {allFiles.length === 0 ? (
                <p className="text-center text-muted">No files to commit</p>
              ) : (
                allFiles.map((file, index) => (
                  <div key={index} className="file-list-item">
                    <span className="file-list-icon">{getFileIcon(file.name)}</span>
                    <div className="file-list-details">
                      <div className="file-name">{file.name}</div>
                      {file.path !== file.name && (
                        <div className="file-path">{file.path}</div>
                      )}
                    </div>
                    <span className="file-size">
                      {Math.round(file.size / 1024) || 1} KB
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitPage;