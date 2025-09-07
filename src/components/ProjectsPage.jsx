import React from "react";
import "./devstyle.css";

const ProjectsPage = ({ projects, onCreateProject }) => {
  const formatDate = (timestamp) => {
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

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "status-badge status-approved";
      case "pending":
        return "status-badge status-pending";
      case "submitting":
        return "status-badge status-submitting";
      case "rejected":
      case "failed":
        return "status-badge status-rejected";
      default:
        return "status-badge status-pending";
    }
  };

  const formatSkills = (skills) => {
    if (typeof skills === 'string') {
      return skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    }
    if (Array.isArray(skills)) {
      return skills;
    }
    return [];
  };

  return (
    <div className="projects-container fade-in">
      <div className="projects-header">
        <h2 className="projects-title">
          Your Projects ({projects.length})
        </h2>
        <button
          className="dev-button primary"
          onClick={onCreateProject}
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="projects-empty-state">
          <div className="projects-empty-icon">📁</div>
          <h3>No projects submitted yet</h3>
          <p>Create your first project and share it with the world</p>
          <button
            className="dev-button primary mt-2"
            onClick={onCreateProject}
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map((project) => {
            const skillsArray = formatSkills(project.skills);
            
            return (
              <div key={project.id} className="project-card slide-in">
                <div className="project-card-header">
                  <h3 className="project-title">{project.title}</h3>
                  <span className={getStatusBadgeClass(project.status)}>
                    {project.status || 'unknown'}
                  </span>
                </div>

                <p className="project-description">
                  {project.description}
                </p>

                {/* Project metadata */}
                <div className="project-metadata">
                  <span>📁 {project.filesCount || 0} files</span>
                  <span>💾 {Math.round((project.codebaseSize || 0) / 1024)} KB</span>
                  <span>🏷️ {project.category || 'uncategorized'}</span>
                  {project.license && (
                    <span>📄 {project.license}</span>
                  )}
                  {project.payment_amount && (
                    <span>💰 {project.payment_amount} {project.payment_token}</span>
                  )}
                  <span>📅 {formatDate(project.createdAt)}</span>
                </div>

                {/* Technologies/Skills */}
                {skillsArray.length > 0 && (
                  <div className="project-skills">
                    <div className="skills-label">Technologies:</div>
                    <div className="skills-list">
                      {skillsArray.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="project-actions">
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-link demo"
                    >
                      🌐 Demo
                    </a>
                  )}

                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-link"
                    >
                      🐙 GitHub
                    </a>
                  )}

                  {project.transactionHash && (
                    <a
                      href={`https://explorer.aptoslabs.com/txn/${project.transactionHash}?network=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-link"
                    >
                      🔗 Transaction
                    </a>
                  )}

                  <button
                    className="dev-button"
                    onClick={() => {
                      navigator.clipboard.writeText(project.id);
                      alert('Project ID copied to clipboard!');
                    }}
                    title="Copy Project ID"
                  >
                    📋 Copy ID
                  </button>
                </div>

                {/* Error message for failed submissions */}
                {(project.status === "failed" || project.status === "rejected") && project.error && (
                  <div className="error-message">
                    Error: {project.error}
                  </div>
                )}

                {/* Additional project details */}
                {project.readme && (
                  <details style={{ marginTop: '12px' }}>
                    <summary style={{ 
                      cursor: 'pointer', 
                      color: '#0969da',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      📖 View README
                    </summary>
                    <div style={{
                      marginTop: '8px',
                      padding: '12px',
                      backgroundColor: '#0d1117',
                      border: '1px solid #21262d',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {project.readme}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;