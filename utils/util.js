const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const appId = "wx4d62bd61eb6b0330"; //开发环境
const getOpenIdUrl = "https://dev.bookingyun.com/hotel_wx/rest/wxRest/getSNSUserInfoByEncryptedData";  // 开发环境
var rootDocment = 'https://dev.bookingyun.com/CenterMaster/';   // 开发环境


// const appId = "wx4d62bd61eb6b0330"; //正式环境
// const getOpenIdUrl = "https://wx.bookingyun.com/hotel_wx/rest/wxRest/getSNSUserInfoByEncryptedData";   // 正式环境
// var rootDocment = 'https://cm.bookingyun.com/CenterMaster/'; // 正式环境

function getQuery(url, parms, message, success, fail) {
  var start = new Date().getTime();
  var that = this;
  if (message != "") {
    wx.showLoading({
      title: message,
    })
  }

  wx.request({
    url: rootDocment + url,
    // sName: 'user/sendVerifyCode',  // 这两个参数的作用
    // text: '发送验证码',
    method: 'GET',
    data: parms,
    isLoading: true,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      if (message != "") {
        wx.hideLoading()
      }

      if (res.data.returnCode == '1') {
        success(res);
        var end = new Date().getTime();
        that.sendLog('', 1002, "GET", end - start, url, rootDocment + url, parms, res.data, res.data.returnMessage);
      } else {
        fail(res);
        var end = new Date().getTime();
        that.sendLog('error', 1001, "GET", end - start, url, rootDocment + url, parms, res.data, res.data.returnMessage);
      }
    },
    fail: function (res) {
      if (message != "") {
        wx.hideLoading();
      }
      var end = new Date().getTime();
      that.sendLog('fail', 1003, "GET", end - start, url, rootDocment + url, parms, res.data, res.data.returnMessage);
    }
  })
}

// 发送请求日志到服务器
function sendLog(type, logType, clientMethod, costTime, serviceName, url, contentIn, contentOut, contentException) {

  if (url.indexOf("queryInvoiceHeadsByKeyword") > -1) {  // 剔除掉模糊搜索的日志
    return;
  }
  var that = this;

  let serviceId = '';
  if (url.indexOf('hotel_wx') > -1) {
    serviceId = 3;
  } else {
    serviceId = 1;
  }


  var exceptionName = '';
  var errMsg = "";
  if (type == 'error') {
    exceptionName = contentOut.returnMessage;
    errMsg = errMsg + '错误（' + contentOut.returnMessage + '）,请重试~';
  } else if (type == 'fail') {
    exceptionName = JSON.stringify(contentOut);
    if (exceptionName.errMsg == 'request:fail timeout') {
      errMsg = errMsg + '失败,请求超时,请重试~';
    } else {
      errMsg = errMsg + '失败（' + JSON.stringify(contentOut) + '）,请重试';
    }
  }
  var d = new Date();
  var month = d.getMonth() + 1 > 9 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1);
  var day = d.getDate() > 9 ? d.getDate() : '0' + d.getDate();
  var hh = d.getHours() > 9 ? d.getHours() : '0' + d.getHours();
  var mm = d.getMinutes() > 9 ? d.getMinutes() : '0' + d.getMinutes();
  var ss = d.getSeconds() > 9 ? d.getSeconds() : '0' + d.getSeconds();
  //JSON.stringify(contentIn, null, 2),
  // var clientId = app.globalData.hotelName;
  var parms = {
    logType: logType,
    clientMethod: clientMethod,
    costTime: costTime,
    serviceName: serviceName,
    serviceId: serviceId,
    contentIn: JSON.stringify(contentIn, null, 2),
    contentOut: JSON.stringify(contentOut, null, 2),
    contentException: JSON.stringify(contentException, null, 2),
    clientType: 202,
    // clientId: clientId,
    clientId: getApp().globalData.hotelId,
    exceptionName: '',
    clientTime: d.getFullYear() + month + day + hh + mm + ss
  };

  wx.request({
    url: 'https://log.bookingyun.com/SystemLog/web/logs/insertLog',
    data: that.jsonToUrl(parms),
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function success(res) { },
    fail: function fail(error) { }

  })
}


function jsonToUrl(param, key) {
  var paramStr = "";
  if (param instanceof String || param instanceof Number || param instanceof Boolean) {
    paramStr += "&" + key + "=" + encodeURIComponent(param);
  } else {
    for (var p in param) {
      if (typeof param[p] == "function") {
        param[p]();
      } else {
        if (typeof param[p] == 'undefined') {
          paramStr += "&" + p + "=";
        } else {
          paramStr += "&" + p + "=" + param[p];
        }
      }
    }
  }
  return paramStr.substr(1);
}



function checkSettingStatu(msg) {
  var that = this;
  // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
  wx.getSetting({
    success: function success(res) {
      console.log(res.authSetting);
      var authSetting = res.authSetting;
      if (that.isEmptyObject(authSetting)) {
        console.log('首次授权');
      } else {
        console.log('不是第一次授权', authSetting);
        // 没有授权的提醒
        if (authSetting[msg] === false) {
          wx.hideLoading();
          wx.showModal({
            title: '用户未授权',
            content: '如需正常使用【实名住】功能，请按确定并在授权管理中进行授权，再重新进入小程序即可正常使用。',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.openSetting({
                  success: function success(res) {
                    console.log('openSetting success', res.authSetting);
                  }
                });
              }
            }
          })
        }
      }
    }
  })
}

// 判断数组或js是否为空
function isEmptyObject(value) {
  var name;
  for (name in value) {
    return false;
  }
  return true;
}

module.exports = {
  formatTime: formatTime,
  getQuery: getQuery,
  isEmptyObject: isEmptyObject,
  checkSettingStatu: checkSettingStatu,
  appId: appId,
  getOpenIdUrl: getOpenIdUrl,
  sendLog: sendLog,
  jsonToUrl: jsonToUrl,
}
