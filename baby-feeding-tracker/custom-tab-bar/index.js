Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        icon: 'home'
      },
      {
        pagePath: '/pages/feeding/feeding',
        text: '喂养',
        icon: 'bottle'
      },
      {
        pagePath: '/pages/growth/growth',
        text: '生长',
        icon: 'ruler'
      },
      {
        pagePath: '/pages/report/report',
        text: '报告',
        icon: 'chart'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '档案',
        icon: 'baby'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    },

    init() {
      const page = getCurrentPages().pop()
      const route = page ? `/${page.route}` : ''
      const index = this.data.list.findIndex(item => item.pagePath === route)
      
      this.setData({ selected: index >= 0 ? index : 0 })
    }
  }
})
