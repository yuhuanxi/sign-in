const db = wx.cloud.database(); // 初始化数据库
const app = getApp(); // 获取全局数据

Page({
  data: {
    count: 0 // 坚持天数
  },
  // 点击签到
  singnin: function(e){

    let _this = this;
    let time = app.dateFormat('YYYY-MM-DD');
    let hours = app.dateFormat('HH');

    // 获取用户信息
    wx.getSetting({
      complete: function (res) {
        if (res.authSetting['scope.userInfo']) { // 已授权

          // db.collection('userInfo').where({
          //   _openid: app.globalData.openId
          // })
          //   .get()
          //   .then(res => {
          //     let obj = res.data[0].timeList;

          //     Object.keys(obj)

          //     console.log(Object.keys(obj))
          //   })

          //   return false;
          // 获取当前用户的签到次数
          db.collection('userInfo').where({
            _openid: app.globalData.openId
          })
            .get().then(res => {

              
              
              // 判断今天是否签到
              if (res.data[0].lastTime == time){
                wx.showToast({
                  title: '今天已签到！！',
                  icon: 'none',
                  duration: 2000
                })
                return;
              }

              if (hours >= 0 && hours < 5) {
                // 未到签到时间
                wx.showToast({
                  title: '未到签到时间',
                  duration: 2000
                })
                return;
              } else if (hours >= 9 && hours < 24) {
                // 签到时间已过
                wx.showToast({
                  title: '今天签到时间已过',
                  icon: 'none',
                  duration: 2000
                })
                return;
              } else {
                console.log('签到时间')
              }
              
              // 调用云函数进行更新 加一天
              wx.cloud.callFunction({
                name: 'signin',
                data: {
                  action: 'count',
                  lastTime: time,
                  timeList: time
                }
              }).then(res => {
                console.log('签到成功+1天')
                _this.onLoad(); //更新页面签到天数
              }).catch(err => {
                console.log('签到失败')
                console.log(err)
              })


              let data = {
                currentTime: app.dateFormat('HH:mm'),
                openid: app.globalData.openId,
                nickName: app.globalData.nickName,
                avatarUrl: app.globalData.avatarUrl,
                gender: app.globalData.gender,
                like: 0
              }

              // 今日排行榜
              db.collection('today').doc(time)
                .get()
                .then(res => {

                  // 添加信息到今日排行榜
                  wx.cloud.callFunction({
                    name: 'signin',
                    data: {
                      action: 'today',
                      _id: time,
                      dataList: data
                    }
                  }).then(res => {
                    console.log('添加信息到今日排行榜成功')
                  }).catch(err => {
                    console.log('添加信息到今日排行榜失败')
                  })
                })
                .catch(err => {
                  // 创建今日排行榜
                  db.collection('today').add({
                    data: {
                      _id: time,
                      data: [data]
                    }
                  }).then(res => {
                    console.log('创建今日排行榜成功')
                  }).catch(err => {
                    console.log('创建今日排行榜失败')
                    console.log(err)
                  })
                })

            })

          


          
        } else {
          // 未授权则进入授权页面
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }
    })
  },
  // 排行榜
  ranking: function(e){
    wx.navigateTo({
      url: '../ranking/ranking'
    })
  },
  /**
   *  监听页面加载
   */
  onLoad: function (options) {

    let _this = this;

    // 获取用户信息
    wx.getSetting({
      success: function (res) {
        console.log(app.globalData.openId)
        if (res.authSetting['scope.userInfo']) {
          console.log('已授权')
          // 获取当前用户的签到次数
          db.collection('userInfo').where({
            _openid: app.globalData.openId
          })
            .get()
            .then(res => {
              console.log(res)
              _this.setData({
                count: res.data[0].count
              })
              console.log(res.data[0])
            })
            .catch(err => {
              console.log(err)
            })
        }
      }
    })

    

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
