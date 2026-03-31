import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import postService from '../services/postService';   // ❌ -> ✅ default import
import './CommentBox.css';

export default function CommentBox({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await postService.getComments(postId);
        setComments(res.data?.content || res.data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await postService.addComment(postId, text.trim());
      setComments((prev) => [res.data, ...prev]);
      setText('');
    } catch {}
    setSubmitting(false);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="comment-box animate-fadeIn">
      <form className="comment-form" onSubmit={handleSubmit}>
        <img
          src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
          alt={user?.username}
          className="comment-avatar"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitting}
        />
        <button
          type="submit"
          className="grad-btn comment-submit"
          disabled={!text.trim() || submitting}
        >
          {submitting ? '...' : '↑'}
        </button>
      </form>

      {loading ? (
        <div className="comments-loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="comments-list">
          {comments.length === 0 && (
            <p className="no-comments">No comments yet. Be the first!</p>
          )}
          {comments.map((c, i) => (
            <div key={c.id || i} className="comment-item animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
              <img
                src={c.author?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.username}`}
                alt={c.author?.username}
                className="comment-avatar"
              />
              <div className="comment-bubble">
                <span className="comment-author">@{c.author?.username}</span>
                <p className="comment-text">{c.content}</p>
                {c.createdAt && <span className="comment-time">{timeAgo(c.createdAt)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
