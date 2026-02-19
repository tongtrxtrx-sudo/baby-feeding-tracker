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
    if (!this.globalData.cloudEnabled || !this.globalData.autoSyncEnabled) return
    if (!cloud) return

    try {
      const result = await cloud.syncAllBabiesFromCloud()
      if (result.synced > 0) {
        wx.showToast({
          title: `已同步${result.synced}个宝宝数据`,
          icon: 'none',
          duration: 2000
        })
      }
    } catch (e) {}
  },

  async uploadCurrentBabyData() {
    if (!this.globalData.cloudEnabled || !cloud) return
    if (!this.globalData.currentBaby) return

    try {
      await cloud.syncDataToCloud(this.globalData.currentBaby)
    } catch (e) {}
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
