<!--Sending a request to this page gets all the data for a user, eg chats and messages
Arguments Are:
time: time to get new data since
-->
<?php
//Start the session, in order to allow us to access the session variables
session_start();
//Set the content type of the returned data to XML
header('Content-Type: text/xml');
//Set the time from the request arguments, and the username from session variables
$time = filter_input(INPUT_POST,'time', FILTER_SANITIZE_SPECIAL_CHARS);
//check if the session variable is set before getting username. If its not, set the response code to 403, which is incorrect auth, and kill the connection
if($_SESSION["username"]){
	$username =$_SESSION["username"];
} else{
	http_response_code(403);
	die();
}
//Start the XML data structure that will be returned, and initially set the time_returned and username in it
$data = new SimpleXMLElement('<xml/>');
$now = DateTime::createFromFormat('U.u', microtime(true));

$data ->addChild("time_returned", $now->format("Y-m-d H:i:s.u"));
$data ->addChild("username", $username);

//Set the arguments for the connection to the server
$servername = "127.0.0.1:50447";
$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";

//initialize the connection to the database, and set it to utf8mb4 mode, which allows it to deal with unicode
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');

//Execute the sql query to get all the chats that the user is in, and get all the chats since a certain time
$sql = "SELECT chat_id FROM chat_participation WHERE username='$username' AND '$time' <=(SELECT last_modified FROM chat WHERE chat_participation.chat_id=chat_id )";
$result = $conn->query($sql); 

//Iterate over each of the chats, get the data from them, and add it to the data structure
// Note the use of htmlspecialchars(), which protects against code injection
while($row = $result->fetch_assoc()) {
	$chat_id = $row["chat_id"];
	//Setup and execute query to get name, owner, and chat_id of chat
	$sql = "SELECT chat_name,owner,chat_id FROM chat WHERE chat_id='$chat_id'";
	$chat_details = $conn->query($sql); 
	$chat_details = $chat_details->fetch_assoc();
	//Add chat to data structure and set name, owner, and id
	$chat = $data ->addChild("chat");
	$chat ->addChild("name", htmlspecialchars($chat_details["chat_name"]));
	$chat ->addChild("owner", htmlspecialchars($chat_details["owner"]));
	$chat ->addChild("chat_id", htmlspecialchars($chat_details["chat_id"]));
	//Set up and execute query to get all users in chat, then add these to data structures
	$chat_members = $chat ->addChild("users");
	$sql = "SELECT username FROM chat_participation WHERE chat_id='$chat_id'";
	$members = $conn->query($sql); 
	while($member = $members->fetch_assoc()){
		  $chat_members ->addChild("user", htmlspecialchars($member["username"]) );
	}
	
	//Set up and execute query to get all messages  in chat, then add to data structure
	$messages = $chat ->addChild("messages");
	$sql = "SELECT content, time_sent, username FROM (SELECT content, time_sent, username FROM message WHERE chat_id='$chat_id' AND time_sent >'$time' ORDER BY time_sent DESC LIMIT 50) X ORDER BY time_sent ASC";
	$message_query = $conn->query($sql); 

	while($message_details = $message_query->fetch_assoc()){
		  $message = $messages ->addChild("message");
  		  $message ->addChild("content", htmlspecialchars($message_details["content"]));
  		  $message ->addChild("time", htmlspecialchars($message_details["time_sent"]));
  		  $message ->addChild("sender", htmlspecialchars($message_details["username"]));
	}
}


//close the connection to the db
$conn->close();
//return the data to the client
echo $data->asXML();
