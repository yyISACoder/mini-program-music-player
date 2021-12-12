import {request} from '../../utils/util'

const app = getApp()
Page({
  data: {
    scrollTopPlay: 0,
    scrollTopComment: 0,
    commentListNew: [],
    commentList: [],
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
    bottomPanelTopNumber: Number.MAX_SAFE_INTEGER,
    isLoadCommentOver:false
  },
  onLoad(e) {
    this.playIndex = 0
    this.pageNoComment= 1
    this.mid = e.mid
    this.bottomPanelHeight = 0
    this.isMoveOver = true
    this.pixelRatio = app.deviceInfo.pixelRatio
    this.startMoveTime = 0
    this.endMoveTime = 0
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
      this.reset(true)
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
    },()=>{
      this.init()
    })
  },
  init() {
    this.getMusicDetail().then(()=>{
      this.getCommentList(true)
      this.getCommentList()
      this.getMUsicUrl()
      this.getLyric()
    })
  },
  scrolltolower() {
    if(this.data.isLoadCommentOver) {
      return
    }
    this.getCommentList()
  },
  getCommentList(isHot) {
    if(isHot) {
      request({
        url: 'comment',
        data: {
          id: this.data.detail.track_info.id,
          pageNo: 1,
          type: 1,
          biztype: 1,
          pageSize: 5
        }
      }).then(({data:{comment:{commentlist}}})=>{
        commentlist.forEach(item=>{
          let date = new Date(item.time * 1000)
          let year = date.getFullYear()
          let month= date.getMonth() + 1
          let day = date.getDate()
          item.timeDisplay = `${year}年${month}月${day}日`
        })
        this.setData({
          commentList:commentlist
        })
      })
    }else{
      request({
        url: 'comment',
        data: {
          id: this.data.detail.track_info.id,
          pageNo: this.pageNoComment,
          type: 0,
          biztype: 1,
          pageSize: 20
        }
      }).then(({data:{comment:{commentlist}}})=>{
        this.pageNoComment++
        commentlist.forEach(item=>{
          let date = new Date(item.time * 1000)
          let year = date.getFullYear()
          let month= date.getMonth() + 1
          let day = date.getDate()
          item.timeDisplay = `${year}年${month}月${day}日`
        })
        let tmp = JSON.parse(JSON.stringify(this.data.commentListNew))
        tmp.push(...commentlist)
        if(commentlist.length < 20) {
          this.setData({
            isLoadCommentOver: true,
            commentListNew:tmp
          })
        }else{
          this.setData({
            commentListNew:tmp
          })
        }
      })
    }
  },
  reset(overFlag){
    return new Promise(resolve=>{
      clearInterval(this.lyricInterVal)
      this.lyricInterVal= null
      this.audioCtx.stop()
      this.prevActiveTime = 0
      this.currentTime = 0
        this.setData({
          playBtn: 'icon-bofang',
          currentPlayTime: '00:00',
          slideVal: 0,
          coverAnimateState: 'animation-play-state:paused',
          borderPlay: 'border-stop',
          isPlaying: false,
          scrollIntoView: ''
        },()=>{
          if(!overFlag) {
            resolve()
            return
          }
          this.setData({
            coverAnimateState: 'animation-play-state:play',
            borderPlay: 'border-play',
            isPlaying: true,
            playBtn: 'icon-zanting'
          })
          if(this.data.playMode === 'icon-danquxunhuan') {
            this.audioCtx.title = this.data.detail.track_info.name
            this.audioCtx.src = this.musicSrc 
      
            this.audioCtx.seek(0)
          }else if(this.data.playMode === 'icon-23_shunxubofang'){
            let currentIndex = this.playIndex + 1
            if(currentIndex > this.data.playList.length - 1) {
              wx.showToast({
                title: '没有下一首啦～',
                icon: 'none'
              })
              return
            }
            this.mid = this.data.playList[currentIndex].songmid
            this.pageNoComment = 1
            this.setData({
              commentListNew: [],
              commentList: [],
              isLoadCommentOver: false,
              scrollTopPlay: 0,
              scrollTopComment: 0
            },()=>{
              this.reset().then(()=>{
                this.init()
              })
            })
          }else {
            let index = Math.ceil(Math.random() * (this.data.playList.length - 1))
            this.mid = this.data.playList[index].songmid
            this.pageNoComment = 1
            this.setData({
              commentListNew: [],
              commentList: [],
              isLoadCommentOver: false,
              scrollTopPlay: 0,
              scrollTopComment: 0
            },()=>{
              this.reset().then(()=>{
                this.init()
              })
            })
          }
          resolve()
        })
    })
  },
  bottomPanelTouchEnd(e) {
    this.endMoveY = e.changedTouches[0].clientY
    this.endMoveTime = e.timeStamp
    if(this.endMoveTime - this.startMoveTime < 300) {
      return
    }
    if(this.endMoveY >= this.startMoveY) {
      this.setData({
        bottomPanelTopNumber: this.data.bottomPanelTopReal + 20,
        bottomPanelTop: this.data.bottomPanelTopReal + 'px'
      })
    }else{
      this.setData({
        bottomPanelTopNumber: app.deviceInfo.windowHeight - this.bottomPanelHeight + 20,
        bottomPanelTop: app.deviceInfo.windowHeight - this.bottomPanelHeight + 'px'
      })
    }
  },
  bottomPanelTouchstart(e) {
    this.startMoveY = e.touches[0].clientY
    this.startMoveTime = e.timeStamp
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
  playMusicList(e){
    this.mid = e.currentTarget.dataset.mid
    this.pageNoComment = 1
    this.setData({
      bottomPanelTopNumber: this.data.bottomPanelTopReal + 20,
      bottomPanelTop: this.data.bottomPanelTopReal + 'px',
      commentListNew: [],
      commentList: [],
      isLoadCommentOver: false,
      scrollTopPlay: 0,
    },()=>{
      this.setData({
        activeSwitch: 'comment'
      },()=>{
        this.setData({
          scrollTopComment: 0
        },()=>{
          this.setData({
            activeSwitch: 'play'
          },()=>{
            this.reset().then(()=>{
              this.init()
            })
          })
        })
      })
    })
  },
  playLast(){
    let currentIndex = this.playIndex - 1
    if(currentIndex < 0) {
      wx.showToast({
        title: '没有上一首啦～',
        icon: 'none'
      })
      return
    }
    this.mid = this.data.playList[currentIndex].songmid
    this.pageNoComment = 1
    this.setData({
      commentListNew: [],
      commentList: [],
      isLoadCommentOver: false,
      scrollTopPlay: 0,
      scrollTopComment: 0
    },()=>{
      this.reset().then(()=>{
        this.init()
      })
    })
  },
  playNext(){
    if(this.data.playMode === 'icon-danquxunhuan' || this.data.playMode === 'icon-23_shunxubofang') {
      let currentIndex = this.playIndex + 1
      if(currentIndex > this.data.playList.length - 1) {
        wx.showToast({
          title: '没有下一首啦～',
          icon: 'none'
        })
        return
      }
      this.mid = this.data.playList[currentIndex].songmid
    } else {
      let index = Math.ceil(Math.random() * (this.data.playList.length - 1))
      this.mid = this.data.playList[index].songmid
    }
    this.pageNoComment = 1
    this.setData({
      commentListNew: [],
      commentList: [],
      isLoadCommentOver: false,
      scrollTopPlay: 0,
      scrollTopComment: 0
    },()=>{
      this.reset().then(()=>{
        this.init()
      })
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
        songmid: this.mid
      }
    }).then(({data:{lyric}})=>{
      this.lyricMap = {}
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
        lyric: tmpArr,
        lyricScrollTop: 0
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
        id: this.mid
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
    return new Promise(resolve=>{
      request({
        url: 'song',
        data: {
          songmid: this.mid
        }
      }).then(({data})=>{
        this.setData({
          detail: data,
          albumCover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${data.track_info.album.mid}.jpg`
        },()=>{
          let playList = JSON.parse(JSON.stringify(this.data.playList))
          let music = {
            songmid: data.track_info.mid,
            name: data.track_info.name,
            albummid: data.track_info.album.mid,
            singer: data.track_info.singer[0].name
          }
          let res = playList.find(item=>{
            return item.songmid === music.songmid
          })
          if(!res) {
            playList.unshift(music)
          }
          playList.forEach((item,index)=>{
            if(item.songmid === music.songmid) {
              this.playIndex = index
            }
          })
          this.setData({
            playList
          })
          wx.setStorageSync('playList', JSON.stringify(playList))

          resolve()
        })
      })
    })
  }
})
