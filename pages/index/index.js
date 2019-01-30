// pages/index/index.js
import * as http from '../../utils/http.js'
import * as utils from '../../utils/util.js'
const app = getApp();
      app.http = http
      app.utils = utils
Page({

  /**
   * 页面的初始数据
   */
  data: {
  	uid: '',
  },
	/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  	app.utils.getVersion();
		let scene = decodeURIComponent(options.scene);
		let uid = '';
		if (scene !== 'undefined') {
			uid = app.utils.getQueryString(scene, ['uid']).uid;
		} else {
			uid = options.uid || ''
		}
		this.data.uid = uid
	},
	/*
	 * Description: 授权获取用户信息
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/9
	 */
	bindNext(e) {
	  const openid = app.utils.getCache('openid');
		let userInfo = e.detail.userInfo;
		if (openid) {
	  	 let data = {
			  pageName: '扫码入口',
			  nickName: userInfo && userInfo.nickName || '神秘的美食家',
			  gender: userInfo && userInfo.gender || 1,
			  language: userInfo && userInfo.language || '未知',
			  city: userInfo && userInfo.city || '未知',
			  province: userInfo && userInfo.province || '未知',
			  country: userInfo && userInfo.country || '未知',
			  avatarUrl: userInfo && userInfo.avatarUrl || 'https://mcn-video.daydaycook.com.cn/4f4ea624af9e411f83d9ea155d8d9c87.png',
			  otherOpenId: this.data.uid
		  }
			this.getPutUserInfo(data);
		} else {
			app.utils.showToast('openid不存在，请重新进入');
		}
  },
	getPutUserInfo(data) {
		wx.showLoading({
			title: '请稍后...',
		})
		app.http.$_post('putUserInfo', data).then((xhr) => {
			wx.hideLoading();
			app.utils.setCache('uid', xhr.data.uid);
			app.utils.setCache('qrCode', xhr.data.qrCode);
			app.utils.setCache('nickName', data.nickName);
			app.utils.navigateTo('../desk/desk');
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