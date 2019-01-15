// pages/result.js
import util from "../../utils/util";

const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
	  resultData: [],
    resultBg: '',
	  resultText: '',
	  logo: '../../images/logo.png',
	  close: '../../images/close.png',
	  code: '../../images/code.png',
	  resultArray: [],
	  canvasBg: '',
	  codeBg: '../../images/codeBg.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.setData({
      resultData: JSON.parse(options.resultData),
      resultBg: options.bg,
	    resultText: options.blessText,
    })


  },
	/**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
		const ctx = wx.createCanvasContext('canvasId');
		Promise.all([this.getImageInfoBg()].concat(this.getImageInfo())).then((sucRes) => {
			sucRes.shift()
			this.data.resultData.forEach((item, index) => {
				item.src = sucRes[index].path
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

		// this.data.resultData.forEach((item) => {
		// 	 this.data.resultArray.push(item.id)
		// })
			//console.log(this.data.resultArray.toString(), 'ctx');
  },
	/*
	 * Description: 绘制图片
	 * Types：ctx -> node
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/12
	 */
	drawImg(ctx) {
		ctx.setFillStyle('#fff')
		ctx.fillRect(0, 0, 375, 500)
		ctx.drawImage(this.data.resultBg, 0, 35, 375, 334); // 绘制背景图
		ctx.drawImage(this.data.logo, 80, 8, 18, 18) // 绘制logo
		ctx.drawImage(this.data.close, 102, 12, 10, 10) // 绘制close
		ctx.drawImage(this.data.code, 270, 330, 100, 100) // 绘制code
		this.data.resultData.sort(this.sortNumber('zindex')) // 排序之后绘制层级
		this.data.resultData.forEach((item) => { // 绘制 手动添加的菜品
			ctx.drawImage(item.src, item.x, item.y + 35, 74, 74);
		})
	},
	/*
	 * Description: 绘制文字
	 * Types：ctx -> node
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/12
	 */
	drawText(ctx) {
		let userInfo = app.utils.getCache('userInfo');
		ctx.setFontSize(14);
		ctx.setFillStyle("#000");
		ctx.fillText(`${userInfo.nickName}的新年餐桌`, 120, 22)
		ctx.setTextAlign('center');
		ctx.setFillStyle("#fb7f59");
		ctx.fillText(this.data.resultText, wx.getSystemInfoSync().windowWidth / 2, 60);
		ctx.setFillStyle("#000");
		ctx.fillText('扫码搭配你的新年餐桌', 170, 400);
		ctx.fillText('日日煮APP，发现生活的味道', 150, 420);
	},
	/*
	 * Description: 对网络图片进行遍历下载之后在绘制canvas
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/12
	 */
	getImagePromiseArr(item) {
	 	return new Promise((resolve, reject) => {
		  wx.getImageInfo({
			  src: item.src, // 服务器返回的带参数的小程序码地址
			  success: resolve,
			  fail: function () {
				  app.utils.showToast('图片资源获取失败');
			  }
		  })
	  })
	},
	getImageInfo() {
	 	let promiseArr = []
		this.data.resultData.map((itm) => {
			promiseArr.push(this.getImagePromiseArr(itm))
		})
		return promiseArr
	},

	/*
	 * Description: 单个图片下载处理
	 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
	 * Date: 2019/1/12
	 */
	getImageInfoBg(){
		let that = this;
		return new Promise((resolve => {
			wx.getImageInfo({
				src: that.data.resultBg, // 服务器返回的带参数的小程序码地址
				success: function (res) {
					console.log(res, 'getImageInfoBg');
					that.data.resultBg = res.path
					resolve(true)
				},
				fail: function () {
					app.utils.showToast('图片资源获取失败');
				}
			})
		}))
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
	canvasSave() {
		let that = this;
		wx.getSetting({
			success(res) {
				console.log(res, '授权')
				if (!res.authSetting['scope.writePhotosAlbum']) {
					wx.authorize({
						scope: 'scope.writePhotosAlbum',
						success(res) {
							console.log(res)
								wx.saveImageToPhotosAlbum({
									filePath: that.data.canvasBg,
									success(res) {
										console.log(res)
										wx.showToast({
											title: '保存成功'
										})
									},
									fail() {
										wx.showToast({
											title: '保存失败',
											icon: 'none'
										})
									}
								})
						},
						fail() {
							this.canvasSave()
							console.log('授权失败')
						}
					})
				}
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
			width: 375,
			height: 500,
			fileType: 'jpg',
			canvasId: 'canvasId',
			success(res) {
				that.setData({
					canvasBg: res.tempFilePath
				})
				// wx.getSetting({
				// 	success(res){
				// 		if (!res.authSetting['scope.writePhotosAlbum']) {
				// 			wx.authorize({
				// 				scope: 'scope.writePhotosAlbum',
				// 				success() {
				// 					wx.saveImageToPhotosAlbum({
				// 						filePath: res.tempFilePath,
				// 						success() {
				// 							wx.showToast({
				// 								title: '保存成功'
				// 							})
				// 						},
				// 						fail() {
				// 							wx.showToast({
				// 								title: '保存失败',
				// 								icon: 'none'
				// 							})
				// 						}
				// 					})
				// 				},
				// 				fail() {
				// 					// 如果用户拒绝过或没有授权，则再次打开授权窗口
				// 					//（ps：微信api又改了现在只能通过button才能打开授权设置，以前通过openSet就可打开，下面有打开授权的button弹窗代码）
				// 					// that.setData({
				// 					//   openSet: true
				// 					// })
				// 				}
				// 			})
				// 		}else{
				// 			wx.saveImageToPhotosAlbum({
				// 				filePath: res.tempFilePath,
				// 				success() {
				// 					wx.showToast({
				// 						title: '保存成功'
				// 					})
				// 				},
				// 				fail() {
				// 					wx.showToast({
				// 						title: '保存失败',
				// 						icon: 'none'
				// 					})
				// 				}
				// 			})
				// 		}
				// 	}
				// })
				 		}
		})
	},
	viewOpen() {
		app.utils.navigateTo('../webView/webView')
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
  onShareAppMessage () {

  }
})