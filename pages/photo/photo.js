// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cameraContext:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(wx.canIUse('camera'))
   
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (wx.createCameraContext()) {
      console.log(666);
      this.cameraContext = wx.createCameraContext('myCamera')
      // this.cameraContext.takePhoto();
      console.log(this.cameraContext);
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }

  },

  startTakePhoto: function () {
    var that = this;
    console.log(123456);
    that.cameraContext.takePhoto({
      quality:"normal",
      success: function (res) {
        console.log(res);
        that.setData({
          // src: res.tempImagePath 
        })

      },
      fail: function () {
        wx.showLoading({
          title: "2",
        })
      },
     });
  
  },

  again:function(){
    // console.log(12)
    // wx.showToast({
    //   title: '25',
    // })

    wx.navigateBack({
      delta: 1
    })
  }


})