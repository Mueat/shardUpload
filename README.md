# shardUpload
HTML5+PHP 大文件分片上传

#快速使用
```html
<button type="button" name="upload-btn" id="upload-btn">上传</button>
```
```javascript
<script type="text/javascript" src="shard.js"></script>
<script type="text/javascript">
shardUpload('#upload-btn','shard.php')
</script>
```

第一个参数是按钮ID，第二个参数是后端程序地址

#其他参数

shardSize   //每个碎片分割的大小，默认值2M。如：1024*1024表示每个碎片为1M

asyn        //同时并行上传的碎片数，默认值1个

token       //上传令牌，将token传给服务端，服务端可以验证后再上传

stats       //其他需要传给服务端的参数，如：{id:5,category_id:16}

showTip     //显示上传信息的方法,默认为控制台输出，


使用：

```javascript
var param = {
	shardSize:1024*1024,
	asyn:5,
	token:$('#uptoken').val(),
	stats:{
		id:5,
		category_id:16
	},
	showTip:function(info,flag){
	    if(flag == 'success'){
			//上传成功后回传上传成功的文件名
			$('#video').val(info);
		}else if(flag == 'process'){
			//上传过程中回传上传的进度，如：56
			$('#video').val(info+'%');
		}else if(flag == 'notice'){
            //一般的提示信息，如：正在准备文件
            $('#video').val(info)
	    }
	}
}

shardUpload('#upload-btn','shard.php',param);
```

