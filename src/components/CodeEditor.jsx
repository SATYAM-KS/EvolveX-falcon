import React, { useState, useRef } from "react";
import "./devstyle.css";

const CodeEditor = ({ 
  fileSystem, 
  setFileSystem, 
  activeFile, 
  setActiveFile
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(["src"]));
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const fileInputRef = useRef(null);

  // File system operations
  const getFileByPath = (path) => {
    if (!path) return null;
    const parts = path.split('/');
    let current = fileSystem;
    
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
        if (current.type === 'folder') {
          current = current.children;
        }
      } else {
        return null;
      }
    }
    return current;
  };

  const setFileContent = (path, content) => {
    const parts = path.split('/');
    const fileName = parts.pop();
    let current = { ...fileSystem };
    let pointer = current;
    
    for (const part of parts) {
      if (pointer[part]?.type === 'folder') {
        pointer = pointer[part].children;
      }
    }
    
    if (pointer[fileName]) {
      pointer[fileName] = { ...pointer[fileName], content };
      setFileSystem(current);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const moveItem = (sourcePath, targetPath, isFolder = false) => {
    const sourceParts = sourcePath.split('/');
    const sourceFileName = sourceParts.pop();
    const targetParts = targetPath ? targetPath.split('/') : [];
    
    // Get source item
    let sourceParent = { ...fileSystem };
    let sourcePointer = sourceParent;
    for (const part of sourceParts) {
      if (sourcePointer[part]?.type === 'folder') {
        sourcePointer = sourcePointer[part].children;
      }
    }
    const sourceItem = { ...sourcePointer[sourceFileName] };
    
    // Remove from source
    delete sourcePointer[sourceFileName];
    
    // Add to target
    let targetParent = sourceParent;
    for (const part of targetParts) {
      if (targetParent[part]?.type === 'folder') {
        targetParent = targetParent[part].children;
      }
    }
    targetParent[sourceFileName] = sourceItem;
    
    setFileSystem(sourceParent);
    
    // Update active file if it was moved
    if (activeFile === sourcePath) {
      const newPath = targetPath ? `${targetPath}/${sourceFileName}` : sourceFileName;
      setActiveFile(newPath);
    } else if (activeFile.startsWith(sourcePath + '/')) {
      const relativePath = activeFile.substring(sourcePath.length + 1);
      const newPath = targetPath ? `${targetPath}/${sourceFileName}/${relativePath}` : `${sourceFileName}/${relativePath}`;
      setActiveFile(newPath);
    }
  };

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const createNewFile = () => {
    if (!newFileName.trim()) return;
    
    const fullPath = currentPath ? `${currentPath}/${newFileName}` : newFileName;
    const parts = fullPath.split('/');
    const fileName = parts.pop();
    let current = { ...fileSystem };
    let pointer = current;
    
    for (const part of parts) {
      if (!pointer[part]) {
        pointer[part] = { type: "folder", children: {} };
      }
      if (pointer[part].type === 'folder') {
        pointer = pointer[part].children;
      }
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase() || "";
    const languageMap = {
      js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
      css: "css", scss: "scss", html: "html", json: "json",
      md: "markdown", py: "python", java: "java", php: "php"
    };
    
    pointer[fileName] = {
      type: "file",
      content: "",
      language: languageMap[extension] || "text"
    };
    
    setFileSystem(current);
    setActiveFile(fullPath);
    setNewFileName("");
    setShowNewFileModal(false);
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) return;
    
    const fullPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
    const parts = fullPath.split('/');
    const folderName = parts.pop();
    let current = { ...fileSystem };
    let pointer = current;
    
    for (const part of parts) {
      if (!pointer[part]) {
        pointer[part] = { type: "folder", children: {} };
      }
      if (pointer[part].type === 'folder') {
        pointer = pointer[part].children;
      }
    }
    
    pointer[folderName] = { type: "folder", children: {} };
    
    setFileSystem(current);
    setNewFolderName("");
    setShowNewFolderModal(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e, path) => {
    setDraggedItem(path);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, path, isFolder) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (isFolder) {
      setDragOverItem(path);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, targetPath) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetPath) return;
    
    // Prevent dropping a folder into itself
    if (targetPath && targetPath.startsWith(draggedItem + '/')) return;
    
    moveItem(draggedItem, targetPath);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const deleteItem = (path) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    const parts = path.split('/');
    const itemName = parts.pop();
    let current = { ...fileSystem };
    let pointer = current;
    
    for (const part of parts) {
      if (pointer[part]?.type === 'folder') {
        pointer = pointer[part].children;
      }
    }
    
    delete pointer[itemName];
    setFileSystem(current);
    
    if (activeFile === path || activeFile.startsWith(path + '/')) {
      setActiveFile("");
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const extension = file.name.split('.').pop()?.toLowerCase() || "";
        const languageMap = {
          js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
          css: "css", scss: "scss", html: "html", json: "json",
          md: "markdown", py: "python", java: "java", php: "php"
        };
        
        const newFileSystem = { ...fileSystem };
        newFileSystem[file.name] = {
          type: "file",
          content: content,
          language: languageMap[extension] || "text"
        };
        setFileSystem(newFileSystem);
      };
      reader.readAsText(file);
    });
    e.target.value = '';
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

  const renderFileTree = (items, basePath = "", level = 0) => {
    return Object.entries(items).map(([name, item]) => {
      const fullPath = basePath ? `${basePath}/${name}` : name;
      const isDragging = draggedItem === fullPath;
      const isDragOver = dragOverItem === fullPath;
      
      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(fullPath);
        return (
          <div key={fullPath}>
            <div 
              className={`file-item ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drop-zone' : ''}`}
              style={{ paddingLeft: `${12 + level * 16}px` }}
              draggable
              onDragStart={(e) => handleDragStart(e, fullPath)}
              onDragOver={(e) => handleDragOver(e, fullPath, true)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, fullPath)}
              onClick={() => toggleFolder(fullPath)}
            >
              <span className={`folder-icon ${isExpanded ? 'expanded' : ''}`}>
                ▶
              </span>
              <span className="file-icon">📁</span>
              <span style={{ flex: 1 }}>{name}</span>
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  className="icon-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPath(fullPath);
                    setShowNewFileModal(true);
                  }}
                  title="New File"
                >
                  +
                </button>
              </div>
            </div>
            {isExpanded && (
              <div className="folder-content">
                {renderFileTree(item.children, fullPath, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div 
            key={fullPath}
            className={`file-item ${activeFile === fullPath ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
            draggable
            onDragStart={(e) => handleDragStart(e, fullPath)}
            onClick={() => setActiveFile(fullPath)}
          >
            <span className="file-icon">{getFileIcon(name)}</span>
            <span style={{ flex: 1 }}>{name}</span>
            <button
              className="icon-button"
              style={{ opacity: 0.7 }}
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(fullPath);
              }}
              title="Delete"
            >
              ×
            </button>
          </div>
        );
      }
    });
  };

  const activeFileContent = activeFile ? getFileByPath(activeFile) : null;

  return (
    <div className="code-editor-container">
      {/* Sidebar - File Explorer */}
      <div className="code-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Explorer</h3>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="icon-button"
              onClick={() => {
                setCurrentPath("");
                setShowNewFileModal(true);
              }}
              title="New File"
            >
              📄
            </button>
            <button
              className="icon-button"
              onClick={() => {
                setCurrentPath("");
                setShowNewFolderModal(true);
              }}
              title="New Folder"
            >
              📁
            </button>
            <button
              className="icon-button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Files"
            >
              ↑
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <div 
          className="file-tree"
          onDragOver={(e) => handleDragOver(e, "", false)}
          onDrop={(e) => handleDrop(e, "")}
        >
          {renderFileTree(fileSystem)}
        </div>
      </div>

      {/* Editor Area */}
      <div className="editor-area">
        {activeFile ? (
          <>
            <div className="editor-tabs">
              <div className="editor-tab active">
                <span>{getFileIcon(activeFile.split('/').pop())}</span>
                <span>{activeFile.split('/').pop()}</span>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cccccc',
                    cursor: 'pointer',
                    padding: '0 4px'
                  }}
                  onClick={() => setActiveFile("")}
                >
                  ×
                </button>
              </div>
            </div>
            <textarea
              className="code-editor"
              value={activeFileContent?.content || ""}
              onChange={(e) => setFileContent(activeFile, e.target.value)}
              placeholder="Start coding..."
              spellCheck={false}
            />
          </>
        ) : (
          <div className="editor-empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍💻</div>
            <p>Select a file to start coding</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewFileModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="modal-header">Create New File</h3>
            <input
              className="modal-input"
              type="text"
              placeholder="filename.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createNewFile()}
              autoFocus
            />
            <div style={{ marginTop: '16px' }}>
              <button className="dev-button primary" onClick={createNewFile} disabled={!newFileName.trim()}>
                Create
              </button>
              <button className="dev-button" onClick={() => setShowNewFileModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFolderModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="modal-header">Create New Folder</h3>
            <input
              className="modal-input"
              type="text"
              placeholder="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createNewFolder()}
              autoFocus
            />
            <div style={{ marginTop: '16px' }}>
              <button className="dev-button primary" onClick={createNewFolder} disabled={!newFolderName.trim()}>
                Create
              </button>
              <button className="dev-button" onClick={() => setShowNewFolderModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;