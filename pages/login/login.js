// pages/login/login.js
var util = require("../../utils/util.js")
var net = require("../../utils/net.js")
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
    countdown:60,
    last_time:180,
    hotelId:"B335C79F2B7748A49DCF962BDBC8D220",
    hotelName:"",
    self:true,
    userId:"",
    identName:"",
    mobile:"",
    ident:"",
    inputIdent:""  //实名登记时输入的身份证号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.login();
    net.getHotel(that.data.hotelId , that);
    that.settimeTotal();
  },

  onShow: function () { 
    //  生命周期函数--监听页面显示 
    var that = this;
    if (that.data.ident.length > 0){
      that.setData({
        loginType: "1"
      })
    }
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
                console.log(that)
                that.getUser();
              } else {
                console.log("获取用户信息授权失败")
                if (!res.authSetting['scope.userInfo']) {
                  wx.authorize({
                    scope: 'scope.userInfo',
                    success() {
                      that.getUser();
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

  //获取用户
  getUser: function () {
    let that = this;
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        console.log("获取用户信息成功")
        that.data.openidParms.encryptedData = res.encryptedData;
        that.data.openidParms.iv = res.iv;
        that.data.openidParms.appId = util.appId;

        that.getOpenId(that.data.openidParms);

        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        // if (this.userInfoReadyCallback) {
        //   this.userInfoReadyCallback(res)
        // }
      },fail:function(){
        console.log("获取用户信息失败")
        that.setData({
          loginType: "3"
        })
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
        console.log("获取openid失败")
        that.setData({
          loginType: "3"
        })
      }
    })
  },

  //获取userid , 应该包含基本的用户信息
  getUserId: function (res) {
    var that = this;
    util.getQuery('user/getUserByPoliceOpenId',
      { openIdPoliceLittleApp: res.data.openId, nickname: res.data.nickname, avatar: res.data.avatarUrl }, "",
      function success(res) {
        console.log(res)
        if (res.data.userId) {
          that.setData({
            mobile: res.data.mobile,  // 
            userId: res.data.userId
          })
          if (res.data.mobile == "" || res.data.mobile == null){
            that.setData({
              loginType: "3"  // 去填写手机号
            })
          }else{
            //获取用户列表再做一次判断
            that.getUserContacters();
          }
        }else{
          that.setData({
            loginType: "3" 
          })
        }
      },
      function fail(res) {
        console.log("获取userid失败");
        that.setData({
          loginType: "3"
        })
      })
  },


  //获取联系人列表  ， 非本人的情况还未做处理
  getUserContacters: function () {
    var that = this;
    util.getQuery('user/getUserContacters',
      {
        userId: that.data.userId
      },
      "加载中",
      function success(res) {
        console.log(res);
        var list = res.data.list;
        if (list && list.length > 0){
          for (var i = 0; i < list.length; i++) {
            if (1 == list[i].contacterType){
              that.setData({
                ident: list[i].ident,
                identName: list[i].identName,
                mobile: list[i].phone,
                loginType: "1"  // 已有信息
              })
              console.log(1);
            }
          }

          if (that.data.ident == "" || that.data.ident == null){
            that.setData({
              loginType: "3"  // 去填写信息
            })
          }

          console.log(1);
          console.log(that.data.ident);

        }else{
          console.log(0);
          that.setData({
            loginType: "3"  // 去填写信息
          })
        }
      }, function fail(res) {
        console.log(res);
      })
  },

//提交手机/验证码信息
  formSubmit:function (e){
    var that = this;
    var datas = e.detail.value;
    if (e.detail.target.id == "getCode"){
      if (datas.mobile == ""){
        wx.showToast({
          title: '手机号不能为空',
          icon: "loading"
        })
      }else{
        that.sendVerifyCode(datas.mobile);
      }
    
    } else if (e.detail.target.id == "comminPhone"){
      console.log(2);
      if (datas.mobile == "") {
        wx.showToast({
          title: '手机号不能为空',
          icon: "loading"
        })
        return;
      }
      if (datas.inputVerifyCode == "") {
        wx.showToast({
          title: '效验码不能为空',
          icon: "loading"
        })
        return;
      }
      net.updateUserPnone(that.data.userId, datas.mobile, datas.inputVerifyCode,that);
    }
  },


  //获取验证码 
  sendVerifyCode:function(mobile){
    var that = this;
    util.getQuery('user/sendVerifyCode',
      {
        mobile: mobile
      },
      "加载中",
      function success(res) {
        that.setData({
          codeState: true,
          verifyCodeText: that.data.countdown + "秒后重新获取"
        })
        that.settime();
      }, function fail(res) {
        wx.showToast({
          title: '获取效验码失败',
          icon: "loading"
        })
      })
  },




//绑定手机号登记,需要先验证姓名跟身份证是否匹配
  formSubmit2:function(e){
    var that = this;
    var datas = e.detail.value;

    console.log(2);
    that.setData({
      commitState: false,
    })

    if (datas.identName == "") {
      wx.showToast({
        title: '姓名不能为空',
        icon: "loading"
      })
      return;
    }

    if (datas.ident == "") {
      wx.showToast({
        title: '身份证号不能为空',
        icon: "loading"
      })
      return;
    }

    that.checkIdent(datas);
   
  },


  //核对身份证跟姓名是否一致
  checkIdent:function(data){
    var that = this;
    util.getQuery('police/checkIdent', data,
      "加载中",
      function success(res) {
        console.log("身份校验正确");
        that.setData({
          ident: data.ident,
          identName: data.identName
        })
        wx.navigateTo({
          url: '../photo/photo?ident=' + data.ident + "&identName=" + data.identName
        })
        that.addPerson(); 
        // that.modifyPerson();
      }, function fail(res) {
        wx.showToast({
          title: '身份信息有误',
          icon: "loading"
        })
      })
  },


  //添加联系人
  addPerson: function () {
    console.log("添加联系人开始");
    var that = this;
    util.getQuery('user/addContacter',
    {
      hotelId: that.data.hotelId,
      userId: that.data.userId,
      phone: that.data.mobile,
      identName: that.data.identName,
      contacterType: that.data.self?"1":"2",
      ident: that.data.ident
    }
    ,"加载中",
      function success(res) {
        console.log("添加联系人成功");
        console.log(res);
      }, function fail(res) {
        console.log("添加联系人失败");
        console.log(res);
      })
  },


  //修改联系人
  modifyPerson: function () {
    var that = this;
    util.getQuery('user/updateContacter',
      {
        hotelId: that.data.hotelId,
        userId: that.data.userId,
        phone: that.data.mobile,
        contactersId: "c2646de56ed3447fb55b0ec77f633f31",
        identName: that.data.identName,
        contacterType: that.data.self ? "1" : "2",
        ident: that.data.ident
      }
      , "加载中",
      function success(res) {
        console.log("修改联系人成功");
        console.log(res);
      }, function fail(res) {
        console.log("修改联系人失败");
        console.log(res);
      })
  },

//直接登记
  submit: function (e) {
    var that = this;
    wx.navigateTo({
      url: '../photo/photo?ident=' + that.data.ident + "&identName=" + that.data.identName
    })
  },


  switchChange: function (e) {
    var that = this
    console.log('switch1 发生 change 事件，携带值为', e.detail.value)
    that.setData({
      self:e.detail.value
    })
  },

  addTemporaryUser:function(){
    var that = this
    that.setData({
      ident: "",
      identName: "",
      mobile:"",
      loginType:3,
    })
  },

  settime:function () {
    var that = this;
    if (that.data.countdown == 0) {
      that.setData({
        codeState: false,
        verifyCodeText: "获取验证码"
      })
      that.data.countdown = 60;
      return;
    } else {
      that.setData({
        verifyCodeText: that.data.countdown + "秒后重新获取"
      })
      that.data.countdown--;
    }
    setTimeout(function () {
      that.settime()
    }
      , 1000)

  },

  settimeTotal: function () {
    var that = this;
    if (that.data.last_time == 0) {
      that.setData({
        last_time: that.data.last_time,
        loginType: "4"
      })
      that.data.last_time = 180;
      return;
    } else {
      that.setData({
        last_time: that.data.last_time,
      })
      that.data.last_time--;
    }
    setTimeout(function () {
      that.settimeTotal()
    }
      , 1000)

  },

})

