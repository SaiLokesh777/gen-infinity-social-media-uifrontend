import { useState } from 'react';
import { Link } from 'react-router-dom';
import postService from '../services/postService';   // ✅ default import
import { useAuth } from '../hooks/useAuth';
import CommentBox from './CommentBox';
import './PostCard.css';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(post.likesCount || post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const authorAvatar =
    post.author?.profilePicture ||
    post.author?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username || 'user'}`;

  const handleLike = async () => {
    try {
      if (liked) {
        await postService.unlikePost(post.id);
        setLikeCount((c) => c - 1);
      } else {
        await postService.likePost(post.id);
        setLikeCount((c) => c + 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postService.deletePost(post.id);
      onDelete?.(post.id);
    } catch (err) {
      console.error(err);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  return (
    <div className="post-card card animate-fadeInUp">
      <div className="post-header">
        <Link to={`/profile/${post.author?.username}`} className="post-author">
          <img src={authorAvatar} alt={post.author?.username} className="post-avatar" />
          <div>
            <span className="post-username">@{post.author?.username}</span>
            {post.createdAt && <span className="post-time">{timeAgo(post.createdAt)}</span>}
          </div>
        </Link>

        {user?.username === post.author?.username && (
          <div className="post-menu-wrap">
            <button className="post-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
            {menuOpen && (
              <div className="post-menu animate-scaleIn">
                <Link to={`/create-post?edit=${post.id}`} className="menu-item">✏️ Edit</Link>
                <button className="menu-item danger" onClick={handleDelete}>🗑️ Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.title && <h3 className="post-title">{post.title}</h3>}
      <p className="post-content">{post.content}</p>

      {post.imageUrl && (
        <img src={post.imageUrl} alt="Post" className="post-image" />
      )}

      <div className="post-actions">
        <button className={`action-btn like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <span className="action-icon">{liked ? '❤️' : '🤍'}</span>
          <span>{likeCount}</span>
        </button>
        <button
          className={`action-btn comment-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
        >
          <span className="action-icon">💬</span>
          <span>{post.commentsCount || post.comments?.length || 0}</span>
        </button>
        <button className="action-btn share-btn">
          <span className="action-icon">↗</span>
          <span>Share</span>
        </button>
      </div>

      {showComments && <CommentBox postId={post.id} />}
    </div>
  );
}
