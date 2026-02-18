function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
}

function formatTime(date) {
  return formatDate(date, 'HH:mm')
}

function getRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diff = now - target
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(date, 'MM-DD')
}

function isToday(date) {
  const today = new Date()
  const target = new Date(date)
  return today.toDateString() === target.toDateString()
}

function isYesterday(date) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const target = new Date(date)
  return yesterday.toDateString() === target.toDateString()
}

function getDateLabel(date) {
  if (isToday(date)) return '今天'
  if (isYesterday(date)) return '昨天'
  return formatDate(date, 'MM月DD日')
}

function groupRecordsByDate(records, dateField = 'timestamp') {
  const groups = {}
  
  records.forEach(record => {
    const date = new Date(record[dateField])
    const dateKey = formatDate(date, 'YYYY-MM-DD')
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        label: getDateLabel(date),
        date: dateKey,
        records: []
      }
    }
    
    groups[dateKey].records.push(record)
  })
  
  return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date))
}

function calculateDailyStats(records) {
  const stats = {
    totalAmount: 0,
    count: 0,
    breastMilk: 0,
    formula: 0,
    byTime: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    }
  }
  
  records.forEach(record => {
    stats.totalAmount += record.amount || 0
    stats.count++
    
    if (record.type === 'breast') {
      stats.breastMilk += record.amount || 0
    } else if (record.type === 'formula') {
      stats.formula += record.amount || 0
    }
    
    const hour = new Date(record.timestamp).getHours()
    if (hour >= 6 && hour < 12) {
      stats.byTime.morning += record.amount || 0
    } else if (hour >= 12 && hour < 18) {
      stats.byTime.afternoon += record.amount || 0
    } else if (hour >= 18 && hour < 22) {
      stats.byTime.evening += record.amount || 0
    } else {
      stats.byTime.night += record.amount || 0
    }
  })
  
  return stats
}

function calculateWeeklyStats(records) {
  const dailyStats = {}
  
  records.forEach(record => {
    const dateKey = formatDate(record.timestamp, 'YYYY-MM-DD')
    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = { totalAmount: 0, count: 0 }
    }
    dailyStats[dateKey].totalAmount += record.amount || 0
    dailyStats[dateKey].count++
  })
  
  const weekData = Object.entries(dailyStats)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-7)
    .map(([date, stats]) => ({
      date,
      label: formatDate(date, 'MM/DD'),
      ...stats
    }))
  
  return {
    dailyData: weekData,
    totalAmount: weekData.reduce((sum, d) => sum + d.totalAmount, 0),
    totalCount: weekData.reduce((sum, d) => sum + d.count, 0),
    avgDailyAmount: weekData.length > 0 
      ? Math.round(weekData.reduce((sum, d) => sum + d.totalAmount, 0) / weekData.length)
      : 0
  }
}

function estimateMilkRequirement(ageInMonths, weight) {
  let dailyMilk = 0
  
  if (ageInMonths < 1) {
    dailyMilk = Math.round(weight * 150)
  } else if (ageInMonths < 6) {
    dailyMilk = Math.round(weight * 120)
  } else if (ageInMonths < 12) {
    dailyMilk = 600 + Math.round(weight * 20)
  } else {
    dailyMilk = 500
  }
  
  const minMilk = Math.round(dailyMilk * 0.85)
  const maxMilk = Math.round(dailyMilk * 1.15)
  
  return {
    recommended: dailyMilk,
    range: { min: minMilk, max: maxMilk },
    perFeed: Math.round(dailyMilk / (ageInMonths < 3 ? 8 : ageInMonths < 6 ? 6 : 5))
  }
}

function validateNumber(value, min, max) {
  const num = parseFloat(value)
  if (isNaN(num)) return { valid: false, message: '请输入有效数字' }
  if (num < min) return { valid: false, message: `数值不能小于${min}` }
  if (num > max) return { valid: false, message: `数值不能大于${max}` }
  return { valid: true, value: num }
}

function debounce(fn, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

function throttle(fn, delay = 300) {
  let last = 0
  return function(...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

module.exports = {
  generateId,
  formatDate,
  formatTime,
  getRelativeTime,
  isToday,
  isYesterday,
  getDateLabel,
  groupRecordsByDate,
  calculateDailyStats,
  calculateWeeklyStats,
  estimateMilkRequirement,
  validateNumber,
  debounce,
  throttle
}
