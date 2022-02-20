<!--Sending a request to this page adds a user to a chat
Arguments Are:
chat_id: of the chat to add to
user_id: username of user to add

User senign must be logged in
	-->

<?php
//Start the session, inorder to allow us to access the session variables
session_start();

//Get the username of the the user adding the new user from session vars
$username= $_SESSION["username"];

//Get the id of the chat and user being added, from request, making sure to sanitise them in order to prevent code ingection
$chat_id = filter_input(INPUT_POST,'chat_id', FILTER_SANITIZE_SPECIAL_CHARS);
$user_id = filter_input(INPUT_POST,'user_id', FILTER_SANITIZE_SPECIAL_CHARS);
//Set the arguments for the connection to the database
$servername = "127.0.0.1:50447";
$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";

//initialise the connection to the database, and set it to utf8mb4 mode, which allows it to deal with unicode
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');

//check that the user sending the request actaully owns the chat
$sql = "SELECT owner FROM chat WHERE owner='$username' AND chat_id='$chat_id'";
$result = $conn->query($sql); 
if ($result){
	
	//add the user to the chat, and set the last modified time on the chat
	$sql = "INSERT INTO chat_participation (chat_id,username) VALUES ('$chat_id','$user_id')";
	$result = $conn->query($sql); 
	$sql = "UPDATE chat SET last_modified = CURRENT_TIMESTAMP(6) WHERE chat_id='$chat_id'";
	$result = $conn->query($sql); 	
}
//close the connnection to the database
$conn->close();
?>