;!function(window){
	var _btn,  //按钮
		_showTip, //展示提示方法
		_file, //file控件
		_shardSize = 2 * 1024 * 1024, //每个碎片大小
		_shardCount, //总碎片数量
		_async = 3,       //同时上传的碎片数
		_token = null,      //上传Token
		_stats,       //其他参数
		_succeed = 0;
		_errored = 0;
		_abort = false;

	var _fileName,  //上传的文件名称
		_fileObj, //上传文件
		_fileSize, //文件大小
		_fileForms, //分片后要上传的数据包
		_allowExts = null, //允许上传的文件格式
		_upNum = 0; //已经进入上传队列的数目

	var _upUrl;
	var _this;

	var shardUpload = {
		
		init:function(btn,upUrl,config){
			_this = this;
			_succeed = 0;
			_showTip = null;
			_shardSize = 2 * 1024 * 1024;
			_async = 1;
			_token = null;
			_stats = null;
			_upNum = 0;
			var that = this;
			_btn = document.getElementById(btn);
			_upUrl = upUrl;
			if(typeof(config) == 'object'){
				if(typeof(config.callback) == 'function'){
					_showTip = config.callback;
				}
				if(typeof(config.chunk) == 'number'){
					_shardSize = config.chunk;
				}
				if(typeof(config.async) == 'number'){
					_async = config.async;
				}
				if(typeof(config.token) == 'string'){
					_token = config.token;
				}
				if(typeof(config.parame) == 'object'){
					_stats = config.parame;
				}
				if(typeof(config.exts) == 'string'){
					_allowExts = config.exts.toUpperCase();
				}
			}

			var fileid = 'upfile-'+parseInt(Math.random()*100000);
			
			_file = document.createElement('input');
			_file.type = 'file';
			_file.id = fileid;
			_file.name = fileid;
			_file.style.display = 'none';
			_btn.parentNode.insertBefore(_file,_btn);
			

			_btn.onclick=function(){_file.click()};
			_file.onchange = function(){ that.sliceFile()};


		},

		sliceFile:function(){
			_btn.disabled = true;
			_succeed = 0;
			_errored = 0;
			_abort = false;
			_upNum = 0;
			var fileName = _file.value;
			var ldot = fileName.lastIndexOf(".");
  			var fileExt = fileName.substring(ldot + 1);
			fileExt = fileExt.toUpperCase();
			if(_allowExts){
				var exts = _allowExts.split('|');
				var isValid = false;
				for (var i = 0; i < exts.length; i++) {
					if(exts[i] == fileExt){
						isValid = true;
					}
				};
				if(!isValid){
					this.showTip('文件格式错误！','error');
					return;
				}
			};

			this.showTip('文件准备中...','notice');

			_fileObj = _file.files[0],  //文件对象
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

		    this.showTip('文件准备上传','notice');
		    this.upFile();
		},

		setForm:function(num){
			var start = num * _shardSize, 
				end = Math.min(_fileSize, start + _shardSize);

			var form = new FormData();
			form.append("shard-data", _fileObj.slice(start,end));  //slice方法用于切出文件的一部分
		    form.append("shard-name", _fileName);
		    form.append("shard-total", _shardCount);  //总片数
		    form.append("shard-index", num+1);        //当前是第几片
		    //如果传入了Token，则设置Token
		    if(_token != null){
		    	form.append('shard-token',_token);
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
			if(_errored>0 || _abort) return;
			
			for(var j=0;j<_fileForms.length;j++){
				if(_upNum < _async){
					if(_fileForms[j].status == 0){
						_fileForms[j].status = 1;
						_upNum ++;
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
			var xhr = createXMLHttpRequest();
			xhr.upload.addEventListener("progress", uploadProgress, false);
		    xhr.addEventListener("load", uploadComplete, false);
		    xhr.addEventListener("error", uploadFailed, false);
		    xhr.addEventListener("abort", uploadCanceled, false);
		   
		    xhr.open("POST",_upUrl,true);
		    xhr.send(form);

		    function uploadComplete(){
	            _succeed++;
				_upNum--;
				if(_succeed == _shardCount){
	            	//TODO  全部上传完成
	            	_this.showTip(100,'process');
	            	_this.showTip('正在合并文件','merge');
	            	var merge_xhr = createXMLHttpRequest();
	            	merge_xhr.onreadystatechange = function(){
	            		if(merge_xhr.readyState == 4){
        					if(merge_xhr.status == 200){
        						_this.showTip(merge_xhr.responseText,'success');
	            				_file.value = '';
        					}
        				}
	            	}
	            	merge_xhr.open('POST',_upUrl,true);
	            	var mergeForm = new FormData();
	            	mergeForm.append('shard-merge','yes');
	            	mergeForm.append("shard-name", _fileName);
		    		mergeForm.append("shard-total", _shardCount); 
	            	merge_xhr.send(mergeForm);
	            }else{
	            	_this.showTip(parseInt(_succeed/_shardCount*100),'process');
	            	_this.upFile();
	            }
	            
			};
			function uploadFailed(){
				this.showTip('上传出错','failed');
				_errored++;
			};
			function uploadCanceled(){
				this.showTip('上传终止','cancel');
				_abort = true;
			};
			function uploadProgress(ev){
				/*
				var percent = 0; 
	            if(ev.lengthComputable) { 
	                percent = 100 * ev.loaded/ev.total; 
	            } 
	            */
			};

		},

		
		
		showTip:function(tip,flag){
			if(flag == 'success' || flag == 'failed' || flag == 'error' || flag == 'cancel'){
				_btn.disabled = false;
			}
			if(_showTip != null){
				_showTip(_fileObj,tip,flag);
			}else{
				this.tipDisplay(tip,flag)
			}
		},

		tipDisplay:function(tip,flag){
			if(!document.getElementById(_file.id+'-tip')) {
				this.createTipDiv();
			}
			var tipDiv = document.getElementById(_file.id+'-tip');
			tipDiv.style.display = 'block';
			if(flag == 'notice'){
				tipDiv.firstChild.innerHTML = tip;
			}else if(flag == 'process'){
				document.getElementById(_file.id+'-process-bg').style.display = 'block';
				tipDiv.firstChild.innerHTML = '已完成：'+tip+'%';
				document.getElementById(_file.id+'-process').style.width = tip+'%';
			}else if(flag == 'success'){
				document.getElementById(_file.id+'-process').style.width = '100%';
				tipDiv.firstChild.innerHTML = '上传成功';
				if(_btn.getAttribute('data-shardUpload')){
					var eid = _btn.getAttribute('data-shardUpload');
					document.getElementById(eid).value = tip;
				}
				setTimeout(function(){tipDiv.style.display = 'none';},2000);
			}else{
				tipDiv.firstChild.innerHTML = tip;
				document.getElementById(_file.id+'-process-bg').style.display = 'none';
			}
		},
		createTipDiv:function(){
			var tipDiv = document.createElement('DIV');
				tipDiv.style.position = 'fixed';
				tipDiv.style.right='0';
				tipDiv.style.bottom = '0';
				tipDiv.style.width = '200px';
				tipDiv.style.padding = '10px';
				tipDiv.style.backgroundColor = '#fff';
				tipDiv.style.border = '1px solid #dedede';
				tipDiv.id = _file.id+'-tip';
				//TODO 设置className
			var tipHTML = '<div style="text-align:center;margin-bottom:5px;font-size:14px"></div><div style="width:100%;height:20px;background-color:#dedede;border-radius:20px;overflow:hidden" id="'+_file.id+'-process-bg"><span style="display:block;background-color:green;height:20px;width:0px;float:left" id="'+_file.id+'-process"></span></div>';
				tipDiv.innerHTML = tipHTML;
			document.body.appendChild(tipDiv);
		}

	}

	function createXMLHttpRequest() {  
	    var XMLHttpReq;
	    try {  
	        XMLHttpReq = new ActiveXObject("Msxml2.XMLHTTP");//IE高版本创建XMLHTTP  
	    }  
	    catch(E) {  
	        try {  
	            XMLHttpReq = new ActiveXObject("Microsoft.XMLHTTP");//IE低版本创建XMLHTTP  
	        }  
	        catch(E) {  
	            XMLHttpReq = new XMLHttpRequest();//兼容非IE浏览器，直接创建XMLHTTP对象  
	        }  
	    }  
	    return XMLHttpReq;
	};

	window.shardUpload = shardUpload;
}(window);


  