// pages/login/login.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cameraContext:{},
    identName: "",
    ident: "",
    recognizeIcon:"../../images/icon/recognize_loding.png",
    middleText:"识别中···",
    phoneText:"开始拍照",
    tipState:false,
    buttonState:true,
    isDim:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      identName: options.identName,
      ident: options.ident
    })
    console.log("拍照启动")
    console.log(options.identName)
    console.log(options.ident)
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
    that.setData({
      tipState:true,
      buttonState:false,
      recognizeIcon: "../../images/icon/recognize_loding.png",
      middleText: "识别中···",
    })
    console.log(123456);
    that.cameraContext.takePhoto({
      quality:"high",
      success: function (res) {
        that.upload(res.tempImagePath);
        that.setData({
          isDim: true
        })
      },
      fail: function () {
        //失败需要统一还原状态
      },
     });
  
  },

  upload: function (filePath) {
    var that = this;  
    wx.uploadFile({
      url: "https://dev.bookingyun.com/CenterMaster/police/checkIdentAngPic",
      filePath: filePath,
      name: 'file',
      formData:
      {
        ident: that.data.ident, identName: that.data.identName
      },
      success: function (res) {
        console.log(res);
        console.log(res.data);
        var dataObject = JSON.parse(res.data);
        console.log(dataObject.returnCode);
       
        if (dataObject.returnCode == 1) {
          
          that.setData({
            recognizeIcon: "../../images/icon/recognize_suc.png",
            middleText: "实名登记成功",
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }
            , 2000)

        } else {
          that.setData({
            buttonState: true,
            recognizeIcon: "../../images/icon/recognize_fail.png",
            phoneText: "再试一次",
            middleText: "人像识别未通过",
            isDim: false
          })
        }
      },
      fail: function (error) {
        console.error(error);
      }
    })


    //上传图片到服务器
    wx.uploadFile({
      url: "https://dev.bookingyun.com/KmsMaster/hotel/addHotelImg",
      filePath: filePath,
      name: 'file',
      formData: 
      {
        hotelId: "B335C79F2B7748A49DCF962BDBC8D220", itemType: "401"
      },
      success: function (res) {
        console.log("上传");
        console.log(res);
        console.log(res.data.returnCode);
      },
      fail: function (error) {
        console.error(error);
        wx.showToast({
          title: error.daga.returnMessage,
          icon: "loading"
        })
      }
    })
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