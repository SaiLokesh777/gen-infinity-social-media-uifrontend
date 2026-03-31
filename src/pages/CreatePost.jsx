import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import './CreatePost.css';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [form, setForm] = useState({ title: '', content: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      const load = async () => {
        try {
          const res = await postService.getPost(editId);
          const p = res.data;
          setForm({ title: p.title || '', content: p.content || '', imageUrl: p.imageUrl || '' });
        } catch {
          navigate('/');
        }
        setFetching(false);
      };
      load();
    }
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editId) {
        await postService.updatePost(editId, form);
      } else {
        await postService.createPost(form);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const avatarUrl =
    user?.profilePicture ||
    user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;

  if (fetching) {
    return (
      <div className="create-post-loading">
        <div className="spinner large"></div>
      </div>
    );
  }

  return (
    <div className="create-post-page">
      <div className="create-post-card card animate-scaleIn">
        <div className="create-post-header">
          <img src={avatarUrl} alt={user?.username} className="create-avatar" />
          <div>
            <h2 className="create-title">{editId ? 'Edit Post' : 'Create Post'}</h2>
            <span className="create-username">@{user?.username}</span>
          </div>
        </div>

        {error && <div className="create-error animate-fadeIn">{error}</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>Title <span className="optional">(optional)</span></label>
            <input
              type="text"
              placeholder="Give your post a title..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Content <span className="required">*</span></label>
            <textarea
              placeholder={`What's on your mind, ${user?.username}?`}
              value={form.content}
              onChange={(e) => {
                setForm((f) => ({ ...f, content: e.target.value }));
                setError('');
              }}
              rows={6}
              className="content-textarea"
            />
            <span className="char-count">{form.content.length} chars</span>
          </div>

          <div className="form-group">
            <label>Image URL <span className="optional">(optional)</span></label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
          </div>

          {form.imageUrl && (
            <div className="image-preview animate-fadeIn">
              <img
                src={form.imageUrl}
                alt="Preview"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="create-actions">
            <button
              type="button"
              className="discard-btn"
              onClick={() => navigate('/')}
            >
              Discard
            </button>
            <button type="submit" className="grad-btn publish-btn" disabled={loading}>
              {loading
                ? <span className="btn-spinner"></span>
                : editId ? '✓ Save Changes' : '✦ Publish Post'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
