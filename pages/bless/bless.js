// pages/bless/bless.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
	  blessData: [],
	  bg: '',
      blessText: '',
      currentIndex: -1,
      blessList: [],
      isBottomShow: false,  //底部操作默认隐藏
      status: 0,      //输入框是否聚焦，0代表否，1代表是
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  wx.hideShareMenu();
	  this.data.blessData = JSON.parse(options.deskData);
	  this.data.bg = options.bg;
		this.getBless();
  },
	/*
	 * Description: 获取祝福语
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/16
	 */
	getBless() {
		wx.showLoading({
			title: '数据加载中...',
		})
		let data = {
			pageName: '祝福语'
		}
		app.http.$_post('getBless', data).then((xhr) => {
			this.setData({
				blessList: xhr.data,
				isBottomShow: true
			})
			wx.hideLoading();
		})
	},
	bindBless(e) {
    this.setData({
	    blessText: e.detail.value,
      currentIndex: -1,
    })
  },
	bindList(e) {
    let index = e.currentTarget.dataset.index;
		this.setData({
			blessText: e.currentTarget.dataset.text,
      currentIndex: index
		})
  },
	/*
	 * Description: 生命周期函数--监听页面初次渲染完成
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/21
	 */
  bindNext() {
    if (this.data.blessText == '' || this.data.blessText == null) {
	    app.utils.showToast('请填写祝福语')
      return false
    }
    this.subSave();
  },
	/*
	 * Description: 提交保存数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/16
	 */
	subSave() {
		let data = {
			pageName: '祝福语',
			bless: this.data.blessText,
			ids: app.utils.dishId(this.data.blessData)
		}
		app.http.$_post('clickNext', data).then(() => {
			app.utils.navigateTo('../result/result', {
				resultData: JSON.stringify(this.data.blessData),
				bg: this.data.bg,
				blessText: this.data.blessText
			})
		});
	},
  /*
  * Description: 输入框聚焦  失去焦点
  * Author: wangjingjing <jingjing.wang@daydaycook.com.cn>
  * Date: 2019/1/21
  */
  focus: function(){
    this.setData({
        status: 1,
    });
  },
  blur: function(){
    this.setData({
        status: 0,
    });
  },
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