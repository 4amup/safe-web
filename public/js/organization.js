$(function() {
  var tree = $('.tree');
  var target = null;

  $.get('/api/data/organization',function(json) {
    console.log(json);
    var company = json.children;

    // 根据数据在前端渲染出盒子们
    company.forEach(function(value, index) {
      var company = value;
      var cnode = $(`<div></div>`).addClass('layer-1').attr("id", company.id);
      var ctitle = $('<h4></h4>').text(company.name);
      cnode.append(ctitle);

      // 厂房层
      var departments = company.children;
      departments.forEach(function(value, index) {
        var department = value;
        var dnode = $('<div></div>').addClass('layer-2').attr('id', department.id);
        var dtitle = $('<h4></h4>').text(department.name);
        dnode.append(dtitle);
        cnode.append(dnode);
      });
      $('.layer-0').append(cnode);
    });
  });

  // 选择节点
  tree.on('click', 'div', function (event) {
    event.stopPropagation();
    var div = $(this);
    $('.tree div').removeClass('select');
    div.addClass('select');
    target = div;
    $('input[name="add-layer"]').focus(); // 自动聚焦到添加文本框中
    $('input[name="update-layer"]').val(div.children('h4').text());
  });

  // 取消当前节点的选择
  $('.tree').on('click', function(event) {
    event.stopPropagation();
    $('.tree div').removeClass('select');
    target = null;
    $('input[name="update-layer"]').val(null);
  });

  $('.control-panel').on('click', 'input[type="button"]', function(event) {
    var button = $(this);
    if(target === null) {
      alert('请先选择当前节点');
      return;
    };
    // 判断当前所属层级
    var layerNumber = target.attr('class').replace(/[^0-9]/ig,"") - 0;
    var layerId = target.attr('id');

    var url = '/api'; // 初始化上传url

    switch(layerNumber) {
      case 0:
        url += `/company`;
        break;
      case 1:
        url += `/company/${layerId}`;
        break;
      case 2:
        url += `/department/${layerId}`;
    }

    var text = button.prev(); // 文字输入框内容
    switch(button.attr('id')) {
      case 'btn-delete':
        if(layerNumber<1 || layerNumber>3) {
          alert('当前节点不可删除');
        }
        $.ajax({
          url: url,
          type: 'DELETE',
        })
        .done(function(data) {
          console.log(data);
          target.remove();
        })
        .fail(function() {
          console.log('修改当前节点失败')
        })
        break;
      case 'btn-add': // 添加节点（层级）ajax和前端
        if(!text.val()) {
          alert('请先写入内容');
          return false;
        };
        if(layerNumber<0 || layerNumber>1) {
          alert('当前节点不能添加子节点');
          return false;
        };
        $.post(url, {name: text.val()}) // 异步上传
        .done(function(data) {
          console.log('增加子节点成功');
          var child =  $(`<div><h4>${data.name}</h4></div>`);
          child.addClass(`layer-${layerNumber+1}`);
          child.attr('id', data.id);
          target.append(child);
          text.val(null);
          text.focus();

        })
        .fail(function() {
          console.log('增加子节点成功');
        });
        break;
      case 'btn-update':
        if(!text.val()) {
          alert('请先写入内容');
          return false;
        };
        if(layerNumber<1 || layerNumber>2) {
          alert('当前节点不能修改');
          return false;
        };
        $.ajax({
          url: url,
          type: 'PUT',
          data: {name: text.val()}
        })
        .done(function(data) {
          console.log('修改当前节点成功');
          target.children('h4').text(data.name);
        })
        .fail(function() {
          console.log('修改当前节点失败')
        })
        target.children('h4').text(text.val());
        text.val(null);
        text.focus();
      }
  });
})