<?php
	                        session_start();
$username= $_SESSION["username"];
$chat_id=filter_input(INPUT_POST,'chat_id', FILTER_SANITIZE_SPECIAL_CHARS);
$content=filter_input(INPUT_POST,'content', FILTER_SANITIZE_SPECIAL_CHARS);


$servername = "127.0.0.1:50447";



$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');

$sql = "SELECT username FROM chat_participation WHERE username='$username' AND chat_id='$chat_id' ";
$result = $conn->query($sql); 

if ($result->num_rows > 0){
	$sql = "INSERT INTO message (username,chat_id,content) VALUES ('$username','$chat_id','$content')";
	$result = $conn->query($sql); 
	$sql = "UPDATE chat SET last_modified = CURRENT_TIMESTAMP WHERE chat_id='$chat_id'";
	$result = $conn->query($sql); 	
}

$conn->close();

?>