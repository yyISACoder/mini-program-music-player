const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}


const request = ({url='',method='get',data=''}) => {
  return new Promise((reslove,reject)=>{
    wx.request({
      url: `https://carlblog.site/qq-music-api/${url}`,
      method,
      data,
      success({data}) {
        reslove(data)
      },
      fail(err) {
        wx.showToast({
          title: '服务器接口出错啦~',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}


module.exports = {
  formatTime,
  request
}
