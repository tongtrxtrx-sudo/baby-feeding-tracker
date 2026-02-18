const app = getApp()
const storage = require('../../utils/storage.js')
const growthStandard = require('../../utils/growth-standard.js')

Page({
  data: {
    currentBaby: null,
    greetingText: '',
    ageText: '',
    todayDate: '',
    todayFeedings: [],
    todayTotalMilk: 0,
    lastFeedingTime: '--:--',
    latestGrowth: null,
    weekMilkData: [],
    weekDays: [],
    maxMilk: 1
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.initPage()
  },

  initPage() {
    const currentBaby = app.globalData.currentBaby
    this.setData({ currentBaby })

    if (currentBaby) {
      this.updateGreeting()
      this.updateAgeText()
      this.updateTodayDate()
      this.loadFeedingData()
      this.loadGrowthData()
      this.loadWeekMilkData()
    }
  },

  updateGreeting() {
    const hour = new Date().getHours()
    let greeting = ''
    if (hour < 6) greeting = '夜深了'
    else if (hour < 12) greeting = '早上好'
    else if (hour < 18) greeting = '下午好'
    else greeting = '晚上好'
    this.setData({ greetingText: greeting })
  },

  updateAgeText() {
    if (!this.data.currentBaby) return
    const ageInMonths = growthStandard.calculateAgeInMonths(this.data.currentBaby.birthDate)
    let ageText = ''
    if (ageInMonths < 1) {
      const days = Math.floor((Date.now() - new Date(this.data.currentBaby.birthDate).getTime()) / (1000 * 60 * 60 * 24))
      ageText = `${days}天`
    } else if (ageInMonths < 12) {
      ageText = `${ageInMonths}个月`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      ageText = months > 0 ? `${years}岁${months}个月` : `${years}岁`
    }
    this.setData({ ageText })
  },

  updateTodayDate() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[now.getDay()]
    this.setData({ todayDate: `${month}月${day}日 ${weekDay}` })
  },

  loadFeedingData() {
    const feedings = storage.getTodayFeedings(this.data.currentBaby.id)
    const todayFeedings = feedings.map(f => ({
      ...f,
      timeText: storage.formatFeedingTime(f)
    }))
    const todayTotalMilk = storage.getTodayTotalMilk(this.data.currentBaby.id)
    let lastFeedingTime = '--:--'
    if (feedings.length > 0) {
      lastFeedingTime = storage.formatFeedingTime(feedings[0])
    }
    this.setData({
      todayFeedings,
      todayTotalMilk,
      lastFeedingTime
    })
  },

  loadGrowthData() {
    const growths = storage.getGrowths(this.data.currentBaby.id)
    if (growths.length > 0) {
      const latest = growths[0]
      this.setData({
        latestGrowth: {
          ...latest,
          date: latest.date || storage.formatDate(latest.createTime)
        }
      })
    }
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  goToFeeding() {
    wx.switchTab({ url: '/pages/feeding/feeding' })
  },

  goToGrowth() {
    wx.switchTab({ url: '/pages/growth/growth' })
  },

  goToShare() {
    wx.navigateTo({ url: '/pages/share/share' })
  },

  loadWeekMilkData() {
    const feedings = storage.getFeedings(this.data.currentBaby.id)
    const today = new Date()
    const weekDays = []
    const weekMilkData = []
    let maxMilk = 0
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getMonth() + 1}-${date.getDate()}`
      const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
      weekDays.push(`${date.getMonth() + 1}/${date.getDate()} ${weekDay}`)
      
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000
      
      const dayFeedings = feedings.filter(f => {
        const feedingTime = f.createTime || f.time
        return feedingTime >= dayStart && feedingTime < dayEnd
      })
      
      let totalMilk = 0
      dayFeedings.forEach(f => {
        if (f.amount) {
          totalMilk += parseFloat(f.amount)
        }
      })
      weekMilkData.push(totalMilk)
      if (totalMilk > maxMilk) maxMilk = totalMilk
    }
    
    this.setData({ 
      weekDays, 
      weekMilkData,
      maxMilk: maxMilk || 1
    })
  }
})
