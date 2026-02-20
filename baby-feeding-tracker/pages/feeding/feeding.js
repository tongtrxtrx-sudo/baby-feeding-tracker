const app = getApp()
const storage = require('../../utils/storage.js')

let cloud = null
try {
  cloud = require('../../utils/cloud.js')
} catch (e) {
  console.log('云开发模块不可用')
}

Page({
  data: {
    currentBaby: null,
    feedings: [],
    todayFeedings: [],
    todayTotalMilk: 0,
    avgMilk: 0,
    poops: [],
    todayPoops: [],
    todayDate: '',
    showModal: false,
    showPoopModal: false,
    editingId: null,
    editingPoopId: null,
    formData: {
      type: 'formula',
      amount: '',
      time: '',
      note: ''
    },
    poopFormData: {
      status: 'normal',
      time: '',
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
      this.updateTodayDate()
      this.loadFeedings()
      this.loadPoops()
    }
  },

  updateTodayDate() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[now.getDay()]
    this.setData({ todayDate: `${month}月${day}日 ${weekDay}` })
  },

  loadFeedings() {
    const feedings = storage.getFeedings(this.data.currentBaby.id)
    const formattedFeedings = feedings.map(f => ({
      ...f,
      dateText: storage.formatDate(f.createTime),
      timeText: storage.formatFeedingTime(f)
    }))
    const todayFeedings = storage.getTodayFeedings(this.data.currentBaby.id)
    const todayTotalMilk = storage.getTodayTotalMilk(this.data.currentBaby.id)
    const avgMilk = todayFeedings.length > 0 ? Math.round(todayTotalMilk / todayFeedings.length) : 0

    this.setData({
      feedings: formattedFeedings,
      todayFeedings,
      todayTotalMilk,
      avgMilk
    })
  },

  loadPoops() {
    const poops = storage.getPoops(this.data.currentBaby.id)
    const formattedPoops = poops.map(p => ({
      ...p,
      dateText: storage.formatDate(p.createTime),
      timeText: p.time || storage.formatTime(p.createTime)
    }))
    const todayPoops = storage.getTodayPoops(this.data.currentBaby.id)

    this.setData({
      poops: formattedPoops,
      todayPoops
    })
  },

  showAddModal() {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    this.setData({
      showModal: true,
      editingId: null,
      formData: {
        type: 'formula',
        amount: '',
        time: `${hours}:${minutes}`,
        note: ''
      }
    })
  },

  showAddPoopModal() {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    this.setData({
      showPoopModal: true,
      editingPoopId: null,
      poopFormData: {
        status: 'normal',
        time: `${hours}:${minutes}`,
        note: ''
      }
    })
  },

  editFeeding(e) {
    const feedingId = e.currentTarget.dataset.id
    const feeding = this.data.feedings.find(f => f.id === feedingId)
    if (feeding) {
      this.setData({
        showModal: true,
        editingId: feedingId,
        formData: {
          type: feeding.type,
          amount: String(feeding.amount),
          time: feeding.time || '',
          note: feeding.note || ''
        }
      })
    }
  },

  editPoop(e) {
    const poopId = e.currentTarget.dataset.id
    const poop = this.data.poops.find(p => p.id === poopId)
    if (poop) {
      this.setData({
        showPoopModal: true,
        editingPoopId: poopId,
        poopFormData: {
          status: poop.status || 'normal',
          time: poop.time || '',
          note: poop.note || ''
        }
      })
    }
  },

  hideModal() {
    this.setData({ showModal: false })
  },

  hidePoopModal() {
    this.setData({ showPoopModal: false })
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

  onPoopInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`poopFormData.${field}`]: value
    })
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      'formData.type': type
    })
  },

  selectPoopStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      'poopFormData.status': status
    })
  },

  onTimeChange(e) {
    this.setData({
      'formData.time': e.detail.value
    })
  },

  onPoopTimeChange(e) {
    this.setData({
      'poopFormData.time': e.detail.value
    })
  },

  async saveFeeding() {
    const { type, amount, time, note } = this.data.formData
    const { editingId, currentBaby } = this.data

    if (!amount) {
      wx.showToast({ title: '请输入奶量', icon: 'none' })
      return
    }

    const feedingData = {
      type,
      amount: parseInt(amount),
      time,
      note
    }

    wx.showLoading({ title: '保存中...' })

    try {
      let recordToUpload
      if (editingId) {
        storage.updateFeeding(currentBaby.id, editingId, feedingData)
        recordToUpload = { ...feedingData, id: editingId }
      } else {
        recordToUpload = storage.addFeeding(currentBaby.id, feedingData)
      }

      // 同步单条记录到云端
      if (cloud && app.globalData.cloudEnabled) {
        await cloud.uploadFeeding(currentBaby.id, recordToUpload)
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.hideModal()
      this.loadFeedings()
    } catch (e) {
      wx.hideLoading()
      console.error('保存喂养记录失败:', e)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  async savePoop() {
    const { status, time, note } = this.data.poopFormData
    const { editingPoopId, currentBaby } = this.data

    const poopData = {
      status,
      time,
      note
    }

    wx.showLoading({ title: '保存中...' })

    try {
      let recordToUpload
      if (editingPoopId) {
        storage.updatePoop(currentBaby.id, editingPoopId, poopData)
        recordToUpload = { ...poopData, id: editingPoopId }
      } else {
        recordToUpload = storage.addPoop(currentBaby.id, poopData)
      }

      // 同步单条记录到云端
      if (cloud && app.globalData.cloudEnabled) {
        await cloud.uploadPoop(currentBaby.id, recordToUpload)
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.hidePoopModal()
      this.loadPoops()
    } catch (e) {
      wx.hideLoading()
      console.error('保存大便记录失败:', e)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  deleteFeeding(e) {
    const feedingId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.doDeleteFeeding(feedingId)
        }
      }
    })
  },

  async doDeleteFeeding(feedingId) {
    wx.showLoading({ title: '删除中...' })

    try {
      // 先删除本地数据
      storage.deleteFeeding(this.data.currentBaby.id, feedingId)

      // 删除云端单条记录
      if (cloud && app.globalData.cloudEnabled) {
        await cloud.deleteFeeding(this.data.currentBaby.id, feedingId)
      }

      wx.hideLoading()
      wx.showToast({ title: '删除成功', icon: 'success' })
      this.loadFeedings()
    } catch (e) {
      wx.hideLoading()
      console.error('删除喂养记录失败:', e)
      wx.showToast({ title: '删除失败', icon: 'none' })
    }
  },

  deletePoop(e) {
    const poopId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.doDeletePoop(poopId)
        }
      }
    })
  },

  async doDeletePoop(poopId) {
    wx.showLoading({ title: '删除中...' })

    try {
      // 先删除本地数据
      storage.deletePoop(this.data.currentBaby.id, poopId)

      // 删除云端单条记录
      if (cloud && app.globalData.cloudEnabled) {
        await cloud.deletePoop(this.data.currentBaby.id, poopId)
      }

      wx.hideLoading()
      wx.showToast({ title: '删除成功', icon: 'success' })
      this.loadPoops()
    } catch (e) {
      wx.hideLoading()
      console.error('删除大便记录失败:', e)
      wx.showToast({ title: '删除失败', icon: 'none' })
    }
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  }
})
