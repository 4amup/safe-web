$(function() {
  // 定义地图
  var map = new AMap.Map('map', {
      center: [126.683507, 45.713941],
      zoom: 16,
      rotateEnable: true,
      resizeEnable: true,
      // showBuildingBlock: true,
      // layers: [new AMap.TileLayer.Satellite()],
  });
  // 加载鼠标绘制多边形插件
  var mouseTool = new AMap.MouseTool(map); //在地图中添加MouseTool插件
  map.plugin(mouseTool);

  // 定义公司
  var companyPolygon = new AMap.Polygon({
    map: map,
    strokeColor: "#0000ff",
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: "#f5deb3",
    fillOpacity: 0.35,
  });
  companyPolygon.departments = [];

  // 异步请求公司数据，在地图上绘制
  $.ajax({
    url: '/api/company',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(company) {
    var path = JSON.parse(company.polygonPath).map(function(value, index) {
      return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
    });
    companyPolygon.id = company.id; // 将id赋给多边形
    $('.companyBox').attr('id', company.id);
    companyPolygon.setPath(path); // 根据path将company的多边形显示在地图上。
  })
  .fail(function() {
    console.log('公司数据未上传')
  });

  $('.editCompany').click(function (ev) {
    ev.preventDefault();

    var form = ev.target.closest('form');
    form.attr('method', 'PUT')
    .attr('action', 'api/company/' + $('.companyShow').id)
    .attr('id', 'updateCompany');
  });

  // 编辑地图按钮
  $('.companyBox').on('click', 'input:button', function() {
    map.setMapStyle('amap://styles/grey'); // 设置地图特殊样式，提示可以开始划范围了
    mouseTool.polygon();
    // 添加重画按钮
    $('.buttonBox').append($('<input>').attr('type', 'button').attr('value', '重画').attr('id', 'restPolygon'));
    $('.buttonBox').append($('<input>').attr('type', 'button').attr('value', '编辑').attr('id', 'editPolygon'));
    $('.buttonBox').append($('<input>').attr('type', 'button').attr('value', '结束编辑').attr('id', 'overPolygon'));

    AMap.event.addListener( mouseTool,'draw',function(e){ // 监听鼠标画完事件
      var companyPath = e.obj.getPath();
      mouseTool.close(true); //画完后把画的图擦除
      companyPolygon.setPath(companyPath);
      editCompanyPolygon = new AMap.PolyEditor(map,companyPolygon); // 接着把绘制的多边形变成可编辑状态
      // 添加重画事件按钮事件
      AMap.event.addDomListener(document.getElementById('restPolygon'), 'click', function() {
        editCompanyPolygon.close();
        companyPolygon.setMap(null);
      }, false);
      // 添加重画事件按钮事件
      AMap.event.addDomListener(document.getElementById('editPolygon'), 'click', function() {
        editCompanyPolygon.open();
      }, false);
      // 添加重画事件按钮事件
      AMap.event.addDomListener(document.getElementById('overPolygon'), 'click', function() {
        editCompanyPolygon.close();
      }, false);
    });
  });

  // ajax异步提交
  $('#createCompany').submit(function(ev) {
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPolygon.getPath())
    })
    .done(function(company) {
      console.log(`公司信息${form.attr('method')}成功`);
      console.log(company);
      companyPolygon.id = company.id;
      editCompanyPolygon.close();
      // 前端显示刚上传的数据。
      $('.companyBox span:eq(0)').text(company.name);
      $('.companyBox span:eq(1)').text(company.info);
      $('.companyBox a:eq(1)').attr('href', `api/company/${company.id}`);
      $('#updateCompany').attr('action', `api/company/${company.id}`);
      var path = JSON.parse(company.polygonPath).map(function(value, index) {
        return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
      });
      companyPolygon.setPath(path);
      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('#restPolygon').remove();
      $('#overPolygon').remove();
      $('#editPolygon').remove();
    });
  });

  // 修改公司数据
  $('#updateCompany').submit(function(ev) {
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPolygon.getPath())
    })
    .done(function(company) {
      console.log(`公司信息${form.attr('method')}成功`);
      console.log(company);
      companyPolygon.id = company.id;
      editCompanyPolygon.close();
      var path = JSON.parse(company.polygonPath).map(function(value, index) {
        return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
      });
      companyPolygon.setPath(path);
      // 前端显示刚上传的数据。
      $('.companyBox span:eq(0)').text(company.name);
      $('.companyBox span:eq(1)').text(company.info);
      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('#restPolygon').remove();
      $('#overPolygon').remove();
      $('#editPolygon').remove();
    });
  });

  // 删除数据
  $('.companyBox').on('click', 'a.deleteItem', function(ev) {
    var item = $(ev.target);
    ev.preventDefault();
    $.ajax({
      url: item.attr('href'),
      type: 'DELETE'
    })
    .done(function(data) {
      console.log(data);
      console.log('公司信息DELETE成功');
      companyPolygon.setPath(null);
      $('.companyBox span:eq(0)').text(null);
      $('.companyBox span:eq(1)').text(null);
      $('#restPolygon').remove();
      $('#overPolygon').remove();
      $('#editPolygon').remove();
    })
    .fail(function() {
      console.log('公司信息DELETE失败');
    });
  });
})