import React, { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export default function Register() {
  const webcamRef = useRef(null)
  const [name, setName] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    return imageSrc
  }, [webcamRef])

  const handleRegister = async () => {
    if (!name) {
      setStatus({ type: 'error', msg: 'Vui lòng nhập tên!' })
      return
    }

    const image = capture()
    if (!image) {
      setStatus({ type: 'error', msg: 'Không thể chụp ảnh từ Webcam' })
      return
    }

    setLoading(true)
    setStatus(null)
    setProgress(15)
    setProgressText('Đang chụp ảnh & trích xuất đặc trưng...')

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 85) return prev + 15
        return prev
      })
    }, 350)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('image', image)

      const response = await axios.post(`${API_URL}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      })
      
      clearInterval(progressInterval)
      setProgress(100)
      setProgressText(`🎉 Đăng ký thành công: ${response.data.name}!`)
      setStatus({ type: 'success', msg: `Đăng ký thành công: ${response.data.name}` })
      setName('')
    } catch (error) {
      clearInterval(progressInterval)
      setProgress(0)
      setProgressText('')
      console.error(error)
      const errorMsg = error.response?.data?.detail || error.message || 'Chưa khởi chạy Backend (Vui lòng chạy file run.bat)!';
      setStatus({ 
        type: 'error', 
        msg: errorMsg 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel">
      <h2 style={{textAlign: 'center'}}>Đăng ký nhân viên mới</h2>
      
      {(loading || progress > 0) && (
        <div style={{ margin: '1rem 0' }}>
          <div className="progress-container">
            <div 
              className={`progress-bar ${progress === 100 ? 'success' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">{progressText || `${progress}%`}</div>
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
          width={400}
          videoConstraints={{
            width: 400,
            height: 300,
            facingMode: "user"
          }}
        />
        
        <input 
          type="text" 
          placeholder="Nhập tên nhân viên" 
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
        
        <button 
          className="btn" 
          onClick={handleRegister}
          disabled={loading}
          style={{ maxWidth: '400px', width: '100%' }}
        >
          {loading ? 'Đang xử lý (Trích xuất đặc trưng 3 models)...' : 'Đăng Ký Khuôn Mặt'}
        </button>
      </div>
      
      <p style={{textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
        Hệ thống sẽ tự động chạy ảnh qua 3 thuật toán (Facenet, ArcFace, VGG-Face) để tạo embeddings.
      </p>
    </div>
  )
}
