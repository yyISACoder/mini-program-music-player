import {request} from '../../utils/util'

const app = getApp()
Page({
  data: {
    mid: '',
    detail: {},
    albumCover: ''
  },
  onLoad(e) {
    this.setData({
      mid: e.mid
    })
    this.getMusicDetail()
  },
  getMusicDetail() {
    request({
      url: 'song',
      data: {
        songmid: this.data.mid
      }
    }).then(({data})=>{
      this.setData({
        detail: data,
        albumCover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${data.track_info.album.mid}.jpg`
      })
    })
  }
})
