// Sends a post request to "/" that includes the userEmail when the button is clicked. 
async function deleteEmail(){
    const userEmail = document.getElementById("removeEmail").value
    try{
        // Sending userEmail to my express server
        await fetch("/", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify({emailRemove: userEmail}) 
        })        
    } catch(error){
        console.log("An error has occured while fetching", error)
    }
}

