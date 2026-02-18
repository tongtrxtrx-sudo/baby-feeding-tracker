const { formatTime, getRelativeTime } = require('../../utils/util')

Component({
  properties: {
    record: {
      type: Object,
      value: {}
    }
  },

  data: {
    typeIcon: '🍼',
    typeText: '配方奶',
    timeText: ''
  },

  observers: {
    'record': function(record) {
      if (!record) return
      
      const typeMap = {
        breast: { icon: '🤱', text: '母乳' },
        formula: { icon: '🍼', text: '配方奶' },
        mixed: { icon: '🔄', text: '混合' }
      }
      
      const type = typeMap[record.type] || typeMap.formula
      
      this.setData({
        typeIcon: type.icon,
        typeText: type.text,
        timeText: formatTime(record.timestamp)
      })
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', this.properties.record)
    },

    onEdit() {
      this.triggerEvent('edit', this.properties.record)
    },

    onDelete() {
      this.triggerEvent('delete', this.properties.record)
    }
  }
})
