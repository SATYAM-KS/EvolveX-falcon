import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import "./style.css";

const Community = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    category: "General",
    tags: []
  });
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock data for questions
  const mockQuestions = [
    {
      id: 1,
      title: "How to implement secure token transfers in Move?",
      description: "I'm working on a token contract and want to ensure secure transfers. What are the best practices?",
      author: "CryptoDev123",
      category: "Development",
      tags: ["Move", "Security", "Tokens"],
      answers: [
        {
          id: 1,
          author: "MoveExpert",
          content: "Use the `coin::transfer` function and always check for sufficient balance before transferring.",
          timestamp: "2 hours ago",
          upvotes: 5
        },
        {
          id: 2,
          author: "SecurityGuru",
          content: "Also implement proper access controls and use events for transparency.",
          timestamp: "1 hour ago",
          upvotes: 3
        }
      ],
      upvotes: 8,
      views: 45,
      timestamp: "3 hours ago",
      solved: false
    },
    {
      id: 2,
      title: "Best practices for smart contract verification?",
      description: "What should I include in my verification process to ensure code quality?",
      author: "NewbieDev",
      category: "Verification",
      tags: ["Verification", "Best Practices", "Code Quality"],
      answers: [
        {
          id: 3,
          author: "VerificationPro",
          content: "Always test edge cases, check for reentrancy vulnerabilities, and verify gas optimization.",
          timestamp: "4 hours ago",
          upvotes: 7
        }
      ],
      upvotes: 12,
      views: 67,
      timestamp: "5 hours ago",
      solved: true
    },
    {
      id: 3,
      title: "How to handle errors in Aptos smart contracts?",
      description: "I'm getting unexpected errors in my contract. How should I handle them properly?",
      author: "AptosLearner",
      category: "Development",
      tags: ["Aptos", "Error Handling", "Debugging"],
      answers: [],
      upvotes: 3,
      views: 23,
      timestamp: "1 day ago",
      solved: false
    }
  ];

  const categories = ["General", "Development", "Verification", "Security", "Troubleshooting", "Best Practices"];

  useEffect(() => {
    setQuestions(mockQuestions);
  }, []);

  const handleAskQuestion = () => {
    if (!user) {
      alert("Please connect your wallet to ask questions");
      return;
    }
    setShowAskQuestion(true);
  };

  const handleSubmitQuestion = () => {
    if (!newQuestion.title || !newQuestion.description) {
      alert("Please fill in all required fields");
      return;
    }

    const question = {
      id: questions.length + 1,
      ...newQuestion,
      author: user?.address?.substring(0, 8) + "...",
      answers: [],
      upvotes: 0,
      views: 0,
      timestamp: "Just now",
      solved: false
    };

    setQuestions([question, ...questions]);
    setNewQuestion({ title: "", description: "", category: "General", tags: [] });
    setShowAskQuestion(false);
  };

  const handleAnswerQuestion = (questionId) => {
    if (!newAnswer.trim()) return;

    const answer = {
      id: Date.now(),
      author: user?.address?.substring(0, 8) + "...",
      content: newAnswer,
      timestamp: "Just now",
      upvotes: 0
    };

    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, answers: [...q.answers, answer] }
        : q
    ));

    setNewAnswer("");
    setSelectedQuestion(null);
  };

  const handleUpvote = (questionId) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, upvotes: q.upvotes + 1 }
        : q
    ));
  };

  const handleUpvoteAnswer = (questionId, answerId) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            answers: q.answers.map(a => 
              a.id === answerId 
                ? { ...a, upvotes: a.upvotes + 1 }
                : a
            )
          }
        : q
    ));
  };

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>💬 Community Forum</h1>
        <p>Ask questions, share knowledge, and help fellow developers</p>
        <button className="ask-question-btn" onClick={handleAskQuestion}>
          Ask a Question
        </button>
      </div>

      {/* Ask Question Modal */}
      {showAskQuestion && (
        <div className="modal-overlay">
          <div className="ask-question-modal">
            <h2>Ask a Question</h2>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                placeholder="What's your question?"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newQuestion.description}
                onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})}
                placeholder="Provide details about your question..."
                rows="5"
              />
            </div>
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                value={newQuestion.tags.join(", ")}
                onChange={(e) => setNewQuestion({...newQuestion, tags: e.target.value.split(",").map(t => t.trim())})}
                placeholder="e.g., Move, Security, Tokens"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAskQuestion(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleSubmitQuestion}>
                Post Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="questions-section">
        <div className="questions-header">
          <h2>Recent Questions</h2>
          <div className="filter-options">
            <select>
              <option>All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="questions-list">
          {questions.map((question) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <div className="question-title">{question.title}</div>
                <div className={`question-status ${question.solved ? 'solved' : 'open'}`}>
                  {question.solved ? '✅ Solved' : '❓ Open'}
                </div>
              </div>
              
              <div className="question-meta">
                <span className="author">by {question.author}</span>
                <span className="category">{question.category}</span>
                <span className="timestamp">{question.timestamp}</span>
              </div>

              <div className="question-content">
                <p>{question.description}</p>
                <div className="question-tags">
                  {question.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="question-stats">
                <div className="stat">
                  <span className="stat-icon">👍</span>
                  <span>{question.upvotes}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">👁️</span>
                  <span>{question.views}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">💬</span>
                  <span>{question.answers.length}</span>
                </div>
              </div>

              <div className="question-actions">
                <button 
                  className="action-btn"
                  onClick={() => handleUpvote(question.id)}
                >
                  👍 Upvote
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setSelectedQuestion(question)}
                >
                  💬 Answer
                </button>
                <button className="action-btn">
                  🔗 Share
                </button>
              </div>

              {/* Answers Section */}
              {question.answers.length > 0 && (
                <div className="answers-section">
                  <h4>Answers ({question.answers.length})</h4>
                  {question.answers.map((answer) => (
                    <div key={answer.id} className="answer-card">
                      <div className="answer-header">
                        <span className="answer-author">{answer.author}</span>
                        <span className="answer-timestamp">{answer.timestamp}</span>
                      </div>
                      <div className="answer-content">{answer.content}</div>
                      <div className="answer-actions">
                        <button 
                          className="upvote-btn"
                          onClick={() => handleUpvoteAnswer(question.id, answer.id)}
                        >
                          👍 {answer.upvotes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="modal-overlay">
          <div className="answer-modal">
            <h2>Answer Question</h2>
            <div className="question-preview">
              <h3>{selectedQuestion.title}</h3>
              <p>{selectedQuestion.description}</p>
            </div>
            <div className="form-group">
              <label>Your Answer</label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Provide a detailed answer..."
                rows="6"
              />
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setSelectedQuestion(null)}
              >
                Cancel
              </button>
              <button 
                className="submit-btn" 
                onClick={() => handleAnswerQuestion(selectedQuestion.id)}
              >
                Post Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;