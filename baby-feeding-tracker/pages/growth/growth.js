const app = getApp()
const storage = require('../../utils/storage.js')
const growthStandard = require('../../utils/growth-standard.js')

let cloud = null
try {
  cloud = require('../../utils/cloud.js')
} catch (e) {
  console.log('云开发模块不可用')
}

Page({
  data: {
    currentBaby: null,
    growths: [],
    currentTab: 'weight',
    chartData: null,
    babyRecords: [],
    showModal: false,
    editingId: null,
    currentStandard: null,
    formData: {
      date: '',
      weight: '',
      height: '',
      headCircumference: '',
      note: ''
    }
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
      this.loadGrowths()
    }
  },

  loadGrowths() {
    const growths = storage.getGrowths(this.data.currentBaby.id)
    const formattedGrowths = growths.map(g => ({
      ...g,
      date: g.date || storage.formatDate(g.createTime)
    }))
    this.setData({ growths: formattedGrowths })
    this.prepareChartData()
    this.loadCurrentStandard()
  },

  loadCurrentStandard() {
    const { currentBaby, currentTab } = this.data
    if (!currentBaby) return

    const gender = currentBaby.gender === 'boy' ? 'boys' : 'girls'
    const ageInMonths = growthStandard.calculateAgeInMonths(currentBaby.birthDate)
    const standard = growthStandard.getStandardForAge(gender, currentTab, ageInMonths)

    this.setData({ currentStandard: standard })
  },

  prepareChartData() {
    const { currentBaby, growths, currentTab } = this.data
    if (!currentBaby) return

    const gender = currentBaby.gender === 'boy' ? 'boys' : 'girls'
    const type = currentTab
    const whoStandards = growthStandard.WHO_STANDARDS[gender] && growthStandard.WHO_STANDARDS[gender][type]

    if (!whoStandards) {
      this.setData({ chartData: null, babyRecords: [] })
      return
    }

    const months = whoStandards.months || []
    const chartData = {
      months,
      p3: whoStandards.p3 || [],
      p15: whoStandards.p15 || [],
      p50: whoStandards.p50 || [],
      p85: whoStandards.p85 || [],
      p97: whoStandards.p97 || []
    }

    const babyRecords = growths.map(g => {
      const month = growthStandard.calculateAgeInMonths(currentBaby.birthDate, g.date)
      return {
        month,
        value: g[type]
      }
    }).filter(r => r.value != null)

    this.setData({ chartData, babyRecords })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    this.prepareChartData()
    this.loadCurrentStandard()
  },

  showAddModal() {
    const today = storage.formatDate(new Date())
    this.setData({
      showModal: true,
      editingId: null,
      formData: {
        date: today,
        weight: '',
        height: '',
        headCircumference: '',
        note: ''
      }
    })
  },

  editGrowth(e) {
    const growthId = e.currentTarget.dataset.id
    const growth = this.data.growths.find(g => g.id === growthId)
    if (!growth) return

    this.setData({
      showModal: true,
      editingId: growthId,
      formData: {
        date: growth.date,
        weight: growth.weight.toString(),
        height: growth.height.toString(),
        headCircumference: growth.headCircumference ? growth.headCircumference.toString() : '',
        note: growth.note || ''
      }
    })
  },

  hideModal() {
    this.setData({ showModal: false })
  },

  stopPropagation() {
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  async saveGrowth() {
    const { formData, editingId } = this.data
    const { date, weight, height, headCircumference, note } = formData
    const currentBaby = this.data.currentBaby

    if (!weight) {
      wx.showToast({ title: '请输入体重', icon: 'none' })
      return
    }
    if (!height) {
      wx.showToast({ title: '请输入身高', icon: 'none' })
      return
    }

    const growth = {
      date,
      weight: parseFloat(weight),
      height: parseFloat(height),
      headCircumference: headCircumference ? parseFloat(headCircumference) : null,
      note
    }

    wx.showLoading({ title: '保存中...' })

    try {
      let recordToUpload
      if (editingId) {
        growth.id = editingId
        storage.updateGrowth(currentBaby.id, growth)
        recordToUpload = growth
      } else {
        recordToUpload = storage.addGrowth(currentBaby.id, growth)
      }

      // 同步单条记录到云端
      if (cloud && app.globalData.cloudEnabled) {
        await cloud.uploadGrowth(currentBaby.id, recordToUpload)
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.hideModal()
      this.loadGrowths()
    } catch (e) {
      wx.hideLoading()
      console.error('保存生长记录失败:', e)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  deleteGrowth(e) {
    const growthId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.doDeleteGrowth(growthId)
        }
      }
    })
  },

  async doDeleteGrowth(growthId) {
    wx.showLoading({ title: '删除中...' })

    try {
      // 先删除本地数据
      storage.deleteGrowth(this.data.currentBaby.id, growthId)

      // 删除云端单条记录
      if (cloud && app.globalData.cloudEnabled) {
        await cloud.deleteGrowth(this.data.currentBaby.id, growthId)
      }

      wx.hideLoading()
      wx.showToast({ title: '删除成功', icon: 'success' })
      this.loadGrowths()
    } catch (e) {
      wx.hideLoading()
      console.error('删除生长记录失败:', e)
      wx.showToast({ title: '删除失败', icon: 'none' })
    }
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  }
})
