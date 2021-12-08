import {request} from '../../utils/util'

const app = getApp()
Page({
  data: {
    searchResult: {
      songs: []
    },
    isShowSearchConent: false,
    isShowSearchPanel: false,
    hotTextList: [],
    newBannerList: [],
    recommendListOfficial: [],
    recommendListClassical: [],
    recommendListLove: [],
    recommendListNet: [],
    recommendListKtv: [],
    keyValue: '',
    mapList: {
      3317: 'recommendListOfficial',
      59: 'recommendListClassical',
      71: 'recommendListLove',
      3056: 'recommendListNet',
      64: 'recommendListKtv'
    },
    userInfo: {
      nickName: 'Mr.Carl'
    }
  },
  onLoad() {
    this.getRecommendList(3317)
    this.getRecommendList(59)
    this.getRecommendList(71)
    this.getRecommendList(3056)
    this.getRecommendList(64)
    this.getBanner()
  },
  bindFocus() {
    this.getHotTextList()
    this.setData({
      isShowSearchConent: false,
      isShowSearchPanel: true
    })
  },
  chooseHotText(e) {
    let keyValue = e.currentTarget.dataset.key
    this.setData({
      keyValue
    })
    this.getSearchContent(keyValue)
  },
  bindconfirm(e) {
    let value = e.detail.value
    this.getSearchContent(value)
  },
  bindblur() {
    this.setData({
      isShowSearchPanel: false
    })
  },
  playMusic(e) {
    wx.navigateTo({
      url: `/pages/play/play?mid=${e.currentTarget.dataset.mid}`
    })
  },
  getSearchContent(key) {
    this.setData({
      isShowSearchPanel: false,
      isShowSearchConent: true,
    })
    request({
      url: 'search/quick',
      data: {
        key
      }
    }).then(({data})=>{
      this.setData({
        'searchResult.songs': data.song.itemlist
      })
    })
  },
  getHotTextList() {
    request({
      url:'search/hot'
    }).then(({data})=>{
      this.setData({
        hotTextList: data
      })
    })
  },
  getRecommendList(id){
    request({
      url:'recommend/playlist',
      data: {
        id,
        pageNo: 1,
        pageSize: 10
      }
    }).then(({data:{list}})=>{
      
      this.setData({
        [this.data.mapList[id]]: list
      })
    })
  },
  getBanner() {
    request({
      url:'recommend/banner'
    }).then(({data:newBannerList})=>{
      
      this.setData({
        newBannerList
      })
    })
  }
})
