// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cameraContext:{},
    identName: "刘阳",
    ident: "421222198910262830",
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
        console.log(res.tempImagePath);
        that.getBase64Image(res.tempImagePath);
        // that.setData({
        //   // src: res.tempImagePath 
        // })
      },
      fail: function () {
        wx.showLoading({
          title: "2",
        })
      },
     });
  
  },


  // 转base64
  getBase64Image:function(img) {  
    // var canvas = document.createElement("canvas");  
    // canvas.width = img.width;  
    // canvas.height = img.height;  
    // var ctx = canvas.getContext("2d");  
    // ctx.drawImage(img, 0, 0, img.width, img.height);  
    // var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();  
    // var dataURL = canvas.toDataURL("image/" + ext);  

    // that.identRecognize(that.data.identName, that.data.ident, dataURL);
    // wx.base64ToArrayBuffer(base64)

    console.log(222);
    var base64 = wx.arrayBufferToBase64(img)
    console.log(base64);
  },


  identRecognize: function (ident, identName, pic) {
    var that = this;
    util.getQuery('police/checkIdentAngPic',
    {
      ident:"",
      identName:"",
      pic:""
    },
      "加载中",
      function success(res) {
        console.log("身份校验正确");
        that.setData({
          ident: data.ident,
          identName: data.identName
        })
        wx.navigateTo({
          url: '../photo/photo'
        })
      }, function fail(res) {
        wx.showToast({
          title: '身份信息有误',
          icon: "loading"
        })
      })
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