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
    todayDate: '',
    showModal: false,
    editingId: null,
    formData: {
      type: 'formula',
      amount: '',
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

  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      'formData.type': type
    })
  },

  onTimeChange(e) {
    this.setData({
      'formData.time': e.detail.value
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

      if (cloud && app.globalData.cloudEnabled) {
        const updatedFeeding = { ...feedingData, id: editingId }
        cloud.autoUploadFeeding(currentBaby.id, updatedFeeding).catch(e => {
          console.error('自动上传失败:', e)
        })
      }
    } else {
      const newFeeding = storage.addFeeding(currentBaby.id, feedingData)
      wx.showToast({ title: '记录成功', icon: 'success' })

      if (cloud && app.globalData.cloudEnabled) {
        cloud.autoUploadFeeding(currentBaby.id, newFeeding).catch(e => {
          console.error('自动上传失败:', e)
        })
      }
    }

    this.hideModal()
    this.loadFeedings()
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

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  }
})
