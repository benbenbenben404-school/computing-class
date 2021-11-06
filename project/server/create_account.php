<?php
$username = $_REQUEST['username'];
$password = $_REQUEST['password'];
	
$valid = True;

if (strlen($username) >30){
	$valid = False;
	$error = "Username too long";
}	
if (strlen($password) >30){
	$valid = False;
	$error = "password too long";
}	
if (strlen($password) <8){
	$valid = False;
	$error = "password too short";
}	
if (strlen($username) >30){
	$valid = False;
	$error = "Username too long";
}	
if ($error){
	echo $error;
}


if ($valid){
	$servername = "127.0.0.1:50447";
	$username = "azure";
	$password = "6#vWHD_$";
	$dbname = "testdb";
	$conn = new mysqli($servername, $username, $password, $dbname);
	
}
?>