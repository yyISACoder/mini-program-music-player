import {request} from '../../utils/util'

Page({
  data: {
    mvSrc: '',
    detail: {}
  },
  onLoad(e) {
    this.id = e.id
    this.albumId = e.albumId
    wx.showLoading({
      title: '',
      mask: true
    })
    if(this.id) {
      request({
        url: 'songlist',
        data: {
          id: this.id
        }
      }).then(res=>{
        debugger
        this.setData({
          detail: res.data
        },()=>{
          wx.hideLoading()
        })
      })
    }else{
      request({
        url: 'album',
        data: {
          albummid: this.albumId
        }
      }).then(res=>{
        debugger
        this.setData({
          detail: res.data
        },()=>{
          wx.hideLoading()
        })
      })
    }
  },
  goToPlay(e) {
    let songid = e.currentTarget.dataset.songid
    wx.navigateTo({
      url: `/pages/play/play?mid=${songid}`
    })
  }
})
