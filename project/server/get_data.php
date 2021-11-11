<?php
	

$time = $_REQUEST['time'];
session_start(); 
$username =$_SESSION["username"];
		
$data = new SimpleXMLElement('<xml/>');

header('Content-Type: text/xml');

$data ->addChild("time", date('Y-m-d H:i:s'));
$data ->addChild("username", $username);
//echo $time;



$servername = "127.0.0.1:50447";
$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');

$sql = "SELECT chat_id FROM chat_participation WHERE username='$username' AND '$time' <(SELECT last_modified FROM chat WHERE chat_participation.chat_id=chat_id )";
$result = $conn->query($sql); 
while($row = $result->fetch_assoc()) {
	
	$chat_id = $row["chat_id"];
	$sql = "SELECT chat_name,owner,chat_id FROM chat WHERE chat_id='$chat_id'";
	$chat_details = $conn->query($sql); 
	$chat_details = $chat_details->fetch_assoc();
	
	$chat = $data ->addChild("chat");
	$chat ->addChild("name", $chat_details["chat_name"]);
	$chat ->addChild("owner", $chat_details["owner"]);
	$chat ->addChild("chat_id", $chat_details["chat_id"]);
	
	$chat_members = $chat ->addChild("users");
	$sql = "SELECT username FROM chat_participation WHERE chat_id='$chat_id'";
	$members = $conn->query($sql); 
	while($member = $members->fetch_assoc()){
		  $chat_members ->addChild("user", $member["username"]);
	}
	
	$messages = $chat ->addChild("users");
	$sql = "SELECT content, time_sent, username FROM message WHERE chat_id='$chat_id' AND time_sent >'$time' ORDER BY time_sent LIMIT 50";
	
	$message_query = $conn->query($sql); 
		
	while($message_details = $message_query->fetch_assoc()){
		  $message = $messages ->addChild("message");
  		  $message ->addChild("content", $message_details["content"]);
  		  $message ->addChild("time", $message_details["time_sent"]);
  		  $message ->addChild("sender", $message_details["username"]);
	}
}




echo $data->asXML();
?>