import {request} from '../../utils/util'

const app = getApp()
Page({
  data: {
    mid: '',
    detail: {},
    albumCover: '',
    isPlaying: false,
    borderPlay: '',
    coverAnimateState: 'animation-play-state:paused',
    lyric: [],
    lyricScrollTop:0,
    scrollIntoView: ''
  },
  onLoad(e) {
    this.isOver = false
    this.prevActiveTime = 0
    this.currentTime = 0
    this.lyricInterVal = null
    this.lyricMap = {}
    this.audioCtx = wx.getBackgroundAudioManager()
    this.audioCtx.onError(()=>{
      wx.showToast({
        title: '音乐播放出错啦~',
        icon: 'none'
      })
    })
    this.audioCtx.onEnded(()=>{
      clearInterval(this.lyricInterVa)
      this.lyricInterVal= null
      this.setData({
        coverAnimateState: 'animation-play-state:paused',
        borderPlay: 'border-stop',
        isPlaying: false
      })
      this.prevActiveTime = 0
      this.currentTime = 0
      this.isOver = true
    })
    this.audioCtx.onCanplay(()=>{
      this.setData({
        coverAnimateState: 'animation-play-state:play',
        borderPlay: 'border-play',
        isPlaying: true
      })
      this.audioCtx.play()
    })
    this.audioCtx.onPlay(()=>{
      this.lyricInterVal = setInterval(()=>{
        this.currentTime = parseInt(this.audioCtx.currentTime)
        this.lyricActive()
      },1000)
    })
    this.audioCtx.onPause(()=>{
      clearInterval(this.lyricInterVal)
      this.lyricInterVal= null
    })



    this.setData({
      mid: e.mid
    }) 
    this.getMusicDetail().then(()=>{
      this.getMUsicUrl()
      this.getLyric()
    })
  },
  lyricActive() {
    let match = this.data.lyric.find(item=>{
      return item.time === this.currentTime
    })
    let lyric = JSON.parse(JSON.stringify(this.data.lyric))
    lyric.forEach(item=>{
      if(item.time === this.currentTime) {
        this.prevActiveTime = item.time
        item.activeClass = 'active-lyric'
      }else{
        if(match === undefined) {
          if(this.prevActiveTime === item.time) {
            item.activeClass = 'active-lyric'
          }
        }else{
          item.activeClass = ''
        }
      }
    })
    this.setData({
      lyric,
      scrollIntoView: `time-${this.prevActiveTime}`
    })
  },
  getLyric() {
    request({
      url: 'lyric',
      data: {
        songmid: this.data.mid
      }
    }).then(({data:{lyric}})=>{
      let arr = lyric.split('\n').slice(5)
      arr.forEach(item=>{
        let time = item.split('').slice(0,10).join('')
        let content = item.split('').slice(10).join('')
        let seconds = parseInt(time.slice(1,3)) * 60 +  parseInt(time.slice(4,6))
        this.lyricMap[seconds] = content
      })
      let tmpArr = []
      for(let i in this.lyricMap) {
        if(!this.lyricMap[i]) {
          delete this.lyricMap[i]
        }else{
          tmpArr.push({
            time:Number(i),
            content:this.lyricMap[i]
          })
        }
      }
      this.setData({
        lyric: tmpArr
      })
    })
  },
  onHide() {
    //this.audioCtx.pause()
  },
  onUnload() {
    this.audioCtx.pause()
    //this.audioCtx.destroy()
  },
  getMUsicUrl() {
    request({
      url: 'song/url',
      data: {
        id: this.data.mid
      }
    }).then(res=>{
      if(res.result !== 100) {
        wx.showToast({
          title: '音乐播放出错啦~',
          icon: 'none'
        })
        return
      }
      this.audioCtx.title = this.data.detail.track_info.name
      this.audioCtx.src = res.data
    })
  },
  playOrStop() {
    debugger
    if(this.data.isPlaying) {
      this.setData({
        coverAnimateState: 'animation-play-state:paused',
        borderPlay: 'border-stop',
        isPlaying: false
      })
      this.audioCtx.pause()
    }else{
      this.setData({
        coverAnimateState: 'animation-play-state:play',
        borderPlay: 'border-play',
        isPlaying: true
      })
      this.audioCtx.play()
      if(this.isOver) {
        this.isOver = false
        this.setData({
          scrollIntoView: ''
        })
        this.audioCtx.seek(0)
      }
    }
  },
  getMusicDetail() {
    return request({
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
