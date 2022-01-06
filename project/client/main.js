var global_data = { "chats": [] }
var current_user = ""
var current_chat = ""
var current_panel = ""
var last_data_time = ""
var usernames_to_add=[]
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

function load_theme(){
	if (localStorage.getItem('theme')){
		var theme = localStorage.getItem('theme')
	} else {
        localStorage.setItem('theme', 'dark');
		var theme = localStorage.getItem('theme')
	}
    if (theme== "light"){
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    //document.documentElement.setAttribute('data-theme', 'light');
}

function toggle_theme(){
	var theme = localStorage.getItem('theme')
    if (localStorage.getItem('theme') == "light"){
        localStorage.setItem('theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
        document.documentElement.setAttribute('data-theme', 'light');

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
	var scroll= chatSection.scrollBottom
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
	if (!start){
		chatSection.scrollTo(0, chatSection.scrollHeight-scroll);
	}
}




function load_data(time){
	//setup the request
	var xhttp = new XMLHttpRequest();
	
	//setup the code to be ran if the request is succesfull
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			
			//Store the returned data in data
	       data = xhttp.responseXML;
		   
		   //If the current user is not known on the client, set it the the current user from the request
		   if(!current_user){
			   current_user=data.getElementsByTagName("username")[0].childNodes[0].nodeValue
		   }
		   
		   //Get all chats from data, and iterate through them
		   chats =data.getElementsByTagName("chat")
		   for ( i=0; i< chats.length; i++){
			   chat = chats[i]
			   //Get the chat_id of the current chat
			   //use let instead of var so that chat_id is local to this iteration of the loop, not the entire function
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
   				   //If the chat being operated on is not the currently open chat, increment the unread-messages on it
				   if (current_chat!=chat_id && localStorage.getItem("last_returned") <mes_time ){
	   				   global_data["chats"][chat_id]["unread-messages"]+=1
	   				}
				   if (chat_id ==current_chat){
	   				   display_message(mes_content,mes_sender,mes_time,true)
				   }
			   }
			   
		   }
		   //Store the last time data was gotten from the server in local storage.
		   //this is nescesary so that notifications are only gotten for new messages, if the user closes the page
		   localStorage.setItem("last_returned",data.getElementsByTagName("time_returned")[0].childNodes[0].nodeValue)
		   last_data_time = data.getElementsByTagName("time_returned")[0].childNodes[0].nodeValue
		   update_side_panel()
		   if (current_panel==document.getElementById("manage-window")){
			   manage_chat(current_chat)
		   }
	    } else if (this.readyState == 4 && this.status == 403){
			window.location.href = "index.html";

		} 
	};
	
	xhttp.open("POST", "../server/get_data.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	xhttp.send("time="+time);
	
}
function update_side_panel(){

	//Get Side panel as panel
	var panel = document.getElementById("chat-descriptor-container")
	
	//clear side panel
	panel.innerHTML = ""

	//Get template for a chat descriptor
	var descriptorTemplate = document.getElementById("chat-descriptor")
	
	//For each chat in global data, add a chat desriptor 
	for (let chat_id in global_data["chats"]){
		
		//clone the chat descriptor template into actual html, but dont add it to the actual page yet
		var descriptor = descriptorTemplate.content.cloneNode(true);
	
		//set the name, unread-messages of the chat descriptor
		descriptor.querySelectorAll("p")[0].innerHTML = global_data["chats"][chat_id]["chat-name"]
		if (global_data["chats"][chat_id]["unread-messages"]!=0){
			descriptor.querySelectorAll("span")[0].style.display="block"
			descriptor.querySelectorAll("span")[0].innerHTML = global_data["chats"][chat_id]["unread-messages"]
		}
		
		descriptor.querySelectorAll("div")[0].addEventListener("click", function(){show_chat(chat_id)}, false);
		descriptor.querySelectorAll("svg")[0].addEventListener("click", function(){
			manage_chat(chat_id);
			event.stopPropagation() 	
		}, false);


		//Add the chat descriptor to the panel 
		panel.appendChild(descriptor);
	}
}


function switch_panel(panel_selector){
	var panel = document.querySelector(panel_selector)
	if (current_panel && document.querySelector(".side-window") !=current_panel){
		current_panel.style.display="none"
	}
	panel.style.display = "flex"
	//check if on mobile platform, and if so, hide side window
	if (window.innerWidth <800){
		console.log("Mobile")
		document.getElementsByClassName("side-window")[0].style.display="none"
	}
		current_panel = panel
		return panel
}
function manage_chat(chat_id){

	current_chat = chat_id
	
	//Get chat panel as panel
	//TODO: set this up to work on mobile
	var panel = switch_panel("#manage-window")

	
	//clear the usernames currently in the box
	document.getElementById("username-box").innerHTML = ""
	
	//Hide buttons that may be displayed
	document.getElementById("add-people-button").style.display = "none"
	document.getElementById("leave-chat-button").style.display = "none"
	document.getElementById("delete-chat-button").style.display = "none"
	
	//get name of chat
	var chat_name = global_data["chats"][chat_id]["chat-name"]
	
	//Get members and owner of chat
	var usernames = global_data["chats"][chat_id]["users"]
	var owner = global_data["chats"][chat_id]["owner"]
	
	//set the chat name in the chat header
	panel.querySelector(".chat-header h2").innerHTML = chat_name
	
	//Get the username display box, and template for a username display
	var display = document.getElementById("username-box")
	var usernameTemplate = document.getElementById("username-display")
	for (let user in usernames ){
		
		//Js iterates through the keys of an array, not the values, so this gets the actual usernmaes
		user = usernames[user]
		
		//Clone the username-display template 
		let user_display = usernameTemplate.content.cloneNode(true)
		user_display.querySelector("b").innerHTML=user
		if (current_user==owner && user!= owner){
			user_display.querySelector(".small-button").style.display="block"
			user_display.querySelector(".small-button").id="display"+chat_id+user 
			user_display.querySelector(".small-button").addEventListener("click", function(){
				remove_from_chat(chat_id,user);
				global_data["chats"][chat_id]["users"].splice(global_data["chats"][chat_id]["users"].indexOf(user),1);
				manage_chat(chat_id);
				
				//document.getElementById("display"+chat_id+user).remove()
				}, false);
		}
		if (user ==owner){
			user_display.querySelector(".small-indicator").style.display="block"
		}
		display.appendChild(user_display);
	}
	if (current_user==owner){
		document.getElementById("add-people-button").style.display = "block"
		document.getElementById("delete-chat-button").style.display = "block"
		document.getElementById("delete-chat-button").addEventListener("click", function(){
			delete_chat(chat_id);
			delete global_data["chats"][chat_id];
			update_side_panel();
			clear_main_panel();
		}, false);
	} else{
		document.getElementById("leave-chat-button").style.display = "block"
		document.getElementById("leave-chat-button").addEventListener("click", function(){
			remove_from_chat(chat_id,current_user);
			delete global_data["chats"][chat_id];
			update_side_panel();
			clear_main_panel();
		}, false);
	}
}
function show_chat(chat_id){
	//TODO: add updata of current_chat to design
	current_chat = chat_id
	
	//Get chat panel as panel
	//TODO: set this up to work on mobile

	var panel = switch_panel("#chat-window")

	
	var chat_name = global_data["chats"][chat_id]["chat-name"]
	
	var messages = global_data["chats"][chat_id]["messages"]
	
	panel.querySelector(".chat-header h2").innerHTML = chat_name
	panel.querySelector(".chat").innerHTML	=""

	for (let message in global_data["chats"][chat_id]["messages"]){
		let mes_content = (global_data["chats"][chat_id]["messages"][message]["content"])
		let time = global_data["chats"][chat_id]["messages"][message]["time_sent"]
		let username = global_data["chats"][chat_id]["messages"][message]["sender"]
		display_message(mes_content,username,time,true)
	}
	global_data["chats"][chat_id]["unread-messages"] = 0
	panel.scrollTo(0, panel.scrollHeight)
	update_side_panel()
	document.title = "Chat - " + chat_name
	var chat_section =document.querySelector(".chat")
	chat_section.onscroll = function() {
	    if (chat_section.scrollTop == 0) {
			get_50_more()

	    }        
	};

}
function get_50_more(){
	var time = global_data["chats"][current_chat]["messages"][0]["time_sent"]
	
	//setup the request
	var xhttp = new XMLHttpRequest();
	
	//setup the code to be ran if the request is succesfull
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			
			//Store the returned data in data
	       data = xhttp.responseXML;
		   

			   messages = data.getElementsByTagName("message")
			   for (j=0; j< messages.length; j++){
				   message = messages[j]

				   mes_content = message.getElementsByTagName("content")[0].childNodes[0].nodeValue
				   mes_sender = message.getElementsByTagName("sender")[0].childNodes[0].nodeValue
				   mes_time = message.getElementsByTagName("time")[0].childNodes[0].nodeValue
				   global_data["chats"][current_chat]["messages"].unshift({
					   "content":mes_content,
					   "sender" :mes_sender,
					   "time_sent":mes_time 
					   
				   })


	   				   display_message(mes_content,mes_sender,mes_time,false)
				   
			   }
			   
		   
	    } 
	}
	
	xhttp.open("POST", "../server/get_50_more.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	xhttp.send("time="+time+"&chat_id="+current_chat);
}


//Send a message to the currently open chat
function send_message(){
	var content = document.getElementById("message-input").value
	if (content){
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "../server/send_message.php", true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send(encodeURI("content="+content+"&chat_id="+current_chat));

	

	}
	document.getElementById("message-input").value=""
}

function poll_for_data(){
	load_data(last_data_time)
}

setInterval(poll_for_data, 2000)

function on_load(){
	load_theme()
	load_data('1970-01-01 10:00:00')
	current_panel= document.querySelector(".side-window")
	
	//Set up an event listener to send a message when th enter key is pressed
	document.querySelector("#message-input").addEventListener("keyup", function(event) {
	  // Number 13 is the "Enter" key on the keyboard
	  if (event.keyCode === 13) {
	    // Cancel the default action, if needed
	    event.preventDefault();
	    // Trigger the button element with a click
	send_message()
	  }
	});

}


function open_modal(modal){
	var modal = document.getElementById(modal)	
	modal.style.display="flex"
}
function close_modal(modal){
	var modal = document.getElementById(modal)	
	modal.style.display="none"
}
function clear_main_panel(){
	current_panel.style.display="none"
}
function remove_from_chat(chat_id, user_id){
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "../server/remove_user.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(encodeURI("user_id="+user_id+"&chat_id="+chat_id));
}

function delete_chat(chat_id){
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "../server/delete_chat.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(encodeURI("chat_id="+chat_id));
}


function add_to_chat(chat_id, user_id){
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "../server/add_user.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(encodeURI("user_id="+user_id+"&chat_id="+chat_id));
}

function create_chat(){
	close_modal('create-chat-modal')
	var xhttp = new XMLHttpRequest();
	usernames_to_add.push(current_user)
	var chat_name = document.querySelector('#create-chat-modal #name').value;
	xhttp.open("POST", "../server/create_chat.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			var chat_id = xhttp.responseText
			for (var user in usernames_to_add){
				add_to_chat(chat_id, usernames_to_add[user])
			}
			usernames_to_add=[]
		}
	}
	xhttp.send(encodeURI("chat_name="+chat_name));
}


function search_for_user_to_add(usernames_searched){
var results=document.querySelector("#add-people-modal .members")
	results.innerHTML = ""
	for( let i =0; i< usernames_searched.length;i++){
		let user = usernames_searched[i].childNodes[0].nodeValue

		if (global_data["chats"][current_chat]["users"].includes(user)){
			

			var resultTemplate = document.getElementById("username-added-button")
			var result = resultTemplate.content.cloneNode(true);
		
	
			result.querySelectorAll("b")[0].innerHTML = user
	
			results.appendChild(result);
		}else{
			

			var resultTemplate = document.getElementById("username-add-button")
			let result = resultTemplate.content.cloneNode(true);
		
	
			result.querySelectorAll("b")[0].innerHTML = user
			result.querySelectorAll("button")[0].addEventListener("click", function(){
				add_to_chat(current_chat,user);
				this.className = 'small-indicator';
				this.innerHTML = 'Added';

			}, false);
			results.appendChild(result);
		}

	}

}
function search_for_user_to_create(usernames_searched){
		var results=document.querySelector("#create-chat-modal .members")
	results.innerHTML = ""
	for( let i =0; i< usernames_searched.length;i++){
		let user = usernames_searched[i].childNodes[0].nodeValue

		if (usernames_to_add.includes(user)){
			

			var resultTemplate = document.getElementById("username-added-button")
			var result = resultTemplate.content.cloneNode(true);
		
	
			result.querySelectorAll("b")[0].innerHTML = user
				result.querySelectorAll("button")[0].addEventListener("click", function(){
				usernames_to_add.splice(usernames_to_add.indexOf(user),1);
				this.className = 'small-button';
				this.innerHTML = 'Add';
				search_for_user_to_create(usernames_searched) 
								console.log(usernames_to_add)
			}, false);
			results.appendChild(result);
		}else{
			

			var resultTemplate = document.getElementById("username-add-button")
			let result = resultTemplate.content.cloneNode(true);
		
	
			result.querySelectorAll("b")[0].innerHTML = user
			result.querySelectorAll("button")[0].addEventListener("click", function(){
				usernames_to_add.push(user);
				this.className = 'small-indicator';
				this.innerHTML = 'Added';
				search_for_user_to_create(usernames_searched);
				console.log(usernames_to_add)
			}, false);
			results.appendChild(result);
		}

	}


}
function live_search(search_field, callback){
	var search_term=document.querySelector(search_field).value	
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "../server/live_search.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.onreadystatechange =   function() {
	    if (this.readyState == 4 && this.status == 200) {
			var usernames_returned = xhttp.responseXML.getElementsByTagName("username")

			callback(usernames_returned)

		}
	}
	
	xhttp.send(encodeURI("username="+search_term));
	return xhttp.onreadystatechange
}


function close_panel(){
	var side_panel = document.querySelector(".side-window")
	side_panel.style.display = "flex"
	current_panel.style.display = "none"
	current_panel = side_panel
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
//setInterval(display_message, 1000, "//Function to add a message to the page//Arguments are://	content: text of the message", "Ben", "2038-01-19 03:14:07", true)