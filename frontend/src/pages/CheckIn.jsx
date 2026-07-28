import React, { useRef, useState, useEffect, useCallback } from 'react'
import Webcam from 'react-webcam'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export default function CheckIn() {
  const webcamRef = useRef(null)
  const isProcessingRef = useRef(false)
  const [status, setStatus] = useState(null)
  const [modelName, setModelName] = useState('Facenet512')
  const [isScanning, setIsScanning] = useState(false)
  const [logs, setLogs] = useState([])
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/logs`)
      setLogs(res.data)
    } catch(e) {}
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const captureAndCheckIn = useCallback(async () => {
    if (isProcessingRef.current || !webcamRef.current) return

    const image = webcamRef.current.getScreenshot()
    if (!image) return

    isProcessingRef.current = true
    try {
      setProgress(40)
      setProgressText('Đang quét khuôn mặt & so khớp FAISS...')

      const formData = new FormData()
      formData.append('image', image)
      formData.append('model_name', modelName)

      const response = await axios.post(`${API_URL}/checkin`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000
      })
      
      setProgress(100)
      setProgressText(`🎉 Nhận diện thành công: Xin chào ${response.data.name}!`)
      setStatus({ 
        type: 'success', 
        msg: `Xin chào ${response.data.name}! (Score: ${response.data.confidence.toFixed(2)}, Time: ${response.data.time_taken_ms.toFixed(0)}ms)` 
      })
      fetchLogs()
      
      setIsScanning(false)
      setTimeout(() => {
        setStatus(null)
        setProgress(0)
        setProgressText('')
      }, 3500)

    } catch (error) {
      setProgress(0)
      setProgressText('')
      const errorMsg = error.response?.data?.detail || 'Chưa nhận diện được khuôn mặt';
      setStatus({ type: 'error', msg: errorMsg })
    } finally {
      isProcessingRef.current = false
    }
  }, [webcamRef, modelName])

  useEffect(() => {
    let timer
    let active = true

    const loop = async () => {
      if (isScanning && active && !isProcessingRef.current) {
        await captureAndCheckIn()
      }
      if (isScanning && active) {
        timer = setTimeout(loop, 250)
      }
    }

    if (isScanning) {
      loop()
    } else {
      setProgress(0)
      setProgressText('')
      isProcessingRef.current = false
    }

    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [isScanning, captureAndCheckIn])

  return (
    <div>
      <div className="glass-panel" style={{marginBottom: '2rem'}}>
        <h2 style={{textAlign: 'center'}}>Chấm Công Bằng Khuôn Mặt</h2>
        
        <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem'}}>
          <select 
            className="input-field" 
            style={{width: 'auto'}}
            value={modelName}
            onChange={e => setModelName(e.target.value)}
          >
            <option value="Facenet512">Thuật toán: Facenet512 (Chính xác cao)</option>
            <option value="ArcFace">Thuật toán: ArcFace (Cân bằng)</option>
            <option value="VGG-Face">Thuật toán: VGG-Face (Nhanh)</option>
          </select>
        </div>

        {(isScanning || progress > 0) && (
          <div style={{ margin: '1rem 0' }}>
            <div className="progress-container">
              <div 
                className={`progress-bar ${progress === 100 ? 'success' : ''}`}
                style={{ width: `${progress === 0 ? 20 : progress}%` }}
              />
            </div>
            <div className="progress-text">{progressText || 'Đang quét...' }</div>
          </div>
        )}

        {status && (
          <div className={`alert alert-${status.type}`}>
            {status.msg}
          </div>
        )}

        <div className="webcam-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam-video"
            mirrored={true}
            width={500}
            videoConstraints={{
              width: 500,
              height: 375,
              facingMode: "user"
            }}
          />
          
          <button 
            className="btn" 
            onClick={() => setIsScanning(!isScanning)}
            style={{ 
              maxWidth: '300px', width: '100%', 
              background: isScanning ? 'var(--error)' : 'var(--success)' 
            }}
          >
            {isScanning ? 'Dừng Quét' : 'Bắt Đầu Quét Khuôn Mặt'}
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <h3>Lịch sử chấm công gần đây</h3>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
          <thead>
            <tr style={{borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
              <th style={{padding: '0.5rem', width: '60px'}}>STT</th>
              <th style={{padding: '0.5rem'}}>Họ và Tên</th>
              <th style={{padding: '0.5rem'}}>Thời gian</th>
              <th style={{padding: '0.5rem'}}>Model</th>
              <th style={{padding: '0.5rem'}}>Độ lệch (Distance)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                <td style={{padding: '0.5rem', fontWeight: 'bold', color: 'var(--text-secondary)'}}>#{index + 1}</td>
                <td style={{padding: '0.5rem', fontWeight: '600', color: 'var(--text-primary)'}}>{log.user_name || log.name || `User #${log.user_id}`}</td>
                <td style={{padding: '0.5rem'}}>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                <td style={{padding: '0.5rem'}}>
                  <span style={{
                    background: 'rgba(59, 130, 246, 0.2)', 
                    color: 'var(--accent-color)',
                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem'
                  }}>
                    {log.model_used}
                  </span>
                </td>
                <td style={{padding: '0.5rem'}}>{log.confidence_score.toFixed(4)}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="5" style={{padding: '1rem', textAlign: 'center'}}>Chưa có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
