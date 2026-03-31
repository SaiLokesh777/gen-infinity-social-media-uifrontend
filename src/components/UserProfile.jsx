import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './UserProfile.css';

export default function UserProfile({ user: profileUser }) {
  const { user } = useAuth();
  const displayUser = profileUser || user;

  if (!displayUser) return null;

  const avatarUrl =
    displayUser.profilePicture ||
    displayUser.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.username}`;

  return (
    <div className="user-profile-card card animate-fadeInUp">
      <div className="profile-avatar-wrap">
        <img src={avatarUrl} alt={displayUser.username} className="profile-avatar" />
        <div className="avatar-ring"></div>
      </div>
      <h3 className="profile-name">{displayUser.username}</h3>
      <p className="profile-email">{displayUser.email}</p>
      {displayUser.bio && <p className="profile-bio">{displayUser.bio}</p>}
      {!displayUser.bio && <p className="profile-bio muted">Welcome to GenInfinity!</p>}

      <div className="profile-stats">
        <div className="stat">
          <span className="stat-value">{displayUser.postsCount ?? displayUser.posts ?? 0}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <span className="stat-value">{displayUser.followersCount ?? displayUser.followers ?? 0}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat">
          <span className="stat-value">{displayUser.followingCount ?? displayUser.following ?? 0}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>

      <Link to={`/profile/${displayUser.username}`} className="grad-btn view-profile-btn">
        View Profile
      </Link>
    </div>
  );
}
