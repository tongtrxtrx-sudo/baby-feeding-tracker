const app = getApp()
const storage = require('../../utils/storage.js')
const growthStandard = require('../../utils/growth-standard.js')

let cloud = null
try {
  cloud = require('../../utils/cloud.js')
} catch (e) {
  console.log('云开发模块不可用')
}

function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

Page({
  data: {
    cloudEnabled: false,
    cloudEnvId: '',
    currentBaby: null,
    ageText: '',
    shareCode: '',
    inputShareCode: '',
    hasShareCode: false,
    syncing: false,
    lastSyncTime: '',
    sharedBabies: [],
    allBabies: []
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.initPage()
  },

  initPage() {
    let cloudEnvId = ''
    let cloudEnabled = false
    
    if (cloud) {
      cloudEnvId = cloud.getCloudEnv()
      cloudEnabled = app.globalData.cloudEnabled && cloud.isCloudEnabled()
    }

    const currentBaby = app.globalData.currentBaby
    const babies = app.globalData.babies || []
    const sharedBabies = app.globalData.sharedBabies || []
    const allBabies = [...babies, ...sharedBabies]
    
    this.setData({
      cloudEnabled,
      cloudEnvId,
      currentBaby,
      babies,
      sharedBabies,
      allBabies
    })

    if (currentBaby) {
      this.updateAgeText()
      this.loadShareCode()
      this.loadLastSyncTime()
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

  loadShareCode() {
    if (!this.data.currentBaby) return
    const shareCode = wx.getStorageSync(`shareCode_${this.data.currentBaby.id}`)
    if (shareCode) {
      this.setData({
        shareCode,
        hasShareCode: true
      })
    }
  },

  loadLastSyncTime() {
    if (!this.data.currentBaby) return
    const lastSync = wx.getStorageSync(`lastSync_${this.data.currentBaby.id}`)
    if (lastSync) {
      const date = new Date(lastSync)
      const timeText = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      this.setData({ lastSyncTime: timeText })
    }
  },

  onEnvInput(e) {
    this.setData({
      cloudEnvId: e.detail.value
    })
  },

  async setupCloud() {
    if (!cloud) {
      wx.showToast({ title: '云开发模块不可用', icon: 'none' })
      return
    }

    const { cloudEnvId } = this.data
    if (!cloudEnvId) {
      wx.showToast({ title: '请输入环境ID', icon: 'none' })
      return
    }

    wx.showLoading({ title: '配置中...' })

    try {
      cloud.setCloudEnv(cloudEnvId)
      await cloud.initDatabase()
      
      app.globalData.cloudEnabled = true
      
      wx.showToast({
        title: '云同步已启用',
        icon: 'success'
      })

      this.setData({
        cloudEnabled: true
      })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '配置失败：' + (e.message || '请重试'), icon: 'none' })
    }
  },

  async generateShareCode() {
    if (!this.data.currentBaby) return

    wx.showLoading({ title: '生成中...' })

    try {
      const shareCode = generateShareCode()
      
      if (cloud && this.data.cloudEnabled) {
        try {
          await cloud.createShare(this.data.currentBaby.id, shareCode)
        } catch (e) {
          console.log('云端创建失败，使用本地模式', e)
        }
      }

      wx.setStorageSync(`shareCode_${this.data.currentBaby.id}`, shareCode)
      wx.setStorageSync(`shareData_${shareCode}`, {
        babyId: this.data.currentBaby.id,
        name: this.data.currentBaby.name,
        gender: this.data.currentBaby.gender,
        birthDate: this.data.currentBaby.birthDate
      })
      
      this.setData({
        shareCode,
        hasShareCode: true
      })
      wx.hideLoading()
      wx.showToast({ title: '生成成功', icon: 'success' })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '生成失败，请重试', icon: 'none' })
    }
  },

  copyShareCode() {
    const { shareCode } = this.data
    wx.setClipboardData({
      data: shareCode,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  },

  onShareCodeInput(e) {
    this.setData({
      inputShareCode: e.detail.value.toUpperCase()
    })
  },

  async joinShare() {
    const { inputShareCode, cloudEnabled } = this.data
    if (!inputShareCode || inputShareCode.length !== 6) {
      wx.showToast({ title: '请输入6位邀请码', icon: 'none' })
      return
    }

    if (!cloudEnabled) {
      wx.showToast({ title: '请先开通云开发', icon: 'none' })
      return
    }

    wx.showLoading({ title: '加入中...' })

    try {
      let baby = null

      const localShareData = wx.getStorageSync(`shareData_${inputShareCode}`)
      if (localShareData) {
        baby = localShareData
      } else if (cloud && cloudEnabled) {
        try {
          const shareInfo = await cloud.getShareByCode(inputShareCode)
          if (shareInfo) {
            baby = await cloud.downloadBaby(shareInfo.babyId)
          }
        } catch (e) {
          console.log('云端获取分享失败', e)
          wx.hideLoading()
          wx.showToast({ title: '云端连接失败', icon: 'none' })
          return
        }
      }
      
      if (!baby) {
        wx.hideLoading()
        wx.showToast({ title: '邀请码无效或已过期', icon: 'none' })
        return
      }

      baby.shareFrom = '配偶'
      baby.shared = true
      
      app.addSharedBaby(baby)

      const babies = app.globalData.babies || []
      if (!babies.find(b => b.id === baby.id)) {
        app.globalData.babies.push(baby)
        app.saveBabies()
      }

      app.setCurrentBaby(baby)
      
      this.setData({
        currentBaby: baby,
        sharedBabies: app.globalData.sharedBabies || []
      })

      wx.hideLoading()
      wx.showToast({ title: '加入成功', icon: 'success', duration: 1500 })
      
      setTimeout(async () => {
        try {
          const result = await cloud.syncDataFromCloud(baby)
          if (result.success) {
            wx.showToast({ title: result.message || '数据同步成功', icon: 'none' })
          }
        } catch (e) {
          console.error('同步失败', e)
        }
        wx.switchTab({ url: '/pages/index/index' })
      }, 1500)
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '加入失败', icon: 'none' })
    }
  },

  selectBaby(e) {
    const babyId = e.currentTarget.dataset.id
    const { babies, sharedBabies } = this.data
    const allBabies = [...babies, ...sharedBabies]
    const baby = allBabies.find(b => b.id === babyId)
    
    if (baby) {
      app.setCurrentBaby(baby)
      this.setData({ currentBaby: baby })
      this.updateAgeText()
      this.loadShareCode()
      this.loadLastSyncTime()
      wx.showToast({ title: `已切换到${baby.name}`, icon: 'none' })
    }
  },

  async syncToCloud() {
    if (!this.data.currentBaby) return

    this.setData({ syncing: true })
    wx.showLoading({ title: '上传中...' })

    try {
      const result = await cloud.syncDataToCloud(this.data.currentBaby)
      
      wx.hideLoading()
      this.setData({ syncing: false })

      if (result.success) {
        this.loadLastSyncTime()
        wx.showToast({ title: result.message || '上传成功', icon: 'success' })
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    } catch (e) {
      wx.hideLoading()
      this.setData({ syncing: false })
      wx.showToast({ title: '上传失败', icon: 'none' })
    }
  },

  async syncFromCloud() {
    if (!this.data.currentBaby) return

    this.setData({ syncing: true })
    wx.showLoading({ title: '下载中...' })

    try {
      const result = await cloud.syncDataFromCloud(this.data.currentBaby, { force: false })
      
      wx.hideLoading()
      this.setData({ syncing: false })

      if (result.success) {
        this.loadLastSyncTime()
        wx.showToast({ title: result.message || '下载成功', icon: 'success' })
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    } catch (e) {
      wx.hideLoading()
      this.setData({ syncing: false })
      wx.showToast({ title: '下载失败', icon: 'none' })
    }
  },

  async syncAll() {
    if (!this.data.cloudEnabled) return

    this.setData({ syncing: true })
    wx.showLoading({ title: '同步中...' })

    try {
      const result = await cloud.syncAllBabiesFromCloud()
      
      wx.hideLoading()
      this.setData({ syncing: false })

      if (result.success) {
        wx.showToast({ title: `同步成功：${result.synced}个宝宝`, icon: 'success' })
      } else {
        wx.showToast({ title: `同步完成：${result.synced}成功，${result.failed}失败`, icon: 'none' })
      }
    } catch (e) {
      wx.hideLoading()
      this.setData({ syncing: false })
      wx.showToast({ title: '同步失败', icon: 'none' })
    }
  },

  async uploadAll() {
    if (!this.data.cloudEnabled) return

    this.setData({ syncing: true })
    wx.showLoading({ title: '上传中...' })

    try {
      const result = await cloud.syncAllBabiesToCloud()
      
      wx.hideLoading()
      this.setData({ syncing: false })

      if (result.success) {
        wx.showToast({ title: `上传成功：${result.synced}个宝宝`, icon: 'success' })
      } else {
        wx.showToast({ title: `上传完成：${result.synced}成功，${result.failed}失败`, icon: 'none' })
      }
    } catch (e) {
      wx.hideLoading()
      this.setData({ syncing: false })
      wx.showToast({ title: '上传失败', icon: 'none' })
    }
  }
})
