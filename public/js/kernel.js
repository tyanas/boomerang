var a=false;
function fbut(event){

	if (a == false){
	document.getElementById("but").innerHTML="";
	a = true;
	 
	}
	
	
	
		
		
		
	if (event.keyCode == 13)
			{
			
			document.getElementById("note").innerHTML="Great! Here's the deal...";
			 document.getElementById("but").style.visibility="hidden";
			 document.getElementById("exp").style.visibility="visible";
			 document.getElementById("pay").style.visibility="visible";
			 
			
			}	


}