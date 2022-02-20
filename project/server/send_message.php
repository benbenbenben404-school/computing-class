<?php
	                        session_start();
$username= $_SESSION["username"];
$chat_id=filter_input(INPUT_POST,'chat_id', FILTER_SANITIZE_SPECIAL_CHARS);
$content=filter_input(INPUT_POST,'content', FILTER_SANITIZE_SPECIAL_CHARS);
//If the content is not specified, stop proccesing the request
if (mb_strlen($content)==0){
	die();
}

$servername = "127.0.0.1:50447";



$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');

$sql = "SELECT username FROM chat_participation WHERE username='$username' AND chat_id='$chat_id' ";
$result = $conn->query($sql); 
$now = DateTime::createFromFormat('U.u', microtime(true));
echo $now->format("Y-m-d H:i:s.u");
if ($result->num_rows > 0){
	$sql = "INSERT INTO message (username,chat_id,content,time_sent) VALUES ('$username','$chat_id','$content','".$now->format("Y-m-d H:i:s.u")."')";
	
	echo $sql;
	$result = $conn->query($sql); 
	$sql = "UPDATE chat SET last_modified = '".$now->format("Y-m-d H:i:s.u")."' WHERE chat_id='$chat_id'";
	$result = $conn->query($sql); 	
		echo $sql;
}

$conn->close();

?>