import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';
import UserProfile from '../components/UserProfile';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followingMap, setFollowingMap] = useState({});

  const loadPosts = useCallback(async (pageNum = 0) => {
    try {
      const res = await postService.getFeed(pageNum, 10);
      const data = res.data?.content || res.data || [];
      if (pageNum === 0) setPosts(data);
      else setPosts((prev) => [...prev, ...data]);
      const totalPages = res.data?.totalPages;
      setHasMore(totalPages ? pageNum < totalPages - 1 : data.length === 10);
    } catch { setHasMore(false); }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadPosts(0);
      try {
        const res = await userService.getSuggestions();
        setSuggestions(res.data?.content || res.data || []);
      } catch {}
      setLoading(false);
    };
    init();
  }, [loadPosts]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    await loadPosts(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleFollow = async (username) => {
    try {
      if (followingMap[username]) {
        await userService.unfollowUser(username);
        setFollowingMap((m) => ({ ...m, [username]: false }));
      } else {
        await userService.followUser(username);
        setFollowingMap((m) => ({ ...m, [username]: true }));
      }
    } catch {}
  };

  return (
    <div className="home-layout">
      {/* Left sidebar */}
      <aside className="home-sidebar left">
        <UserProfile user={user} />
      </aside>

      {/* Main feed */}
      <main className="home-feed">
        <Link to="/create-post" className="create-post-banner grad-btn animate-fadeInUp">
          <span>+</span>
          <span>Create Post</span>
        </Link>

        {loading ? (
          <div className="feed-loading">
            {[1,2,3].map((i) => (
              <div key={i} className="skeleton-card card"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-feed card animate-scaleIn">
            <div className="empty-illustration">
              <div className="empty-notebook">📝</div>
              <div className="empty-sparkles">✨</div>
            </div>
            <p className="empty-text">No posts yet. Be the first to share a post!</p>
            <Link to="/create-post" className="grad-btn empty-cta">Create Your First Post</Link>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post, i) => (
              <div key={post.id || i} style={{ animationDelay: `${i * 0.07}s` }}>
                <PostCard post={post} onDelete={handleDeletePost} />
              </div>
            ))}
            {hasMore && (
              <button
                className="load-more-btn grad-btn"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        )}
      </main>

      {/* Right sidebar - suggestions */}
      <aside className="home-sidebar right">
        <div className="suggestions-card card animate-fadeInUp">
          <h4 className="suggestions-title">Suggestions for you</h4>
          <div className="suggestions-list">
            {suggestions.slice(0, 5).map((u, i) => (
              <div key={u.id || u.username || i} className="suggestion-item">
                <img
                  src={u.profilePicture || u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                  alt={u.username}
                  className="suggestion-avatar"
                />
                <div className="suggestion-info">
                  <Link to={`/profile/${u.username}`} className="suggestion-username">
                    {u.username}
                  </Link>
                  <span className="suggestion-mutual">
                    {u.mutualCount ? `Followed by ${u.mutualCount} mutuals` : 'Suggested for you'}
                  </span>
                </div>
                <button
                  className={`follow-btn grad-btn ${followingMap[u.username] ? 'following' : ''}`}
                  onClick={() => handleFollow(u.username)}
                >
                  {followingMap[u.username] ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
            {suggestions.length === 0 && (
              <p className="no-suggestions">No suggestions yet</p>
            )}
          </div>
          {suggestions.length > 5 && (
            <Link to="/explore" className="see-all-link">See All</Link>
          )}
        </div>
      </aside>
    </div>
  );
}
