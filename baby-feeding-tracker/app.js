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
    autoSyncEnabled: false
  },

  onLaunch() {
    this.initCloud().then(() => {
      this.loadBabies()
      this.loadSharedBabies()
      // 登录后自动全量下载数据
      this.autoDownloadFromCloud()
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

  // 自动从云端下载数据（登录时触发）
  async autoDownloadFromCloud() {
    if (!this.globalData.cloudEnabled || !cloud) {
      console.log('云同步未启用，跳过自动下载')
      return
    }

    const lastAutoDownload = wx.getStorageSync('lastAutoDownload') || 0
    const now = Date.now()
    // 至少间隔5分钟才自动下载，避免频繁请求
    if (now - lastAutoDownload < 5 * 60 * 1000) {
      console.log('距离上次自动下载不足5分钟，跳过')
      return
    }

    console.log('开始自动从云端下载数据...')
    wx.showLoading({ title: '同步数据中...', mask: true })

    try {
      let downloadedCount = 0

      // 合并所有宝宝（包括共享宝宝）
      const allBabies = [...this.globalData.babies, ...(this.globalData.sharedBabies || [])]

      for (const baby of allBabies) {
        const result = await cloud.syncDataFromCloud(baby)
        if (result.success) {
          downloadedCount += (result.added?.feedings || 0) + 
                            (result.added?.growths || 0) + 
                            (result.added?.poops || 0)
        }
      }

      wx.setStorageSync('lastAutoDownload', now)
      wx.hideLoading()

      if (downloadedCount > 0) {
        wx.showToast({ 
          title: `同步成功，新增${downloadedCount}条记录`, 
          icon: 'none',
          duration: 2000
        })
        // 重新加载数据
        this.loadBabies()
      } else {
        console.log('没有新数据需要同步')
      }
    } catch (e) {
      console.error('自动下载数据失败:', e)
      wx.hideLoading()
    }
  },

  loadSharedBabies() {
    const sharedBabies = wx.getStorageSync('sharedBabies') || []
    this.globalData.sharedBabies = sharedBabies
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