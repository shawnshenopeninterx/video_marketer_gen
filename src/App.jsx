import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './index.css'

function App() {
  const [url, setUrl] = useState('')
  // ... rest of state
  const [loading, setLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const resultRef = useRef(null)

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  const stages = [
    'Intel Extraction',
    'Trend Synthesis',
    'Viral Scripting',
    'Cinematic Rendering'
  ]

  const features = [
    {
      title: 'Trend Matching',
      description: 'AI analyzes viral patterns across TikTok to identify what makes content explode'
    },
    {
      title: 'Hook Factory',
      description: 'Generates scroll-stopping openings optimized for 3-second attention spans'
    },
    {
      title: 'Product Extraction',
      description: 'Automatically scrapes product details, images, and key selling points'
    },
    {
      title: 'Veo 3.1 Rendering',
      description: 'Google\'s latest AI generates cinematic 9:16 vertical videos in seconds'
    }
  ]

  const [processLogs, setProcessLogs] = useState([])

  const addLog = (tag, message, data = null) => {
    setProcessLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      tag,
      message,
      data
    }])
  }

  const handleGenerate = async () => {
    if (!url) return
    setLoading(true)
    setCurrentStage(0)
    setError(null)
    setResult(null)
    setProcessLogs([])

    addLog('SYSTEM', 'Initializing secure connection to Google GenAI...')

    // Track what we've logged to prevent duplicates in StrictMode
    const loggedStages = new Set()

    try {
      setProcessLogs([])
      const loggedStages = new Set()

      const eventSource = new EventSource(`/api/campaign?url=${encodeURIComponent(url)}`)

      eventSource.addEventListener('log', (event) => {
        const logEntry = JSON.parse(event.data)
        addLog(logEntry.tag, logEntry.message, logEntry.data)

        // Update stages based on tags
        if (logEntry.tag === 'INTEL') setCurrentStage(0)
        if (logEntry.tag === 'TREND') setCurrentStage(1)
        if (logEntry.tag === 'SCRIPT') setCurrentStage(2)
        if (logEntry.tag === 'RENDER') setCurrentStage(3)
      })

      eventSource.addEventListener('result', (event) => {
        const data = JSON.parse(event.data)
        addLog('SYSTEM', 'Campaign assets ready for deployment.')
        setResult(data)
        setLoading(false)
        eventSource.close()
      })

      eventSource.addEventListener('error', (event) => {
        const data = JSON.parse(event.data)
        setError(data.message)
        addLog('ERROR', `Process terminated: ${data.message}`)
        setLoading(false)
        eventSource.close()
      })

      eventSource.onerror = (err) => {
        console.error('EventSource failed:', err)
        eventSource.close()
        setLoading(false)
      }

    } catch (err) {
      setError(err.message)
      addLog('ERROR', `Process terminated: ${err.message}`)
      setLoading(false)
    }
  }

  const loadMockData = () => {
    setLoading(false)
    const mockData = {
      status: 'success',
      productData: {
        productName: 'Oura Ring 4',
        category: 'Smart Health Wearable',
        description: 'The Oura Ring 4 is a revolutionary smart ring designed to track your health with medical-grade accuracy. It monitors sleep, activity, stress, and heart rate 24/7, all within a sleek, lightweight titanium design that lasts up to 8 days on a single charge.',
        images: ['/best_product.webp']
      },
      researchPrompt: 'Find me the most viral or popular video in the product category Smart Health Wearable related to Sleep Tracking, and write a viral script for the product',
      insights: {
        data: {
          content: "Based on current TikTok trends, the 'Biohacking' and 'Aesthetic Wellness' niches are seeing a 45% increase in engagement. Users are responding to high-contrast, minimalist visuals paired with 'POV' hooks that emphasize personal optimization and medical-grade data. The Oura Ring 4 fits perfectly into the 'Quiet Luxury' tech category. The most successful videos use a 'Lab-Test' style comparison, showing raw data overlays and satisfying side-by-side results.",
          thinkings: [
            { refs: [{ video: { video_name: "POV: Your ring knows you better than you do - Biohacking Trend" } }] }
          ]
        }
      },
      script: `[HOOK]\nPOV: You just found the only piece of tech you actually want to wear 24/7.\n\n[BODY]\nForget the bulky smartwatches. The Oura Ring 4 tracks everything—sleep, stress, heart rate—in a sleek titanium band.\nIt literally tells you when you're getting sick before you even feel it.\n8 days of battery life and it looks like high-end jewelry.\n\n[CTA]\nUpgrade your health game. Link in bio.`,
      video: { videoUrl: '/videos/veo3_1766728395899.mp4' },
      selectedImage: '/best_product.webp',
      videoPrompt: 'Cinematic 9:16 video of a sleek silver Oura Ring 4 on a minimalist wooden surface, soft morning light, focus on the interior sensors, 4k high-fidelity.',
      tiktokUrls: [
        'https://www.tiktok.com/@mkbhd/video/7421882194639457567',
        'https://www.tiktok.com/@carterpcs/video/7331580138927033643'
      ]
    }

    setResult(mockData)
    setProcessLogs([
      { timestamp: new Date().toLocaleTimeString(), tag: 'SYSTEM', message: 'Initializing secure connection to Google GenAI...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'INTEL', message: 'Launching headless browser instance...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'INTEL', message: 'Navigating to Amazon Product Page...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'INTEL', message: 'Distilling core product data from raw text...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'INTEL', message: 'Data extraction complete.', data: { category: mockData.productData.category, description: mockData.productData.description } },
      { timestamp: new Date().toLocaleTimeString(), tag: 'INTEL', message: 'Image validation complete.', data: { reason: "Selected clear, professional product shot. Disqualified lifestyle/collage candidates." } },
      { timestamp: new Date().toLocaleTimeString(), tag: 'TREND', message: 'Querying Memories.ai Viral Engine...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'TREND', message: 'Analyzing TikTok engagement patterns for this niche...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'TREND', message: 'Viral research prompt synthesized for Memories.ai.', data: { prompt: mockData.researchPrompt } },
      { timestamp: new Date().toLocaleTimeString(), tag: 'TREND', message: 'Marketing insights received from Memories.ai.', data: { insights: mockData.insights.data.thinkings[0].refs[0].video.video_name, rawOutput: mockData.insights.data.content } },
      { timestamp: new Date().toLocaleTimeString(), tag: 'SCRIPT', message: 'Constructing viral hook structure...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'SCRIPT', message: 'Optimizing narrative for 15s retention loop...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'SCRIPT', message: 'Viral script finalized.', data: { script: mockData.script, hook: "[HOOK] POV: You just found the only piece of tech you actually want to wear 24/7." } },
      { timestamp: new Date().toLocaleTimeString(), tag: 'RENDER', message: 'Sending prompt to Google Veo 3.1...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'RENDER', message: 'Initializing 9:16 portrait canvas...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'RENDER', message: 'Cinematic prompt generated for Google Veo 3.1.', data: { veoPrompt: mockData.videoPrompt } },
      { timestamp: new Date().toLocaleTimeString(), tag: 'RENDER', message: 'Finalizing viral pacing and transitions...' },
      { timestamp: new Date().toLocaleTimeString(), tag: 'SYSTEM', message: 'Campaign assets ready for deployment.' }
    ])
  }

  return (
    <div className="app-container">
      {/* Animated Background Blobs */}
      <div className="background-blobs">
        <motion.div
          className="blob blob-1"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="blob blob-2"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 30, -20, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
        />
        <motion.div
          className="blob blob-3"
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.05, 0.95, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
      </div>

      <main className="main-content">
        {/* Hero Section */}
        <motion.div
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            Viral Velocity.<br />Automated.
          </h1>
          <p className="hero-subtitle">
            Product URL → TikTok Ad in 60 seconds
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          className="input-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="glass-input-wrapper">
            <input
              type="text"
              className="url-input"
              placeholder="Paste product URL (Amazon, Shopify, etc.)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <button
              className="launch-btn"
              onClick={handleGenerate}
              disabled={!url || loading}
            >
              {loading ? <span className="spinner"></span> : 'Launch'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={loadMockData}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: loading ? 'rgba(249,249,249,0.2)' : 'rgba(249,249,249,0.5)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                opacity: loading ? 0.5 : 1
              }}
            >
              🎨 Preview Demo
            </button>
          </div>
        </motion.div>

        {/* Processing Pipeline */}
        {(loading || result) && (
          <motion.div
            className="pipeline-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: result ? '2rem' : '4rem' }}
          >
            <h2 className="pipeline-title">
              {result ? 'Process Complete' : 'Viral Engine Processing'}
            </h2>
            {!result && (
              <div className="pipeline-stages">
                {stages.map((stage, index) => (
                  <div
                    key={index}
                    className={`stage ${index < currentStage ? 'completed' : ''} ${index === currentStage ? 'active' : ''}`}
                  >
                    <div className="stage-number">{index + 1}</div>
                    <div className="stage-label">{stage}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Detailed Thinking Process Log */}
            <div className="thinking-log-container">
              <div className="log-header">
                <div className="log-header-left">
                  <span className="log-dot"></span>
                  <span className="log-title">System Intelligence Log</span>
                </div>
                {loading && <div className="log-spinner"></div>}
              </div>
              <div className="log-content-area" style={{ maxHeight: result ? '200px' : '400px' }}>
                {processLogs.map((log, index) => (
                  <div key={index} className="log-item visible">
                    <span className="log-timestamp">[{log.timestamp}]</span>
                    <span className="log-message">
                      {log.tag !== 'SYSTEM' && (
                        <span className="log-tag" data-tag={log.tag}>{log.tag}</span>
                      )}
                      {log.message}
                      {log.data && (
                        <div className="log-data-box">
                          {log.data.category && (
                            <div className="log-data-item">
                              <strong>Category:</strong> {log.data.category}
                            </div>
                          )}
                          {log.data.description && (
                            <div className="log-data-item">
                              <strong>Description:</strong> {log.data.description.substring(0, 200)}...
                            </div>
                          )}
                          {log.data.prompt && (
                            <div className="log-data-item">
                              <strong>Market Prompt:</strong> {log.data.prompt}
                            </div>
                          )}
                          {log.data.reason && (
                            <div className="log-data-item">
                              <strong>Validation:</strong> {log.data.reason}
                            </div>
                          )}
                          {log.data.hook && (
                            <div className="log-data-item">
                              <strong>Viral Hook:</strong> <span style={{ color: '#00f2ea' }}>{log.data.hook}</span>
                            </div>
                          )}
                          {log.data.veoPrompt && (
                            <div className="log-data-item">
                              <strong>Veo 3.1 Prompt:</strong> <span style={{ fontStyle: 'italic', color: '#a855f7' }}>{log.data.veoPrompt}</span>
                            </div>
                          )}
                          {log.data.insights && (
                            <div className="log-data-item">
                              <strong>Marketing Hook:</strong> <span style={{ color: '#ff4b2b' }}>{log.data.insights}</span>
                            </div>
                          )}
                          {log.data.rawOutput && (
                            <div className="log-data-item">
                              <strong>Raw Marketer Output:</strong>
                              <div className="log-script-preview" style={{ color: 'rgba(249,249,249,0.8)', fontSize: '0.8rem' }}>
                                {log.data.rawOutput}
                              </div>
                            </div>
                          )}
                          {log.data.script && (
                            <div className="log-data-item">
                              <strong>Generated Script:</strong>
                              <pre className="log-script-preview">{log.data.script}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </span>
                  </div>
                ))}
                <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Bento Grid Features */}
        {!loading && !result && (
          <motion.div
            className="bento-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <h3 className="card-title">{feature.title}</h3>
                <p className="card-description">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Result View */}
        {result && (
          <motion.div
            ref={resultRef}
            className="result-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="result-header">
              <h2 className="result-main-title">Campaign Assets Generated</h2>
              <button onClick={() => setResult(null)} className="reset-btn">New Campaign</button>
            </div>

            <div className="result-grid-layout">
              {/* Column 1: Product Intel */}
              <div className="result-col intel-col">
                <div className="glass-card intel-card">
                  <div className="card-label">Product Intel</div>
                  {(result.selectedImage || result.productData.images?.[0]) && (
                    <div className="product-image-container">
                      <img
                        src={(result.selectedImage || result.productData.images[0]).startsWith('http') ? (result.selectedImage || result.productData.images[0]) : `http://localhost:3000${result.selectedImage || result.productData.images[0]}`}
                        alt="Product"
                        className="scraped-image"
                      />
                    </div>
                  )}
                  <div className="intel-details">
                    <div className="intel-item">
                      <span className="intel-key">Category</span>
                      <span className="intel-value">{result.productData.category}</span>
                    </div>
                    <div className="intel-item">
                      <span className="intel-key">Description</span>
                      <p className="intel-desc">{result.productData.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Viral Video */}
              <div className="result-col video-col">
                <div className="glass-card video-card">
                  <div className="card-label">Cinematic Render</div>
                  <div className="video-player-wrapper">
                    {result.video && result.video.videoUrl ? (
                      <video
                        key={result.video.videoUrl}
                        src={result.video.videoUrl.startsWith('http') ? result.video.videoUrl : `http://localhost:3000${result.video.videoUrl}`}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="main-video"
                      />
                    ) : (
                      <div className="video-render-placeholder">
                        <span className="spinner"></span>
                        <p>Finalizing Render...</p>
                      </div>
                    )}
                  </div>
                  <div className="video-actions">
                    <a
                      href={result.video?.videoUrl.startsWith('http') ? result.video.videoUrl : `http://localhost:3000${result.video?.videoUrl}`}
                      download
                      className="download-btn"
                    >
                      Download 9:16 Ad
                    </a>
                  </div>
                </div>
              </div>

              {/* Column 3: Viral Script */}
              <div className="result-col script-col">
                <div className="glass-card script-card">
                  <div className="card-label">Viral Script</div>
                  <div className="script-scroll-area">
                    <div className="script-content">
                      {result.script.split('\n\n').map((section, i) => (
                        <div key={i} className="script-section">
                          {section.startsWith('[') ? (
                            <>
                              <div className="script-section-header">
                                <span className="section-tag">{section.match(/\[(.*?)\]/)?.[1]}</span>
                              </div>
                              <div className="section-body">{section.replace(/\[.*?\]\n?/, '')}</div>
                            </>
                          ) : (
                            <div className="section-body">{section}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 4: Referenced TikToks */}
              <div className="result-col tiktok-col">
                <div className="glass-card tiktok-refs-card">
                  <div className="card-label">Referenced TikToks</div>
                  <div className="tiktok-scroll-area">
                    {result.tiktokUrls && result.tiktokUrls.length > 0 ? (
                      result.tiktokUrls.map((url, i) => {
                        const videoId = url.replace(/\/$/, '').split('/').pop().split('?')[0];
                        return (
                          <div key={i} className="tiktok-embed-wrapper">
                            <iframe
                              src={`https://www.tiktok.com/embed/v2/${videoId}?lang=en-US&music_info=1&description=1`}
                              style={{ width: '100%', height: '100%', border: 'none' }}
                              allowFullScreen
                              allow="autoplay; encrypted-media; picture-in-picture"
                              title={`TikTok Video ${i + 1}`}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ color: 'rgba(249,249,249,0.3)', textAlign: 'center', padding: '2rem' }}>
                        No reference videos found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            color: '#FF0050',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 0, 80, 0.1)',
            border: '1px solid rgba(255, 0, 80, 0.3)',
            borderRadius: '16px',
            marginTop: '2rem'
          }}>
            {error}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
