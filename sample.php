<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>sample</title>
	<style>
		body{background-color: #f2f2f2;}
		#main{width: 800px; margin: 0px auto; margin-top: 50px; background-color: #fff; height: 300px; padding:40px;}
		#video-upload-btn{background-color: green; color: #fff; border: none; height: 50px; line-height: 50px; padding: 0 50px; cursor: pointer; outline: none; font-size: 16px}
		#video-upload-btn:disabled{background-color: #ccc; color: #333}
		#video{height: 40px; width: 90%; line-height: 40px; outline: none; margin-bottom: 10px; padding: 0px 10px; font-size: 14px}
	</style>
</head>
<body>
	<div id="main">
		<h2>shardUpload HTML5+PHP 大文件分片上传 </h2>
		<div style="margin-bottom:50px;">
			文档：<a href="https://github.com/bencolin4/shardUpload" target="_blank">https://github.com/bencolin4/shardUpload</a>
		</div>
		<form action="#">
			<div class="form-group">
				<input type="text" name="video" id="video" placeholder="点击下方按钮上传视频，视频格式：mp4"><br>
				<button type="button" id="video-upload-btn" data-shardUpload="video">选择视频上传</button>
			</div>
		</form>
		
	</div>
</body>
</html>
<script type="text/javascript" src="shard.js"></script>
<script type="text/javascript">
	shardUpload.init('video-upload-btn','shard.php',{exts:'mp4'});
</script>