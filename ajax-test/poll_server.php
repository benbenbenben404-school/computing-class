<?php


$servername = "127.0.0.1:50447";
$username = "azure";
$password = "6#vWHD_$";
$dbname = "testdb"; // only bit you need to change

$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {

}
$sql = "SELECT sent,username,message FROM ajax ORDER BY sent DESC;";

//echo $_GET["id"].$_GET["fname"].$_GET["lname"].$_GET["addr"].$_GET["city"];
$result = mysqli_query($conn, $sql );
//echo $result;
if(mysqli_num_rows($result) > 0) {
    // display table headings for query results
    echo "<table >";
    echo "<tr>  <th width='200'>Sent at</th>
    <th width='200' >Username</th>
    <th>Message</th>
    
    </tr>";
    
    // loop over each set of results
    while($row = mysqli_fetch_array($result)){
        // display data
        echo "<tr>  <td >".$row['sent']."</td>
            <td>".$row['username']."</td>
            <td>".$row['message']."</td>
        
            </tr>";
    }
    echo "</table>";}

else { // display error message
    echo "There are no matches for your search  criteria";}
                
mysqli_close($conn);
	
	
?>