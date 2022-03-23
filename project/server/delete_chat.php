<?php
//Start the session, in order to allow us to access the session variables
session_start();


//Get the username of the the user the chat from session vars
$username= $_SESSION["username"];


//Get the id of the chat being deleted, from request, making sure to sanitize them in order to prevent code injection
$chat_id = filter_input(INPUT_POST,'chat_id', FILTER_SANITIZE_SPECIAL_CHARS);
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

if ($result){
	//delete chat through SQL
	$sql = "DELETE FROM chat WHERE chat_id='$chat_id'";
	$result = $conn->query($sql); 

}
$conn->close();
