Component({
  properties: {
    type: {
      type: String,
      value: 'tip'
    },
    title: {
      type: String,
      value: ''
    },
    content: {
      type: String,
      value: ''
    }
  },

  data: {
    iconText: '💡'
  },

  observers: {
    'type': function(type) {
      const iconMap = {
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️',
        tip: '💡'
      }
      this.setData({ iconText: iconMap[type] || '💡' })
    }
  }
})
