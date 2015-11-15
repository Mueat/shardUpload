# shardUpload
HTML5 大文件分片上传

#快速使用
```html
<input type="text" name="video" id="video">
<button type="button" name="upload-btn" data-shardUpload='video' id="upload-btn">上传</button>
```
```javascript
<script type="text/javascript" src="shard.js"></script>
<script type="text/javascript">
shardUpload('upload-btn','shard.php')
</script>
```

#使用说明

```
shardUpload.init(elementID,uploadUrl,config)
```

- elementID 绑定的元素ID，绑定后点击这个元素会出现选择文件框

- uploadUrl 上传的服务端地址

- config 配置参数

在绑定的元素上设置 data-shardUpload属性，则在上传成功后，会将对应元素的value设置为服务返回的数据，如上面的例子中，上传成功后，会吧video的value设置为服务器返回的数据（shard.php返回的数据为合并后的文件的路劲）


#config说明

- exts 允许上传的文件类型，多种类型用 | 分割，如：mp4|flv|avi

- chunk 每个碎片分割的大小，默认值2M。如：设置1024*1024表示每个碎片为1M（注：以B为单位，不是以M为单位）

- async 同时并行上传的碎片数，默认值1个

- token 上传令牌，将token传给服务端，服务端可以验证后再上传

- parame 其他需要传给服务端的参数，如：{id:5,category_id:16}

- callback 回调函数，下面有详细说明，

#callback回调函数

```
callback(file,message,status)
```

- file 文件选择框内的原始文件对象，可以通过file.size获取文件大小 file.name获取文件名称等等

- message 传入的提示信息/结果，如：上传错误或上传成功后服务器返回的信息

- status 状态/信息类型，通过判断status来执行不同的操作

```javascript
function myCallback(file,message,status){
	//当设置了回调函数后，默认的上传进度条将不会显示，如果要让进度条显示，则调用shardUpload.tipDisplay(message,status)
	shardUpload.tipDisplay(message,status) //显示默认的进度条
	if(status == 'success') {
		//当status为success的时候，message返回的是服务端合并文件后返回的信息，一般为合并的文件名称
		document.getElementById('output').innerHTML = message
	}else if(status == 'process'){
        //当status为process的时候，返回当前上传进度,返回0-100
        document.getElementById('output').innerHTML = message + '%';
    }else if(status == 'merge'){
		//当status为merge时，文件上传完成，通知服务端开始合并文件,message为正在合并文件
		document.getElementById('output').innerHTML = message;
	}else if(status == 'failed'){
		//文件上传失败
	}else if(status == 'cancel'){
        //文件上传取消
    }else if(status == 'error'){
		//文件格式不正确
	}
}

//全部参数都设置的使用方法

shardUpload.init('upload-btn','shard.php',{
	exts:'mp4|flv', //只允许上传mp4或flv格式
	chunk:4*1024*1024, //按4M分割
	async:5,//允许同时上传5个碎片
	token:'<?php echo $_SESSION['uptoken']?>', //上传token为session内的token，服务器端判断 $_POST['shard-token'] == $_SESSION['uptoken']
	param:{id:5,category_id:10}, //其他参数，服务器端获取 $_POST['id']/$_POST['category_id']
	callback:myCallback, //上面设置的回调方法

})

```
#服务器端说明

服务器端可以通过request获取到传入的参数，如php的为 $_POST['shard-name']

- shard-data 传入的文件对象
- shard-name 上传的文件名，此文件名加入了随机数，防止同时上传相同文件名文件的时候冲突
- shard-total 总共碎片数
- shard-index 当前碎片编号 从1开始
- shard-token 如果设置了token则会传给服务端
- shard-merge 当传入为yes的时候，则表示上传完成，需要服务器端合并文件





