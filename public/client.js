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

// Show temporary message
function showMessage(elementId, text) {
    const msg = document.getElementById(elementId);
    msg.textContent = text;
    msg.style.display = "block";
    setTimeout(() => {
        msg.style.display = "none";
    }, 3000);
}

// Handle Start Tracking
document.getElementById("trackingForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // stop page reload

    const formData = new FormData(this);

    try {
        const res = await fetch("/", {
            method: "POST",
            body: formData
        });

        if (res.ok) {
            const msg = document.getElementById("trackingMessage");
            msg.textContent = "Successfully tracking item!";
            msg.style.display = "block";

            setTimeout(() => {
                msg.style.display = "none";
            }, 3000);

            this.reset();
        }
    } catch (err) {
        console.error("Tracking error", err);
    }
});





