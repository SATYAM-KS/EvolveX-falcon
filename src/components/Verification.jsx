import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Code, 
  FileText, 
  User, 
  Calendar,
  Shield,
  Send,
  ArrowLeft,
  Eye,
  Download,
  Star,
  MessageSquare
} from 'lucide-react';

const Verification = ({ 
  project, 
  userWallet, 
  onBack, 
  onVerificationComplete,
  monthlyVerifications,
  maxMonthlyVerifications = 3 
}) => {
  const [verificationData, setVerificationData] = useState({
    codeQuality: 0,
    security: 0,
    functionality: 0,
    documentation: 0,
    overallRating: 0,
    feedback: '',
    issues: [],
    recommendations: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [codebase, setCodebase] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [existingVerifications, setExistingVerifications] = useState([]);

  useEffect(() => {
    if (project && project.codebase) {
      try {
        const parsed = JSON.parse(project.codebase);
        setCodebase(parsed);
        // Set first file as default
        const firstFile = findFirstFile(parsed);
        setSelectedFile(firstFile);
      } catch (err) {
        console.error('Error parsing codebase:', err);
        setError('Failed to load project files');
      }
    }

    // Load existing verifications
    if (project && project.verifications) {
      setExistingVerifications(project.verifications || []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const findFirstFile = (fs) => {
    for (const [name, item] of Object.entries(fs)) {
      if (item.type === 'file') {
        return name;
      } else if (item.type === 'folder' && item.children) {
        const childFile = findFirstFile(item.children);
        if (childFile) {
          return `${name}/${childFile}`;
        }
      }
    }
    return null;
  };

  const getFileContent = (fileName) => {
    const parts = fileName.split('/');
    let current = codebase;
    
    for (const part of parts) {
      if (current[part]) {
        if (current[part].type === 'file') {
          return current[part];
        } else if (current[part].type === 'folder') {
          current = current[part].children;
        }
      }
    }
    return null;
  };

  const renderFileTree = (fs, prefix = '') => {
    return Object.entries(fs).map(([name, item]) => {
      const fullPath = prefix ? `${prefix}/${name}` : name;
      
      if (item.type === 'file') {
        return (
          <div
            key={fullPath}
            className={`file-item ${selectedFile === fullPath ? 'active' : ''}`}
            onClick={() => setSelectedFile(fullPath)}
          >
            <FileText className="file-icon" />
            <span>{name}</span>
          </div>
        );
      } else if (item.type === 'folder') {
        return (
          <div key={fullPath} className="folder-item">
            <div className="folder-header">
              <Code className="folder-icon" />
              <span>{name}/</span>
            </div>
            <div className="folder-children">
              {renderFileTree(item.children, fullPath)}
            </div>
          </div>
        );
      }
      return null;
    });
  };

  const handleRatingChange = (category, value) => {
    const newData = { ...verificationData, [category]: value };
    
    // Calculate overall rating as average
    const ratings = [
      newData.codeQuality,
      newData.security,
      newData.functionality,
      newData.documentation
    ].filter(r => r > 0);
    
    const overallRating = ratings.length > 0 
      ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) 
      : 0;
    
    setVerificationData({
      ...newData,
      overallRating
    });
  };

  const addIssue = () => {
    const issue = prompt('Describe the issue:');
    if (issue && issue.trim()) {
      setVerificationData({
        ...verificationData,
        issues: [...verificationData.issues, {
          id: Date.now(),
          description: issue.trim(),
          severity: 'medium'
        }]
      });
    }
  };

  const removeIssue = (issueId) => {
    setVerificationData({
      ...verificationData,
      issues: verificationData.issues.filter(issue => issue.id !== issueId)
    });
  };

  const updateIssueSeverity = (issueId, severity) => {
    setVerificationData({
      ...verificationData,
      issues: verificationData.issues.map(issue =>
        issue.id === issueId ? { ...issue, severity } : issue
      )
    });
  };

  const canSubmitVerification = () => {
    return (
      verificationData.codeQuality > 0 &&
      verificationData.security > 0 &&
      verificationData.functionality > 0 &&
      verificationData.documentation > 0 &&
      verificationData.feedback.trim().length > 10 &&
      monthlyVerifications < maxMonthlyVerifications
    );
  };

  const submitVerification = async () => {
    if (!canSubmitVerification()) {
      setError('Please complete all required fields and ensure you have remaining verifications this month');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const verification = {
        verifierId: userWallet,
        verifierAddress: userWallet,
        timestamp: serverTimestamp(),
        submittedAt: new Date().toISOString(),
        ...verificationData,
        verificationId: `${userWallet}_${Date.now()}`
      };

      // Update project with new verification
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        verifications: arrayUnion(verification),
        updatedAt: serverTimestamp(),
        verificationStatus: existingVerifications.length + 1 >= 3 ? 'verified' : 'in_review'
      });

      // Call callback to update parent component
      onVerificationComplete(verification);

      alert('Verification submitted successfully!');
      onBack();

    } catch (err) {
      console.error('Error submitting verification:', err);
      setError('Failed to submit verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label }) => (
    <div className="rating-container">
      <label>{label}</label>
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`star ${rating >= star ? 'filled' : ''}`}
            onClick={() => onRatingChange(star)}
          />
        ))}
      </div>
    </div>
  );

  if (!project) {
    return <div className="error">No project selected</div>;
  }

  return (
    <div className="verification-container">
      {/* Header */}
      <div className="verification-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft className="back-icon" />
          Back to Projects
        </button>
        
        <div className="project-info">
          <h2>{project.name || 'Untitled Project'}</h2>
          <div className="project-meta">
            <span><User className="meta-icon" />{project.ownerAddress?.slice(0, 10)}...</span>
            <span><Calendar className="meta-icon" />{new Date(project.createdAt).toLocaleDateString()}</span>
            <span><FileText className="meta-icon" />{project.filesCount || 0} files</span>
          </div>
        </div>

        <div className="verification-status">
          <div className="verifications-count">
            {existingVerifications.length}/3 Verifications
          </div>
          <div className="monthly-limit">
            Your monthly verifications: {monthlyVerifications}/{maxMonthlyVerifications}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <AlertTriangle className="error-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="verification-content">
        {/* Left Panel - File Explorer and Code */}
        <div className="code-panel">
          <div className="file-explorer">
            <h3>Project Files</h3>
            <div className="file-tree">
              {codebase && renderFileTree(codebase)}
            </div>
          </div>

          <div className="code-viewer">
            <div className="code-header">
              <span className="file-name">{selectedFile || 'Select a file'}</span>
              {selectedFile && (
                <button className="download-btn" title="Download file">
                  <Download className="download-icon" />
                </button>
              )}
            </div>
            
            <div className="code-content">
              {selectedFile && codebase ? (
                <pre className="code-block">
                  <code>{getFileContent(selectedFile)?.content || 'File not found'}</code>
                </pre>
              ) : (
                <div className="no-file-selected">
                  <Eye className="no-file-icon" />
                  <p>Select a file to view its contents</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Verification Form */}
        <div className="verification-panel">
          <h3>Code Verification</h3>
          
          {/* Rating Categories */}
          <div className="rating-section">
            <h4>Rate the Project</h4>
            
            <StarRating
              rating={verificationData.codeQuality}
              onRatingChange={(rating) => handleRatingChange('codeQuality', rating)}
              label="Code Quality"
            />
            
            <StarRating
              rating={verificationData.security}
              onRatingChange={(rating) => handleRatingChange('security', rating)}
              label="Security"
            />
            
            <StarRating
              rating={verificationData.functionality}
              onRatingChange={(rating) => handleRatingChange('functionality', rating)}
              label="Functionality"
            />
            
            <StarRating
              rating={verificationData.documentation}
              onRatingChange={(rating) => handleRatingChange('documentation', rating)}
              label="Documentation"
            />

            <div className="overall-rating">
              <span>Overall Rating: </span>
              <div className="overall-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`star ${verificationData.overallRating >= star ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <span className="rating-text">({verificationData.overallRating}/5)</span>
            </div>
          </div>

          {/* Issues Section */}
          <div className="issues-section">
            <div className="issues-header">
              <h4>Issues Found</h4>
              <button onClick={addIssue} className="add-issue-btn">
                Add Issue
              </button>
            </div>
            
            <div className="issues-list">
              {verificationData.issues.map(issue => (
                <div key={issue.id} className="issue-item">
                  <div className="issue-content">
                    <p>{issue.description}</p>
                    <select
                      value={issue.severity}
                      onChange={(e) => updateIssueSeverity(issue.id, e.target.value)}
                      className="severity-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <button
                    onClick={() => removeIssue(issue.id)}
                    className="remove-issue-btn"
                  >
                    <XCircle className="remove-icon" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="feedback-section">
            <h4>Detailed Feedback</h4>
            <textarea
              value={verificationData.feedback}
              onChange={(e) => setVerificationData({ ...verificationData, feedback: e.target.value })}
              placeholder="Provide detailed feedback about the code quality, security, functionality, and any recommendations..."
              className="feedback-textarea"
              rows={4}
            />
          </div>

          {/* Recommendations Section */}
          <div className="recommendations-section">
            <h4>Recommendations (Optional)</h4>
            <textarea
              value={verificationData.recommendations}
              onChange={(e) => setVerificationData({ ...verificationData, recommendations: e.target.value })}
              placeholder="Provide recommendations for improvement..."
              className="recommendations-textarea"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button
              onClick={submitVerification}
              disabled={!canSubmitVerification() || submitting}
              className="submit-verification-btn"
            >
              {submitting ? (
                <>
                  <div className="loading-spinner small"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="submit-icon" />
                  Submit Verification
                </>
              )}
            </button>
            
            {!canSubmitVerification() && (
              <div className="submit-requirements">
                <p>Requirements to submit:</p>
                <ul>
                  <li className={verificationData.codeQuality > 0 ? 'completed' : ''}>
                    Rate Code Quality
                  </li>
                  <li className={verificationData.security > 0 ? 'completed' : ''}>
                    Rate Security
                  </li>
                  <li className={verificationData.functionality > 0 ? 'completed' : ''}>
                    Rate Functionality
                  </li>
                  <li className={verificationData.documentation > 0 ? 'completed' : ''}>
                    Rate Documentation
                  </li>
                  <li className={verificationData.feedback.trim().length > 10 ? 'completed' : ''}>
                    Provide detailed feedback (min 10 characters)
                  </li>
                  <li className={monthlyVerifications < maxMonthlyVerifications ? 'completed' : ''}>
                    Have remaining monthly verifications ({monthlyVerifications}/{maxMonthlyVerifications})
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Existing Verifications */}
      {existingVerifications.length > 0 && (
        <div className="existing-verifications">
          <h3>Previous Verifications ({existingVerifications.length})</h3>
          <div className="verifications-list">
            {existingVerifications.map((verification, index) => (
              <div key={index} className="verification-item">
                <div className="verification-header">
                  <div className="verifier-info">
                    <Shield className="verifier-icon" />
                    <span>{verification.verifierId?.slice(0, 10)}...</span>
                  </div>
                  <div className="verification-date">
                    {new Date(verification.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="verification-summary">
                  <div className="rating-summary">
                    Overall: {verification.overallRating}/5 stars
                  </div>
                  {verification.issues?.length > 0 && (
                    <div className="issues-summary">
                      {verification.issues.length} issues found
                    </div>
                  )}
                </div>
                
                <div className="verification-feedback">
                  <MessageSquare className="feedback-icon" />
                  <p>{verification.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Verification;