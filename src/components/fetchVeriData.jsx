import React, { useState, useEffect } from 'react';
import { collection, getDocs, query,  orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Search, Code, Calendar, User, Clock, FileText, Database } from 'lucide-react';

const FetchVeriData = ({ onSelectProject, userWallet }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending'); // pending, in_review, verified
  const [error, setError] = useState(null);

  // Fetch projects from Firestore
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(projectsQuery);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      setProjects(projectsData);
      filterProjects(projectsData, searchTerm, filterStatus);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects from database');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search and status
  const filterProjects = (projectList, search, status) => {
    let filtered = projectList;

    // Filter by verification status
    if (status === 'pending') {
      filtered = filtered.filter(project => 
        !project.verificationStatus || 
        project.verificationStatus === 'pending' ||
        (project.verifications && project.verifications.length < 3)
      );
    } else if (status === 'in_review') {
      filtered = filtered.filter(project => 
        project.verifications && 
        project.verifications.length > 0 && 
        project.verifications.length < 3
      );
    } else if (status === 'verified') {
      filtered = filtered.filter(project => 
        project.verificationStatus === 'verified' ||
        (project.verifications && project.verifications.length >= 3)
      );
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.skillsArray?.some(skill => skill.toLowerCase().includes(searchLower)) ||
        project.tagsArray?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Exclude user's own projects
    if (userWallet) {
      filtered = filtered.filter(project => 
        project.ownerAddress?.toLowerCase() !== userWallet.toLowerCase()
      );
    }

    setFilteredProjects(filtered);
  };

  useEffect(() => {
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterProjects(projects, searchTerm, filterStatus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, projects, userWallet]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getVerificationProgress = (project) => {
    const verifications = project.verifications || [];
    return Math.min(verifications.length, 3);
  };

  const getProjectSize = (project) => {
    if (project.codebaseSize) {
      const sizeInKB = project.codebaseSize / 1024;
      if (sizeInKB > 1024) {
        return `${(sizeInKB / 1024).toFixed(1)} MB`;
      }
      return `${sizeInKB.toFixed(1)} KB`;
    }
    return 'Unknown';
  };

  return (
    <div className="fetch-veri-container">
      <div className="fetch-veri-header">
        <h2>Projects Available for Verification</h2>
        <p>Select projects to verify based on your expertise and interests</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="fetch-controls">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search projects by name, skills, or tags..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          {[
            { key: 'pending', label: 'Pending Verification', count: projects.filter(p => !p.verificationStatus || p.verificationStatus === 'pending').length },
            { key: 'in_review', label: 'In Review', count: projects.filter(p => p.verifications && p.verifications.length > 0 && p.verifications.length < 3).length },
            { key: 'verified', label: 'Verified', count: projects.filter(p => p.verificationStatus === 'verified').length }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => handleFilterChange(filter.key)}
              className={`filter-btn ${filterStatus === filter.key ? 'active' : ''}`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-container">
          <Database className="error-icon" />
          <span>{error}</span>
          <button onClick={fetchProjects} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Fetching projects from database...</span>
        </div>
      )}

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.length === 0 && !loading ? (
          <div className="no-projects">
            <FileText className="no-projects-icon" />
            <h3>No Projects Found</h3>
            <p>
              {filterStatus === 'pending' && 'No projects pending verification at the moment.'}
              {filterStatus === 'in_review' && 'No projects currently under review.'}
              {filterStatus === 'verified' && 'No verified projects match your search criteria.'}
            </p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <div className="project-title">
                  <Code className="project-icon" />
                  <h3>{project.name || 'Untitled Project'}</h3>
                </div>
                
                <div className="verification-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(getVerificationProgress(project) / 3) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {getVerificationProgress(project)}/3 verifications
                  </span>
                </div>
              </div>

              <div className="project-description">
                <p>{project.description || 'No description provided'}</p>
              </div>

              <div className="project-metadata">
                <div className="metadata-item">
                  <User className="metadata-icon" />
                  <span>{formatAddress(project.ownerAddress)}</span>
                </div>
                
                <div className="metadata-item">
                  <Calendar className="metadata-icon" />
                  <span>
                    {project.createdAt ? 
                      project.createdAt.toLocaleDateString() : 
                      'Unknown date'
                    }
                  </span>
                </div>

                <div className="metadata-item">
                  <FileText className="metadata-icon" />
                  <span>{project.filesCount || 0} files ({getProjectSize(project)})</span>
                </div>
              </div>

              {/* Skills and Tags */}
              <div className="project-tags">
                <div className="skills-section">
                  <span className="tags-label">Skills:</span>
                  <div className="tags-list">
                    {(project.skillsArray || []).slice(0, 3).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {(project.skillsArray || []).length > 3 && (
                      <span className="more-tags">+{(project.skillsArray || []).length - 3}</span>
                    )}
                  </div>
                </div>
                
                <div className="tags-section">
                  <span className="tags-label">Tags:</span>
                  <div className="tags-list">
                    {(project.tagsArray || []).slice(0, 3).map((tag, index) => (
                      <span key={index} className="project-tag">{tag}</span>
                    ))}
                    {(project.tagsArray || []).length > 3 && (
                      <span className="more-tags">+{(project.tagsArray || []).length - 3}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="project-actions">
                <button
                  onClick={() => onSelectProject(project)}
                  className="verify-btn"
                  disabled={getVerificationProgress(project) >= 3}
                >
                  {getVerificationProgress(project) >= 3 ? 'Fully Verified' : 'Start Verification'}
                </button>
              </div>

              {/* Verification Status Indicator */}
              <div className={`status-indicator ${filterStatus}`}>
                <div className="status-dot"></div>
                <span className="status-text">
                  {getVerificationProgress(project) >= 3 ? 'Verified' : 
                   getVerificationProgress(project) > 0 ? 'In Review' : 'Pending'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="refresh-section">
        <button 
          onClick={fetchProjects} 
          className="refresh-btn"
          disabled={loading}
        >
          <Database className="refresh-icon" />
          Refresh Projects
        </button>
      </div>
    </div>
  );
};

export default FetchVeriData;