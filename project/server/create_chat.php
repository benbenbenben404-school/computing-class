<!--Sending a request to this page creates a chat
Arguments Are:
chat_name: name of the chat to create
-->
<?php
//Start the session, in order to allow us to access the session variables
session_start();

//Get the username of the the user adding the new user from session vars
$username= $_SESSION["username"];

//Get the name of the chat from request, making sure to sanitize it in order to prevent code ingestion
$chat_name = filter_input(INPUT_POST,'chat_name', FILTER_SANITIZE_SPECIAL_CHARS);
//If the chat_name is not specified, stop proceeding the request
if (mb_strlen($chat_name)==0){
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

//create the chat, setting the last modified time on the chat
$sql = "INSERT INTO chat (chat_name,owner,last_modified) VALUES ('$chat_name','$username',CURRENT_TIMESTAMP(6));";
$result = $conn->query($sql); 
//Return the id of the new chat, so that the client can use it
echo $conn->insert_id;

$conn->close();
