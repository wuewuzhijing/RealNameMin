// pages/login/login.js
var util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commitState: false,
    codeState:false,
    verifyCodeText:"获取验证码",
    openidParms: {},
    loginType: "0",
    switchType: 2,
    imageUrl:"../../images/icon/temporary_user.png",
  
    name:"刘阳",
    phone:"158204808434",
    idcard:"421222198910262830",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.login();
  },

  login: function () {
    var that = this
    // 登录
    wx.login({
      success: res => {
        that.data.openidParms.jsCode = res.code;
        if (res.code) {
          // 获取用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                that.getUserInfo();
              } else {
                console.log("获取用户信息授权失败")
                if (!res.authSetting['scope.userInfo']) {
                  wx.authorize({
                    scope: 'scope.userInfo',
                    success() {
                      that.getUserInfo();
                    },
                    fail() {
                      util.checkSettingStatu('scope.userInfo');
                    }
                  })
                }
              }
            }
          })
        }
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  //获取用户信息
  getUserInfo: function () {
    let that = this;
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        that.data.openidParms.encryptedData = res.encryptedData;
        that.data.openidParms.iv = res.iv;
        that.data.openidParms.appId = util.appId;

        let info = JSON.stringify(that.globalData);
        console.log(info)

        that.getOpenId(that.data.openidParms);

        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        // if (this.userInfoReadyCallback) {
        //   this.userInfoReadyCallback(res)
        // }
      }
    })
  },

  //获取opind
  getOpenId: function (parms) {
    let that = this;
    // wx.showLoading({
    //   title: "正在登录",
    // });
    wx.request({
      url: util.getOpenIdUrl,
      method: 'GET',
      data: parms,
      isLoading: true,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading()
        console.log("获取openid成功" + res.data.returnMessage)
        if (res.data.openId) {
          //获取用户的抬头列表 ， 如果有数据打开抬头列表页，没有数据就进入添加抬头页
        }
        // var userid = { userId: "567" };
        // that.getUserTitleList(userid);
        that.getUserId(res);
      },
      fail: function () {
        wx.hideLoading();
        console.log("获取openid失败")
      }
    })
  },

  //获取userid
  getUserId: function (res) {
    var that = this;
    util.getQuery('user/getUserByInvoiceOpenId',
      { openIdInvoiceLittleApp: res.data.openId, nickname: res.data.nickname, avatar: res.data.avatarUrl }, "",
      function success(res) {
        console.log("获取userid成功")
        if (res.data.userId) {
          // 获取用户信息
          // that.globalData.userInfo.userId = res.data.userId
          // that.globalData.userInfo.userId = "567"
          // that.getUserTitleList(that.globalData.userInfo.userId);
          that.getUserInfo(res.data.userId);
        }

      },
      function fail(res) {
        console.log("获取userid失败")
      })
  },

  getUserInfo:function(userId){
    var that = this ;
    that.setData({
      loginType:"1"  // 类型一，填写手机号
    })

  },



//获取验证码
  getVerifyCode:function(e){
    this.setData({
      codeState:true,
      verifyCodeText:"60秒后重新获取"
    })
  },


//提交手机信息
  formSubmit:function(e){
    var that = this;
    console.log(3);
    console.log(e.detail.value);
    that.setData({
      commitState: false,
      loginType: 2,
    })
  },


//绑定手机号登记
  formSubmit2:function(e){
      console.log(2);
      console.log(e.detail.value);
      wx.navigateTo({
        url: '../photo/photo'
      })
  },

//直接登记
  submit: function (e) {
    var that = this;
    console.log(3);
    console.log(data);
    wx.navigateTo({
      url: '../photo/photo'
    })
  },


  switchChange: function (e) {
    console.log('switch1 发生 change 事件，携带值为', e.detail.value)
  },

  addTemporaryUser:function(){
    var that = this
    that.setData({
      loginType:3,
    })
  }




  
})