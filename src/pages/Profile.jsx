import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';
import './Profile.css';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', name: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwn = currentUser?.username === username;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPostsLoading(true);
      try {
        const res = await userService.getProfile(username);
        setProfile(res.data);
        setIsFollowing(res.data.followedByCurrentUser || false);
        setEditForm({ bio: res.data.bio || '', name: res.data.name || '' });
      } catch {
        navigate('/');
      }
      setLoading(false);
      try {
        const pRes = await postService.getUserPosts(username);
        setPosts(pRes.data?.content || pRes.data || []);
      } catch {}
      setPostsLoading(false);
    };
    load();
  }, [username]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(username);
        setIsFollowing(false);
        setProfile((p) => ({ ...p, followersCount: (p.followersCount || 1) - 1 }));
      } else {
        await userService.followUser(username);
        setIsFollowing(true);
        setProfile((p) => ({ ...p, followersCount: (p.followersCount || 0) + 1 }));
      }
    } catch {}
    setFollowLoading(false);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await userService.updateProfile(username, editForm);
      setProfile((p) => ({ ...p, ...res.data }));
      updateUser(res.data);
      setEditMode(false);
    } catch {}
    setSaving(false);
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setProfile((p) => ({ ...p, postsCount: Math.max(0, (p.postsCount || 1) - 1) }));
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner large"></div>
      </div>
    );
  }

  if (!profile) return null;

  const avatarUrl =
    profile.profilePicture ||
    profile.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;

  return (
    <div className="profile-page">
      {/* Profile header */}
      <div className="profile-header card animate-fadeInUp">
        <div className="profile-cover">
          <div className="cover-gradient"></div>
        </div>
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrap">
              <img src={avatarUrl} alt={profile.username} className="profile-avatar-lg" />
              <div className="avatar-ring-lg"></div>
            </div>
          </div>

          <div className="profile-info">
            {editMode ? (
              <div className="edit-form">
                <input
                  type="text"
                  placeholder="Display name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="edit-input"
                />
                <textarea
                  placeholder="Write a bio..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                  className="edit-textarea"
                  rows={3}
                />
                <div className="edit-actions">
                  <button className="grad-btn save-btn" onClick={handleSaveEdit} disabled={saving}>
                    {saving ? '...' : 'Save'}
                  </button>
                  <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="profile-display-name">{profile.name || profile.username}</h2>
                <p className="profile-handle">@{profile.username}</p>
                {profile.bio && <p className="profile-bio-text">{profile.bio}</p>}
                <p className="profile-email-text">{profile.email}</p>
              </>
            )}
          </div>

          <div className="profile-actions">
            {isOwn ? (
              !editMode && (
                <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
                  ✏️ Edit Profile
                </button>
              )
            ) : (
              <button
                className={`grad-btn follow-action-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="profile-stats-row">
          <div className="pstat">
            <span className="pstat-val">{profile.postsCount ?? posts.length ?? 0}</span>
            <span className="pstat-label">Posts</span>
          </div>
          <div className="pstat">
            <span className="pstat-val">{profile.followersCount ?? 0}</span>
            <span className="pstat-label">Followers</span>
          </div>
          <div className="pstat">
            <span className="pstat-val">{profile.followingCount ?? 0}</span>
            <span className="pstat-label">Following</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 Posts
        </button>
      </div>

      {/* Posts */}
      <div className="profile-posts">
        {postsLoading ? (
          <div className="feed-loading">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton-card card"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-profile-posts card">
            <span className="empty-icon">📝</span>
            <p>{isOwn ? "You haven't posted yet." : `@${username} hasn't posted yet.`}</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post, i) => (
              <div key={post.id || i} style={{ animationDelay: `${i * 0.06}s` }}>
                <PostCard post={post} onDelete={handleDeletePost} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
