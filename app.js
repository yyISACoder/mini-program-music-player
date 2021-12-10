// app.js
App({
  onLaunch() {
    wx.getSystemInfo({
      success: result => {
        this.deviceInfo = result
      }
    })
  },
  deviceInfo: null
})
