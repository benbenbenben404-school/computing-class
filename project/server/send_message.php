<!--Sending a request to this page sends a message
Arguments Are:
chat_id: the chat to send a message to
content: the message content
-->
<?php
//Start the session, in order to allow us to access the session variables
session_start();
//Get the username of the the user sending the message from session vars
$username= $_SESSION["username"];
//Get the id of the chat and message content, from request
$chat_id=filter_input(INPUT_POST,'chat_id', FILTER_SANITIZE_SPECIAL_CHARS);
$content=filter_input(INPUT_POST,'content', FILTER_SANITIZE_SPECIAL_CHARS);
//If the content is not specified, stop processing the request
if (mb_strlen($content)==0){
	die();
}
//Set the arguments for the connection to the database
$servername = "127.0.0.1:50447";
$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";

//initialize the connection to the database, and set it to utf8mb4 mode, which allows it to deal with unicode
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');
// Check that the user sending the request is actually in the chat
$sql = "SELECT username FROM chat_participation WHERE username='$username' AND chat_id='$chat_id' ";
$result = $conn->query($sql); 
// If user is in chat, send the message, and update the last modified time on the chat
if ($result->num_rows > 0){
	$sql = "INSERT INTO message (username,chat_id,content,time_sent) VALUES ('$username','$chat_id','$content',CURRENT_TIMESTAMP(6))";
	$result = $conn->query($sql); 
	$sql = "UPDATE chat SET last_modified = CURRENT_TIMESTAMP(6)  WHERE chat_id='$chat_id'";
	$result = $conn->query($sql); 	
}

$conn->close();
