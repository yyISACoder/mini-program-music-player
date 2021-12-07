// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    webSrc: ''
  },
  onLoad(query) {
    this.setData({
      webSrc: query.site
    })
  }
})
