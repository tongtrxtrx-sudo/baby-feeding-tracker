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
      value: ''
    }
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
      
      const padding = { top: 20, right: 20, bottom: 30, left: 45 }
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
      
      const minValue = Math.min(...allValues) * 0.9
      const maxValue = Math.max(...allValues) * 1.1
      
      const scaleX = (month) => padding.left + (month / maxMonth) * chartWidth
      const scaleY = (value) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight
      
      ctx.strokeStyle = '#E8E8E8'
      ctx.lineWidth = 1
      
      for (let i = 0; i <= 6; i++) {
        const y = padding.top + (chartHeight / 6) * i
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }
      
      for (let i = 0; i <= 4; i++) {
        const x = padding.left + (chartWidth / 4) * i
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
      }
      
      ctx.fillStyle = '#B2BEC3'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      
      for (let i = 0; i <= 4; i++) {
        const month = Math.round((maxMonth / 4) * i)
        const x = padding.left + (chartWidth / 4) * i
        ctx.fillText(`${month}月`, x, height - 8)
      }
      
      ctx.textAlign = 'right'
      for (let i = 0; i <= 3; i++) {
        const value = minValue + ((maxValue - minValue) / 3) * (3 - i)
        const y = padding.top + (chartHeight / 3) * i
        ctx.fillText(value.toFixed(1), padding.left - 8, y + 4)
      }
      
      const lines = [
        { data: chartData.p3, color: '#FFB8B8', width: 1 },
        { data: chartData.p15, color: '#FFD4A3', width: 1 },
        { data: chartData.p50, color: '#A8E6CF', width: 2 },
        { data: chartData.p85, color: '#88D8B0', width: 1 },
        { data: chartData.p97, color: '#7EC8E3', width: 1 }
      ]
      
      lines.forEach(line => {
        if (!line.data || line.data.length === 0) return
        
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width
        ctx.beginPath()
        
        line.data.forEach((value, index) => {
          if (value == null) return
          const x = scaleX(months[index])
          const y = scaleY(value)
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        ctx.stroke()
      })
      
      if (babyRecords.length > 1) {
        ctx.strokeStyle = '#FF8C69'
        ctx.lineWidth = 3
        ctx.beginPath()
        
        babyRecords.forEach((record, index) => {
          if (record.value == null) return
          const x = scaleX(record.month)
          const y = scaleY(record.value)
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        ctx.stroke()
      }
      
      babyRecords.forEach((record) => {
        if (record.value == null) return
        const x = scaleX(record.month)
        const y = scaleY(record.value)
        
        ctx.fillStyle = '#FF8C69'
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
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
        babyRecords
      }
    },

    onTouchStart(e) {
      this.handleTouch(e)
    },

    onTouchMove(e) {
      this.handleTouch(e)
    },

    onTouchEnd() {
      this.setData({
        'tooltip.show': false
      })
    },

    handleTouch(e) {
      if (!this.chartInfo) return
      
      const touch = e.touches[0]
      const { padding, chartWidth, chartHeight, maxMonth, minValue, maxValue, babyRecords } = this.chartInfo
      
      const x = touch.x
      const y = touch.y
      
      if (x < padding.left || x > padding.left + chartWidth ||
          y < padding.top || y > padding.top + chartHeight) {
        this.setData({ 'tooltip.show': false })
        return
      }
      
      const month = ((x - padding.left) / chartWidth) * maxMonth
      
      let closestRecord = null
      let minDistance = Infinity
      
      babyRecords.forEach(record => {
        const distance = Math.abs(record.month - month)
        if (distance < minDistance && distance < 2) {
          minDistance = distance
          closestRecord = record
        }
      })
      
      if (closestRecord) {
        const unit = this.properties.chartType === 'weight' ? 'kg' : 'cm'
        this.setData({
          'tooltip.show': true,
          'tooltip.x': x,
          'tooltip.y': this.chartInfo.scaleY(closestRecord.value),
          'tooltip.title': `${closestRecord.month}个月`,
          'tooltip.value': `${closestRecord.value}${unit}`
        })
      } else {
        this.setData({ 'tooltip.show': false })
      }
    }
  }
})
