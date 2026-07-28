import React, { useRef, useState, useEffect, useCallback } from 'react'
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
  const [users, setUsers] = useState([])

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`)
      setUsers(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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
      fetchUsers()
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

  const handleDeleteUser = async (id, userName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${userName}" (#${id}) khỏi hệ thống không?`)) {
      try {
        await axios.delete(`${API_URL}/users/${id}`)
        setStatus({ type: 'success', msg: `Đã xóa thành công nhân viên "${userName}"` })
        fetchUsers()
      } catch (error) {
        setStatus({ type: 'error', msg: error.response?.data?.detail || 'Lỗi khi xóa nhân viên' })
      }
    }
  }

  return (
    <div>
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
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

      <div className="glass-panel">
        <h3>Danh sách nhân viên đã đăng ký</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '0.5rem', width: '60px' }}>STT</th>
              <th style={{ padding: '0.5rem' }}>ID</th>
              <th style={{ padding: '0.5rem' }}>Họ và Tên</th>
              <th style={{ padding: '0.5rem' }}>Ngày đăng ký</th>
              <th style={{ padding: '0.5rem', textAlign: 'center', width: '100px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{index + 1}</td>
                <td style={{ padding: '0.5rem' }}>#{u.id}</td>
                <td style={{ padding: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>{u.name}</td>
                <td style={{ padding: '0.5rem' }}>{new Date(u.created_at).toLocaleString('vi-VN')}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                  <button
                    className="btn"
                    onClick={() => handleDeleteUser(u.id, u.name)}
                    style={{
                      background: 'var(--error)',
                      padding: '4px 12px',
                      fontSize: '0.85rem'
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>Chưa có nhân viên nào được đăng ký</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
