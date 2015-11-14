;!function(window){
	var _btn,  //按钮
		_showTip, //展示提示方法
		_file, //file控件
		_shardSize = 2 * 1024 * 1024, //每个碎片大小
		_shardCount, //总碎片数量
		_asyn = 1,       //同时上传的碎片数
		_token = null,      //上传Token
		_stats,       //其他参数
		_succeed = 0;

	var _fileName,  //上传的文件名称
		_fileObj, //上传文件
		_fileSize, //文件大小
		_fileForms, //分片后要上传的数据包
		_upNum = 0; //已经进入上传队列的数目

	var _upUrl;

	var shardUpload = {
		
		init:function(btn,upUrl,param){
			_succeed = 0;
			_showTip = null;
			_shardSize = 2 * 1024 * 1024;
			_asyn = 1;
			_token = null;
			_stats = null;
			_upNum = 0;
			var that = this;
			_btn = btn;
			_upUrl = upUrl;
			if(typeof(param) == 'object'){
				if(typeof(param.showTip) == 'function'){
					_showTip = param.showTip;
				}
				if(typeof(param.shardSize) != 'undefined'){
					_shardSize = param.shardSize;
				}
				if(typeof(param.asyn) != 'undefined'){
					_asyn = param.asyn;
				}
				if(typeof(param.token) != 'undefined'){
					_token = param.token;
				}
				if(typeof(param.stats) != 'undefined'){
					_stats = param.stats;
				}
			}

			var fileid = 'upfile-'+parseInt(Math.random()*100000);
			$(_btn).before('<input type="file" name="'+fileid+'" id="'+fileid+'" style="display:none">');
			_file = $('#'+fileid);
			$(_btn).click(function(event) {
				$('#'+fileid).click();
			});
			$('#'+fileid).change(function(){
				//console.log(that);
				that.sliceFile();
			});


		},

		sliceFile:function(){
			_succeed = 0;
			_upNum = 0;
			this.showTip('文件准备中...','notice');

			_fileObj = _file[0].files[0],  //文件对象
			_fileSize = _fileObj.size;
		    _shardCount = Math.ceil(_fileSize / _shardSize);  //总片数
		    _fileName = parseInt(Math.random()*100000)+_fileObj.name;


		    var forms = new Array();

		    for(var i = 0;i < _shardCount; ++i){
		        //计算每一片的起始与结束位置
		      	var form = this.setForm(i);
		      	var formObj = {
		      		status:0,
		      		form:form
		      	};
		        forms.push(formObj);
		    }
		    _fileForms = forms;
		    console.log('总共上传：'+forms.length)

		    this.showTip('文件准备上传','notice');
		    this.upFile();
		},

		setForm:function(num){
			var start = num * _shardSize, 
				end = Math.min(_fileSize, start + _shardSize);

			var form = new FormData();
			form.append("data", _fileObj.slice(start,end));  //slice方法用于切出文件的一部分
		    form.append("name", _fileName);
		    form.append("total", _shardCount);  //总片数
		    form.append("index", num+1);        //当前是第几片
		    //如果传入了Token，则设置Token
		    if(_token != null){
		    	form.append('token',_token);
			}
			//如果传入了其他参数
			if(_stats != null){
				for(var stat in _stats){
					form.append(stat,_stats[stat]);
				}
			}

			return form;
		},

		upFile:function(){
			var upNum = 0;
			for(var j=0;j<_fileForms.length;j++){
				if(upNum < _asyn){
					if(_fileForms[j].status == 0){
						_fileForms[j].status = 1;
						_upNum ++;
						upNum ++;
						this.ajaxUp(_fileForms[j]);
					}
				}else{
					break;
				}
			}
		      
		},

		ajaxUp:function(formObject){
			var form = formObject.form;
			var that = this;
			$.ajax({
	          url: _upUrl,
	          type: "POST",
	          data: form,
	          async: true,        //异步
	          processData: false,  //很重要，告诉jquery不要对form进行处理
	          contentType: false,  //很重要，指定为false才能形成正确的Content-Type
	          success: function(data){
	          	//TODO 判断服务回传数据
	            _succeed++;
	            if(_succeed == _shardCount){
	            	console.log(_succeed);
	            	//TODO  全部上传完成
	            	that.showTip('正在合并文件','notice');
	            	$.post(_upUrl,{name:_fileName,total:_shardCount,mearge:'yes'},function(data){
	            		that.showTip(data,'success');
	            		_file.val('');
	            	})
	            	
	            }else{
	            	console.log('已经上传:'+_succeed+'/'+_shardCount);
	            	that.showTip(parseInt(_succeed/_shardCount*100),'process');
	            	that.upFile();
	            }
	          }
	        })
		},
		
		showTip:function(tip,flag){
			if(_showTip != null){
				_showTip(tip,flag);
			}else{
				console.log(tip);
			}
			
		}

	}

	window.shardUpload = shardUpload;
}(window);