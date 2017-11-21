$(function () {
  // 载入提示
  console.log('main.js load start!');

  var fileInput = $('#upImage');
  var troubleDescription = $('#troubleDescription');
  var dateInput = $('#dateInput'); // 拍摄时间自动读取
  var timeInput = $('#timeInput'); // 拍摄时间自动读取
  var locationInput = $('#troubleLocation'); // 定位点获取
  var statusInput = $('#status');
  var reformBox = $('#reformBox');

  // 添加整改图片联动逻辑
  statusInput.change(function() {
    var status = $(this).val();
    if(status == "true") {
      reformBox.show();
    } else {
      reformBox.hide();
    }
  });

  // 上传前得到上传文件信息，读取exif的时间和定位信息，然后改变相应的表单内容
  fileInput.on('change', function(e){ // 监听fileInput文件上传框的内容改变事件
    // input文件改变后，首先要清除原先的旧信息
    locationInput.val('');
    troubleDescription.val('');

    var _file = e.target.files[0]; // 原始文件信息

    EXIF.getData(_file, function(){
      var _datetime = EXIF.getTag(this, 'DateTime'); // exif时间信息
      var _date, _time;
      // 前端显示时间
      if (_datetime) { // 将有时间信息的照片的时间输入框设为不可编辑
        _datetime = _datetime.split(' ');
        _date = _datetime[0].split(':').join('-');
        _time = _datetime[1];
        dateInput.val(_date);
        timeInput.val(_time);
        dateInput.attr('disabled','disabled');
        timeInput.attr('disabled','disabled');
      } else { // 如果没有时间信息，则使用当前时间，时间输入框可编辑
        _datetime = new Date();
        _date = `${_datetime.getFullYear()}-${_datetime.getMonth()+1}-${_datetime.getDate()}`;
        var hours = (_datetime.getHours()<10)?'0'+_datetime.getHours():_datetime.getHours();
        var minutes = (_datetime.getMinutes()<10)?'0'+_datetime.getMinutes():_datetime.getMinutes();
        _time = `${hours}:${minutes}`;
        dateInput.val(_date);
        timeInput.val(_time);
      }

      // 自动添加gps定位信息
      var _gpsLat = EXIF.getTag(this, 'GPSLatitude');
      var _gpsLng = EXIF.getTag(this, 'GPSLongitude');
      // 前端直接显示gps经纬度
      if (_gpsLat && _gpsLng) { // 如果有经纬度，将经纬度信息换算成小数模式后，写入定位输入框内
        var Lat = _gpsLat[0] + (_gpsLat[1]+_gpsLat[2]/60)/60;
        var Lng = _gpsLng[0] + (_gpsLng[1]+_gpsLng[2]/60)/60;
        locationInput.val(Lat + ',' + Lng);
        // 手动触发locationInput的change事件，使地图出现跳动marker
        locationInput.trigger("focus");
      } else {
        // to-do
        // 将来可以添加到页面提示信息栏目
        console.log('照片无gps信息，请手动在地图上点击，添加位置信息');
      }
    });
  });

  // 定义公司范围，随后通过ajax绘制后异步显示地图
  var map = new AMap.Map('map', {
    center: [126.683507, 45.713941],
    zoom: 16,
    rotateEnable: true,
    resizeEnable: true,
    // showBuildingBlock: true,
      // layers: [new AMap.TileLayer.Satellite()],
  });

  // 定义公司
  var companyPolygon = new AMap.Polygon({
    map: map,
    strokeColor: "#0000ff",
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: "#f5deb3",
    fillOpacity: 0.35,
  });
  companyPolygon.areas = [];

  // 异步请求公司数据，在地图上渲染路径
  $.ajax({
    url: '/api/company',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(company) {
    companyPolygon.setPath(company.polygonPath);
    companyPolygon.id = company.id;
  })
  .fail(function() {
    console.log('未查询到公司数据')
  });

  // 异步请求单位数据，并在地图中渲染
  $.ajax({
    url: '/api/company/areas',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(areas) {
    areas.forEach(function(value, index) {
      var area = new AMap.Polygon({
        map: map,
        path: path,
        strokeColor: "#33eeff",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#f5dbe3",
        fillOpacity: 0.35,
        id: area.id
      });
      companyPolygon.areas.push(areaPolygon); 
    });
  })
  .fail(function() {
    console.log('未查询到单位数据')
  })

});