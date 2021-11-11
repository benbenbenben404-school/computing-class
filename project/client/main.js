var global_data = { "chats": [] }
var current_user = ""
var current_chat = ""

//Functions to generate random numbers from strings
//https://stackoverflow.com/a/47593316
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

//Function to add a message to the page
//Arguments are:
//	content: text of the message
//	useranme: sender of the message
//	time: when the message was sent, as a timestamp, in the format YYYY-MM-DD hh:mm:ss, ie  2038-01-19 03:14:07
//	start: if true, the message is added at the bottom of the chat section, if false it's added at the top
function display_message(content, username, time, start) {
	//Get the chat section
	var chatSection = document.getElementById("chat")

	//Check if the user is scrolled to the bottom of the chat section
	if (chatSection.scrollTop === (chatSection.scrollHeight - chatSection.offsetHeight)) {
		var at_bottom = true
	} else {
		var at_bottom = false
	}
	
	//get the correct template fot the HTML for a message
	//If the sender of the message is the currently logged in user, gets the correct template for this
	if (username == current_user) {
		var messageTemplate = document.getElementById("user-message")
	} else {
		var messageTemplate = document.getElementById("message")
	}
	//clone the message template into actual html, but dont add it to the actual page yet
	var message = messageTemplate.content.cloneNode(true);
	
	//set the username, time and content of the message
	message.querySelectorAll("b")[0].innerHTML = username
	message.querySelectorAll("time")[0].innerHTML = time
	message.querySelectorAll("p")[0].innerHTML = content
	
	//Set the color of the username
	//Generate a seed for the random number generator from the username
	var seed = xmur3(username)	
	//generate h, a random number between 0 and 360, based on the seed of the username
	var rand = mulberry32(seed())
	var h = rand()*360
	
	//set the colour of the text of the username, in hsl
	message.querySelectorAll("b")[0].style.color = "hsl("+ String(h)+",60%, 50%)"
	
	//add the message to the bottom of the chat section if start is true, else add it to the top
	if (start) {
		chatSection.appendChild(message);
	} else {
		chatSection.prepend(message);
	}
	
	//if message is added to the bottom, and th user was at the bottom, scroll the page down
	if (start && at_bottom) {
		chatSection.scrollTo(0, chatSection.scrollHeight);
	}
}




function load_data(time){

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	       // Typical action to be performed when the document is ready:
	       data= xhttp.responseXML;
		   if(!current_user){
			   current_user=data.getElementsByTagName("username")[0].childNodes[0].nodeValue
		   }
		   if(!current_chat){
			   current_chat=data.getElementsByTagName("chat_id")[0].childNodes[0].nodeValue
		   }

		   chats =data.getElementsByTagName("chat")
		   for ( i=0; i< chats.length; i++){
			   chat = chats[i]
			   let chat_id= chat.getElementsByTagName("chat_id")[0].childNodes[0].nodeValue
			   if (!(chat_id in global_data["chats"] )  ){
				   new_chat = {
					   "messages":[],
					   "unread-messages":0,
					   "owner":chat.getElementsByTagName("owner")[0].childNodes[0].nodeValue,
					   "chat-name":chat.getElementsByTagName("name")[0].childNodes[0].nodeValue,
					   "users":[]
				   }

				   global_data["chats"][chat_id] = new_chat
			   }

			  global_data["chats"][chat_id]["unread-messages"]+= chat.getElementsByTagName("message").length
			   

			  global_data["chats"][chat_id]["users"] =[]
			  users = chat.getElementsByTagName("user")
			  for (j=0; j< users.length; j++){
				   global_data["chats"][chat_id]["users"].push(users[j].childNodes[0].nodeValue)
			  }
			   messages = chat.getElementsByTagName("message")
			   for (j=0; j< messages.length; j++){
				   message = messages[j]
				   mes_content = message.getElementsByTagName("content")[0].childNodes[0].nodeValue
				   mes_sender = message.getElementsByTagName("sender")[0].childNodes[0].nodeValue
				   mes_time = message.getElementsByTagName("time")[0].childNodes[0].nodeValue
				   global_data["chats"][chat_id]["messages"].push({
					   "content":mes_content,
					   "sender" :mes_sender,
					   "time_sent":mes_time 
					   
				   })
				   if (chat_id ==current_chat){
	   				   display_message(mes_content,mes_sender,mes_time,true)
				   }
			   }
			   
		   }
		   update_side_panel()
	    } 
	};
	
	xhttp.open("POST", "../server/get_data.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	xhttp.send("time=1970-01-01 10:00:00");
	
}
function update_side_panel(){
	var panel = document.getElementById("chat-descriptor-container")



	var descriptorTemplate = document.getElementById("chat-descriptor")
	
	for (var chat_id in global_data["chats"]){
		console.log(global_data["chats"][chat_id])
	//clone the message template into actual html, but dont add it to the actual page yet
	var descriptor = descriptorTemplate.content.cloneNode(true);
	
	//set the username, time and content of the message
		descriptor.querySelectorAll("p")[0].innerHTML = global_data["chats"][chat_id]["chat-name"]
		descriptor.querySelectorAll("span")[0].innerHTML = global_data["chats"][chat_id]["unread-messages"]

			panel.appendChild(descriptor);
	}
	

}



function on_load(){
	load_data('a')
}



//just for testing


function randText(min, max){
	var tokens =["lorem", "ipsum", "is", "simply", "dummy", "text", "of", "the", "printing", "and", "typesetting", "industry", "lorem", "ipsum", "has", "been", "the", "industrys", "standard", "dummy", "text", "ever", "since", "the", "1500s", "when", "an", "unknown", "printer", "took", "a", "galley", "of", "type", "and", "scrambled", "it", "to", "make", "a", "type", "specimen", "book", "it", "has", "survived", "not", "only", "five", "centuries", "but", "also", "the", "leap", "into", "electronic", "typesetting", "remaining", "essentially", "unchanged", "it", "was", "popularised", "in", "the", "1960s", "with", "the", "release", "of", "letraset", "sheets", "containing", "lorem", "ipsum", "passages", "and", "more", "recently", "with", "desktop", "publishing", "software", "like", "aldus", "pagemaker", "including", "versions", "of", "lorem", "ipsum"]
	var text = ''
	for (var i=0; i<Math.round(Math.random()*(max-min) + min) ; i++) {
		text += tokens[Math.floor(Math.random()*tokens.length)] +" ";
	}
	return text
}
function randomMessage(){
	var text = randText(20,50)
	if (Math.random() >0.75){
		var usr="ben"
	} else{
		var usr = randText(2,3)
	}

	//display_message(text,  usr, "2038-01-19 03:14:07", true)
}
setInterval(randomMessage, 1000 )

//setInterval(display_message, 1000, "//Function to add a message to the page//Arguments are://	content: text of the message", "Ben", "2038-01-19 03:14:07", true)