<?php
date_default_timezone_set('UTC');
$now = DateTime::createFromFormat('U.u', microtime(true));
echo $now->format("Y-d-m H:i:s.u");

$servername = "127.0.0.1:50447";
$username = "azure";
$password = "6#vWHD_$";
$dbname = "testdb"; // only bit you need to change

$conn = new mysqli($servername, $username, $password, $dbname);


	$sql = "INSERT INTO time VALUES('".$now->format("Y-d-m H:i:s.u")."',CURRENT_TIMESTAMP(6));";
//$sql  = "SELECT CURRENT_TIMESTAMP(6);";
//echo $_GET["id"].$_GET["fname"].$_GET["lname"].$_GET["addr"].$_GET["city"];
$result = mysqli_query($conn, $sql );
echo"<br>";
echo $result;
?>
<br>
	
<script>
	document.write(new Date().toISOString().replace("T"," ").replace("Z"," ").slice(0, 19))
	</script>