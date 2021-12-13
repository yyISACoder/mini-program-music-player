import {request} from '../../utils/util'

Page({
  data: {
    mvSrc: '',
    detail: {}
  },
  onLoad(e) {
    this.id = e.id
    wx.showLoading({
      title: '',
      mask: true
    })
    Promise.all([
      request({
        url: 'mv/url',
        data: {
          id: this.id
        }
      }),
      request({
        url: 'mv',
        data: {
          id: this.id
        }
      })
    ]).then(res=>{
      this.setData({
        mvSrc: res[0].data[this.id][0],
        detail: res[1].data.info
      },()=>{
        wx.hideLoading()
      })
    })
  }
})
