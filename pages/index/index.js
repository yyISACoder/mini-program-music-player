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
    historyList: [],
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
  getHistory() {
    let historyList = JSON.parse(wx.getStorageSync('searchKey') ? wx.getStorageSync('searchKey') : '[]')
    this.setData({
      historyList
    })
  },
  bindFocus() {
    this.getHistory()
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
  toIndex() {
    this.setData({
      isShowSearchConent: false,
      isShowSearchPanel:false
    })
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
  deleteHis(e) {
    e.cancel
    let key = e.currentTarget.dataset.key
    let keyArr = JSON.parse(wx.getStorageSync('searchKey'))
    let index = keyArr.indexOf(key)
    keyArr.splice(index,1)
    wx.setStorageSync('searchKey', JSON.stringify(keyArr))
    this.setData({
      historyList: keyArr
    })
  },
  getSearchContent(key) {
    let keyArr = wx.getStorageSync('searchKey')
    if(!keyArr) {  
      wx.setStorageSync('searchKey', JSON.stringify([key]))
    }else{
      let arr = JSON.parse(keyArr)
      arr.push(key)
      arr = Array.from(new Set(arr))
      wx.setStorageSync('searchKey', JSON.stringify(arr))
    }
    this.setData({
      isShowSearchPanel: false,
      isShowSearchConent: true,
    })
    request({
      url: 'search',
      data: {
        key,
        pageSize:40
      }
    }).then(({data:{list}})=>{
      this.setData({
        'searchResult.songs': list
      })
    })
  },
  getHotTextList() {
    request({
      url:'search/hot'
    }).then(({data})=>{
      this.setData({
        hotTextList: data.slice(0,10)
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
