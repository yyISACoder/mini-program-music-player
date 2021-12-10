import {request} from '../../utils/util'

const app = getApp()
Page({
  data: {
    mid: '',
    detail: {},
    playList: [],
    albumCover: '',
    isPlaying: false,
    borderPlay: '',
    coverAnimateState: 'animation-play-state:paused',
    lyric: [],
    lyricScrollTop:0,
    scrollIntoView: '',
    currentPlayTime: '00:00',
    totalPlayTime: '00:00',
    slideVal: 0,
    playBtn: 'icon-bofang',
    playMode: 'icon-danquxunhuan',
    activeSwitch: 'play',
    bottomPanelTop: '1100rpx',
    bottomPanelTopReal: 0,
    bottomPanelTopNumber: Number.MAX_SAFE_INTEGER
  },
  onLoad(e) {
    this.bottomPanelHeight = 0
    this.isMoveOver = true
    this.pixelRatio = app.deviceInfo.pixelRatio
    this.startMoveY = 0
    this.endMoveY = 0
    this.playModeListIndex = 0
    this.playModeList=['icon-danquxunhuan','icon-23_shunxubofang','icon-24gl-shuffle']
    this.duration = 0
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
      clearInterval(this.lyricInterVal)
      this.lyricInterVal= null
      this.prevActiveTime = 0
      this.currentTime = 0
      this.playModeListIndex = 0
        this.setData({
          playBtn: 'icon-bofang',
          currentPlayTime: '00:00',
          slideVal: 0,
          coverAnimateState: 'animation-play-state:paused',
          borderPlay: 'border-stop',
          isPlaying: false,
          scrollIntoView: ''
        },()=>{
          debugger
          if(this.data.playMode === 'icon-danquxunhuan') {
            this.setData({
              coverAnimateState: 'animation-play-state:play',
              borderPlay: 'border-play',
              isPlaying: true,
              playBtn: 'icon-zanting'
            })
            this.audioCtx.title = this.data.detail.track_info.name
            this.audioCtx.src = this.musicSrc 
      
            this.audioCtx.seek(0)
          }
        })
    })
    this.audioCtx.onCanplay(()=>{
      this.duration = parseInt(this.audioCtx.duration)
      let minute = parseInt(this.duration / 60) >= 10 ? parseInt(this.duration / 60) : '0' + parseInt(this.duration / 60)
      let seconds = this.duration % 60 >= 10 ? this.duration % 60 : '0' + (this.duration % 60) 
      this.setData({
        coverAnimateState: 'animation-play-state:play',
        borderPlay: 'border-play',
        isPlaying: true,
        totalPlayTime: `${minute}:${seconds}`,
        playBtn: 'icon-zanting'
      })
      this.audioCtx.play()
    })
    this.audioCtx.onPlay(()=>{
      this.lyricInterVal = setInterval(()=>{
        this.currentTime = parseInt(this.audioCtx.currentTime)
        this.lyricActive()

        let slideVal = Math.round(this.currentTime / this.duration * 100)

        let minute = parseInt(this.currentTime / 60) >= 10 ? parseInt(this.currentTime / 60) : '0' + parseInt(this.currentTime / 60)
        let seconds = this.currentTime % 60 >= 10 ? this.currentTime % 60 : '0' + (this.currentTime % 60) 
        this.setData({
          slideVal,
          currentPlayTime: `${minute}:${seconds}`
        })
      },1000)
    })
    this.audioCtx.onPause(()=>{
      clearInterval(this.lyricInterVal)
      this.lyricInterVal= null
    })
    const query = wx.createSelectorQuery()
    query.select('#bottomPanel').boundingClientRect()
    query.exec(res => {
      debugger
      this.bottomPanelHeight = res[0].height
      this.setData({
        bottomPanelTopReal:res[0].top
      })
    })
    let playList = wx.getStorageSync('playList') ? JSON.parse(wx.getStorageSync('playList')) : []
    this.setData({
      playList,
      mid: e.mid
    },()=>{
      this.getMusicDetail().then(()=>{
        this.getMUsicUrl()
        this.getLyric()
      })
    })
  },
  bottomPanelTouchstart(e) {
    this.startMoveY = e.touches[0].clientY + 'px'
  },
  bottomPanelTouchmove(e) {
    let clientY = e.touches[0].clientY
    let windowHeight = app.deviceInfo.windowHeight
    if(this.isMoveOver && clientY >= windowHeight - this.bottomPanelHeight && clientY <= this.data.bottomPanelTopReal) {
      this.isMoveOver = false
      this.setData({
        bottomPanelTopNumber: clientY + 20,
        bottomPanelTop: clientY+ 'px'
      },()=>{
        this.isMoveOver = true
      })
    }
  },
  chooseSwitch(e) {
    let activeSwitch = e.currentTarget.dataset.key
    this.setData({
      activeSwitch
    })
  },
  changeMode() {
    this.playModeListIndex++
    if(this.playModeListIndex > 2) {
      this.playModeListIndex = 0
    }
    this.setData({
      playMode: this.playModeList[this.playModeListIndex]
    })
  },
  slider1change({detail:{value}}){
      let playTime = Math.round(this.duration * (value / 100))
      this.audioCtx.seek(playTime)
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
      this.musicSrc = res.data
      this.audioCtx.src = res.data
    })
  },
  playOrStop() {
    if(this.data.isPlaying) {
      this.setData({
        coverAnimateState: 'animation-play-state:paused',
        borderPlay: 'border-stop',
        isPlaying: false,
        playBtn: 'icon-bofang'
      })
      this.audioCtx.pause()
    }else{
      this.setData({
        coverAnimateState: 'animation-play-state:play',
        borderPlay: 'border-play',
        isPlaying: true,
        playBtn: 'icon-zanting'
      })
      // if(this.isOver) {
      //   this.audioCtx.title = this.data.detail.track_info.name
      //   this.audioCtx.src = this.musicSrc 

      //   this.isOver = false
      //   this.setData({
      //     scrollIntoView: ''
      //   })
      //   this.audioCtx.seek(0)
      // }else {
        this.audioCtx.play()
     // }
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

      let playList = JSON.parse(JSON.stringify(this.data.playList))
      let music = {
        songmid: data.track_info.mid,
        name: data.track_info.name,
        albummid: data.track_info.album.mid,
        singer: data.track_info.singer[0].name
      }
      playList = playList.filter(item=>{
        return item.songmid !== music.songmid
      })
      playList.unshift(music)
      this.setData({
        playList
      })
      wx.setStorageSync('playList', JSON.stringify(playList))
    })
  }
})
