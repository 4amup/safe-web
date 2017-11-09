$(function() {
  var map = new AMap.Map('map', {
      center: [126.683507, 45.713941],
      zoom: 16,
      rotateEnable: true,
      // showBuildingBlock: true,
      layers: [new AMap.TileLayer.Satellite()],
  });

  // 如果有公司的数据，则新建一个公司范围的polygon
  if($('.companyBox span:eq(0)').text() !== "") {
    var companyPolygon = new AMap.Polygon({
      map: map,
      strokeColor: "#0000ff",
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: "#f5deb3",
      fillOpacity: 0.35
    });
    companyPolygon.id = $('.companyBox').attr('id');

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
      companyPolygon.setPath(path); // 根据path将company的多边形显示在地图上。
    });

    // 获取前端信息后，循环写部门的polygon
    if($('.departmentBox').length) {
      companyPolygon.departments = new Array($('.departmentBox').length);
      for(var i=0; i<$('.departmentBox').length; i++) {
        companyPolygon.departments[i] = new AMap.Polygon({
          map: map,
          strokeColor: "#0000ff",
          strokeOpacity: 1,
          strokeWeight: 1,
          fillColor: "#f5deb3",
          fillOpacity: 0.35
        });
        companyPolygon.departments[i].id = $(`.departmentBox:eq(${i})`).attr('id');
      }

      // 异步请求部门数据，在地图上绘制
      $.ajax({
        url: `/api/company/${companyPolygon.id}/departments`,
        type: 'GET',
        dataType: 'json'
      })
      .done(function(departments) {
        for (var j=0; j<departments.length; j++) {
          var departmentPath = JSON.parse(departments[j].polygonPath).map(function(value, index) {
            return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
          });
          companyPolygon.departments[j].setPath(departmentPath);
        }
      });
    }
  };

  // 加载页面的一些基础工具
  AMap.plugin(['AMap.ToolBar','AMap.Scale','AMap.MapType', 'AMap.Geolocation'],
  function(){
    map.addControl(new AMap.ToolBar());

    map.addControl(new AMap.Scale());
    // map.addControl(new AMap.MapType());
    map.addControl(new AMap.Geolocation());
  });

  // 加载鼠标绘制多边形插件
  var mouseTool = new AMap.MouseTool(map); //在地图中添加MouseTool插件
  map.plugin(mouseTool);

  var companyPolygon;
  // 添加事件监听按钮点击
  AMap.event.addDomListener(document.getElementById('addCompanyArea'), 'click', function() {
    mouseTool.polygon(); //用鼠标工具画多边形
  }, false);
  // 定义多边形的路径，待后面赋值
  // 监听鼠标画完事件
  AMap.event.addListener( mouseTool,'draw',function(e){ //添加事件
    var companyPath = e.obj.getPath();
    mouseTool.close(true); //画完后把画的图擦除
    companyPolygon = new AMap.Polygon({
      map: map,
      path: companyPath,
      strokeColor: "#0000ff",
      strokeOpacity: 1,
      strokeWeight: 1,
      fillColor: "#f5deb3",
      fillOpacity: 0.35,
      departments: []
    });
    editCompanyPolygon = new AMap.PolyEditor(map,companyPolygon); // 接着把绘制的多边形变成可编辑状态
    editCompanyPolygon.open();
    // 添加确认/结束按钮
    $('#buttonBox').append($('<input>').attr('type', 'button').attr('value', '重画范围').attr('id', 'restArea'));
    $('#buttonBox').append($('<input>').attr('type', 'button').attr('value', '编辑范围').attr('id', 'editArea'));
    $('#buttonBox').append($('<input>').attr('type', 'button').attr('value', '确认范围').attr('id', 'confirmArea'));
    // 确认多边形范围dom事件
    AMap.event.addDomListener(document.getElementById('confirmArea'), 'click', function() {
      editCompanyPolygon.close();
    }, false);
    // 确认多边形范围dom事件
    AMap.event.addDomListener(document.getElementById('editArea'), 'click', function() {
      editCompanyPolygon.open();
    }, false);
    // 添加重画事件按钮事件
    AMap.event.addDomListener(document.getElementById('restArea'), 'click', function() {
      editCompanyPolygon.close();
      companyPolygon.setMap(null);
      $('#restArea').remove();
      $('#editArea').remove();
      $('#confirmArea').remove();
    }, false);
  });
  // ajax异步提交
  $('form:eq(0)').submit(function(ev) {
    // 取消默认的提交事件，使用ajax提交表单
    ev.preventDefault();
    var form = $(this);
    $.ajax({
      url: form.attr('action'),
      type: 'POST',
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPolygon.getPath())
    })
    .done(function(company) {
      console.log('公司信息上传成功');
      console.log(company);
      companyPolygon.id = company.id;
      // 前端显示刚上传的数据。
      $('.companyBox span:eq(0)').text(company.name);
      $('.companyBox span:eq(1)').text(company.info);
      // 添加修改公司的表单并删除增加公司的表单
      var updateCompanyForm = $('<form>')
      .attr('action', `/api/company/${company.id }`)
      .attr('method', 'PUT')
      .attr('id', 'updateCompany')
      .html(
      `<div>
        <label for="companyName">修改公司名称：</label>
        <input type="text" name="name" id="companyName">
      </div>
      <div>
        <label for="companyInfo">修改公司简介：</label>
        <input type="text" name="info" id="companyInfo"></input>
      </div>
      <div>
        <input type="submit" value="保存">
      </div>`
      );
      $('.companyBox').append(updateCompanyForm);
      $('#createCompany').remove();
      // 实时显示更新的地图
    });
  });


  // ajax异步提交
  $('form:eq(1)').submit(function(ev) {
    // 提交前将编辑中的多边形去掉
    drawPolygon.setMap(null);
    // 取消默认的提交事件，使用ajax提交表单
    ev.preventDefault();
    var form = $(this);
    $.ajax({
      url: form.attr('action'),
      type: 'POST',
      data: form.serialize()+'&polygonPath='+ JSON.stringify(editpath)
    })
    .done(function(department) {
      console.log('单位信息上传成功');
      console.log(department);
      // // 前端显示刚上传的数据。
      // $('.companyBox span:eq(0)').text(company.id);
      // $('#companyBox span:eq(1)').text(company.name);
      // $('#companyBox span:eq(2)').text(company.info);
      // // 实时显示更新的地图
      // var companyPolygon = new AMap.Polygon({
      //   map: map,
      //   path: editpath,
      //   strokeColor: "#0000ff",
      //   strokeOpacity: 1,
      //   strokeWeight: 3,
      //   fillColor: "#f5deb3",
      //   fillOpacity: 0.35
      // });
    });
  });

    // 异步更新公司数据
    $('#updateCompany').submit(function(ev) {

    });
})