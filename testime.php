<?php
date_default_timezone_set('UTC');
echo date_default_timezone_get();
echo date('Y-m-d H:i:s.v');

$servername = "127.0.0.1:50447";
$username = "azure";
$password = "6#vWHD_$";
$dbname = "testdb"; // only bit you need to change

$conn = new mysqli($servername, $username, $password, $dbname);


	$sql = "INSERT INTO time VALUES('".date('Y-m-d H:i:s')."',NOW(4));";

//echo $_GET["id"].$_GET["fname"].$_GET["lname"].$_GET["addr"].$_GET["city"];
$result = mysqli_query($conn, $sql );
echo $result;
?>
<br>
	
<script>
	document.write(new Date().toISOString().replace("T"," ").replace("Z"," ").slice(0, 19))
	</script>