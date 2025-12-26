import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function VideoAgent() {
    const [script, setScript] = useState(`Viral 30–45s social short script (TikTok / Reels / Shorts) — product: Samsung Galaxy Watch7 (adaptable to any sleep-tracking wearable)

Hook (0–3s)
Visual: Extreme close-up of the watch face showing sleep time (fast zoom-in). Bold caption: "I tracked my sleep for 2 weeks. You won't believe what happened."
Audio: Use a rising pitch-snap or a trending 1–2s sound cut that stops on a beat.

Tease the experiment (3–8s)
Visual: Split screen label Week 1 / Week 2. On-screen caption: "Week 1: 6 hours" / "Week 2: 10 hours".
Voiceover (energetic): "Week one I slept 6 hours. Week two I slept 10. Same person. Same watch."
On-screen text (small): "I tracked my sleep using my Galaxy Watch7." — attributed on-screen: @drjulie

Show the data (8–18s)
Visual: Quick montage of watch screenshots: total sleep, actual sleep, sleep stages, sleep score. Pop-up stats: "Mood ↓" vs "Mood ↑".
Voiceover: "Look at the Sleep Score, REM, deep sleep, and resting HR — the numbers tell a story."
Caption overlay: "6h → burned out. 10h → felt better, but…"

Reveal insight / twist (18–28s)
Visual: Cut to presenter reacting (surprised/reflective) while the watch data animates beside them.
Voiceover (calm): "More sleep felt better — but the science warns: 'continuously oversleeping might be a sign of underlying health issues.'"
On-screen quote (small): "'If you're continuously oversleeping it might be a sign of underlying health issues.' — @drjulie"

Practical takeaway (28–36s)
Visual: Quick checklist animation: "1) Track nightly for 2 weeks 2) Note mood + focus 3) Adjust timing, not just hours"
Voiceover: "Use the watch to track timing, latency and resting heart rate — it's not just hours, it's quality and rhythm."

Viral CTA & micro-ask (36–40s)
Visual: Bold final line on-screen: "Which sleep made me sharper? Watch the full breakdown." (or "Full experiment in my next video.")
Audio: Beat drop and a signature sound effect.
Hashtags shown: #sleeptracking #GalaxyWatch7 #wearabletech #sleepexperiment

End frame (40–45s)
Visual: Product hero shot (watch on wrist), quick caption: "Track. Learn. Sleep smarter." Small legal/sponsor tag if needed: "#samsungpartner"`)
    const [loading, setLoading] = useState(false)
    const [logs, setLogs] = useState([])
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const logEndRef = useRef(null)

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs])

    const handleGenerate = async () => {
        if (!script) return
        setLoading(true)
        setLogs([])
        setResult(null)
        setError(null)

        try {
            const eventSource = new EventSource(`http://localhost:3000/api/video-agent?script=${encodeURIComponent(script)}`)

            eventSource.addEventListener('log', (event) => {
                const logEntry = JSON.parse(event.data)
                setLogs(prev => [...prev, logEntry])
            })

            eventSource.addEventListener('result', (event) => {
                const data = JSON.parse(event.data)
                setResult(data)
                setLoading(false)
                eventSource.close()
            })

            eventSource.addEventListener('error', (event) => {
                const data = JSON.parse(event.data)
                setError(data.message)
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
            setLoading(false)
        }
    }

    return (
        <div className="video-agent-container">
            <motion.div
                className="hero-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="hero-title">Video Agent</h1>
                <p className="hero-subtitle">Transform scripts into viral video segments</p>
            </motion.div>

            <div className="agent-grid">
                {/* Input Column */}
                <div className="input-col">
                    <div className="glass-card">
                        <div className="card-label">Input Script</div>
                        <textarea
                            className="script-textarea"
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Paste your script here..."
                            disabled={loading}
                        />
                        <button
                            className="launch-btn"
                            onClick={handleGenerate}
                            disabled={loading || !script}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {loading ? <span className="spinner"></span> : 'Generate Video'}
                        </button>
                    </div>

                    {/* Logs */}
                    {(loading || logs.length > 0) && (
                        <div className="glass-card log-card" style={{ marginTop: '1.5rem' }}>
                            <div className="card-label">Agent Intelligence</div>
                            <div className="agent-logs">
                                {logs.map((log, i) => (
                                    <div key={i} className={`log-entry ${log.type}`}>
                                        <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                        <span className="log-msg">{log.message}</span>
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Output Column */}
                <div className="output-col">
                    {result ? (
                        <div className="scenes-grid">
                            {result.scenes.map((scene, i) => (
                                <div key={i} className="glass-card scene-card">
                                    <div className="card-label">Scene {i + 1} ({scene.sceneData.duration}s)</div>
                                    <div className="scene-visuals">
                                        <div className="keyframe-pair">
                                            <div className="keyframe">
                                                <img src={scene.keyframes.start} alt="Start" />
                                                <span>Start</span>
                                            </div>
                                            <div className="keyframe">
                                                <img src={scene.keyframes.end} alt="End" />
                                                <span>End</span>
                                            </div>
                                        </div>
                                        <div className="video-segment">
                                            <video src={scene.videoUrl} controls loop muted playsInline />
                                        </div>
                                    </div>
                                    <div className="scene-info">
                                        <p><strong>Visual:</strong> {scene.sceneData.visual_description}</p>
                                        <p><strong>Audio:</strong> {scene.sceneData.audio_description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            {loading ? (
                                <div className="loading-state">
                                    <div className="large-spinner"></div>
                                    <p>Agent is working...</p>
                                </div>
                            ) : (
                                <p>Generated scenes will appear here</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="error-toast">
                    {error}
                </div>
            )}

            <style jsx>{`
                .video-agent-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                .agent-grid {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 2rem;
                    margin-top: 2rem;
                }
                .script-textarea {
                    width: 100%;
                    height: 400px;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: white;
                    padding: 1rem;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    resize: none;
                    outline: none;
                }
                .script-textarea:focus {
                    border-color: var(--electric-cyan);
                }
                .agent-logs {
                    height: 300px;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 0.8rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .log-entry {
                    display: flex;
                    gap: 0.5rem;
                }
                .log-time { color: rgba(255,255,255,0.3); }
                .log-entry.success .log-msg { color: var(--electric-cyan); }
                .log-entry.error .log-msg { color: var(--tiktok-magenta); }
                
                .scenes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }
                .scene-card {
                    padding: 1.5rem;
                }
                .scene-visuals {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .keyframe-pair {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem;
                }
                .keyframe {
                    position: relative;
                    aspect-ratio: 9/16;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid var(--glass-border);
                }
                .keyframe img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .keyframe span {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.6);
                    font-size: 0.6rem;
                    text-align: center;
                    padding: 2px;
                }
                .video-segment {
                    aspect-ratio: 9/16;
                    border-radius: 12px;
                    overflow: hidden;
                    background: black;
                    border: 1px solid var(--glass-border);
                }
                .video-segment video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .scene-info {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.7);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .empty-state {
                    height: 600px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px dashed var(--glass-border);
                    border-radius: 24px;
                    color: rgba(255,255,255,0.2);
                }
                .loading-state {
                    text-align: center;
                }
                .large-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255,255,255,0.1);
                    border-top-color: var(--electric-cyan);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                .error-toast {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    background: var(--tiktok-magenta);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
            `}</style>
        </div>
    )
}

export default VideoAgent
