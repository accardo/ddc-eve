//app.js
import * as http from 'utils/http.js'
import * as utils from 'utils/util.js'
App({
  onLaunch: function (options) {
	  /*
		 * Description: 登陆获取用户openid；发送 res.code 到后台换取 openId, sessionKey
		 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
		 * Date: 2019/1/9
		 */
	  wx.login({
		  success: res => {
			  http.$_post('getOpenId', {jsCode: res.code}).then(({data}) => {
				  console.log(data.openid, '入口');
				  utils.setCache('openid', data.openid)
				  utils.setCache('sessionKey', data.session_key)
			  })
		  }
	  })
	  /*
		 * Description:  session_key 是否过期，并且在本生命周期一直有效
		 * Author: yanlichen <lichen.yan@daydaycook.com.cn>
		 * Date: 2019/1/10
		 */
	  wx.checkSession({
		  success() {
		    // 操作分享过来数据
		    // console.log('session_key 未过期');
		  },
		  fail() {
			  wx.login() // 重新登录
		  }
	  })
  }
})