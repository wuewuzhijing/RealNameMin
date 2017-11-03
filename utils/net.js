var util = require("util.js");

function getUserTitleList(userid,obj) {
  util.getQuery('invoice/getUserInvoiceHeads',
   { userId: userid },
    "加载中",
    function success(res) {
      if (res.data.list && res.data.list.length > 0){
        // let list = JSON.stringify(res.data.list);
        //console.log(res.data.list);
        obj.setData({
          list_title: res.data.list,
        });
      }
  }, function fail(res) {
    console.log("获取抬头列表失败");
  })
}

function updateUserPnone(userId, mobile, verityCode, obj ){
  util.getQuery('user/updateUserPnone',
    {
      userId: userId,
      mobile: mobile,
      needVerifyCode: true,
      inputVerifyCode: verityCode
    },
    "加载中",
    function success(res) {
      if (res.data) {
        obj.setData({
          commitState: false,
          loginType: 2,
          countdown: 0 ,//结束倒计时
          mobile: mobile
        });
      }
    }, function fail(res) {
      wx.showToast({
        title: res.data.returnMessage,
        icon: "loading"
      })
    })
}

function getHotel(hotelid , obj) {
  util.getQuery('hotel/getHotelSimpleInfoById',
    { hotelId: hotelid },
    "",
    function success(res) {
      console.log("获取酒店信息成功");
      obj.setData({
        hotelName: res.data.hotelName,
      });
    }, function fail(res) {
      wx.showToast({
        title: res.data.returnMessage,
        icon:"loading"
      })
    })
}

module.exports = {
  getHotel: getHotel,                  //获取酒店信息
  updateUserPnone: updateUserPnone,

}
