// pages/result.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
	  resultData: [], // 数据源
    resultBg: '', // 背景桌
	  resultText: '', // 祝福语
	  shareImg: '../../images/shareImg.jpg',
	  resultTextBg: '../../images/text-bg.png',
	  logoBg: '../../images/logo.png',
	  closeBg: '../../images/close.png',
	  code: '',
	  canvasBg: '', // 图片路径
	  saveImgBtnHidden: true, // 保存相册
	  openSettingBtnHidden: false, // 去授权
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.setData({
      resultData: JSON.parse(options.resultData),
      resultBg: options.bg,
	    resultText: options.blessText,
	    code: app.utils.getCache('qrCode'),
    })
  },
	/**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
  	this.getInit();
  },
	/*
	 * Description: 数据初始化
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/28
	 */
	getInit() {
		const ctx = wx.createCanvasContext('canvasId');
		wx.showLoading({
			title: '请稍后...',
		})
		let imageArray = [
			this.getImagePromiseArr(this.data.resultBg),
			this.getImagePromiseArr(this.data.code),
			...this.getImageInfo()
		]
		Promise.all(imageArray).then((sucRes) => {
			wx.hideLoading();
			this.data.resultBg = sucRes[0].path;
			this.data.code = sucRes[1].path;
			sucRes.splice(0,2)
			this.data.resultData.forEach((item, index) => { // 拉取微信服务器数据之后重新复制 开始绘制
				item.foodImg = sucRes[index].path
			})
			this.drawImg(ctx);
			this.drawText(ctx);
			ctx.draw();
			setTimeout(() => {
				this.drawPicture();
			}, 500)
		}, () => {
			app.utils.showToast('图片资源获取失败');
		})
	},
	/*
	 * Description: 绘制图片
	 * Types：ctx -> node
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/12
	 */
	drawImg(ctx) {
		let nickName = app.utils.getCache('nickName'); // 获取用户信息
		const metrics = ctx.measureText(`${nickName}的新年餐桌`);
		ctx.setFillStyle('#fff')
		ctx.fillRect(0, 0, this.remSize(375), this.remSize(500))
		ctx.drawImage(this.data.resultBg, 0, 80, this.remSize(375), this.remSize(334)); // 绘制背景图
		ctx.drawImage(this.data.closeBg, (wx.getSystemInfoSync().windowWidth / 2) - (metrics.width * 1.4 / 2) + this.remSize(12), this.remSize(16), this.remSize(12), this.remSize(12)); // 绘制X标识
		ctx.save();
		ctx.beginPath(); //开始绘制
		//先画个圆
		ctx.arc(this.remSize(100) / 2 + this.remSize(265), this.remSize(100) / 2 + this.remSize(375), this.remSize(100) / 2, 0, Math.PI * 2);
		ctx.clip();//画好了圆 剪切
		ctx.drawImage(this.data.code, this.remSize(265), this.remSize(375), this.remSize(100), this.remSize(100));
		ctx.restore();
		this.data.resultData.sort(this.sortNumber('zindex')) // 排序之后绘制层级
		this.data.resultData.forEach((item) => { // 绘制 手动添加的菜品
			ctx.drawImage(item.foodImg, item.x, item.y + 80, this.remSize(60), this.remSize(60));
		})
	},
	/*
	 * Description: 绘制文字
	 * Types：ctx -> node
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/12
	 */
	drawText(ctx) {
		let nickName = app.utils.getCache('nickName'); // 获取用户信息
		const metrics = ctx.measureText(`${nickName}的新年餐桌`);
		ctx.setFontSize(14);
		ctx.setFillStyle("#000");
		ctx.fillText('日日煮', (wx.getSystemInfoSync().windowWidth / 2) - (metrics.width * 1.4 / 2) - this.remSize(34), this.remSize(28)) // 绘制头信息
		ctx.fillText(`${nickName}的新年餐桌`, (wx.getSystemInfoSync().windowWidth / 2) - (metrics.width * 1.4 / 2) + this.remSize(30), this.remSize(28)) // 绘制头信息
		ctx.setTextAlign('center');
		ctx.setFontSize(20);
		ctx.fillText(this.data.resultText, wx.getSystemInfoSync().windowWidth / 2, 65); // 祝福居中
		ctx.setFontSize(16);
		ctx.fillText('长按识别生成你的年夜饭', this.remSize(170), this.remSize(465));
	 	// ctx.fillText('搭配你的餐桌，讲述新年故事', this.remSize(135), this.remSize(465));
	},
	/*
		*Description: 按照375大小转换px 计算不同屏幕设备大小转换
		*
		* Author: yanlichen <lichen.yan@daydaycook.com.cn>
		* Date: 2019/1/7
	*/
	remSize (num) {
		let scale = wx.getSystemInfoSync().windowWidth / 375
		return num * scale
	},
	/*
	 * Description: 重新拉取 二维码数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/28
	 */
	getCodeImg() {
		app.http.$_post('putUserInfo').then((xhr) => {
			this.data.code = xhr.data.qrCode;
			app.utils.setCache('qrCode', xhr.data.qrCode)
			this.getInit();
		})
	},
	/*
	 * Description: 对网络图片进行下载之后在绘制canvas imgSrc:图片路径地址
	 * Types：imgSrc -> String
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/12
	 */
	getImagePromiseArr(imgSrc) {
		let that = this;
		return new Promise((resolve, reject) => {
		  wx.getImageInfo({
			  src: imgSrc, // 服务器返回的带参数的小程序码地址
			  success: resolve,
			  fail: function () {
				  app.utils.showToast('获取资源失败, 重新获取');
			  	setTimeout(()=> {
					  that.getCodeImg();
				  }, 800)
			  }
		  })
	  })
	},
	/*
	 * Description: 循环拉取微信服务端数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/15
	 */
	getImageInfo() {
	 	let promiseArr = []
		this.data.resultData.map((item) => {
			promiseArr.push(this.getImagePromiseArr(item.foodImg))
		})
		return promiseArr
	},
	/*
	 * Description: 数组对象进行有小到大排序
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/7
	 */
	sortNumber(property) {
		return function(a,b){
			var value1 = a[property];
			var value2 = b[property];
			return value1 - value2;
		}
	},
	/*
	 * Description: 保存相册
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/15
	 */
	canvasSave() {
		let that = this;
		wx.getSetting({
			success(res) {
				if (!res.authSetting['scope.writePhotosAlbum']) {
					wx.authorize({
						scope: 'scope.writePhotosAlbum',
						success() { // 第一次 直接授权保存
							that.subSave()
							that.saveImageToPhotosAlbum();
						},
						fail() {
							that.setData({
								saveImgBtnHidden: false,
								openSettingBtnHidden: true
							})
						}
					})
				} else { // 拒绝授权之后 在授权执行保存
					that.subSave();
					that.saveImageToPhotosAlbum();
				}
			}
		})
	},
	/*
	 * Description: 提交保存数据
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/16
	 */
	subSave() {
		let data = {
			pageName: '用户提交',
			bless: this.data.resultText,
			ids: app.utils.dishId(this.data.resultData)
		}
		app.http.$_post('clickNext', data).then(() => {});
	},
	/*
	 * Description: 保存到相册
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/15
	 */
	saveImageToPhotosAlbum() {
		let that = this;
		wx.saveImageToPhotosAlbum({
			filePath: that.data.canvasBg,
			success() {
				app.utils.showToast('保存成功，快去分享吧', 3000);
			},
			fail() {
				app.utils.showToast('保存失败')
			}
		})
	},
	/*
	 * Description: 生产图片路径  显示在页面
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/15
	 */
	drawPicture() {
		let that = this;
		wx.canvasToTempFilePath({
			x: 0,
			y: 0,
			width: that.remSize(375),
			height: that.remSize(500),
			fileType: 'jpg',
			canvasId: 'canvasId',
			success(res) {
				that.setData({
					canvasBg: res.tempFilePath
				})
			}
		})
	},
	/*
	 * Description: 相册二次授权
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/15
	 */
	handleSetting(e) {
		if (!e.detail.authSetting['scope.writePhotosAlbum']) {
			wx.showModal({
				title: '警告',
				content: '若不打开授权，则无法将图片保存在相册中！',
				showCancel: false
			})
			this.setData({
				saveImgBtnHidden: false,
				openSettingBtnHidden: true
			})
		} else {
			wx.showModal({
				title: '提示',
				content: '您已授权，赶紧将图片保存在相册中吧！',
				showCancel: false
			})
			this.setData({
				saveImgBtnHidden: true,
				openSettingBtnHidden: false
			})
		}
	},
	/*
	 * Description: 开放能力 跳转
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/15
	 */
	bindNavTo() {
		wx.navigateToMiniProgram({
			appId: 'wx50794ebcda998678',
			path: '/pages/ddctime/ddctime',
			extraData: {
				foo: 'bar'
			},
			envVersion: 'develop',
			success(res) {
				// 打开成功
			}
		})
	},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(options){
	  let uid = app.utils.getCache('uid');
	  let shareObj = {
		  title: "搭配你的餐桌，讲述您的新年故事", // 默认是小程序的名称
		  path: `/pages/index/index?uid=${uid}`,  // 默认是当前页面，必须是以‘/’开头的完整路径
		  imageUrl: '',  //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
		  success (res) {// 转发成功之后的回调
			  if (res.errMsg == 'shareAppMessage:ok') {}
		  },
		  fail () {// 转发失败之后的回调
			  if (res.errMsg == 'shareAppMessage:fail cancel') {// 用户取消转发
			  }else if (res.errMsg == 'shareAppMessage:fail') {// 转发失败，其中 detail message 为详细失败信息
			  }
		  },
		  complete(){// 转发结束之后的回调（转发成不成功都会执行）
		  }
	  }
	  // 来自页面内的按钮的转发
	  if (options.from == 'button') {
		  // var dataid = options.target.dataset; //data-id=shareBtn
	  }
	  return shareObj;
  },
})