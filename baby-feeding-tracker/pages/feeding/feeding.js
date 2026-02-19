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

  saveFeeding() {
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

    if (editingId) {
      storage.updateFeeding(currentBaby.id, editingId, feedingData)
      wx.showToast({ title: '修改成功', icon: 'success' })

      if (cloud) {
        const updatedFeeding = { ...feedingData, id: editingId }
        cloud.autoUploadFeeding(currentBaby.id, updatedFeeding)
      }
    } else {
      const newFeeding = storage.addFeeding(currentBaby.id, feedingData)
      wx.showToast({ title: '记录成功', icon: 'success' })

      if (cloud) {
        cloud.autoUploadFeeding(currentBaby.id, newFeeding)
      }
    }

    this.hideModal()
    this.loadFeedings()
  },

  savePoop() {
    const { status, time, note } = this.data.poopFormData
    const { editingPoopId, currentBaby } = this.data

    const poopData = {
      status,
      time,
      note
    }

    if (editingPoopId) {
      storage.updatePoop(currentBaby.id, editingPoopId, poopData)
      wx.showToast({ title: '修改成功', icon: 'success' })

      if (cloud) {
        const updatedPoop = { ...poopData, id: editingPoopId }
        cloud.autoUploadPoop(currentBaby.id, updatedPoop)
      }
    } else {
      const newPoop = storage.addPoop(currentBaby.id, poopData)
      wx.showToast({ title: '记录成功', icon: 'success' })

      if (cloud) {
        cloud.autoUploadPoop(currentBaby.id, newPoop)
      }
    }

    this.hidePoopModal()
    this.loadPoops()
  },

  deleteFeeding(e) {
    const feedingId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteFeeding(this.data.currentBaby.id, feedingId)
          this.loadFeedings()
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  deletePoop(e) {
    const poopId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deletePoop(this.data.currentBaby.id, poopId)
          this.loadPoops()
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  }
})
