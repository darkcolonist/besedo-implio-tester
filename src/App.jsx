import { useState } from 'react';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [submitUrl, setSubmitUrl] = useState('https://api.implio.com/v3/ads');
  const [fetchUrl, setFetchUrl] = useState('https://api.implio.com/v3/ads/{taskId}');
  
  // Sample data defaults
  const [imgId, setImgId] = useState('img_placeholder_id_001');
  const [title, setTitle] = useState('moderate this image');
  const [imageUrl, setImageUrl] = useState('https://core-ap-southeast-1-shared-storage.s3.ap-southeast-1.amazonaws.com/apps/s3files/storage/stage/2026-05-12T05-45-48-966Z_4ada2e9c_69919149_033_4cee.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAYIJASCBUKQLHJH3C%2F20260512%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260512T054549Z&X-Amz-Expires=604800&X-Amz-Signature=05e88ffcf4cf351e10d7eb555630c5beed1466baa21589bb68b803536e13cac1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject');
  
  const [submitResult, setSubmitResult] = useState(null);
  const [taskId, setTaskId] = useState('');
  const [fetchResult, setFetchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClear = () => {
    setSubmitResult(null);
    setFetchResult(null);
    setError('');
  };

  const handleSubmitBatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubmitResult(null);

    const payload = [
      {
        id: imgId,
        content: {
          title: title,
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
          'Authorization': `Bearer ${apiKey}` // Or whatever Implio uses, usually X-API-Key or Bearer
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setSubmitResult(data);
      
      // Auto-fill task ID if available in response
      if (data.accepted && data.accepted.length > 0) {
        setTaskId(data.accepted[0].taskId);
      }
    } catch (err) {
      setError(`Failed to submit: ${err.message}. (Note: This might be due to CORS if running locally without a proxy)`);
      // Fallback sample output for demo purposes if it fails due to CORS or network
      console.log('Error occurred, showing sample output structure.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchResults = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFetchResult(null);

    const url = fetchUrl.replace('{taskId}', taskId);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();
      setFetchResult(data);
    } catch (err) {
      setError(`Failed to fetch results: ${err.message}. (Note: This might be due to CORS if running locally without a proxy)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Implio Moderation Tester</h1>
        <p>A beautiful interface to test Besedo Implio API integration.</p>
      </header>

      {/* Global Config */}
      <div className="glass-panel p-6 mb-4" style={{ marginBottom: '2rem' }}>
        <h3>Global Configuration</h3>
        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label>API Key</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="Enter your Implio API Key"
            />
          </div>
          <div className="form-group">
            <label>Submit URL</label>
            <input 
              type="text" 
              value={submitUrl} 
              onChange={(e) => setSubmitUrl(e.target.value)} 
            />
          </div>
        </div>
        <div className="form-group">
          <label>Fetch Results URL (use {'{taskId}'} as placeholder)</label>
          <input 
            type="text" 
            value={fetchUrl} 
            onChange={(e) => setFetchUrl(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Submit Section */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h2>1. Submit Batch</h2>
            <p style={{ marginBottom: '1.5rem' }}>Send an image for moderation.</p>
            
            <form onSubmit={handleSubmitBatch}>
              <div className="form-group">
                <label>Item ID</label>
                <input type="text" value={imgId} onChange={(e) => setImgId(e.target.value)} />
              </div>
              
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <textarea 
                  rows="4" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="primary" disabled={loading || !apiKey}>
                {loading ? 'Submitting...' : 'Submit to Implio'}
              </button>
              {!apiKey && <p style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Please enter API Key above.</p>}
            </form>
          </div>

          {submitResult && (
            <div className="mt-4 glass-card p-6" style={{ marginTop: '1.5rem' }}>
              <h3>Submission Result</h3>
              <pre><code>{JSON.stringify(submitResult, null, 2)}</code></pre>
            </div>
          )}
        </div>

        {/* Fetch Section */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h2>2. Retrieve Results</h2>
            <p style={{ marginBottom: '1.5rem' }}>Fetch moderation results using Task ID.</p>
            
            <form onSubmit={handleFetchResults}>
              <div className="form-group">
                <label>Task ID</label>
                <input 
                  type="text" 
                  value={taskId} 
                  onChange={(e) => setTaskId(e.target.value)} 
                  placeholder="Enter or select task ID"
                />
              </div>

              <button type="submit" className="secondary" disabled={loading || !apiKey || !taskId}>
                {loading ? 'Fetching...' : 'Fetch Results'}
              </button>
            </form>
          </div>

          {fetchResult && (
            <div className="mt-4 glass-card p-6" style={{ marginTop: '1.5rem' }}>
              <h3>Moderation Result</h3>
              <pre><code>{JSON.stringify(fetchResult, null, 2)}</code></pre>
            </div>
          )}

          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-4 glass-card p-6" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <h3>Image Preview</h3>
              <img 
                src={imageUrl} 
                alt="To be moderated" 
                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginTop: '0.5rem' }}
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-panel p-6" style={{ marginTop: '2rem', borderColor: 'var(--error)' }}>
          <h3 style={{ color: 'var(--error)' }}>Error / Info</h3>
          <p style={{ color: 'var(--text-color)' }}>{error}</p>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.9rem' }}>Since you are testing locally, if you get a CORS error, you might need to use a browser extension to disable CORS or set up a proxy. Here are the sample outputs for your reference:</p>
            <details style={{ marginTop: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--accent-primary)' }}>View Sample Output Structure</summary>
              <pre style={{ marginTop: '0.5rem' }}><code>{`// Sample Submit Output
{
  "batchId": "6e86424a-68dc-4d65-b16b-de4cccb54e6c",
  "accepted": [
    {
      "id": "img_placeholder_id_001",
      "taskId": "6cb13564-1551-4f79-afdb-ba06d2097f35"
    }
  ],
  "rejected": []
}`}</code></pre>
            </details>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button className="secondary" onClick={handleClear}>Clear Results</button>
      </div>
    </div>
  );
}

export default App;
