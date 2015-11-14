# shardUpload
HTML5+PHP 大文件分片上传

#快速使用

shardUpload('#upload-btn','shard.php')

第一个参数是按钮ID，第二个参数是后端程序地址

#其他参数

shardSize   //每个碎片分割的大小，默认值2M。如：1024*1024表示每个碎片为1M

asyn        //同时并行上传的碎片数，默认值1个

token       //上传令牌，将token传给服务端，服务端可以验证后再上传

stats       //其他需要传给服务端的参数，如：{id:5,category_id:16}


使用：

```javascript
var param = {

	shardSize:1024*1024,

	asyn:5,

	token:$('#uptoken').val(),

	stats:{

		id:5,

		category_id:16

	}

}
```

shardUpload('#upload-btn','shard.php',param);

