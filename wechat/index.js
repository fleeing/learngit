var mqtt = require('../../utils/mqtt.min.js')
const crypto = require('../../utils/hex_hmac_sha1.js');
var wxCharts = require('../../utils/wxcharts.js');
const app = getApp();
var daylineChart = null;
var yuelineChart = null;
var  that =this;
var D0=60,D1=60,D2=60,D3=60,D4=60,D5=70;



Page({

  /**
   * 页面的初始数据
   */
  data: {
    showView: true,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.doConnect();
    showView: (options.showView == "flase" ? true : false);
    this.getMothElectro();
    this.setData(
      {
        humidity: 60
      }
    )
  },




















  doConnect: function () {
    var that = this;
    const deviceConfig = {
      productKey: "a1OBweWWN85",
      deviceName: "weixin",
      deviceSecret: "KHgDKc6GBjKMf0Bhld4R6u8UoXBZTmio",
      regionId: "cn-shanghai"
    };
    const options = this.initMqttOptions(deviceConfig);
    console.log(options)
    //替换productKey为你自己的产品的
    const client = mqtt.connect('wxs://productKey.iot-as-mqtt.cn-shanghai.aliyuncs.com', options)
    app.globalData.client = client;
    client.on('connect', function () {
      console.log('连接服务器成功')
      client.subscribe('/sys/a1OBweWWN85/weixin/thing/service/property/set', function (err) {
        if (!err) {
          console.log('订阅成功！');
        }
      })
    })

    client.on('message', function (topic, message) {
      // message is Buffer
      console.log('收到消息：' + message.toString())
      let a = JSON.parse(message);
      
      console.log(a.items.HeartBeatInterval.value);
      
      D5 = a.items.HeartBeatInterval.value;
      D0=D1;
      D1=D2;
      D2=D3;
      D3=D4; 
      D4=D5;
      that.getMothElectro();
      that.setData(
        {
          humidity: a.items.HeartBeatInterval.value
        
        }
      )
      //关闭连接 client.end()
      //向表里添加信息



    })

    //发送数据
    // const topic = "/sys/a1T57L0CHoU/sensor_1/thing/event/property/post";
    // console.log(topic);
    // console.log("发送数据！！");
    // console.log(client);


    // setInterval(function () {
    //   //发布数据到topic
    //   client.publish(topic, getPostData(), { qos: 1 });
    // }, 5000);

    // function getPostData() {
    //   const payloadJson = {
    //     id: Date.now(),
    //     params: {
    //       SoilMoisture: Math.floor((Math.random() * 20) + 60)
    //     },
    //     method: "thing.event.property.post"
    //   }

    //   console.log("===postData\n topic=" + topic)
    //   console.log(payloadJson)

    //   return JSON.stringify(payloadJson);
    // }

  },
  initMqttOptions(deviceConfig) {

    const params = {
      productKey: deviceConfig.productKey,
      deviceName: deviceConfig.deviceName,
      timestamp: Date.now(),
      clientId: Math.random().toString(36).substr(2),
    }
    //CONNECT参数
    const options = {
      keepalive: 60, //60s
      clean: true, //cleanSession不保持持久会话
      protocolVersion: 4 //MQTT v3.1.1
    }
    //1.生成clientId，username，password
    options.password = this.signHmacSha1(params, deviceConfig.deviceSecret);
    options.clientId = `${params.clientId}|securemode=2,signmethod=hmacsha1,timestamp=${params.timestamp}|`;
    options.username = `${params.deviceName}&${params.productKey}`;

    return options;
  },
  signHmacSha1(params, deviceSecret) {

    let keys = Object.keys(params).sort();
    // 按字典序排序
    keys = keys.sort();
    const list = [];
    keys.map((key) => {
      list.push(`${key}${params[key]}`);
    });
    const contentStr = list.join('');
    return crypto.hex_hmac_sha1(deviceSecret, contentStr);
  },


  onChangeShowState: function (options) {
    var that = this;
    showView: (options.showView == "flase" ? true : false);
    that.setData({
      showView: (!that.data.showView)
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

  },

  selectHumidityData: function () {
    var that = this
    var timestamp = Date.parse(new Date());
    //timestamp = timestamp / 1000;
    console.log("当前时间戳为：" + timestamp);
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('humidityData')
      .where({
        humidityDate: _.gt(1576574626515)
      }).get({
        success: res => {
          console.log(res.data);
          that.getMothElectro(res.data);
        }, fail: err => {  //连接失败返回的信息

          console.log("数据库连接失败");
        }
      }
      )


  },

  getMothElectro: function () {
    console.log("chart 数据输出");

    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    yuelineChart = new wxCharts({ //当月用电折线图配置
      canvasId: 'yueEle',
      type: 'line',
      categories: ['1', '2', '3', '4', '5'], //categories X轴
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '统计',
        //data: yuesimulationData.data,
        data: [D0, D1, D2,D3,D5],
        format: function (val, name) {
          return val.toFixed(2) + 'kWh';
        }
      }],
    
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '心跳',
        format: function (val) {
          return val.toFixed(2);
        },
        max: 150,
        min: 30
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },






})