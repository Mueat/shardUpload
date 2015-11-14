<?php
$path = '../storage/test/';
define('_UPLOAD_PATH', $path);


function shardUpload(){
    $data = $_FILES["data"];
    $total = $_POST['total'];
    $index = $_POST['index'];
    $name = $_POST['name'];
    $dr = _UPLOAD_PATH;

    $savename = shardName($name,$index);
    move_uploaded_file($data["tmp_name"],$savename);
    echo 'succed=>'.$index;
}

function merge(){
    $name = $_POST['name'];
    $total = $_POST['total'];
    $dr = _UPLOAD_PATH;
    $exts = explode('.', $name);
    $newName = md5($name.time()).'.'.$exts[count($exts)-1];
    $newFile = $dr.$newName;
    $fp = fopen($newFile,"ab"); 
    for ($i=1; $i <= $total; $i++) { 
        $thisfilepath = shardName($name,$i);
        $handle = fopen($thisfilepath,'r');  
        fwrite($fp,fread($handle,filesize($thisfilepath)));  
        fclose($handle); 
        unlink($thisfilepath);
    }
    fclose($fp); 
    echo $newName;
}

function shardName($name,$index){
	//echo _UPLOAD_PATH.md5($name).'_'.$index.'.txt';
	return _UPLOAD_PATH.md5($name).'_'.$index.'.txt';
}

if($_POST['mearge'] == 'yes'){
	merge();
}else{
	shardUpload();
}


?>