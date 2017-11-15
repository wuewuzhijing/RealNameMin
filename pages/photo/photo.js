var util = require("../../utils/util.js")
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
    });
    console.log("拍照启动");
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
      quality:"normal",
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

//人脸认证
  upload: function (filePath) {
    var start = new Date().getTime();
    var that = this;  
    let data = {
      ident: that.data.ident, 
      identName: that.data.identName,
      hotelId:"B335C79F2B7748A49DCF962BDBC8D220"
    };
    wx.uploadFile({
      url: util.policeUrl,
      filePath: filePath,
      name: 'file',
      formData: data,
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
          var end = new Date().getTime();
          util.sendLog('', 1002, "post", end - start, "police/checkIdentAngPic", util.policeUrl, data, res.data, res.data.returnMessage);
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
          var end = new Date().getTime();
          util.sendLog('error', 1001, "post", end - start, "police/checkIdentAngPic", util.policeUrl, data, res.data, res.data.returnMessage)
        }
      },
      fail: function (error) {
        console.error(error);
        var end = new Date().getTime();
        util.sendLog('fail', 1003, "post", end - start, "police/checkIdentAngPic", util.policeUrl, data, error.data, error.errMsg);
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
        // wx.showToast({
        //   title: error.daga.returnMessage,
        //   icon: "loading"
        // })
      }
    })
  },

})