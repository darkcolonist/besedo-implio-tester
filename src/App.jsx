import { useState, useEffect } from 'react';

function App() {
  // Persistence keys
  const STORAGE_KEY_UPLOADS = 'implio_uploads';
  const STORAGE_KEY_CONFIG = 'implio_config';

  // State for inputs
  const [apiKey, setApiKey] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Advanced settings (hidden by default)
  const [submitUrl, setSubmitUrl] = useState('https://api.implio.com/v3/ads');
  const [fetchUrl, setFetchUrl] = useState('https://api.implio.com/v3/ads/{taskId}');
  const [imgId, setImgId] = useState('img_placeholder_id_001');
  const [title, setTitle] = useState('moderate this image');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load from LocalStorage on init
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setApiKey(config.apiKey || '');
      setSubmitUrl(config.submitUrl || 'https://api.implio.com/v3/ads');
      setFetchUrl(config.fetchUrl || 'https://api.implio.com/v3/ads/{taskId}');
    }

    const savedUploads = localStorage.getItem(STORAGE_KEY_UPLOADS);
    if (savedUploads) {
      setUploads(JSON.parse(savedUploads));
    }
  }, []);

  // Save Config to LocalStorage
  useEffect(() => {
    const config = { apiKey, submitUrl, fetchUrl };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [apiKey, submitUrl, fetchUrl]);

  // Save Uploads to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_UPLOADS, JSON.stringify(uploads));
  }, [uploads]);

  const handleSubmitBatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = [
      {
        id: imgId || `img_${Date.now()}`,
        content: {
          title: title || 'Quick Upload',
          images: [
            { src: imageUrl }
          ]
        },
        user: {
          id: "user_99"
        }
      }
    ];

    try {
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      let taskId = '';
      if (data.accepted && data.accepted.length > 0) {
        taskId = data.accepted[0].taskId;
      }

      // Add to table
      const newUpload = {
        id: imgId || `img_${Date.now()}`,
        title: title || 'Quick Upload',
        imageUrl: imageUrl,
        taskId: taskId,
        status: taskId ? 'Pending' : 'Failed',
        timestamp: new Date().toLocaleString(),
        result: data
      };

      setUploads([newUpload, ...uploads]);
      
      // Auto generate next ID to avoid collisions if not specified
      setImgId(`img_${Date.now()}`);
    } catch (err) {
      setError(`Failed to submit: ${err.message}.`);
      
      // Add a failed entry for visibility if network fails
      const failedUpload = {
        id: imgId || `img_${Date.now()}`,
        title: title || 'Quick Upload',
        imageUrl: imageUrl,
        taskId: 'N/A',
        status: 'Error',
        timestamp: new Date().toLocaleString(),
        result: { error: err.message }
      };
      setUploads([failedUpload, ...uploads]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchResults = async (upload) => {
    if (!upload.taskId || upload.taskId === 'N/A') return;
    
    setLoading(true);
    setError('');
    const url = fetchUrl.replace('{taskId}', upload.taskId);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();
      
      // Update table item
      setUploads(uploads.map(u => 
        u.taskId === upload.taskId 
          ? { ...u, status: 'Fetched', result: data } 
          : u
      ));
    } catch (err) {
      setError(`Failed to fetch results for ${upload.taskId}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear the history?')) {
      setUploads([]);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Implio Moderation Tester</h1>
        <p>A beautiful interface to test Besedo Implio API integration.</p>
      </header>

      {/* Main Form */}
      <div className="glass-panel p-6" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSubmitBatch}>
          <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label>API Key</label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="Enter your Implio API Key"
                required
              />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input 
                type="text" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="images.google.com/sample.png"
                required
              />
            </div>
          </div>

          {/* Advanced Toggle */}
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <button 
              type="button" 
              className="secondary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '[ Hide Advanced ]' : '[ Advanced ]'}
            </button>
          </div>

          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="glass-card p-6 mb-4 animate-fade-in" style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
              <h3>Advanced Settings</h3>
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>Submit URL</label>
                  <input type="text" value={submitUrl} onChange={(e) => setSubmitUrl(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Fetch URL (use {'{taskId}'} as placeholder)</label>
                  <input type="text" value={fetchUrl} onChange={(e) => setFetchUrl(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Item ID</label>
                  <input type="text" value={imgId} onChange={(e) => setImgId(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button type="submit" className="primary" style={{ minWidth: '200px' }} disabled={loading || !apiKey || !imageUrl}>
              {loading ? 'Processing...' : 'Submit to Implio'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-panel p-6" style={{ marginBottom: '2rem', borderColor: 'var(--error)' }}>
          <p style={{ color: 'var(--error)', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Table of Uploads */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <h2>Recent Uploads</h2>
          {uploads.length > 0 && (
            <button className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={clearHistory}>
              Clear History
            </button>
          )}
        </div>

        {uploads.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No uploads yet. Submit an image above to get started.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Image</th>
                  <th style={{ padding: '1rem' }}>Title / ID</th>
                  <th style={{ padding: '1rem' }}>Task ID</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((upload, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle' }}>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{upload.timestamp}</td>
                    <td style={{ padding: '1rem' }}>
                      <img 
                        src={upload.imageUrl} 
                        alt="Thumbnail" 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{upload.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{upload.id}</div>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{upload.taskId}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: upload.status === 'Pending' ? 'rgba(245,158,11,0.2)' : 
                                    upload.status === 'Fetched' ? 'rgba(16,185,129,0.2)' : 
                                    'rgba(239,68,68,0.2)',
                        color: upload.status === 'Pending' ? 'var(--warning)' : 
                               upload.status === 'Fetched' ? 'var(--success)' : 
                               'var(--error)'
                      }}>
                        {upload.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        className="secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => handleFetchResults(upload)}
                        disabled={loading || !apiKey || upload.taskId === 'N/A' || upload.status === 'Fetched'}
                      >
                        {upload.status === 'Fetched' ? 'Updated' : 'Fetch Updates'}
                      </button>
                      <details style={{ marginTop: '0.5rem' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>View JSON</summary>
                        <pre style={{ marginTop: '0.5rem', fontSize: '0.7rem', maxHeight: '100px' }}>
                          <code>{JSON.stringify(upload.result, null, 2)}</code>
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
