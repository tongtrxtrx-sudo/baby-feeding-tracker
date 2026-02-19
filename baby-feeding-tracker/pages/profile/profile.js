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
    babies: [],
    currentBaby: null,
    showModal: false,
    editingBaby: null,
    formData: {
      name: '',
      gender: 'boy',
      birthDate: '',
      birthWeight: '',
      birthHeight: ''
    },
    ageText: ''
  },

  onLoad() {
    this.loadBabies()
  },

  onShow() {
    this.loadBabies()
  },

  loadBabies() {
    this.setData({
      babies: app.globalData.babies,
      currentBaby: app.globalData.currentBaby
    })
    if (this.data.currentBaby) {
      this.updateAgeText()
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

  showAddModal() {
    this.setData({
      showModal: true,
      editingBaby: null,
      formData: {
        name: '',
        gender: 'boy',
        birthDate: '',
        birthWeight: '',
        birthHeight: ''
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

  selectGender(e) {
    const gender = e.currentTarget.dataset.gender
    this.setData({
      'formData.gender': gender
    })
  },

  onDateChange(e) {
    this.setData({
      'formData.birthDate': e.detail.value
    })
  },

  saveBaby() {
    const { name, gender, birthDate, birthWeight, birthHeight } = this.data.formData

    if (!name) {
      wx.showToast({ title: '请输入宝宝昵称', icon: 'none' })
      return
    }
    if (!birthDate) {
      wx.showToast({ title: '请选择出生日期', icon: 'none' })
      return
    }

    const baby = {
      id: this.data.editingBaby ? this.data.editingBaby.id : storage.generateId(),
      name,
      gender,
      birthDate,
      birthWeight: birthWeight ? parseFloat(birthWeight) : null,
      birthHeight: birthHeight ? parseFloat(birthHeight) : null,
      createTime: this.data.editingBaby ? this.data.editingBaby.createTime : Date.now()
    }

    let babies = this.data.babies
    if (this.data.editingBaby) {
      const index = babies.findIndex(b => b.id === this.data.editingBaby.id)
      if (index !== -1) {
        babies[index] = baby
      }
    } else {
      babies.push(baby)
    }

    app.globalData.babies = babies
    if (!app.globalData.currentBaby) {
      app.setCurrentBaby(baby)
    }
    app.saveBabies()

    // 自动上传到云端
    if (cloud) {
      cloud.uploadBaby(baby)
    }

    this.hideModal()
    this.loadBabies()
    wx.showToast({ title: '保存成功', icon: 'success' })
  },

  selectBaby(e) {
    const babyId = e.currentTarget.dataset.id
    const baby = this.data.babies.find(b => b.id === babyId)
    if (baby) {
      app.setCurrentBaby(baby)
      this.loadBabies()
    }
  },

  editBaby(e) {
    const babyId = e.currentTarget.dataset.id
    const baby = this.data.babies.find(b => b.id === babyId)
    if (baby) {
      this.setData({
        showModal: true,
        editingBaby: baby,
        formData: {
          name: baby.name,
          gender: baby.gender,
          birthDate: baby.birthDate,
          birthWeight: baby.birthWeight || '',
          birthHeight: baby.birthHeight || ''
        }
      })
    }
  },

  deleteBaby(e) {
    const babyId = e.currentTarget.dataset.id
    const baby = this.data.babies.find(b => b.id === babyId)
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除宝宝"${baby.name}"吗？删除后该宝宝的所有数据将无法恢复。`,
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          let babies = this.data.babies.filter(b => b.id !== babyId)
          app.globalData.babies = babies
          
          if (app.globalData.currentBaby && app.globalData.currentBaby.id === babyId) {
            app.globalData.currentBaby = babies.length > 0 ? babies[0] : null
            if (babies.length > 0) {
              app.setCurrentBaby(babies[0])
            } else {
              wx.removeStorageSync('currentBabyId')
            }
          }
          app.saveBabies()
          
          this.loadBabies()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }
})
