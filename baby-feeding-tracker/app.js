let cloud = null
try {
  cloud = require('./utils/cloud.js')
} catch (e) {
  console.log('云开发模块不可用')
}

App({
  globalData: {
    currentBaby: null,
    babies: [],
    cloudEnabled: false,
    autoSyncEnabled: true
  },

  onLaunch() {
    this.initCloud().then(() => {
      this.loadBabies()
      this.loadSharedBabies()
      this.autoSyncOnLaunch()
    })
  },

  async initCloud() {
    return new Promise((resolve) => {
      if (cloud) {
        const cloudEnvId = cloud.getCloudEnv()
        if (cloudEnvId) {
          cloud.initCloud()
          this.globalData.cloudEnabled = cloud.isCloudEnabled()
        }
      }
      resolve()
    })
  },

  loadSharedBabies() {
    const sharedBabies = wx.getStorageSync('sharedBabies') || []
    this.globalData.sharedBabies = sharedBabies
  },

  async autoSyncOnLaunch() {
    console.log('=== 自动同步检查 ===')
    console.log('cloudEnabled:', this.globalData.cloudEnabled)
    console.log('autoSyncEnabled:', this.globalData.autoSyncEnabled)
    console.log('cloud:', !!cloud)
    
    if (!this.globalData.cloudEnabled || !this.globalData.autoSyncEnabled) {
      console.log('自动同步条件不满足，跳过')
      return
    }
    if (!cloud) {
      console.log('cloud模块不可用，跳过')
      return
    }

    try {
      console.log('=== 开始自动同步 ===')

      const babies = wx.getStorageSync('babies') || []
      const sharedBabies = wx.getStorageSync('sharedBabies') || []
      console.log('本地宝宝数量:', babies.length, '共享宝宝数量:', sharedBabies.length)

      const result = await cloud.syncAllBabiesFromCloud()
      console.log('同步结果:', result)

      if (result.synced > 0) {
        wx.showToast({
          title: `已同步${result.synced}个宝宝数据`,
          icon: 'none',
          duration: 2000
        })
      } else if (result.failed > 0) {
        wx.showToast({
          title: `同步失败：${result.failed}个`,
          icon: 'none',
          duration: 2000
        })
      } else {
        console.log('没有需要同步的数据')
      }

      console.log('=== 自动同步完成 ===')
    } catch (e) {
      console.error('自动同步失败:', e)
    }
  },

  async uploadCurrentBabyData() {
    if (!this.globalData.cloudEnabled || !cloud) return
    if (!this.globalData.currentBaby) return

    try {
      const result = await cloud.syncDataToCloud(this.globalData.currentBaby)
      if (result.success) {
        console.log('当前宝宝数据上传成功')
      }
    } catch (e) {
      console.error('上传当前宝宝数据失败:', e)
    }
  },

  loadBabies() {
    const babies = wx.getStorageSync('babies') || []
    this.globalData.babies = babies

    const sharedBabies = wx.getStorageSync('sharedBabies') || []
    const allBabies = [...babies, ...sharedBabies]

    if (allBabies.length > 0) {
      const currentBabyId = wx.getStorageSync('currentBabyId')
      if (currentBabyId) {
        this.globalData.currentBaby = allBabies.find(b => b.id === currentBabyId)
      } else if (babies.length > 0) {
        this.globalData.currentBaby = babies[0]
      } else if (sharedBabies.length > 0) {
        this.globalData.currentBaby = sharedBabies[0]
      }
    }
  },

  saveBabies() {
    wx.setStorageSync('babies', this.globalData.babies)
  },

  setCurrentBaby(baby) {
    this.globalData.currentBaby = baby
    wx.setStorageSync('currentBabyId', baby.id)
  },

  addSharedBaby(baby) {
    const sharedBabies = wx.getStorageSync('sharedBabies') || []
    const existingIndex = sharedBabies.findIndex(b => b.id === baby.id)
    if (existingIndex === -1) {
      sharedBabies.push(baby)
      wx.setStorageSync('sharedBabies', sharedBabies)
      this.globalData.sharedBabies = sharedBabies
    }
  },

  removeSharedBaby(babyId) {
    let sharedBabies = wx.getStorageSync('sharedBabies') || []
    sharedBabies = sharedBabies.filter(b => b.id !== babyId)
    wx.setStorageSync('sharedBabies', sharedBabies)
    this.globalData.sharedBabies = sharedBabies

    if (this.globalData.currentBaby && this.globalData.currentBaby.id === babyId) {
      const babies = wx.getStorageSync('babies') || []
      if (babies.length > 0) {
        this.setCurrentBaby(babies[0])
      } else {
        this.globalData.currentBaby = null
        wx.removeStorageSync('currentBabyId')
      }
    }
  }
})
