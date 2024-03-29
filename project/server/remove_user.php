<!--Sending a request to this page removes a user from a chat
Arguments Are:
user_id: the user to remove
chat_id: the user to remove from a chat
-->
<?php
//Start the session, in order to allow us to access the session variables
session_start();


//Get the username of the the user removing the  user from session vars
$username= $_SESSION["username"];


//Get the id of the chat and user being removed, from request
$chat_id = filter_input(INPUT_POST,'chat_id', FILTER_SANITIZE_SPECIAL_CHARS);
$user_id = filter_input(INPUT_POST,'user_id', FILTER_SANITIZE_SPECIAL_CHARS);
//Set the arguments for the connection to the database
$servername = "127.0.0.1:50447";
$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";

//initialize the connection to the database, and set it to utf8mb4 mode, which allows it to deal with unicode
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');

//check that the user sending the request actually owns the chat
$sql = "SELECT owner FROM chat WHERE owner='$username' AND chat_id='$chat_id'";
$result = $conn->query($sql); 
// If the user owns the chat, or is just removing themselves, proceed
if ($result or $username ==$user_id){
	//remove the user from the chat, and set the last modified time on the chat
	$sql = "DELETE FROM chat_participation WHERE username='$user_id' AND chat_id='$chat_id'";
	$result = $conn->query($sql); 
	$sql = "UPDATE chat SET last_modified = CURRENT_TIMESTAMP(6) WHERE chat_id='$chat_id'";
	$result = $conn->query($sql); 	
} 
$conn->close();
