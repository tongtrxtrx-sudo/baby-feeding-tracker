const app = getApp()
const calculator = require('../../utils/calculator.js')
const growthStandard = require('../../utils/growth-standard.js')

Page({
  data: {
    currentBaby: null,
    ageText: '',
    report: {}
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
      this.updateAgeText()
      this.generateReport()
    }
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

  generateReport() {
    const report = calculator.generateReport(this.data.currentBaby)
    this.setData({ report })
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  goToGrowth() {
    wx.switchTab({ url: '/pages/growth/growth' })
  }
})
