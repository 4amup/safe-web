$(function() {
  // 第一部分初始化设置
  // 使用echarts显示关系图
  var myChart = echarts.init(document.getElementById('tree'));
  $.get('/api/data/plant', function(data) {
    myChart.hideLoading();
    var data = data.children[0];

    // 指定图表的配置项和数据
    myChart.setOption(option = {
      backgroundColor: '#fcf9f2',
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [
        {
          type: 'tree',

          data: [data],

          top: '1%',
          left: '20%',
          bottom: '1%',
          right: '20%',

          symbolSize: 7,

          label: {
              normal: {
                position: 'left',
                verticalAlign: 'middle',
                align: 'right',
                fontSize: 9
              }
          },

          leaves: {
            label: {
              normal: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left'
              }
            }
          },

          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750
        }
      ]
    });
  });

  // 初始化信息提示
  var tips = $('.tips p');
  $('form').attr('autocomplete', 'off');

  var map = new AMap.Map('map', { // 初始化地图
    center: [126.683507, 45.713941],
    zoom: 16,
  });

  var tempPolygon = new AMap.Polygon({ // 初始化编辑状态的polygon
    map: map,
    strokeColor: "#d55d5c", // 配置线条颜色
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: "#f5dbe3", // 配置填充色
    fillOpacity: 0.35,
    strokeStyle: 'dashed', // 配置线条样式
    id: null
  });

  var companyPolygon = new AMap.Polygon({   // 初始化公司
    map: map,
    strokeColor: "#0000ff",
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: "#f5deb3",
    fillOpacity: 0.35,
    });
  companyPolygon.areas = []; // 初始化公司下的部门区域

  var mouseTool = new AMap.MouseTool(map); //在地图中添加MouseTool插件
  map.plugin(mouseTool);

  var editingPolygon;// 编辑状态下的polygon

  AMap.event.addListener(mouseTool,'draw',function(e){ // 画完范围后自动启用编辑状态
    var tempPath = e.obj.getPath();
    tempPath = tempPath.map(function(value, index) {
      return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
    });
    mouseTool.close(true); //画完后把画的图擦除
    tempPolygon.setPath(tempPath);
    editingPolygon = new AMap.PolyEditor(map,tempPolygon); // 接着把绘制的多边形变成可编辑状态
    editingPolygon.open();

    // 添加编辑事件按钮事件
    AMap.event.addDomListener(document.getElementById('editPolygonButton'), 'click', function() {
      editingPolygon.open();
    }, false);
    // 添加结束编辑事件按钮事件
    AMap.event.addDomListener(document.getElementById('overPolygonButton'), 'click', function() {
      editingPolygon.close();
    }, false);
  });

  // 功能化按钮事件绑定--------------
  // 新建范围
  $('.companyBox').on('click', '.addForm:button', function(ev) {
    var addForm = $(ev.target).parent().next('form[id^="create"]');
    addForm.show(); //显示增加表单
    map.setMapStyle('amap://styles/grey'); // 设置地图特殊样式，提示可以开始划范围了

    mouseTool.polygon(); //开始绘制
    $('.buttonBox').show(); //地图按钮组显示
  });

  //取消新建范围
  $('.companyBox').on('click', '.cancelForm:button', function(ev) {
    var addForm = $(ev.target).parent().next('form[id^="create"]');
    addForm.hide();
    $('.buttonBox').hide(); //地图按钮组显示
    map.setMapStyle('amap://styles/normal');

    if(editingPolygon) {
      editingPolygon.close();
    }
    if(tempPolygon.getPath().length !== 0) {
      tempPolygon.setPath(null);
    }
  });

  //编辑现有范围
  $('.companyBox').on('click', '.editPolygon', function(ev) {
    ev.preventDefault();
    var editForm = $(ev.target).parent().prevAll('form[id^="update"]');
    editForm.show();
    map.setMapStyle('amap://styles/grey'); // 设置地图特殊样式，提示可以开始划范围了
    $('.buttonBox').show();

    // 将原文copy到修改的表单中
    var info = $(ev.target).prev();
    var name = info.prev();
    editForm.children('input[type="text"]:eq(0)').val(name.text());
    editForm.children('input[type="text"]:eq(1)').val(info.text());

    // 通过id让将目标的polygon变成可编辑状态
    var polygonId = $(ev.target).parent().attr('id');
    // 如果当前修改的polygon是公司的，就将targetPolygon设为公司
    // 否则，找到当前的area，并将其设为targetPolygon
    if (companyPolygon.getExtData().id === polygonId) {
      tempPolygon = companyPolygon;
      editForm.attr('action', `api/company/${polygonId}`);
    }else {
      var areas = companyPolygon.areas;
      //开始循环
      for(var i=0; i<areas.length; i++) {
        var area = areas[i];
        if(area.getExtData().id === polygonId) {
          tempPolygon = area;
          editForm.attr('action', `api/company/areas/${polygonId}`);
          break;
        }
      }
    };

    tempPolygon.id = polygonId;

    editingPolygon = new AMap.PolyEditor(map,tempPolygon); // 接着把绘制的多边形变成可编辑状态
    editingPolygon.open();
    // 添加编辑事件按钮事件
    AMap.event.addDomListener(document.getElementById('editPolygonButton'), 'click', function() {
      editingPolygon.open();
    }, false);
    // 添加结束编辑事件按钮事件
    AMap.event.addDomListener(document.getElementById('overPolygonButton'), 'click', function() {
      editingPolygon.close();
    }, false);
  });

  // 取消编辑现有范围
  $('.companyBox').on('click', '.cancelPolygon', function(ev) {
    ev.preventDefault();
    var editForm = $(ev.target).parent().prevAll('form[id^="update"]');
    editForm.hide();
    map.setMapStyle('amap://styles/normal'); // 设置地图特殊样式，提示可以开始
    editingPolygon.close();
    $('.buttonBox').hide();
  });

  // 查-异步请求公司数据，在地图上绘制
  $.ajax({
    url: '/api/company',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(company) {
    $('.companyShow h3').show();
    $('.areaBox').show();
    var path = JSON.parse(company.polygonPath);
    companyPolygon.setExtData({
      id: company.id,
      name: company.name
    })
    companyPolygon.setPath(path); // 根据path将company的多边形显示在地图上。
  })
  .fail(function() {
    console.log('公司数据未上传');
    $('.companyBox .control_add').show();
  });

  // 增-ajax异步提交
  $('#createCompany').submit(function(ev) {

    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    if(!check(form)) {
      return;
    }
    var companyPath = tempPolygon.getPath().map(function(value, index) {
      return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
    });
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPath)
    })
    .done(function(company) {
      console.log(`公司信息${form.attr('method')}成功`);
      tempPolygon.setPath(null);
      companyPolygon.setExtData({
        id:company.id,
        name:company.name
      });
      // 前端显示刚上传的数据
      $('.companyShow h3').show();
      $('.companyShow h3').attr('id', company.id);
      $('.areaBox').show();
      $('#createCompany').hide();
      $('.companyShow h3').next('.control_add').hide();
      $('.companyBox span:eq(0)').text(company.name);
      $('.companyBox span:eq(1)').text(company.info);
      $('.companyBox a:eq(1)').attr('href', `api/company/${company.id}`);
      $('#updateCompany').attr('action', `api/company/${company.id}`);
      $('#createArea').attr('action', `api/company/${company.id}/areas`);
      var path = JSON.parse(company.polygonPath);
      companyPolygon.setPath(path);
      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('.buttonBox').hide();
    });
  });

  // 修改公司数据
  $('#updateCompany').submit(function(ev) {
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    var companyPath = tempPolygon.getPath().map(function(value, index) {
      return [value.lng, value.lat];
    });
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(companyPath)
    })
    .done(function(company) {
      console.log(`公司信息${form.attr('method')}成功`);
      companyPolygon.setExtData({id:company.id});
      editingPolygon.close();
      var path = JSON.parse(company.polygonPath);
      companyPolygon.setPath(path);
      companyPolygon.setOptions({
        strokeStyle: 'solid'
      });
      // 前端显示刚上传的数据。
      $('.companyBox span:eq(0)').text(company.name);
      $('.companyBox span:eq(1)').text(company.info);
      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('.buttonBox').hide();
      $('#updateCompany').hide();
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
      companyPolygon.areas.forEach(function(value, index) {
        value.setPath(null);
      });
      companyPolygon.areas = [];
      $('.companyShow h3').hide();
      $('.areaBox').hide();
      $('.areaShow').remove();
      $('.companyBox span:eq(0)').text(null);
      $('.companyBox span:eq(1)').text(null);
      $('.buttonBox').hide();
      $('#updateCompany').hide();
      $('.companyBox .control_add').show();
    })
    .fail(function() {
      console.log('公司信息DELETE失败');
    });
  });

  // 查-异步请求部门数据，在地图上绘制
  $.ajax({
    url: '/api/company/areas',
    type: 'GET',
    dataType: 'json'
  })
  .done(function(areas) {
    $('.areaBox').show();
    areas.forEach(function(value, index) {
      var path = JSON.parse(value.polygonPath);
      var areaPolygon = new AMap.Polygon({
        map: map,
        path: path,
        strokeColor: "#33eeff",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#f5dbe3",
        fillOpacity: 0.35,
      });
      areaPolygon.setExtData({
        id: value.id,
        name: value.name
      })
      companyPolygon.areas.push(areaPolygon);
    });
  })
  .fail(function() {
    console.log('部门数据未上传');
  });

  // 增-ajax异步提交区域
  $('#createArea').submit(function(ev) {
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    var form = $(this);
    var areaPath = tempPolygon.getPath().map(function(value, index) {
      return [value.lng, value.lat]; // polygonPath的高级数据，转换成简单的数组形式
    });
    if(!check(form)) {
      return;
    }
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(areaPath)
    })
    .done(function(area) {
      console.log(`部门信息${form.attr('method')}成功`);
      tempPolygon.setPath(null);
      var path = JSON.parse(area.polygonPath);
      var areaPolygon = new AMap.Polygon({
        map: map,
        path: path,
        strokeColor: "#33eeff",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#f5dbe3",
        fillOpacity: 0.35,
      });
      areaPolygon.setExtData({
        id: area.id,
        name: area.name
      })
      companyPolygon.areas.push(areaPolygon);
      // 前端显示刚上传的数据。
      var h3 = $('<h3></h3>');
      h3.attr('class', 'areaShow').attr('id', area.id);
      h3.html(`
      <span>${ area.name }</span>
      <span>${ area.info }</span>
      <a href="#" class="editPolygon">编辑</a>
      <a href="#" class="cancelPolygon">取消</a>
      <a href="api/company/areas/${area.id}" class="delete">删除</a>
      `);
      $('.areaBox').append(h3);
      $('#createArea input[type="text"]').val(null);
      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('.buttonBox').hide();
      $('#createArea').hide();
    })
    .fail(function() {
      console.log('创建部门失败')
    })
  });

  // 改-ajax异步提交区域
  $('#updateArea').submit(function(ev) {
    ev.preventDefault(); // 取消默认的提交事件，使用ajax提交表单
    editingPolygon.close();
    var form = $(this);

    var areaPatn = tempPolygon.getPath().map(function(value, index) {
      return [value.lng, value.lat];
    })
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      data: form.serialize()+'&polygonPath='+ JSON.stringify(areaPatn)
    })
    .done(function(area) {
      console.log(`部门信息${form.attr('method')}成功`);
      var path = JSON.parse(area.polygonPath);
      var id = area.id;
      // 前端显示刚上传的数据。
      var areaShow = $('.areaBox').find(`#${id}`);
      areaShow.children('span:eq(0)').text(area.name);
      areaShow.children('span:eq(1)').text(area.info);

      map.setMapStyle('amap://styles/normal'); // 恢复地图正常样式
      $('.buttonBox').hide();
      $('#updateArea').hide();
    });
  });
  // 删除数据
  $('.areaBox').on('click', '.areaShow a.delete', function(ev) {
    var item = $(ev.target).parent('h3');
    areaIndex = $('.areaBox h3').index(item);
    ev.preventDefault();
    $.ajax({
      url: $(ev.target).attr('href'),
      type: 'DELETE'
    })
    .done(function(data) {
      console.log('部门信息DELETE成功');
      companyPolygon.areas[areaIndex].setPath(null);
      companyPolygon.areas.splice(areaIndex, 1); // 删除指定索引位置的元素

      item.remove();
      $('.buttonBox').hide();
      $('#updateArea').hide();
    })
    .fail(function() {
      console.log('部门信息DELETE失败');
    });
  });

  // 功能函数部分--------------------------
  // 检查函数
  function check (obj) {
    var children =  obj.find('input[type!="submit"]');
    for(var i=0; i<children.length; i++) {
      var child = children[i];
      if(child.value === '') {
        child.focus();
        tips.text(`${child.name}不能为空!`);
        return false;
      }
    }

    if(tempPolygon.getPath().length === 0) {
      tips.text('请在地图上绘制范围后，再提交')
      return false;
    }

    return true;
    console.log('范围提交信息验证通过...')
  }
})