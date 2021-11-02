<?php
	echo"test";
$username = $_REQUEST['username']
$password = $_REQUEST['password']
	
$valid = True

if (strlen($username) >30){
	$valid = False
	$error = "Username too long"
}	
	if (strlen($password) >30){
	$valid = False
	$error = "password too long"
}	
	if (strlen($password) <8){
	$valid = False
	$error = "password too short"
}	
	if (strlen($username) >30){
	$valid = False
	$error = "Username too long"
}	
	if ($error){
		echo $error
	}
?>