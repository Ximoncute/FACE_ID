import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

const API_URL = 'http://127.0.0.1:8000'

export default function Analytics() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const runBenchmark = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/analytics/compare`)
      setData(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: 'white' }
      },
    },
    scales: {
      y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  }

  const fpsData = {
    labels: data.map(d => d.model),
    datasets: [
      {
        label: 'Tốc độ xử lý (FPS)',
        data: data.map(d => d.fps),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      }
    ]
  }

  const accuracyData = {
    labels: data.map(d => d.model),
    datasets: [
      {
        label: 'Độ chính xác (%)',
        data: data.map(d => d.accuracy),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      }
    ]
  }

  return (
    <div>
      <div className="glass-panel" style={{marginBottom: '2rem'}}>
        <h2>Đánh giá đa thuật toán (AI Benchmarking)</h2>
        <p style={{color: 'var(--text-secondary)'}}>
          Module này mô phỏng so sánh các thuật toán AI trên bài toán <strong>Dữ liệu lớn (10,000 users)</strong> sử dụng cơ sở dữ liệu Vector FAISS.
        </p>
        <button className="btn" onClick={runBenchmark} disabled={loading}>
          {loading ? 'Đang chạy Benchmark (Mất khoảng 5-10s)...' : 'Chạy Đánh Giá Đa Thuật Toán'}
        </button>
      </div>

      {data.length > 0 && (
        <>
          <div className="grid">
            <div className="glass-panel">
              <h3>So sánh tốc độ (FPS)</h3>
              <Bar options={chartOptions} data={fpsData} />
              <p style={{marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                Tốc độ Frames Per Second (FPS) tính bằng thời gian trích xuất đặc trưng khuôn mặt (Inference Time).
              </p>
            </div>
            
            <div className="glass-panel">
              <h3>Độ chính xác (Accuracy)</h3>
              <Bar options={chartOptions} data={accuracyData} />
              <p style={{marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                Độ chính xác trên tập giả lập (Tương đương chuẩn LFW - Labeled Faces in the Wild).
              </p>
            </div>
          </div>

          <div className="glass-panel" style={{marginTop: '2rem'}}>
            <h3>Báo cáo chi tiết</h3>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
                  <th style={{padding: '0.5rem'}}>Thuật toán</th>
                  <th style={{padding: '0.5rem'}}>Thời gian Inference (ms)</th>
                  <th style={{padding: '0.5rem'}}>Thời gian Search FAISS 10k (ms)</th>
                  <th style={{padding: '0.5rem'}}>Accuracy (%)</th>
                  <th style={{padding: '0.5rem'}}>F1-Score</th>
                </tr>
              </thead>
              <tbody>
                {data.map(d => (
                  <tr key={d.model} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                    <td style={{padding: '0.5rem', fontWeight: 'bold'}}>{d.model}</td>
                    <td style={{padding: '0.5rem'}}>{d.inference_time_ms} ms</td>
                    <td style={{padding: '0.5rem'}}>{d.search_time_ms} ms</td>
                    <td style={{padding: '0.5rem', color: 'var(--success)'}}>{d.accuracy}%</td>
                    <td style={{padding: '0.5rem'}}>{d.f1_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{marginTop: '2rem'}}>
              <h3>Phân tích Nguyên nhân sai / chậm</h3>
              <ul style={{color: 'var(--text-secondary)', lineHeight: '1.6'}}>
                <li><strong>VGG-Face (Chạy chậm):</strong> Do kiến trúc CNN cổ điển với số lượng tham số lớn, sinh ra vector 2622 chiều, làm chậm cả tốc độ Inference và thời gian tìm kiếm của FAISS so với các model 512 chiều.</li>
                <li><strong>Trường hợp nhận diện sai (False Negative):</strong> Khi ánh sáng yếu hoặc khuôn mặt góc nghiêng lớn hơn 45 độ, mô hình không bắt được trọn vẹn đặc trưng (features) nên Vector Distance bị đẩy lên cao hơn ngưỡng Threshold (ví dụ &gt; 250).</li>
                <li><strong>Trường hợp nhận nhầm (False Positive):</strong> Xảy ra chủ yếu với VGG-Face ở những người có đặc điểm tương đồng cao (anh em sinh đôi) do độ phân giải trích xuất chưa đủ sâu. ArcFace khắc phục điểm này tốt hơn nhờ Additive Angular Margin Loss.</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
