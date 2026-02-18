Component({
  properties: {
    chartData: {
      type: Object,
      value: null
    },
    babyRecords: {
      type: Array,
      value: []
    },
    chartType: {
      type: String,
      value: 'weight'
    }
  },

  data: {
    tooltip: {
      show: false,
      x: 0,
      y: 0,
      title: '',
      value: '',
      p3: '',
      p15: '',
      p50: '',
      p85: '',
      p97: ''
    },
    currentScale: 1,
    chartOffsetX: 0
  },

  observers: {
    'chartData, babyRecords, chartType': function() {
      this.drawChart()
    }
  },

  lifetimes: {
    attached() {
      this.initChart()
    }
  },

  methods: {
    initChart() {
      const query = this.createSelectorQuery()
      query.select('#growthCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            
            const dpr = wx.getSystemInfoSync().pixelRatio
            canvas.width = res[0].width * dpr
            canvas.height = res[0].height * dpr
            ctx.scale(dpr, dpr)
            
            this.canvas = canvas
            this.ctx = ctx
            this.canvasWidth = res[0].width
            this.canvasHeight = res[0].height
            
            this.drawChart()
          }
        })
    },

    drawChart() {
      if (!this.ctx || !this.properties.chartData) return
      
      const { chartData, babyRecords, chartType } = this.properties
      const ctx = this.ctx
      const width = this.canvasWidth
      const height = this.canvasHeight
      
      ctx.clearRect(0, 0, width, height)
      
      const padding = { top: 24, right: 24, bottom: 40, left: 50 }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom
      
      const months = chartData.months || []
      if (months.length === 0) return
      
      const maxMonth = Math.max(...months, 24)
      const allValues = [
        ...(chartData.p3 || []),
        ...(chartData.p97 || []),
        ...babyRecords.map(r => r.value)
      ].filter(v => v != null)
      
      if (allValues.length === 0) return
      
      const minValue = Math.min(...allValues) * 0.85
      const maxValue = Math.max(...allValues) * 1.15
      
      const scaleX = (month) => padding.left + (month / maxMonth) * chartWidth
      const scaleY = (value) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight
      
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
      gradient.addColorStop(0, '#FFF5F8')
      gradient.addColorStop(1, '#FFFFFF')
      ctx.fillStyle = gradient
      ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight)
      
      ctx.strokeStyle = '#FFE4E8'
      ctx.lineWidth = 1
      ctx.setLineDash([])
      
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }
      
      ctx.strokeStyle = '#FFD4DC'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      
      for (let i = 1; i <= 5; i++) {
        const x = padding.left + (chartWidth / 5) * i
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
      }
      
      ctx.setLineDash([])
      
      ctx.fillStyle = '#999999'
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif'
      ctx.textAlign = 'center'
      
      for (let i = 0; i <= 5; i++) {
        const month = Math.round((maxMonth / 5) * i)
        const x = padding.left + (chartWidth / 5) * i
        ctx.fillText(`${month}月`, x, height - 12)
      }
      
      ctx.textAlign = 'right'
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif'
      for (let i = 0; i <= 4; i++) {
        const value = minValue + ((maxValue - minValue) / 4) * (4 - i)
        const y = padding.top + (chartHeight / 4) * i
        ctx.fillStyle = '#666666'
        ctx.fillText(value.toFixed(1), padding.left - 12, y + 4)
      }
      
      if (chartData.p15 && chartData.p85 && chartData.p15.length > 0) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(255, 212, 163, 0.2)'
        chartData.p15.forEach((value, index) => {
          if (value == null || chartData.p85[index] == null) return
          const x = scaleX(months[index])
          if (index === 0) {
            ctx.moveTo(x, scaleY(value))
          } else {
            ctx.lineTo(x, scaleY(value))
          }
        })
        for (let i = chartData.p85.length - 1; i >= 0; i--) {
          if (chartData.p85[i] == null || chartData.p15[i] == null) continue
          const x = scaleX(months[i])
          ctx.lineTo(x, scaleY(chartData.p85[i]))
        }
        ctx.closePath()
        ctx.fill()
      }
      
      const lines = [
        { data: chartData.p3, color: '#FFB8B8', width: 1.5, name: 'P3' },
        { data: chartData.p15, color: '#FFD4A3', width: 1.5, name: 'P15' },
        { data: chartData.p50, color: '#A8E6CF', width: 3, name: 'P50' },
        { data: chartData.p85, color: '#88D8B0', width: 1.5, name: 'P85' },
        { data: chartData.p97, color: '#7EC8E3', width: 1.5, name: 'P97' }
      ]
      
      lines.forEach(line => {
        if (!line.data || line.data.length === 0) return
        
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        
        let hasStarted = false
        line.data.forEach((value, index) => {
          if (value == null) return
          const x = scaleX(months[index])
          const y = scaleY(value)
          
          if (!hasStarted) {
            ctx.moveTo(x, y)
            hasStarted = true
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        ctx.stroke()
      })
      
      if (babyRecords.length > 1) {
        ctx.strokeStyle = '#FF6B9D'
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        
        let hasStarted = false
        babyRecords.forEach((record, index) => {
          if (record.value == null) return
          const x = scaleX(record.month)
          const y = scaleY(record.value)
          
          if (!hasStarted) {
            ctx.moveTo(x, y)
            hasStarted = true
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        ctx.stroke()
      }
      
      babyRecords.forEach((record, index) => {
        if (record.value == null) return
        const x = scaleX(record.month)
        const y = scaleY(record.value)
        
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12)
        gradient.addColorStop(0, 'rgba(255, 107, 157, 0.3)')
        gradient.addColorStop(1, 'rgba(255, 107, 157, 0)')
        ctx.fillStyle = gradient
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#FF6B9D'
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
        
        if (babyRecords.length <= 10) {
          ctx.fillStyle = '#FF6B9D'
          ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif'
          ctx.textAlign = 'center'
          const unit = chartType === 'weight' ? 'kg' : 'cm'
          ctx.fillText(`${record.value}${unit}`, x, y - 16)
        }
      })
      
      this.chartInfo = {
        padding,
        chartWidth,
        chartHeight,
        maxMonth,
        minValue,
        maxValue,
        scaleX,
        scaleY,
        babyRecords,
        chartData,
        months
      }
    },

    onTouchStart(e) {
      this.handleTouch(e)
    },

    onTouchMove(e) {
      this.handleTouch(e)
    },

    onTouchEnd() {
      setTimeout(() => {
        this.setData({
          'tooltip.show': false
        })
      }, 1500)
    },

    handleTouch(e) {
      if (!this.chartInfo) return
      
      const touch = e.touches[0]
      const { padding, chartWidth, chartHeight, maxMonth, minValue, maxValue, babyRecords, chartData, months } = this.chartInfo
      
      const x = touch.x
      const y = touch.y
      
      if (x < padding.left || x > padding.left + chartWidth ||
          y < padding.top || y > padding.top + chartHeight) {
        return
      }
      
      const month = ((x - padding.left) / chartWidth) * maxMonth
      
      let closestRecord = null
      let minDistance = Infinity
      
      babyRecords.forEach(record => {
        const distance = Math.abs(record.month - month)
        if (distance < minDistance && distance < 3) {
          minDistance = distance
          closestRecord = record
        }
      })
      
      const monthIndex = Math.round(month)
      const closestMonthIndex = months.findIndex(m => Math.abs(m - monthIndex) < 1)
      
      if (closestRecord || closestMonthIndex >= 0) {
        const unit = this.properties.chartType === 'weight' ? 'kg' : 'cm'
        const tooltipData = {
          show: true,
          x: x,
          title: `${monthIndex}个月`
        }
        
        if (closestRecord) {
          tooltipData.y = this.chartInfo.scaleY(closestRecord.value)
          tooltipData.value = `${closestRecord.value}${unit}`
        }
        
        if (closestMonthIndex >= 0 && chartData) {
          tooltipData.p3 = chartData.p3 ? `${chartData.p3[closestMonthIndex]}${unit}` : ''
          tooltipData.p15 = chartData.p15 ? `${chartData.p15[closestMonthIndex]}${unit}` : ''
          tooltipData.p50 = chartData.p50 ? `${chartData.p50[closestMonthIndex]}${unit}` : ''
          tooltipData.p85 = chartData.p85 ? `${chartData.p85[closestMonthIndex]}${unit}` : ''
          tooltipData.p97 = chartData.p97 ? `${chartData.p97[closestMonthIndex]}${unit}` : ''
        }
        
        this.setData({
          tooltip: tooltipData
        })
      }
    }
  }
})
