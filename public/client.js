// Sends a post request to "/" that includes the userEmail when the button is clicked. 
async function deleteEmail(){
    const input = document.getElementById("removeEmail");
    const userEmail = input.value
    const status = document.getElementById("statusMessage");

    try{
        // Sending userEmail to my express server
        await fetch("/", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify({emailRemove: userEmail}) 
        }) 
        
        document.getElementById("statusMessage").textContent = "Email has been removed successfully!";
        
        input.value = '' // Clears the user input after submission

        // Remove the message after 3 seconds
        setTimeout(() =>{
            status.textContent = '' 
        }, 3000)

    } catch(error){
        console.log("An error has occured while fetching", error)
    }
}
