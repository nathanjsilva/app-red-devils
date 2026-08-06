import {
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip
} from 'chart.js'

Chart.register(
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip
)

Chart.defaults.color = '#b3a29b'
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)'
